import { useMutation } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { MUTATION_CAMPFIRE_ACTIVITIES } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { PollType, QuestionType, QuizType, ThreadType } from '@/types/forum';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ICampfireLivePosts {
  campfireId: string;
}

const LivePosts = ({ campfireId }: ICampfireLivePosts) => {
  const [livePostsData, setLivePostsData] = useState([]);
  const [refetch, setRefetch] = useState(false);

  const token = useAppSelector(selectGetToken);

  const [getLivePosts, { loading, data, error }] = useMutation(
    MUTATION_CAMPFIRE_ACTIVITIES,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );

  useEffect(() => {
    if ((data as any)?.getCampfireActivities?.activities?.threads) {
      setLivePostsData((data as any).getCampfireActivities.activities.threads);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  useEffect(() => {
    getLivePosts({
      variables: {
        campfireId: campfireId,
        limit: null,
        offset: 0,
        postId: '00000000-0000-0000-0000-000000000000',
        search: '%%',
      },
    });
  }, [campfireId, getLivePosts, refetch]);
  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(livePostsData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            Nothing to see here
          </p>
        </div>
      ) : (
        <>
          {livePostsData.map((post: ThreadType) => {
            switch (post.type) {
              case 'question':
                return (
                  <div key={post.id}>
                    <ForumQuestionCard
                      postData={post.question as QuestionType}
                      clickableCard={
                        !post?.question?.is_disabled_by_admin &&
                        !post?.question?.user?.is_disabled_by_admin
                      }
                      threadId={
                        (post?.question as QuestionType).campfire_threads?.[0]
                          ?.id
                      }
                      footerDisable
                      isDisable={
                        post?.question?.is_disabled_by_admin ||
                        post?.question?.user?.is_disabled_by_admin
                      }
                      setRefetch={setRefetch}
                      campfireToolsPosts
                    />
                  </div>
                );
              case 'quiz':
                return (
                  <div key={post.id}>
                    <ForumQuizCard
                      postData={post.quiz as QuizType}
                      clickableCard={
                        !post?.quiz?.is_disabled_by_admin &&
                        !post?.quiz?.user?.is_disabled_by_admin
                      }
                      threadId={
                        (post.quiz as QuizType).campfire_threads?.[0]?.id
                      }
                      footerDisable
                      isDisable={
                        post?.quiz?.is_disabled_by_admin ||
                        post?.quiz?.user?.is_disabled_by_admin
                      }
                      setRefetch={setRefetch}
                      campfireToolsPosts
                    />
                  </div>
                );
              case 'poll':
                return (
                  <div key={post.id}>
                    <ForumPollCard
                      postData={post.poll as PollType}
                      clickableCard={
                        !post?.poll?.is_disabled_by_admin &&
                        !post?.poll?.user?.is_disabled_by_admin
                      }
                      threadId={
                        (post.poll as PollType).campfire_threads?.[0]?.id
                      }
                      footerDisable
                      isDisable={
                        post?.poll?.is_disabled_by_admin ||
                        post?.poll?.user?.is_disabled_by_admin
                      }
                      setRefetch={setRefetch}
                      campfireToolsPosts
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
        </>
      )}
    </div>
  );
};

export default LivePosts;
