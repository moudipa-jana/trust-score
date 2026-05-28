{
  /**
   * Pin component allows toggling pin/unpin actions for comments or campfire posts.
   * It executes GraphQL mutations and updates the feed state upon success, showing different
   * icons for pinned and unpinned states.
   */
}

import { useMutation } from '@apollo/client/react';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';

import { getPostById } from '@/actions/forum';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  getThreadIdObject,
} from '@/lib/helpers';
import {
  MUTATION_CAMPFIRE_ACTIVITIES,
  PIN_UNPIN_CAMPFIRE_POST_MUTATION,
} from '@/service/graphql/Campfire';
import { PIN_UNPIN_COMMENT_MUTATION } from '@/service/graphql/Comment';
import { getUserId } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { updateForumFeedByPost } from '@/state/Slices/necessary';
import { CampfireActivity } from '@/types/campfire';

interface PinProps {
  commentId: string | undefined;
  postId?: string;
  isPinned?: boolean;
  campfirePost?: boolean;
  threadId?: string;
  campfireId?: string;
  disablePin?: boolean;
}

const Pin = ({
  disablePin,
  commentId,
  postId,
  isPinned,
  campfirePost,
  threadId,
  campfireId,
}: PinProps) => {
  const [isPin, setIsPin] = useState(isPinned);
  const userId = useAppSelector(getUserId);

  const { token } = useAppSelector((state) => ({
    token: state.auth.token,
  }));
  const dispatch = useAppDispatch();

  const { mutationFunction: fetchActivityList } = useAuthMutation(
    MUTATION_CAMPFIRE_ACTIVITIES,
    (response) => {
      const activities = get(
        response,
        'getCampfireActivities.activities.threads',
        [],
      ) as CampfireActivity[];
      const formatedArray = activities.map((obj: CampfireActivity) => {
        return getThreadIdObject(obj);
      });
      dispatch(updateForumFeedByPost(formatedArray[0]));
    },
    () => {
      dispatch(updateForumFeedByPost([]));
    },
  );

  const [pinUnpinComment, { data: commentData, error: commentError }] =
    useMutation(PIN_UNPIN_COMMENT_MUTATION);

  // Handle comment pin/unpin completion and errors with useEffect
  useEffect(() => {
    const handleCompletion = async () => {
      if (
        commentData &&
        (commentData as any).pinOrUnpinComment &&
        (commentData as any).pinOrUnpinComment.success
      ) {

        setIsPin((prev) => !prev)
        const threadData = await getPostById(postId);
        dispatch(updateForumFeedByPost(threadData));
      }
    };
    handleCompletion();
  }, [commentData, postId, dispatch]);

  useEffect(() => {
    if (commentError) {
      emitErrorNotification(formatGraphqlError(commentError));
    }
  }, [commentError]);

  const [pinUnpinCampfirePost] = useMutation(PIN_UNPIN_CAMPFIRE_POST_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: async () => {
      setIsPin((prev) => !prev);
      await fetchActivityList({
        variables: { postId, campfireId, limit: 1 },
      });
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });




  const handlePinClick = () => {
    if (disablePin) return;
    if (token) {
      if (campfirePost && !commentId) {
        pinUnpinCampfirePost({
          variables: {
            thread_id: threadId,
            is_pinned: !isPin,
            pinned_at: !isPin ? new Date().toISOString() : null,
            pinned_by: userId,
          },
        });
      } else {
        pinUnpinComment({
          variables: {
            commentId: commentId,
            pinned: !isPin,
          },
        });
      }
    } else {
      dispatch(toggleSignupDialog(true));
    }
  };

  return (
    <div className="flex items-center">
      {isPin && token ? (
        <svg
          className='cursor-pointer'
          onClick={handlePinClick}
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.2743 1.60567L14.2862 8.70679C15.4284 9.24441 16.9604 10.5258 17.3893 13.5586C17.42 13.7714 17.4043 13.9883 17.3435 14.1945C17.2826 14.4006 17.1779 14.5912 17.0367 14.7532L16.9617 14.8281C16.8224 14.9675 16.6569 15.0781 16.4748 15.1535C16.2927 15.2289 16.0975 15.2677 15.9004 15.2676L9.49868 15.2643L9.50067 20.9183C9.50067 21.1173 9.42161 21.3082 9.28088 21.4489C9.14015 21.5897 8.94927 21.6687 8.75025 21.6687C8.55123 21.6687 8.36036 21.5897 8.21963 21.4489C8.0789 21.3082 7.99983 21.1173 7.99983 20.9183L8.00182 15.2643L1.59809 15.2643C1.38747 15.2642 1.17923 15.2197 0.986946 15.1338C0.794659 15.0478 0.622625 14.9223 0.482045 14.7655C0.341466 14.6087 0.235491 14.424 0.171021 14.2235C0.106551 14.023 0.0850299 13.8111 0.107859 13.6017C0.433349 10.557 2.31337 9.21127 3.24078 8.72668L3.22819 1.60766C3.22817 1.41065 3.26695 1.21556 3.34234 1.03354C3.41772 0.851522 3.52822 0.686135 3.66753 0.546826C3.80684 0.407518 3.97222 0.297017 4.15424 0.221634C4.33626 0.146252 4.53135 0.107464 4.72836 0.107486L12.7741 0.106824C13.1718 0.106778 13.5532 0.264634 13.8345 0.545694C14.1158 0.826755 14.274 1.20802 14.2743 1.60567Z"
            fill="#00B2ED"
          />
        </svg>
      ) : (
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className='cursor-pointer'
          onClick={handlePinClick}
        >
          <g clip-path="url(#clip0_927_325)">
            <path
              d="M12.7739 0.606689C13.0391 0.606659 13.2934 0.712297 13.481 0.899658C13.6684 1.08698 13.7737 1.34072 13.7739 1.60571V1.60669L13.7866 8.70728V9.02466L14.0737 9.15942C15.0713 9.62913 16.4899 10.7714 16.894 13.6282V13.6301C16.9144 13.7715 16.9042 13.9158 16.8638 14.053C16.8243 14.1864 16.7567 14.3094 16.6665 14.4153L16.6089 14.4739L16.6079 14.4749C16.5151 14.5676 16.405 14.6414 16.2837 14.6917C16.1623 14.7419 16.0321 14.7679 15.9009 14.7678L9.49951 14.7639H8.99854V15.2639L9.00049 20.9182L8.99561 20.967C8.986 21.0152 8.96246 21.0598 8.92725 21.095C8.88026 21.1419 8.81679 21.1682 8.75049 21.1682C8.6842 21.1682 8.62074 21.1419 8.57373 21.095C8.52682 21.0481 8.49952 20.9846 8.49951 20.9182L8.50146 15.2639L8.50244 14.7639H1.59814C1.4579 14.7638 1.31897 14.7343 1.19092 14.677C1.06303 14.6199 0.948653 14.5362 0.85498 14.4319C0.761206 14.3272 0.689933 14.2041 0.646973 14.0706C0.603995 13.9369 0.58976 13.7951 0.60498 13.6555V13.6545C0.906736 10.8325 2.63494 9.60773 3.47217 9.17017L3.7417 9.02954L3.74072 8.72583L3.72803 1.60767C3.72801 1.47636 3.75399 1.34613 3.8042 1.22485C3.8544 1.10364 3.92826 0.993446 4.021 0.900635C4.11374 0.807887 4.22408 0.734086 4.34521 0.683838C4.46645 0.633631 4.59681 0.607701 4.72803 0.607666L12.7739 0.606689Z"
              stroke="#00B2ED"
            />
          </g>
          <defs>
            <clipPath id="clip0_927_325">
              <rect width="18" height="22" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  );
};

export default Pin;
