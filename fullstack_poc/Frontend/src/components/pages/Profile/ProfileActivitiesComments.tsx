import { useLazyQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { get, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import { Comment as ReplyComment } from '@/components/pages/Profile/ProfileActivitiesReply';
import ForumCard from '@/components/Utility/ForumCard';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { selectGetToken } from '@/state/Slices/auth';
import { TrustScoreContext } from '@/context/TrustScoreContext';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { activitiesProfileOption } from '@/types/profile';

interface CommentUser {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  isFollowing: boolean;
  is_disabled_by_admin: boolean;
}

interface PostReaction {
  id: string;
  userId: string;
  kofukon: {
    id: string;
    name: string;
  };
}

interface BaseComment {
  id: string;
  message: string;
  noParticipants?:
    | number
    | {
        aggregate: {
          count: number;
        };
      };
  noDownValues: number;
  noUpValues: number;
  createdAt: string;
  upVoted: boolean;
  downVoted: boolean;
  isBookmarked: boolean;
  isEdited: boolean;
  ispinned: boolean;
  isHidden: boolean;
  questionId?: string;
  quizId?: string;
  pollId?: string;
  likes: number;
  is_disabled_by_admin: boolean;
  post_reactions: PostReaction[];
  postShareId?: string;
  campfire_post_share_id?: string;
  campfireShareId?: string;
  parentId?: string;
  user: CommentUser;
  repliesCount: {
    aggregate: {
      count: number;
    };
  };
}

interface ExtendedComment extends BaseComment {
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
        user: CommentUser;
      };
    }>;
    user: CommentUser | null;
  };
  campfireShare?: {
    campfire: {
      title: string;
    };
    user: {
      name?: string;
    };
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
  poll?: {
    user: CommentUser;
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
  question?: {
    user: CommentUser;
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
  quiz?: {
    user: CommentUser;
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
  postShare?: {
    user: CommentUser;
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
  campfire_thread_share?: {
    user: CommentUser;
    comments: Array<{
      parentId: string;
      comment: {
        user: CommentUser;
      };
    }>;
  };
}
interface CommentData {
  type: string;
  participanCount?: number;
  comment: ExtendedComment;
}

interface CommentWithParentId {
  parentId: string;
  comment: {
    user: {
      name: string;
    };
  };
}

interface IProfileActivitiesComments {
  selectedOption: activitiesProfileOption;
  query: ReturnType<typeof gql>;
  header?: React.ReactNode;
  count?: number;
  userId?: string;
  guestUser?: boolean;
}
const ProfileActivitiesComments = ({
  selectedOption,
  query,
  header,
  count,
  userId,
  guestUser,
}: IProfileActivitiesComments) => {
  const [isLoadmore, setIsLoadmore] = useState(true);
  const [commentData, setCommentData] = useState<CommentData[]>([]);
  const router = useRouter();
  const isGuestUser = router.pathname.includes('/user/');

  const token = useAppSelector(selectGetToken);
  const [fetchActivityList, { loading, error, data }] = useLazyQuery(query, {
    fetchPolicy: 'no-cache',
  });

  const [trustScoreMap, setTrustScoreMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    const fetchTrustScore = async () => {
      try {
        const response = await fetch('http://localhost:8080/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': 'myadminsecretkey'
          },
          body: JSON.stringify({
            query: `
            query GetUserTrustScores($userId: uuid!) {
              trust_scores(where: {author_id: {_eq: $userId}}) {
                trust_score
              }
            }
          `,
            variables: { userId }
          })
        });
        const resData = await response.json();
        const scores = resData?.data?.trust_scores;
        if (scores && scores.length > 0) {
          const total = scores.reduce((sum: number, item: any) => sum + Number(item.trust_score), 0);
          setTrustScoreMap({ [userId]: total / scores.length });
        }
      } catch (err) {
        console.error("Failed to fetch trust score:", err);
      }
    };
    fetchTrustScore();
  }, [userId]);

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      setCommentData((prevData) => {
        const commentArray = [
          ...prevData,
          ...((data as any)?.comments.slice(0, 3) || []),
        ];
        const checkLoadmore = count
          ? count > commentArray.length
          : !((data as any)?.comments?.length <= 3);
        setIsLoadmore(checkLoadmore);
        return commentArray;
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
          offset,
          userId: userId,
          ...(guestUser ? { sort: selectedOption.value.sort } : {}),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchActivityList, userId, selectedOption, token],
  );

  const handleLoadMore = () => {
    fetchActivities(commentData?.length);
  };

  useEffect(() => {
    setCommentData([]);
    fetchActivities(0);
  }, [selectedOption, fetchActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Comments & Replies" />
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className="text-sm font-bold text-gray-500">
            To see updates, have to create comment or reply
          </p>
        </div>
      </div>
    );

  return (
    <TrustScoreContext.Provider value={trustScoreMap}>
      <div>
        {header}
      {isEmpty(commentData) ? (
        !(data as any)?.comments ? (
          <TabletLoader />
        ) : (
          <div>
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops, no data to show." />
              <p className="text-sm font-bold text-gray-500">
                To see updates, have to create comment
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="m-2">
          <div className="second-child overlaySecChild relative rounded-md ">
            {commentData?.map((commentObj: CommentData | ExtendedComment) => {
              const comment = commentObj;
              const participanCount =
                (comment as ExtendedComment)?.noParticipants || 0;
              let postUsername = '';
              let replyUsername = '';
              if ((comment as ExtendedComment)?.questionId) {
                postUsername =
                  (comment as ExtendedComment)?.question?.user?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.question?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.pollId) {
                postUsername =
                  (comment as ExtendedComment)?.poll?.user?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.poll?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.quizId) {
                postUsername =
                  (comment as ExtendedComment)?.quiz?.user?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.quiz?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.postShareId) {
                postUsername =
                  (comment as ExtendedComment)?.postShare?.user?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.postShare?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.campfireShareId) {
                postUsername =
                  (comment as ExtendedComment)?.campfireShare?.user?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.campfireShare?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.campfire_post_share_id) {
                postUsername =
                  (comment as ExtendedComment)?.campfire_thread_share?.user
                    ?.name ?? '';
                replyUsername = (
                  comment as ExtendedComment
                )?.campfire_thread_share?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else if ((comment as ExtendedComment)?.announcement_id) {
                postUsername =
                  (comment as ExtendedComment)?.announcement?.user?.name ??
                  'kōfuku';
                replyUsername = (
                  comment as ExtendedComment
                )?.announcement?.comments?.find(
                  (cmt: CommentWithParentId) =>
                    cmt?.parentId ==
                    ((comment as ExtendedComment)?.parentId as string),
                )?.comment?.user?.name as string;
              } else {
                replyUsername =
                  (comment as unknown as ReplyComment)?.parent?.user?.name ??
                  '';
              }
              return (
                <div
                  className="my-4 bg-[#BDECFF] p-4 reshare-card comment-card rounded-xl"
                  key={(comment as ExtendedComment)?.id}
                >
                  <ForumCard
                    color="bg-skyBlue-300"
                    isDisable={
                      (comment as ExtendedComment)?.is_disabled_by_admin ||
                      (comment as ExtendedComment)?.user?.is_disabled_by_admin
                    }
                    postId={
                      (((comment as ExtendedComment)?.questionId ||
                        (comment as ExtendedComment)?.quizId ||
                        (comment as ExtendedComment)?.pollId ||
                        (comment as ExtendedComment)?.campfireShareId ||
                        (comment as ExtendedComment)?.campfire_post_share_id ||
                        (comment as ExtendedComment)?.postShareId) as string) ||
                      (((comment as ReplyComment)?.parent?.questionId ||
                        (comment as ReplyComment)?.parent?.quizId ||
                        (comment as ReplyComment)?.parent?.pollId ||
                        (comment as ReplyComment)?.parent?.campfireShareId ||
                        (comment as ReplyComment)?.parent
                          ?.campfire_post_share_id ||
                        (comment as ReplyComment)?.parent
                          ?.postShareId) as string) ||
                      (((comment as ReplyComment)?.parent?.parent?.questionId ||
                        (comment as ReplyComment)?.parent?.parent?.quizId ||
                        (comment as ReplyComment)?.parent?.parent?.pollId ||
                        (comment as ReplyComment)?.parent?.parent
                          ?.campfireShareId ||
                        (comment as ReplyComment)?.parent?.parent
                          ?.campfire_post_share_id ||
                        (comment as ReplyComment)?.parent?.parent
                          ?.postShareId) as string)
                    }
                    otherLink={
                      (comment as ReplyComment)?.parent?.campfireShareId
                        ? `/campfire/${
                            (comment as ReplyComment)?.parent?.campfireShare
                              ?.campfire?.title
                          }`
                        : (comment as ReplyComment)?.parent?.parent
                              ?.campfireShareId
                          ? `/campfire/${
                              (comment as ReplyComment)?.parent?.parent
                                ?.campfireShare?.campfire?.title
                            }`
                          : (comment as ReplyComment)?.parent
                                ?.announcement_id &&
                              (comment as ReplyComment)?.parent?.announcement
                            ? (comment as ReplyComment)?.parent?.announcement
                                ?.isExpired
                              ? `/announcement/${
                                  (comment as ReplyComment)?.parent
                                    ?.announcement_id
                                }`
                              : (comment as ReplyComment)?.parent?.announcement
                                    ?.campfire_id &&
                                  (comment as ReplyComment)?.parent
                                    ?.announcement?.campfire
                                ? `/campfire/${
                                    (comment as ReplyComment)?.parent
                                      ?.announcement?.campfire?.title
                                  }`
                                : '/'
                            : (comment as ReplyComment)?.parent?.parent
                                  ?.announcement_id &&
                                (comment as ReplyComment)?.parent?.parent
                                  ?.announcement
                              ? (comment as ReplyComment)?.parent?.parent
                                  ?.announcement?.isExpired
                                ? `/announcement/${
                                    (comment as ReplyComment)?.parent?.parent
                                      ?.announcement_id
                                  }`
                                : (comment as ReplyComment)?.parent?.parent
                                      ?.announcement?.campfire_id &&
                                    (comment as ReplyComment)?.parent?.parent
                                      ?.announcement?.campfire
                                  ? `/campfire/${
                                      (comment as ReplyComment)?.parent?.parent
                                        ?.announcement?.campfire?.title
                                    }`
                                  : '/'
                              : ''
                    }
                    id={(comment as ExtendedComment)?.id}
                    parentCommentId={(comment as ExtendedComment)?.id}
                    user={
                      (comment as ExtendedComment)?.user ||
                      (comment as ExtendedComment)?.campfireShare?.campfire
                        ?.title
                    }
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.comment}
                    title={
                      <ShrinkComments
                        message={(comment as ExtendedComment)?.message}
                        isEdited={(comment as ExtendedComment)?.isEdited}
                      />
                    }
                    createdAt={(comment as ExtendedComment)?.createdAt}
                    commentsCount={get(
                      comment,
                      'repliesCount.aggregate.count',
                      0,
                    )}
                    participantsCount={participanCount as number}
                    showBookmark
                    clickableCard={
                      !(comment as ExtendedComment)?.is_disabled_by_admin &&
                      !(comment as ExtendedComment)?.user?.is_disabled_by_admin
                    }
                    hideActions
                    footerDisable
                    guestUserComment
                    hideFooter
                    guestParentId={(comment as ExtendedComment)?.parentId}
                    postUsername={postUsername}
                    replyUsername={replyUsername}
                    postReaction={(comment as ExtendedComment)?.post_reactions}
                    likesCount={(comment as ExtendedComment)?.likes}
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
            {isGuestUser
              ? loading
                ? 'Loading Comments & Replies...'
                : 'Load More Comments & Replies'
              : loading
                ? 'Loading Comments'
                : 'Load More Comments'}
          </LoadMore>
        </div>
      )}
    </div>
    </TrustScoreContext.Provider>
  );
};

export default ProfileActivitiesComments;
