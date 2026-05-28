import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import CampfireCard from '@/components/pages/Forum/posts/CampfireCard';
import ForumAnnouncementCard, {
  Announcement,
} from '@/components/pages/Forum/posts/ForumAnnouncementCard';
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
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { campfirePostShare, campfireShare } from '@/types/campfire';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';
import { activitiesProfileOption } from '@/types/profile';

interface PostReactionData {
  id: string;
  kofukon: {
    id: string;
    name: string;
  };
  poll_id?: string;
  question_id?: string;
  quiz_id?: string;
  campfire_share_id?: string;
  post_share_id?: string;
  campfire_post_share_id?: string;
  poll?: {
    id: string;
    is_disabled_by_admin: boolean;
    user: {
      is_disabled_by_admin: boolean;
    };
    campfire_threads: Array<{
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }>;
  };
  question?: {
    id: string;
    is_disabled_by_admin: boolean;
    user: {
      is_disabled_by_admin: boolean;
    };
    campfire_threads: Array<{
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }>;
  };
  quiz?: {
    id: string;
    is_disabled_by_admin: boolean;
    user: {
      is_disabled_by_admin: boolean;
    };
    campfire_threads: Array<{
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }>;
  };
  campfire_share?: {
    id: string;
  };
  post_share?: {
    id: string;
  };
  announcement?: {
    id: string;
  };
  campfire_thread_share?: {
    id: string;
  };
}

interface IProfileActivitiesPost {
  selectedOption: activitiesProfileOption;
  query: ReturnType<typeof gql>;
  headerTitle: JSX.Element | string;
}

const ProfileActivitiesReacted = ({
  selectedOption,
  query,
  headerTitle,
}: IProfileActivitiesPost) => {
  const [postData, setPostData] = useState<PostReactionData[]>([]);
  const userId = useAppSelector(getUserId);
  const [isLoadmore, setIsLoadmore] = useState(false);
  const token = useAppSelector(selectGetToken);
  const [fetchActivityList, { loading, error, data }] = useLazyQuery(query, {
    fetchPolicy: 'no-cache',
  });

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      setPostData((prevData) => [
        ...prevData,
        ...(data as any).post_reactions.slice(0, 3),
      ]);
      setIsLoadmore(!((data as any).post_reactions.length <= 3));
    }
  }, [data]);

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
          ...selectedOption.value,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    },
    [fetchActivityList, selectedOption.value, userId, token],
  );

  const handleLoadMore = () => {
    fetchActivities(postData?.length);
  };

  useEffect(() => {
    setPostData([]);
    fetchActivities(0);
  }, [query, fetchActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Your Reacted Posts" />
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className="text-sm font-bold text-gray-500">
            To see updates, have to react on post
          </p>
        </div>
      </div>
    );

  return (
    <div>
      <ProfileActivityHeader title={headerTitle} />

      {isEmpty(postData) ? (
        !(data as any)?.post_reactions ? (
          <TabletLoader />
        ) : (
          <div>
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops, no data to show." />
              <p className="text-sm font-bold text-gray-500">
                To see updates, have to react on post
              </p>
            </div>
          </div>
        )
      ) : (
        <div>
          <div className="second-child relative  mt-4 rounded-md p-4 ">
            {postData.map((post: PostReactionData) => {
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
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      reactionName={post?.kofukon?.name}
                      isDisable={
                        post?.poll?.is_disabled_by_admin ||
                        post?.poll?.user?.is_disabled_by_admin
                      }
                      footerDisable
                    />
                  </div>
                );
              }
              if (post.quiz) {
                return (
                  <div key={post.quiz.id}>
                    <ForumQuizCard
                      postData={post.quiz as QuizType}
                      clickableCard={
                        !post?.quiz?.is_disabled_by_admin &&
                        !post?.quiz?.user?.is_disabled_by_admin
                      }
                      hideActions
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      reactionName={post?.kofukon?.name}
                      isDisable={
                        post?.quiz?.is_disabled_by_admin ||
                        post?.quiz?.user?.is_disabled_by_admin
                      }
                      footerDisable
                    />
                  </div>
                );
              }
              if (post.question) {
                return (
                  <div key={post.question.id}>
                    <ForumQuestionCard
                      postData={post.question as QuestionType}
                      clickableCard={
                        !post?.question?.is_disabled_by_admin &&
                        !post?.question?.user?.is_disabled_by_admin
                      }
                      hideActions
                      pollReactions={[
                        {
                          id: post.id,

                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      reactionName={post?.kofukon?.name}
                      isDisable={
                        post?.question?.is_disabled_by_admin ||
                        post?.question?.user?.is_disabled_by_admin
                      }
                      footerDisable
                    />
                  </div>
                );
              }
              if (post.campfire_share) {
                return (
                  <div key={post.campfire_share.id}>
                    <CampfireCard
                      postData={post.campfire_share as campfireShare}
                      reactionName={post?.kofukon?.name}
                      hideActions
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      footerDisable
                      isCampfireShare
                      isDisable={false}
                      clickableCard={
                        !(post?.campfire_share as campfireShare)
                          ?.is_disabled_by_admin &&
                        !(post?.campfire_share as campfireShare)?.user
                          ?.is_disabled_by_admin
                      }
                    />
                  </div>
                );
              }
              if (post.campfire_thread_share) {
                return (
                  <div key={post.campfire_thread_share.id}>
                    <CampfireCard
                      postData={post.campfire_thread_share as campfirePostShare}
                      hideActions
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      footerDisable
                      reactionName={post?.kofukon?.name}
                      isDisable={false}
                      clickableCard={
                        !(post?.campfire_thread_share as campfirePostShare)
                          ?.is_disabled_by_admin &&
                        !(post?.campfire_thread_share as campfirePostShare)
                          ?.user?.is_disabled_by_admin
                      }
                    />
                  </div>
                );
              }
              if (post.post_share) {
                return (
                  <div key={post.post_share.id}>
                    <SharedPostCard
                      postData={post.post_share as PostShare}
                      reactionName={post?.kofukon?.name}
                      hideActions
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      clickableCard={
                        !(post?.post_share as PostShare)
                          ?.is_disabled_by_admin &&
                        !(post?.post_share as PostShare)?.user
                          ?.is_disabled_by_admin
                      }
                      footerDisable
                      isDisable={false}
                    />
                  </div>
                );
              }
              if (post.announcement) {
                return (
                  <div key={post.announcement?.id}>
                    <ForumAnnouncementCard
                      announcementsData={
                        [{ ...post.announcement }] as Announcement[]
                      }
                      pollReactions={[
                        {
                          id: post.id,
                          userId: userId ?? '',
                          kofukon: post.kofukon,
                        },
                      ]}
                      reactionName={post?.kofukon?.name}
                      footerDisable
                    />
                  </div>
                );
              }
              return null;
            })}
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
  );
};

export default ProfileActivitiesReacted;
