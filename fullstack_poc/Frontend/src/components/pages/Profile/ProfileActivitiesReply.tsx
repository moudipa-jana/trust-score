import { useLazyQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import ForumCard from '@/components/Utility/ForumCard';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PostReaction } from '@/types/forum';
import { activitiesProfileOption } from '@/types/profile';

interface User {
  email: string;
  id: string;
  isFollowing: boolean;
  name: string;
  profilePicture: string;
  is_disabled_by_admin: boolean;
  userTag?: string;
}

export interface CommentParent {
  id: string;
  message: string;
  pollId?: string;
  quizId?: string;
  questionId?: string;
  postShareId?: string;
  campfireShareId?: string;
  campfireShare?: {
    campfire: {
      title: string;
    };
  };
  announcement_id: string;
  announcement: {
    isExpired?: boolean;
    campfire_id?: string;
    campfire: {
      title: string;
    };
    comments: Array<{
      parentId: string;
      comment: {
        user: User;
      };
    }>;
    user: User | null;
  };
  campfire_post_share_id?: string;
  parentId?: string;
  is_disabled_by_admin?: boolean;
  parent?: CommentParent;
  user?: User;
}

export interface Comment {
  id: string;
  message: string;
  is_disabled_by_admin?: boolean;
  noDownValues?: number;
  noUpValues?: number;
  upVoted?: boolean;
  downVoted?: boolean;
  questionId?: string;
  pollId?: string;
  quizId?: string;
  parentId?: string;
  campfireShareId?: string;
  postShareId?: string;
  campfire_post_share_id?: string;
  isEdited?: boolean;
  createdAt: string;
  announcement_id: string;
  hasPostCommentorRequestedForDeactivation?: boolean;
  parent?: CommentParent;
  user: User;
  post_reactions?: PostReaction[]; // Add specific type if available
  likes?: number;
}

interface QueryResponse {
  replies: Comment[];
}

interface IProfileActivitiesReply {
  selectedOption: activitiesProfileOption;
  query: ReturnType<typeof gql>;
  header?: React.ReactNode;
  count?: number;
}

const ProfileActivitiesReply = ({
  selectedOption,
  query,
  header,
  count,
}: IProfileActivitiesReply) => {
  const [replieData, setRepliesData] = useState<Comment[]>([]);
  const [isLoadmore, setIsLoadmore] = useState(true);
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const [fetchActivityList, { loading, error, data }] =
    useLazyQuery<QueryResponse>(query, {
      fetchPolicy: 'no-cache',
    });

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      setRepliesData((prevData) => {
        const replyArray = [...prevData, ...(data?.replies?.slice(0, 3) || [])];
        const checkLoadmore = count
          ? count > replyArray.length
          : !(data?.replies?.length <= 3);
        setIsLoadmore(checkLoadmore);
        return replyArray;
      });
    }
  }, [data, count]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const fetchActivities = useCallback(
    (offset = 0) => {
      fetchActivityList({
        variables: {
          limit: 4,
          userId,
          offset,
        },
        context: {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      });
    },
    [fetchActivityList, userId, token],
  );

  const handleLoadMore = () => {
    fetchActivities(replieData?.length);
  };

  useEffect(() => {
    setRepliesData([]);
    fetchActivities(0);
  }, [selectedOption, fetchActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Your Replies" />
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className="text-sm font-bold text-gray-500">
            To see updates, have to create reply
          </p>
        </div>
      </div>
    );
  return (
    <div>
      {header}
      {isEmpty(replieData) ? (
        !data?.replies ? (
          <TabletLoader />
        ) : (
          <div>
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops, no data to show." />
              <p className="text-sm font-bold text-gray-500">
                To see updates, have to create reply
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="m-2">
          <div className="second-child overlaySecChild relative  mt-4 rounded-xl bg-[#BDECFF] reshare-card reply-card ">
            {replieData?.map((replyobj: Comment) => {
              const reply = replyobj;

              let replyUsername = '';
              replyUsername = (reply as Comment)?.parent?.user?.name ?? '';
              return (
                <div className=" py-2 lg:p-4" key={(reply as Comment)?.id}>
                  <ForumCard
                    isDisable={
                      (reply as Comment)?.is_disabled_by_admin ||
                      (reply as Comment)?.user?.is_disabled_by_admin
                    }
                    parentCommentId={(reply as Comment)?.parentId} // Parent Comment ID
                    postId={
                      ((reply as Comment)?.parent?.questionId ||
                        (reply as Comment)?.parent?.parent?.questionId ||
                        (reply as Comment)?.parent?.quizId ||
                        (reply as Comment)?.parent?.parent?.quizId ||
                        (reply as Comment)?.parent?.pollId ||
                        (reply as Comment)?.parent?.parent?.pollId ||
                        (reply as Comment)?.parent?.campfireShareId ||
                        (reply as Comment)?.parent?.parent?.campfireShareId ||
                        (reply as Comment)?.parent?.campfire_post_share_id ||
                        (reply as Comment)?.parent?.parent
                          ?.campfire_post_share_id ||
                        (reply as Comment)?.parent?.postShareId ||
                        (reply as Comment)?.parent?.parent
                          ?.postShareId) as string
                    }
                    otherLink={
                      (reply as Comment)?.parent?.campfireShareId
                        ? `/campfire/${
                            (reply as Comment)?.parent?.campfireShare?.campfire
                              ?.title
                          }`
                        : (reply as Comment)?.parent?.parent?.campfireShareId
                          ? `/campfire/${
                              (reply as Comment)?.parent?.parent?.campfireShare
                                ?.campfire?.title
                            }`
                          : (reply as Comment)?.parent?.announcement_id &&
                              (reply as Comment)?.parent?.announcement
                            ? (reply as Comment)?.parent?.announcement
                                ?.isExpired
                              ? `/announcement/${
                                  (reply as Comment)?.parent?.announcement_id
                                }`
                              : (reply as Comment)?.parent?.announcement
                                    ?.campfire_id &&
                                  (reply as Comment)?.parent?.announcement
                                    ?.campfire
                                ? `/campfire/${
                                    (reply as Comment)?.parent?.announcement
                                      ?.campfire?.title
                                  }`
                                : '/'
                            : (reply as Comment)?.parent?.parent
                                  ?.announcement_id &&
                                (reply as Comment)?.parent?.parent?.announcement
                              ? (reply as Comment)?.parent?.parent?.announcement
                                  ?.isExpired
                                ? `/announcement/${
                                    (reply as Comment)?.parent?.parent
                                      ?.announcement_id
                                  }`
                                : (reply as Comment)?.parent?.parent
                                      ?.announcement?.campfire_id &&
                                    (reply as Comment)?.parent?.parent
                                      ?.announcement?.campfire
                                  ? `/campfire/${
                                      (reply as Comment)?.parent?.parent
                                        ?.announcement?.campfire?.title
                                    }`
                                  : '/'
                              : ''
                    }
                    id={(reply as Comment)?.id} // Comment ID
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.comment}
                    user={(reply as Comment)?.user}
                    title={
                      <ShrinkComments
                        message={(reply as Comment)?.message}
                        isEdited={(reply as Comment)?.isEdited}
                      />
                    }
                    createdAt={(reply as Comment)?.createdAt}
                    color="bg-skyBlue-300"
                    showBookmark
                    isLastChild
                    clickableCard={
                      !(reply as Comment)?.is_disabled_by_admin &&
                      !(reply as Comment)?.user?.is_disabled_by_admin
                    }
                    hideActions
                    footerDisable
                    postReaction={(reply as Comment)?.post_reactions}
                    likesCount={(reply as Comment)?.likes}
                    replyUsername={replyUsername}
                    guestUserComment
                    guestParentId={(reply as Comment)?.parent?.id}
                    hideFooter
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isLoadmore && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>
            {loading ? 'Loading Replies...' : 'Load More Replies'}
          </LoadMore>
        </div>
      )}
    </div>
  );
};

export default ProfileActivitiesReply;
