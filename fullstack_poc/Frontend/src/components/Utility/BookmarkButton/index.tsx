/**
 * BookmarkButton toggles bookmark state for various content types (posts, comments, etc.).
 * - Prevents bookmarking own content
 * - Handles auth, campfire access, and optimistic UI updates
 * - Uses GraphQL mutations and Redux for state sync
 */

import { useMutation } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { MouseEvent, useEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  MUTATION_ADD_BOOKMARK,
  MUTATION_REMOVE_BOOKMARK,
} from '@/service/graphql/Profile';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import {
  bookmarkSuccess,
  unbookmarkProfileSuccess,
} from '@/state/Slices/profile';
import { CardTypeEnum } from '@/types/enums';

interface BookmarkProps {
  postId: string;
  postUserId?: string;
  isBookmarked?: boolean;
  cardType: CardTypeEnum;
  commentId?: string;
  parentCommentId?: string;
  isCamfireMember?: boolean | null;
  setCampfireJoin?: (join: boolean) => void;
  footerDisable?: boolean;
  categoryName?: string;
}

type BookmarkVariable = {
  [key: string]: string;
};

export default function BookmarkButton({
  postUserId,
  postId,
  isBookmarked,
  commentId,
  cardType,
  parentCommentId,
  isCamfireMember,
  setCampfireJoin,
  footerDisable,
  categoryName,
}: BookmarkProps) {
  function handlePostType() {
    let type = '';
    if (cardType === CardTypeEnum.question) type = 'question';
    if (cardType === CardTypeEnum.quiz) type = 'quiz';
    if (cardType === CardTypeEnum.poll) type = 'poll';
    if (cardType === CardTypeEnum.comment) type = 'comment';
    if (cardType === CardTypeEnum.campfire) type = 'campfireShare';
    if (cardType === CardTypeEnum.postShare) type = 'postShare';
    if (cardType === CardTypeEnum.campfirePostShare) type = 'campfirePostShare';
    return type;
  }
  const [bookMarked, setBookMarked] = useState(isBookmarked || false);
  const [postType] = useState(handlePostType());
  const [isLoading, setIsLoading] = useState(false);

  const token = useAppSelector((state) => state.auth.token);
  const profile = useAppSelector((state) => state.auth.profile);
  const userBookmarks = useAppSelector((state) => state.profile.bookmarkPosts || []);

  const dispatch = useAppDispatch();

  const lastClickTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 500; // 500ms delay

  const [bookmarkPost] = useMutation(MUTATION_ADD_BOOKMARK, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response) => {
      dispatch(bookmarkSuccess(response));
      setBookMarked(true);
      setIsLoading(false);
      if (cardType === CardTypeEnum.comment && parentCommentId === commentId) {
        emitNotification('success', 'Comment bookmarked successfully');
      } else if (cardType === CardTypeEnum.comment) {
        emitNotification('success', 'Reply bookmarked successfully');
      } else {
        emitNotification('success', 'Post bookmarked successfully');
      }
      
      // Notify Trust Service of the UI interaction
      if (postUserId && categoryName && profile?.id && cardType !== CardTypeEnum.comment) {
        fetch('http://localhost:8001/process-reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: `bookmark_${postId}_${Date.now()}`,
            author_id: postUserId,
            voter_id: profile.id,
            voter_tier: 'New Voice', // Default
            category: categoryName,
            entity_type: 'post',
            post_text: '',
            comment_text: '',
            reaction_text: 'bookmark',
            signal: 'BOOKMARK',
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Trust service bookmark failed', err));
      }
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [unBookmarkPost] = useMutation(MUTATION_REMOVE_BOOKMARK, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (_, clientOptions) => {
      dispatch(unbookmarkProfileSuccess(clientOptions?.variables));
      setBookMarked(false);
      setIsLoading(false);
      if (cardType === CardTypeEnum.comment && parentCommentId === commentId) {
        emitNotification('success', 'Comment unbookmarked successfully');
      } else if (cardType === CardTypeEnum.comment) {
        emitNotification('success', 'Reply unbookmarked successfully');
      } else {
        emitNotification('success', 'Post unbookmarked successfully');
      }
      
      // Notify Trust Service of the UI interaction (Unbookmark)
      if (postUserId && categoryName && profile?.id && cardType !== CardTypeEnum.comment) {
        fetch('http://localhost:8001/process-reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: `unbookmark_${postId}_${Date.now()}`,
            author_id: postUserId,
            voter_id: profile.id,
            voter_tier: 'New Voice', // Default
            category: categoryName,
            entity_type: 'post',
            post_text: '',
            comment_text: '',
            reaction_text: 'unbookmark',
            signal: 'UNBOOKMARK',
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Trust service unbookmark failed', err));
      }
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  useEffect(() => {
    if (!isBookmarked && !isEmpty(userBookmarks)) {
      const owner = userBookmarks.find((x) => {
        if (x[postType as CardTypeEnum.poll]) {
          const post = x[postType as CardTypeEnum.poll];
          return post?.id === (postType !== 'comment' ? postId : commentId);
        }
        return null;
      });

      if (owner) {
        setBookMarked(true);
      } else {
        setBookMarked(false);
      }
    }
  }, [userBookmarks, isBookmarked, postType, postId, commentId]);

  const onBookmarkClick = (e: MouseEvent) => {
    e.stopPropagation();
    // Prevent multiple rapid clicks with debouncing
    const now = Date.now();
    if (now - lastClickTimeRef.current < DEBOUNCE_DELAY || isLoading) {
      return;
    }
    lastClickTimeRef.current = now;

    if (!isCamfireMember && setCampfireJoin) {
      setCampfireJoin(true);
    } else {
      const variable: BookmarkVariable = {};
      if (cardType === CardTypeEnum.question) variable.questionId = postId;
      if (cardType === CardTypeEnum.quiz) variable.quizId = postId;
      if (cardType === CardTypeEnum.poll) variable.pollId = postId;
      if (cardType === CardTypeEnum.comment)
        variable.commentId = commentId ?? '';
      if (cardType === CardTypeEnum.campfire) variable.campfireShareId = postId;
      if (cardType === CardTypeEnum.postShare) variable.postShareId = postId;
      if (cardType === CardTypeEnum.campfirePostShare)
        variable.campfirePostShareId = postId;
      if (!token || isEmpty(profile)) {
        dispatch(toggleSignupDialog(true));
        return;
      }
      if (!bookMarked) {
        bookmarkPost({
          variables: variable,
        });
      } else {
        unBookmarkPost({
          variables: variable,
        });
      }
    }
  };
  if (profile?.id === postUserId) {
    return null;
  }
  return (
    <div>
      <div
        className="cursor-pointer relative group"
        onClick={!isLoading && !footerDisable ? onBookmarkClick : undefined}
      >
        {bookMarked ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
          >
            <path
              d="M1.78492e-07 2.49994V19.3746C-8.45251e-05 19.4831 0.0299794 19.5898 0.0872328 19.6841C0.144486 19.7784 0.226955 19.8572 0.326522 19.9125C0.426089 19.9679 0.539322 19.998 0.655073 19.9999C0.770825 20.0018 0.885106 19.9754 0.986667 19.9233L8 16.3359L15.0133 19.9233C15.1149 19.9754 15.2292 20.0018 15.3449 19.9999C15.4607 19.998 15.5739 19.9679 15.6735 19.9125C15.773 19.8572 15.8555 19.7784 15.9128 19.6841C15.97 19.5898 16.0001 19.4831 16 19.3746V2.49994C16 1.83692 15.719 1.20105 15.219 0.732216C14.7189 0.263386 14.0406 0 13.3333 0L2.66667 0C1.95942 0 1.28115 0.263386 0.781049 0.732216C0.280952 1.20105 1.78492e-07 1.83692 1.78492e-07 2.49994Z"
              fill="#00B2ED"
            />
          </svg>
        ) : (
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 19L8 15L1 19V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H13C13.5304 1 14.0391 1.21071 14.4142 1.58579C14.7893 1.96086 15 2.46957 15 3V19Z"
              stroke="#818181"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        <span className="absolute bottom-6 -right-10 mr-2 hidden rounded border border-gray-500  bg-white px-1 py-0.5 text-[10px] font-medium text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-400">
          Bookmark
        </span>
      </div>
    </div>
  );
}
