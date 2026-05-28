/**
 * UseStrapiBookmark hook checks if a blog post is bookmarked by the current user and handles loading states.
 *
 * - Uses Apollo's useQuery to fetch bookmark data based on the user's profile and the given blog ID.
 * - Tracks the bookmark status (whether the blog is bookmarked or not) and the associated bookmark ID.
 * - Returns the loading state, bookmark status, bookmark ID, and a refetch function.
 *
 * @param blogId The ID of the blog post to check for bookmarks.
 */

import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/Hooks/useRedux';
import { formatGraphqlError } from '@/lib/helpers';
import { getBookmarkByUserIdBlogId } from '@/service';
import cmsClient from '@/service/cmsClient';
import { selectGetUserProfile } from '@/state/Slices/auth';

const UseStrapiBookmark = (blogId: string) => {
  const [isBookMarked, setIsBookMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarkId, setBookMarkId] = useState<string | null>(null);
  const profile = useAppSelector(selectGetUserProfile);

  const {
    loading: queryLoading,
    error,
    data: queryData,
    refetch,
  } = useQuery(getBookmarkByUserIdBlogId, {
    variables: {
      userId: profile?.id,
      id: blogId,
    },
    client: cmsClient, // Specify the client instance
    skip: !blogId || !profile?.id,
  });

  useEffect(() => {
    if (!queryLoading) {
      if (error) {
        setIsBookMarked(false);
        console.error(formatGraphqlError(error));
      } else {
        const exists =
          queryData &&
          (queryData as any).bookMarks &&
          (queryData as any).bookMarks.data.length > 0;
        setIsBookMarked(exists);
        setBookMarkId(exists ? (queryData as any).bookMarks.data[0].id : null);
        setLoading(false);
      }
    }
  }, [queryLoading, error, queryData]);

  return { loading, isBookMarked, bookmarkId, refetch };
};

export default UseStrapiBookmark;
