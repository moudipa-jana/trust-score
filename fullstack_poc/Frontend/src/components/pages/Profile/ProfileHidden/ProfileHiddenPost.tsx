import { useLazyQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect } from 'react';

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
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { QUERY_FETCH_HIDE_POST } from '@/service/graphql/Profile';
import { selectGetToken } from '@/state/Slices/auth';
import {
  fetchHiddenPostCount,
  fetchHiddenPostFeedSuccess,
  getHiddenPostCount,
  getHiddenPostFeed,
} from '@/state/Slices/profile';
import { PostTypeEnum } from '@/types/enums';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';
import { profileOption } from '@/types/profile';

interface IProfileActivitiesPost {
  selectedOption: profileOption;
}

interface HiddenPost {
  id: string;
  poll?: PollType;
  quiz?: QuizType;
  question?: QuestionType;
  postShare?: PostShare & {
    type: string;
  };
}

const ProfileHiddenPost = ({ selectedOption }: IProfileActivitiesPost) => {
  const dispatch = useAppDispatch();
  const hiddenPosts = useAppSelector(getHiddenPostFeed);
  const hiddenPostCount = useAppSelector(getHiddenPostCount);
  const token = useAppSelector(selectGetToken);
  const [fetchActivityList, { loading, error, data }] = useLazyQuery(
    QUERY_FETCH_HIDE_POST,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      const hiddenCount = (data as any).totalHiddenPosts.aggregate.count;
      const postArray = [...hiddenPosts, ...(data as any).hidden_posts];
      dispatch(fetchHiddenPostFeedSuccess(postArray));
      dispatch(fetchHiddenPostCount(hiddenCount));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const fetchHiddenActivities = useCallback(
    (offset = 0, limit = 3) => {
      fetchActivityList({
        variables: {
          limit,
          offset,
          sort: {
            createdAt: selectedOption.value,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    },
    [fetchActivityList, selectedOption.value, token],
  );

  const handleLoadMore = () => {
    fetchHiddenActivities(hiddenPosts.length);
  };

  useEffect(() => {
    dispatch(fetchHiddenPostFeedSuccess([]));
    fetchHiddenActivities(0);
  }, [selectedOption, dispatch, fetchHiddenActivities]);

  useEffect(() => {
    if (hiddenPosts.length === 2 && hiddenPostCount > 2) {
      fetchHiddenActivities(hiddenPosts.length, 1);
    }
  }, [hiddenPosts.length, hiddenPostCount, fetchHiddenActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Hidden Posts" />
        <ProfileActivityErrorComponent errorMessage="Oops something went wrong." />
      </div>
    );

  return (
    <div>
      {isEmpty(hiddenPosts) ? (
        !(data as any)?.hidden_posts ? (
          <TabletLoader />
        ) : (
          <div>
            <ProfileActivityHeader title="Hidden Posts" />
            <ProfileActivityErrorComponent errorMessage="Oops, no data to show." />
          </div>
        )
      ) : (
        <div>
          <ProfileActivityHeader title="Hidden Posts" />
          <div className="second-child relative  mt-2">
            {Array.isArray(hiddenPosts) &&
              hiddenPosts.map((post: HiddenPost) => {
                if (post.poll) {
                  return (
                    <div key={post.id}>
                      <ForumPollCard
                        postData={post.poll as PollType}
                        clickableCard={
                          !post?.poll?.is_disabled_by_admin &&
                          !post?.poll?.user?.is_disabled_by_admin
                        }
                        isHidden={post.id}
                        notOverlay
                        footerDisable
                        isDisable={
                          post?.poll?.is_disabled_by_admin ||
                          post?.poll?.user?.is_disabled_by_admin
                        }
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
                        isHidden={post.id}
                        notOverlay
                        footerDisable
                        isDisable={
                          post?.quiz?.is_disabled_by_admin ||
                          post?.quiz?.user?.is_disabled_by_admin
                        }
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
                        isHidden={post.id}
                        notOverlay
                        footerDisable
                        isDisable={
                          post?.question?.is_disabled_by_admin ||
                          post?.question?.user?.is_disabled_by_admin
                        }
                      />
                    </div>
                  );
                }
                if (post.postShare) {
                  const postShareInnerType = post?.postShare?.type;
                  return (
                    <div key={post.postShare.id}>
                      <SharedPostCard
                        noPadd
                        postData={post.postShare as PostShare}
                        clickableCard={
                          (!post?.postShare?.is_disabled_by_admin &&
                            !post?.postShare?.user?.is_disabled_by_admin &&
                            !post?.postShare?.[
                              postShareInnerType as PostTypeEnum.poll
                            ]?.is_disabled_by_admin) ||
                          !post?.postShare?.[
                            postShareInnerType as PostTypeEnum.poll
                          ]?.user?.is_disabled_by_admin
                        }
                        isHidden={post.id}
                        notOverlay
                        footerDisable
                        isDisable={
                          post?.postShare?.is_disabled_by_admin ||
                          post?.postShare?.user?.is_disabled_by_admin ||
                          post?.postShare?.[
                            postShareInnerType as PostTypeEnum.poll
                          ]?.is_disabled_by_admin ||
                          post?.postShare?.[
                            postShareInnerType as PostTypeEnum.poll
                          ]?.user?.is_disabled_by_admin
                        }
                      />
                    </div>
                  );
                }
                return null;
              })}
          </div>
        </div>
      )}
      {hiddenPostCount > hiddenPosts?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>
            {loading ? 'Loading Post...' : 'Load More Post'}
          </LoadMore>
        </div>
      )}
    </div>
  );
};

export default ProfileHiddenPost;
