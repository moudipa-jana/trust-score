import { useMutation } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  IoIosArrowDown,
  IoIosArrowRoundUp,
  IoIosArrowUp,
} from 'react-icons/io';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Flash from '/public/images/Flash.svg';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { POSTS_WITHIN_CAMPFIRE } from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';
import { PollType, QuestionType, QuizType } from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface UserDetails {
  id: string;
  name: string;
  profilePicture: string;
  totalComments: {
    aggregate: {
      count: number;
    };
  };
}

interface MostActiveUserData {
  userDetails: UserDetails;
  commentsAndReplies: {
    count: number;
  };
  totalPosts: number;
}

interface TotalPostsData {
  totalPosts: number;
  question: number;
  poll: number;
  quiz: number;
  percentChange: string;
}

interface MostPostedUserData {
  totalPosts: number;
  questions: number;
  poll: number;
  quiz: number;
  mostPostedUserData: {
    user: UserDetails;
  };
}

interface MostInteractedPost {
  id: string;
  question?: QuestionType;
  poll?: PollType;
  quiz?: QuizType;
}

interface MostActiveUserProps {
  userDetails: UserDetails;
  commentsAndReplies: { count: number };
  totalPosts: number;
  handleUserNavigation: (user: UserDetails) => void;
}

interface TotalPostsCardProps {
  totalNoPosts: TotalPostsData;
  formatChange: (change: string) => string;
}

interface MostPostsCreatedByUserCardProps {
  mostNoPostsCreatedBy: MostPostedUserData;
  handleUserNavigation: (user: UserDetails) => void;
}

interface IPostsWithinCampfire {
  campfireId: string;
}

const MostActiveUser = ({
  userDetails,
  commentsAndReplies,
  totalPosts,
  handleUserNavigation,
}: MostActiveUserProps) => {
  return (
    <div>
      <div className="flex flex-row items-center">
        <div className="h-5 w-5">
          <CustomImage src={Flash} />
        </div>
        <Text color="text-white" size="sm">
          Most active user
        </Text>
      </div>
      <div
        onClick={() => handleUserNavigation(userDetails)}
        className="my-1 flex cursor-pointer flex-row items-center"
      >
        <div className="mr-2 h-7 w-7">
          <CustomImage
            width={10}
            height={10}
            src={userDetails?.profilePicture}
          />
        </div>
        <Text color="text-white" size="xs">
          {userDetails?.name}
        </Text>
      </div>
      <div>
        <Text size="xxs" color="text-white">
          Comments & Replies {commentsAndReplies?.count}
        </Text>
        <Text size="xxs" color="text-white">
          Created Posts {totalPosts}
        </Text>
        <Text size="xxs" color="text-white">
          Interactions {userDetails?.totalComments?.aggregate?.count}
        </Text>
      </div>
    </div>
  );
};

const TotalPostsCard = ({
  totalNoPosts,
  formatChange,
}: TotalPostsCardProps) => {
  return (
    <div>
      {totalNoPosts?.percentChange &&
        parseFloat(totalNoPosts?.percentChange) > 0 && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-green-900 px-1 py-0.5">
            <Text color="text-white" size="xxs">
              {formatChange(totalNoPosts?.percentChange)}%
            </Text>
            <IoIosArrowRoundUp color="white" />
          </div>
        )}
      <div className="flex space-x-2 pt-2">
        <Text size="lg" color="text-white" font="font-semibold">
          {totalNoPosts?.totalPosts}
        </Text>
      </div>
      <Text size="sm" color="text-white">
        Total number of posts
      </Text>
      <div>
        <div className="flex flex-row items-center">
          <Text size="xxs" color="text-white">
            Questions {totalNoPosts?.question}
          </Text>
          <div className="mx-1 h-1 w-1 rounded-full bg-red-200"></div>
          <Text size="xxs" color="text-white">
            Polls {totalNoPosts?.poll}
          </Text>
        </div>
        <Text size="xxs" color="text-white">
          Quizzes {totalNoPosts?.quiz}
        </Text>
      </div>
    </div>
  );
};

const MostPostsCreatedByUserCard = ({
  mostNoPostsCreatedBy,
  handleUserNavigation,
}: MostPostsCreatedByUserCardProps) => {
  return (
    <div>
      <div className="flex w-[170px] flex-row gap-2">
        <Text color="text-gray-2000" size="xl" font="font-semibold">
          {mostNoPostsCreatedBy?.totalPosts}
        </Text>
        <Text color="text-gray-2000" size="sm" font="font-semibold">
          Most number of posts created by
        </Text>
      </div>

      <div
        onClick={() =>
          handleUserNavigation(mostNoPostsCreatedBy?.mostPostedUserData?.user)
        }
        className="my-1 flex cursor-pointer flex-row items-center"
      >
        <div className="mr-2 h-9 w-9">
          <CustomImage
            width={10}
            height={10}
            src={mostNoPostsCreatedBy?.mostPostedUserData?.user?.profilePicture}
            fallbackSrc="/images/userImage.svg"
          />
        </div>
        <Text size="md">
          {mostNoPostsCreatedBy?.mostPostedUserData?.user?.name}
        </Text>
      </div>

      <div className="flex flex-row items-center justify-between">
        <Text size="xxs" color="text-gray-2000">
          Questions {mostNoPostsCreatedBy?.questions}
        </Text>
        <div className="mx-1 h-1 w-1 rounded-full bg-gray-1100" />
        <Text size="xxs" color="text-gray-2000">
          Polls {mostNoPostsCreatedBy?.poll}
        </Text>
        <div className="mx-1 h-1 w-1 rounded-full bg-gray-1100" />
        <Text size="xxs" color="text-gray-2000">
          Quizzes {mostNoPostsCreatedBy?.quiz}
        </Text>
      </div>
    </div>
  );
};

const PostsWithinCampfire = ({ campfireId }: IPostsWithinCampfire) => {
  const [isDurationDropdown, setIsDurationDropdown] = useState<boolean>(false);
  const token = getUserToken();
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [totalNoPosts, setTotalNoPosts] = useState<TotalPostsData | null>(null);
  const [mostActiveUser, setMostActiveUser] =
    useState<MostActiveUserData | null>(null);
  const [mostInteractedPost, setMostInteractedPost] =
    useState<MostInteractedPost | null>(null);
  const [mostNoPostsCreatedBy, setMostNoPostsCreatedBy] =
    useState<MostPostedUserData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formatChange = (change: string) => {
    if (change) {
      const parsedChange = parseFloat(change);
      return parsedChange.toFixed(2);
    }
    return change;
  };

  const [postsWithinCampfire, { loading }] = useMutation(
    POSTS_WITHIN_CAMPFIRE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response: any) => {
        setTotalNoPosts(
          response?.fetchInsightsOfCampfirePosts?.data?.postCardData,
        );

        setMostActiveUser(
          response?.fetchInsightsOfCampfirePosts?.data?.activeUserData,
        );
        setMostInteractedPost(
          response?.fetchInsightsOfCampfirePosts?.data?.mostInteractedThread,
        );
        setMostNoPostsCreatedBy(
          response?.fetchInsightsOfCampfirePosts?.data?.mostCreatedPostBy,
        );
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setIsDurationDropdown(false);
  };

  const formatDurationText = (duration: number) => {
    return duration === 365 ? 'Last 1 year' : `Last ${duration} days`;
  };
  const isDesktop = useIsDesktop();
  const isIpad = useIsipad();
  const userId = useAppSelector(getUserId);
  const router = useRouter();
  const handleUserNavigation = (user: UserDetails) => {
    if (user?.id === userId) {
      router.push('/profile#activities');
    } else {
      router.push(`/user/${user?.name}`);
    }
  };

  useEffect(() => {
    if (selectedDuration) {
      postsWithinCampfire({
        variables: {
          campfireId,
          duration: selectedDuration,
        },
      });
    }
  }, [selectedDuration, campfireId, postsWithinCampfire]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDurationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);





  const forceIsMemberTrue = (post: any) => {
    if (!post?.campfire_threads) return post;
    return {
      ...post,
      campfire_threads: post.campfire_threads.map((thread: any) => ({
        ...thread,
        campfire: {
          ...thread.campfire,
          isMember: true,
        },
      })),
    };
  };


  const mostInteractedQuestionPostData = mostInteractedPost?.question
    ? forceIsMemberTrue(mostInteractedPost.question)
    : null;

  const mostInteractedPollPostData = mostInteractedPost?.poll
    ? forceIsMemberTrue(mostInteractedPost.poll)
    : null;

  const mostInteractedQuizPostData = mostInteractedPost?.quiz
    ? forceIsMemberTrue(mostInteractedPost.quiz)
    : null;

  return (
    <>
      <div className="mx-4 mt-4 flex items-center justify-end">
        <div ref={dropdownRef}>
          <div
            className="flex cursor-pointer items-center space-x-2 rounded-full border border-primary px-4 py-1 text-primary"
            onClick={() => setIsDurationDropdown(!isDurationDropdown)}
          >
            <Text size="base" color="text-primary">
              {formatDurationText(selectedDuration)}
            </Text>
            {isDurationDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
          {isDurationDropdown && (
            <div className="absolute z-10 mt-3 cursor-pointer space-y-3 rounded-lg border border-primary bg-white py-2 pl-8 pr-2 text-right">
              <div onClick={() => handleDurationChange(7)}>
                <Text size="base">Last 7 days</Text>
              </div>
              <div onClick={() => handleDurationChange(30)}>
                <Text size="base">Last 30 days</Text>
              </div>
              <div onClick={() => handleDurationChange(365)}>
                <Text size="base">Last year</Text>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : (
        <div className="mx-4 mt-4">
          {isDesktop && (
            <div className="flex h-full w-full flex-wrap space-x-7">
              {/* totalNoPosts */}
              <div className="relative h-30 w-3/12 bg-indigo-300 p-2">
                <TotalPostsCard
                  totalNoPosts={totalNoPosts as TotalPostsData}
                  formatChange={formatChange}
                />
              </div>

              {/* mostActiveUser */}
              <div className="h-30 w-4/12 bg-green-1200 p-2">
                <MostActiveUser
                  userDetails={mostActiveUser?.userDetails as UserDetails}
                  commentsAndReplies={
                    mostActiveUser?.commentsAndReplies as { count: number }
                  }
                  totalPosts={mostActiveUser?.totalPosts as number}
                  handleUserNavigation={handleUserNavigation}
                />
              </div>

              {/* mostNoPostsCreatedBy */}
              <div className="h-30 w-4/12 bg-neutral-300 p-2">
                <MostPostsCreatedByUserCard
                  mostNoPostsCreatedBy={
                    mostNoPostsCreatedBy as MostPostedUserData
                  }
                  handleUserNavigation={handleUserNavigation}
                />
              </div>
            </div>
          )}

          {isIpad && (
            <div className=" flex flex-wrap space-y-4 md:space-y-0">
              <div className="mb-5 flex h-30 w-full space-x-3">
                {/* totalNoPosts */}
                <div className="relative h-30 w-1/2 bg-indigo-300 p-2">
                  <TotalPostsCard
                    totalNoPosts={totalNoPosts as TotalPostsData}
                    formatChange={formatChange}
                  />
                </div>

                {/* mostActiveUser */}
                <div className="h-30 w-1/2 bg-green-1200 p-2">
                  <MostActiveUser
                    userDetails={mostActiveUser?.userDetails as UserDetails}
                    commentsAndReplies={
                      mostActiveUser?.commentsAndReplies as { count: number }
                    }
                    totalPosts={mostActiveUser?.totalPosts as number}
                    handleUserNavigation={handleUserNavigation}
                  />
                </div>
              </div>

              {/* mostNoPostsCreatedBy */}
              <div className="h-30 w-1/2 bg-neutral-300 p-2">
                <MostPostsCreatedByUserCard
                  mostNoPostsCreatedBy={
                    mostNoPostsCreatedBy as MostPostedUserData
                  }
                  handleUserNavigation={handleUserNavigation}
                />
              </div>
            </div>
          )}

          {/* Most Interacted Post */}
          {isEmpty(mostInteractedPost) && (
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
              <p className='text-sm font-bold text-gray-500'>
                No data found
              </p>
            </div>
          )}

          {mostInteractedPost?.question && (
            <div key={mostInteractedPost.id}>
              <ForumQuestionCard
                postData={mostInteractedQuestionPostData as QuestionType}
                clickableCard={
                  !mostInteractedPost?.question?.is_disabled_by_admin &&
                  !mostInteractedPost?.question?.user?.is_disabled_by_admin
                }
                mostInteractedPostCard
                hideFooter
                hideActions
                totalComments={mostInteractedPost?.question?.noComments}
                totalParticpants={mostInteractedPost?.question?.noParticipants}
                totalInteractions={mostInteractedPost?.question?.likes}
                isDisable={
                  mostInteractedPost?.question?.is_disabled_by_admin ||
                  mostInteractedPost?.question?.user?.is_disabled_by_admin
                }
              />
            </div>
          )}

          {mostInteractedPost?.poll && (
            <div key={mostInteractedPost.id}>
              <ForumPollCard
                postData={mostInteractedPollPostData as PollType}
                clickableCard={
                  !mostInteractedPost?.poll?.is_disabled_by_admin &&
                  !mostInteractedPost?.poll?.user?.is_disabled_by_admin
                }
                mostInteractedPostCard
                hideFooter
                hideActions
                totalComments={mostInteractedPost?.poll.noComments}
                totalParticpants={mostInteractedPost?.poll.noParticipants}
                totalInteractions={mostInteractedPost?.poll.likes}
                isDisable={
                  mostInteractedPost?.poll?.is_disabled_by_admin ||
                  mostInteractedPost?.poll?.user?.is_disabled_by_admin
                }
              />
            </div>
          )}

          {mostInteractedPost?.quiz && (
            <div key={mostInteractedPost.id}>
              <ForumQuizCard
                postData={mostInteractedQuizPostData as QuizType}
                clickableCard={
                  !mostInteractedPost?.quiz?.is_disabled_by_admin &&
                  !mostInteractedPost?.quiz?.user?.is_disabled_by_admin
                }
                mostInteractedPostCard
                hideFooter
                hideActions
                totalComments={mostInteractedPost?.quiz?.noComments}
                totalParticpants={mostInteractedPost?.quiz?.noParticipants}
                totalInteractions={mostInteractedPost?.quiz?.likes}
                isDisable={
                  mostInteractedPost?.quiz?.is_disabled_by_admin ||
                  mostInteractedPost?.quiz?.user?.is_disabled_by_admin
                }
              />
            </div>
          )}
        </div>
      )}
      <Text size="base">
        Let&apos;s check out what&apos;s happening in your campfire
      </Text>
    </>
  );
};

export default PostsWithinCampfire;
