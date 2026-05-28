import { useLazyQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import { useAppSelector } from '@/Hooks/useRedux';
import { GET_REPORTED_POSTS } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { PollType, QuestionType, QuizType, ThreadType } from '@/types/forum';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ICampfireReportedPosts {
  campfireId: string;
}

const ReportedPosts = ({ campfireId }: ICampfireReportedPosts) => {
  const [reportedPostsdata, setreportedPostsData] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const token = useAppSelector(selectGetToken);

  const [fetchReportedPosts, { loading, data }] = useLazyQuery(
    GET_REPORTED_POSTS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if ((data as any)?.reports) {
      setreportedPostsData((data as any).reports);
    }
  }, [data]);

  useEffect(() => {
    fetchReportedPosts({
      variables: {
        campfireid: campfireId,
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }, [refetch, campfireId, fetchReportedPosts, token]);

  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(reportedPostsdata) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            No reported posts found!
          </p>
        </div>
      ) : (
        <>
          {reportedPostsdata.map((post: ThreadType) => {
            if (post.question) {
              return (
                <div key={post.id}>
                  <ForumQuestionCard
                    postData={post.question as QuestionType}
                    clickableCard={
                      !post?.question?.is_disabled_by_admin &&
                      !post?.question?.user?.is_disabled_by_admin
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
            } else if (post.quiz) {
              return (
                <div key={post.id}>
                  <ForumQuizCard
                    postData={post.quiz as QuizType}
                    clickableCard={
                      !post?.quiz?.is_disabled_by_admin &&
                      !post?.quiz?.user?.is_disabled_by_admin
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
            } else if (post.poll) {
              return (
                <div key={post.id}>
                  <ForumPollCard
                    postData={post.poll as PollType}
                    clickableCard={
                      !post?.poll?.is_disabled_by_admin &&
                      !post?.poll?.user?.is_disabled_by_admin
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
            } else {
              return null;
            }
          })}
        </>
      )}
    </div>
  );
};

export default ReportedPosts;
