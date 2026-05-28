import { useLazyQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { selectGetToken } from '@/state/Slices/auth';
import { TrustScoreContext } from '@/context/TrustScoreContext';
import { UserProfile } from '@/types/authentication';
import {
  CampfirePostShare,
  PollType,
  PostShare,
  QuestionType,
  QuizType,
  UserThreadType,
} from '@/types/forum';
import { activitiesProfileOption } from '@/types/profile';

interface IProfileActivitiesPost {
  selectedOption?: activitiesProfileOption;
  query: ReturnType<typeof gql>;
  header?: React.ReactNode;
  count?: number;
  userId?: string;
  guestUser?: boolean;
}

export type ThreadContentType = 'question' | 'quiz' | 'poll' | 'postShare';

export interface ThreadPost {
  id: string;
  type: ThreadContentType;
  postType?: ThreadContentType;
  isArchived: boolean;
  isBlocked: boolean;
  isCampfire: boolean;
  isHidden: boolean;
  createdAt: string;
  commoncategory: string;
  categoryId: string;
  archivedAt: string;
  latest_report_assigned_to_logged_in_admin_at: string;
  noParticipants: number;
  noComments: number;
  noUpValues: number;
  noViews: number;
  title: string;
  userId: string;
  campfirePostShare?: CampfirePostShare;
  poll?: PollType;
  question?: QuestionType;
  quiz?: QuizType;
  postShare?: PostShare;
  user: UserThreadType;
}
const ProfileActivitiesPost = ({
  selectedOption,
  query,
  header,
  count,
  userId,
  guestUser,
}: IProfileActivitiesPost) => {
  const [postData, setPostData] = useState<ThreadPost[]>([]);
  const [isLoadmore, setIsLoadmore] = useState(false);
  const token = useAppSelector(selectGetToken);
  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;

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
      setPostData((prevData) => {
        const postArray = [...prevData, ...(data as any).posts.slice(0, 3)];
        const checkLoadmore = count
          ? count > postArray.length
          : !((data as any).posts.length <= 3);
        setIsLoadmore(checkLoadmore);
        return postArray;
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
      if (selectedOption) {
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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedOption, fetchActivityList, userId, token],
  );

  const handleLoadMore = () => {
    fetchActivities(postData.length);
  };

  useEffect(() => {
    setPostData([]);
    fetchActivities(0);
  }, [selectedOption, fetchActivities]);

  const handleUpdatePostById = (threadData: ThreadPost) => {
    setPostData((prevPostData) => {
      const threadIndex = prevPostData.findIndex(
        (post) => post.id === threadData?.id,
      );

      if (threadIndex === -1) return prevPostData; // Not found, return original

      const updatedPostData = [...prevPostData];
      updatedPostData[threadIndex] = {
        ...updatedPostData[threadIndex],
        ...threadData,
      };

      return updatedPostData;
    });
  };

  if (error)
    return (
      <div className="layout flex flex-col items-center justify-center gap-3 text-center">
        <ProfileActivityHeader title="Activities Posts" />
        <ProfileActivityErrorComponent errorMessage="Oops, no post in the campfire." />
        <p className="text-sm font-bold text-gray-500">
          To see updates, have to create post
        </p>
      </div>
    );

  return (
    <TrustScoreContext.Provider value={trustScoreMap}>
      <div>
        {header}
      {isEmpty(postData) ? (
        !(data as any)?.posts ? (
          <>
            <TabletLoader />
          </>
        ) : (
          <div>
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops, no data to show." />
              <p className="text-sm font-bold text-gray-500">
                To see updates, have to create post
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="m-2">
          <div className="second-child overlaySecChild relative rounded-md ">
            <div className=" relative ">
              {postData.map((post: ThreadPost, index: number) => {
                const postType = post?.type;
                const campfireThreadSharePostType = post?.campfirePostShare
                  ?.question
                  ? 'question'
                  : post?.campfirePostShare?.quiz
                    ? 'quiz'
                    : post?.campfirePostShare?.poll
                      ? 'poll'
                      : null;

                const innerType =
                  post?.[postType]?.type ?? campfireThreadSharePostType;
                if (post.poll) {
                  return (
                    <div key={post.id}>
                      <ForumPollCard
                        postData={post.poll as PollType}
                        clickableCard={
                          !post?.poll?.is_disabled_by_admin &&
                          !post?.poll?.user?.is_disabled_by_admin
                        }
                        hideActions
                        index={index}
                        myActivityPost
                        isDisable={
                          post?.poll?.is_disabled_by_admin ||
                          post?.poll?.user?.is_disabled_by_admin
                        }
                        handleUpdatePostById={handleUpdatePostById}
                        footerDisable
                      />
                    </div>
                  );
                }
                if (post.quiz) {
                  return (
                    <div key={post.quiz.id} className="card-distance">
                      <ForumQuizCard
                        postData={post.quiz as QuizType}
                        clickableCard={
                          !post?.quiz?.is_disabled_by_admin &&
                          !post?.quiz?.user?.is_disabled_by_admin
                        }
                        hideActions
                        index={index}
                        myActivityPost
                        isDisable={
                          post?.quiz?.is_disabled_by_admin ||
                          post?.quiz?.user?.is_disabled_by_admin
                        }
                        handleUpdatePostById={handleUpdatePostById}
                        footerDisable
                      />
                    </div>
                  );
                }
                if (post.question) {
                  return (
                    <div key={post.question.id} className="card-distance">
                      <ForumQuestionCard
                        postData={post.question as QuestionType}
                        clickableCard={
                          !post?.question?.is_disabled_by_admin &&
                          !post?.question?.user?.is_disabled_by_admin
                        }
                        hideActions
                        index={index}
                        myActivityPost
                        isDisable={
                          post?.question?.is_disabled_by_admin ||
                          post?.question?.user?.is_disabled_by_admin
                        }
                        handleUpdatePostById={handleUpdatePostById}
                        footerDisable
                      />
                    </div>
                  );
                }
                if (post.postShare) {
                  return (
                    <div key={post.postShare.id} className="card-distance">
                      <SharedPostCard
                        postData={post.postShare as PostShare}
                        clickableCard={
                          !post?.postShare?.is_disabled_by_admin &&
                          !post?.postShare?.user?.is_disabled_by_admin &&
                          !post?.postShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.is_disabled_by_admin &&
                          !post?.postShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.user?.is_disabled_by_admin
                        }
                        hideActions
                        index={index}
                        currentUserSharedPost={
                          !!post?.postShare?.user?.id || !!profile?.id
                        }
                        currentUserProfile={
                          post?.postShare?.user?.id !== profile?.id
                            ? post?.postShare?.user?.profilePicture
                            : profile?.profilePicture
                        }
                        isDisable={
                          post?.postShare?.is_disabled_by_admin ||
                          post?.postShare?.user?.is_disabled_by_admin ||
                          post?.postShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.is_disabled_by_admin ||
                          post?.postShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.user?.is_disabled_by_admin
                        }
                        handleUpdatePostById={handleUpdatePostById}
                        footerDisable
                      />
                    </div>
                  );
                }
                if (post.campfirePostShare) {
                  return (
                    <div
                      key={post.campfirePostShare.id}
                      className="card-distance"
                    >
                      <SharedPostCard
                        postData={
                          {
                            ...post.campfirePostShare,
                            ...(post.campfirePostShare?.question
                              ? {
                                  type: 'question',
                                }
                              : post.campfirePostShare?.poll
                                ? {
                                    type: 'poll',
                                  }
                                : {
                                    type: 'quiz',
                                  }),
                          } as unknown as PostShare
                        }
                        clickableCard={
                          !post?.campfirePostShare?.is_disabled_by_admin &&
                          !post?.campfirePostShare?.user
                            ?.is_disabled_by_admin &&
                          !post?.campfirePostShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.is_disabled_by_admin &&
                          !post?.campfirePostShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.user?.is_disabled_by_admin
                        }
                        hideActions
                        index={index}
                        currentUserSharedPost={
                          !!post?.campfirePostShare?.user?.id || !!profile?.id
                        }
                        currentUserProfile={
                          post?.campfirePostShare?.user?.id === profile?.id
                            ? post?.campfirePostShare?.user?.profilePicture
                            : profile?.profilePicture
                        }
                        isDisable={
                          post?.campfirePostShare?.is_disabled_by_admin ||
                          post?.campfirePostShare?.user?.is_disabled_by_admin ||
                          post?.campfirePostShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.is_disabled_by_admin ||
                          post?.campfirePostShare?.[
                            innerType as 'question' | 'quiz' | 'poll'
                          ]?.user?.is_disabled_by_admin
                        }
                        handleUpdatePostById={handleUpdatePostById}
                        footerDisable
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}
      {isLoadmore && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>
            {loading ? 'Loading Post...' : 'Load More Post'}
          </LoadMore>
        </div>
      )}
    </div>
    </TrustScoreContext.Provider>
  );
};

export default ProfileActivitiesPost;
