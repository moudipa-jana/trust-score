import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import { useAppSelector } from '@/Hooks/useRedux';
import { GET_DELETED_POSTS } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { PollType, QuestionType, QuizType, ThreadType } from '@/types/forum';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ICampfireLivePosts {
  campfireId: string;
}

const DeletedPosts = ({ campfireId }: ICampfireLivePosts) => {
  const [deletedPostsData, setDeletedPostsData] = useState([]);

  const token = useAppSelector(selectGetToken);

  const { loading, data } = useQuery(GET_DELETED_POSTS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: {
      campfireId: campfireId,
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if ((data as any)?.campfire_threads) {
      setDeletedPostsData((data as any).campfire_threads);
    }
  }, [data]);

  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(deletedPostsData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            Nothing to see here
          </p>
        </div>
      ) : (
        <>
          {deletedPostsData.map((post: ThreadType) => {
            switch (post.type) {
              case 'question':
                return (
                  <div key={post.id}>
                    <ForumQuestionCard
                      postData={post.question as QuestionType}
                      hideActions
                      campfireDeletedPost
                      footerDisable
                      clickableCard={
                        !post?.question?.is_disabled_by_admin &&
                        !post?.question?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.question?.is_disabled_by_admin ||
                        post?.question?.user?.is_disabled_by_admin
                      }
                    />
                  </div>
                );
              case 'quiz':
                return (
                  <div key={post.id}>
                    <ForumQuizCard
                      postData={post.quiz as QuizType}
                      hideActions
                      campfireDeletedPost
                      footerDisable
                      clickableCard={
                        !post?.quiz?.is_disabled_by_admin &&
                        !post?.quiz?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.quiz?.is_disabled_by_admin ||
                        post?.quiz?.user?.is_disabled_by_admin
                      }
                    />
                  </div>
                );
              case 'poll':
                return (
                  <div key={post.id}>
                    <ForumPollCard
                      postData={post.poll as PollType}
                      hideActions
                      campfireDeletedPost
                      footerDisable
                      clickableCard={
                        !post?.poll?.is_disabled_by_admin &&
                        !post?.poll?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.poll?.is_disabled_by_admin ||
                        post?.poll?.user?.is_disabled_by_admin
                      }
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

export default DeletedPosts;
