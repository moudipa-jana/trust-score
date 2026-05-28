/**
 * HashtagSearch fetches and displays posts associated with a given hashtag query.
 * Supports multiple content types (questions, polls, quizzes, comments, shares),
 * aggregates mention counts, and provides a "Load more" feature for pagination.
 */

import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import { CommentParent } from '@/components/pages/Profile/ProfileActivitiesReply';
import Button from '@/components/Utility/Button';
import ForumCard from '@/components/Utility/ForumCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { SEARCH_QUERY_HASHTAG } from '@/service/graphql/Forum';
import { selectGetToken } from '@/state/Slices/auth';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import {
  PollType,
  PostShare,
  QuestionType,
  QuizType,
  UserThreadType,
} from '@/types/forum';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface IProps {
  query: string;
}

interface HashtagPost {
  id: string;
  comment?: {
    id: string;
    message: string;
    createdAt: string;
    questionId?: string;
    quizId?: string;
    pollId?: string;
    postShareId?: string;
    campfireShareId?: string;
    parentId?: string;
    parent?: CommentParent;
    user: UserThreadType;
    noParticipants: number;
    isBookmarked: boolean;
  };
  question?: QuestionType;
  quiz?: QuizType;
  poll?: PollType;
  post_share?: PostShare;
  campfire_share?: PostShare;
}

interface HashtagResponse {
  post_hashtag: HashtagPost[];
  post_hashtag_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

const HashtagSearch = ({ query }: IProps) => {
  const [postData, setPostData] = useState<HashtagPost[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const [displayedPostsCount, setDisplayedPostsCount] = useState(5);
  const token = useAppSelector(selectGetToken);

  const { data, loading, error } = useQuery<HashtagResponse>(
    SEARCH_QUERY_HASHTAG,
    {
      variables: { text: `${query}` },
      context: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    },
  );

  // Handle error
  useEffect(() => {
    if (error) {
      // Handle error silently or implement proper error handling
    }
  }, [error]);

  useEffect(() => {
    if (!loading && data) {
      setPostData(data?.post_hashtag || []);
      if ((data?.post_hashtag?.length || 0) > displayedPostsCount) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
    }
  }, [data, loading, displayedPostsCount]);

  const handleLoadMore = () => {
    setFetchMoreLoading(true);
    setDisplayedPostsCount((prevCount) => {
      const newCount = prevCount + 5;
      if (newCount >= (postData?.length || 0)) {
        setShowLoadMore(false);
      }
      return newCount;
    });
    setFetchMoreLoading(false);
  };

  return (
    <div className="mb-20 flex">
      <div className="w-[730px]">
        {loading ? (
          <div
            className="mt-20 mb-20 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <TabletLoader style={{ height: 150 }} />
          </div>
        ) : isEmpty(postData) ? (
          <div className="layout mb-20 flex flex-col items-center justify-center gap-3 text-center">
                    <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                    <p className='text-sm font-bold text-gray-500'>
                      No result found
                    </p>
                    <p className='text-sm text-gray-500'>
                      We couldn’t find any results for your search
                    </p>
                  </div>
        ) : (
          <>
            <div className="flex items-center space-x-6">
              <Text size="xl" color="text-gray-1400" font="font-extrabold">
                #{query}
              </Text>
              <Text size="3xl" color="text-gray-1450" font="font-medium">
                {(data?.post_hashtag_aggregate?.aggregate?.count as number) > 1
                  ? `${data?.post_hashtag_aggregate?.aggregate?.count} mentions`
                  : `${data?.post_hashtag_aggregate?.aggregate?.count} mention`}
              </Text>
            </div>
            {postData
              ?.slice(0, displayedPostsCount)
              .map((post: HashtagPost) => {
                if (post?.comment) {
                  const postCommentData = post.comment;
                  const postId = postCommentData?.parent
                    ? postCommentData?.parent?.questionId ||
                      postCommentData?.parent?.quizId ||
                      postCommentData?.parent?.pollId ||
                      (postCommentData?.parent?.postShareId as string)
                    : postCommentData?.questionId ||
                      postCommentData?.quizId ||
                      postCommentData?.pollId ||
                      postCommentData?.postShareId ||
                      postCommentData?.campfireShareId;
                  return (
                    <div
                      className="relative my-4 bg-skyBlue-300 p-4"
                      key={postCommentData?.id}
                    >
                      <div
                        className="child-thread relative mt-4"
                        key={postCommentData?.id}
                      >
                        <div className="overlay-conatiner">
                          <ForumCard
                            postType={PostTypeEnum.question}
                            cardType={CardTypeEnum.comment}
                            color="bg-white"
                            postId={postId as string}
                            id={postCommentData?.id}
                            parentCommentId={
                              postCommentData?.parentId || postCommentData?.id
                            }
                            user={postCommentData?.user}
                            title={
                              <ShrinkComments
                                message={postCommentData?.message}
                              />
                            }
                            createdAt={postCommentData?.createdAt}
                            participantsCount={postCommentData?.noParticipants}
                            showBookmark
                            isBookmarked={postCommentData?.isBookmarked}
                            clickableCard
                          />
                        </div>
                      </div>
                    </div>
                  );
                } else if (post?.question) {
                  return (
                    <div key={post?.id}>
                      <ForumQuestionCard
                        postData={post.question}
                        hideActions
                        footerDisable
                        clickableCard
                      />
                    </div>
                  );
                } else if (post?.quiz) {
                  return (
                    <div key={post?.id}>
                      <ForumQuizCard
                        postData={post.quiz}
                        hideActions
                        footerDisable
                        clickableCard
                      />
                    </div>
                  );
                } else if (post?.poll) {
                  return (
                    <div key={post?.id}>
                      <ForumPollCard
                        postData={post.poll}
                        hideActions
                        footerDisable
                        clickableCard
                      />
                    </div>
                  );
                } else if (post?.post_share || post?.campfire_share) {
                  const shareData = post.post_share || post.campfire_share;
                  return (
                    <div key={post?.id}>
                      <SharedPostCard
                        postData={shareData as PostShare}
                        searchedPost
                        hideActions
                        clickableCard
                      />
                    </div>
                  );
                }
                return null;
              })}
            {showLoadMore && (
              <div className="mt-5 flex justify-center">
                <Button
                  customClassName="w-44"
                  isLoading={fetchMoreLoading}
                  size="lg"
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HashtagSearch;
