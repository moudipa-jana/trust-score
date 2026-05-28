import { ApolloClient } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import React, { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import UseStrapiBookmark from '@/Hooks/UseStrapiBookmark';
import { setBlogBookmarCount } from '@/state/Slices/profile';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  createBookMark,
  deleteBookMark,
  createYouTubeBookmark,
} from '@/service';
import cmsClient from '@/service/cmsClient';
import { selectGetUserProfile } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';

interface BookmarkProps {
  blogId?: string | number;
  size?: number;
  noPadding?: boolean;
  isBingewatchMark?: boolean;
}

const Bookmark: React.FC<BookmarkProps> = ({
  blogId,
  size,
  noPadding,
  isBingewatchMark,
}) => {
  const profile = useAppSelector(selectGetUserProfile);
  const dispatch = useAppDispatch();

  const { isBookMarked, bookmarkId, refetch } = UseStrapiBookmark(
    blogId as string,
  );

  const [localIsBookmarked, setLocalIsBookmarked] =
    useState<boolean>(isBookMarked);

  const blogBookmarkCount = useAppSelector(
    (state) => state.profile.bookmarkBlogCount,
  );

  useEffect(() => {
    setLocalIsBookmarked(isBookMarked);
  }, [isBookMarked]);

  const mutation = isBingewatchMark ? createYouTubeBookmark : createBookMark;

  // Create bookmark mutation
  const [createBookmark] = useMutation<{ insert_bookmark_one: { id: string } }>(
    mutation,
    {
      client: cmsClient as ApolloClient,
      onCompleted(data) {
        console.debug('createBookmark onCompleted', {
          data,
          isBingewatchMark,
          blogId,
        });
        setLocalIsBookmarked(true);
        refetch();
        emitNotification('success', 'Blog bookmarked successfully');
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('cms:bookmark:changed', {
                detail: {
                  blogId,
                  isYouTube: !!isBingewatchMark,
                  action: 'created',
                  response: data,
                },
              }),
            );
          }
        } catch (err) {
          /* no-op */
        }

        // increment blog bookmark count in Redux so profile counts update immediately
        try {
          dispatch(setBlogBookmarCount((blogBookmarkCount || 0) + 1));
        } catch (err) {
          /* no-op */
        }
      },
      onError(error) {
        console.debug('createBookmark onError', { error });
        emitErrorNotification(formatGraphqlError(error));
      },
    },
  );

  // Delete bookmark mutation
  const [deleteBookmark] = useMutation<{
    delete_bookmarks_by_pk: { id: string };
  }>(deleteBookMark, {
    client: cmsClient as ApolloClient,
    onCompleted() {
      setLocalIsBookmarked(false);
      refetch();
      emitNotification('success', 'Blog unbookmarked successfully');
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cms:bookmark:changed', {
              detail: {
                blogId,
                isYouTube: !!isBingewatchMark,
                action: 'deleted',
                bookmarkId: bookmarkId,
              },
            }),
          );
        }
      } catch (err) {
        /* no-op */
      }

      // decrement blog bookmark count in Redux so profile counts update immediately
      try {
        dispatch(
          setBlogBookmarCount(Math.max(0, (blogBookmarkCount || 0) - 1)),
        );
      } catch (err) {
        /* no-op */
      }
    },
    onError(error) {
      emitErrorNotification(formatGraphqlError(error));
    },
  });

  const handleBookmark = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!blogId) {
      emitErrorNotification('Blog ID is required');
      return;
    }

    if (!profile?.id) {
      dispatch(toggleSignupDialog(true));
      return;
    }

    console.debug('Bookmark.handleBookmark()', {
      blogId,
      isBingewatchMark,
      bookmarkId,
    });

    if (!bookmarkId) {
      console.debug('Calling createBookmark', {
        mutation: isBingewatchMark ? 'createYouTubeBookmark' : 'createBookMark',
        variables: { userId: profile.id, sunrise_blog: blogId },
      });
      createBookmark({
        variables: {
          userId: profile.id,
          sunrise_blog: blogId,
        },
      });
    } else {
      console.debug('Calling deleteBookmark', {
        variables: { id: bookmarkId },
      });
      deleteBookmark({
        variables: {
          id: bookmarkId,
        },
      });
    }
  };

  return (
    <div className={`ml-auto ${noPadding ? 'pb-0' : 'pb-2'}`}>
      <span className="cursor-pointer" onClick={handleBookmark}>
        {localIsBookmarked ? (
          <BsBookmarkFill size={size ?? 16} color="#00B2ED" />
        ) : (
          <BsBookmark size={size ?? 16} color="#00B2ED" />
        )}
      </span>
    </div>
  );
};

export default Bookmark;
