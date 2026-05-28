import isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';

import { UnhidePost } from '@/actions/forum';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import PuzzleComponent from '@/components/pages/Forum/posts/PuzzleComponent';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import Comments from '@/components/Utility/Comments';
import ForumCard from '@/components/Utility/ForumCard';
import OverlayUndo from '@/components/Utility/OverlayUndo';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { SELECT_POLL_OPTION } from '@/service/graphql/Poll';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  getForumFeedthread,
  updateForumFeedByPost,
} from '@/state/Slices/necessary';
import { CampfireData } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import {
  PollOptionType,
  PollType,
  PostShare,
  QuestionType,
  QuizType,
} from '@/types/forum';

interface PollCardProps {
  postData: PollType;
  clickableCard?: boolean;
  isHidden?: boolean | string;
  isArchived?: boolean;
  footerDisable?: boolean;
  hideActions?: boolean;
  isShowComment?: boolean;
  notOverlay?: boolean;
  threadId?: string;
  hideFooter?: boolean;
  sharedPost?: boolean;
  searchedPost?: boolean;
  isProfilePage?: boolean;
  postShareId?: string;
  sharedPostData?: PollType | QuizType | QuestionType | PostShare;
  index?: number;
  pollReactions?: {
    id: string;
    userId: string;
    kofukon: { id: string; name: string };
  }[];
  myActivityPost?: boolean;
  reactionName?: string;
  pin?: boolean;
  campfirePost?: boolean;
  isPinned?: boolean;
  campfireDeletedPost?: boolean;
  campfirePreDetails?: CampfireData;
  mostInteractedPostCard?: boolean;
  totalComments?: number;
  totalParticpants?: number;
  totalInteractions?: number;
  isDisable?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  campfireToolsPosts?: boolean;
}

export default function ForumPollCard({
  postData,
  clickableCard,
  isHidden,
  isArchived,
  footerDisable,
  hideActions,
  isShowComment,
  notOverlay,
  threadId,
  hideFooter,
  sharedPost,
  searchedPost,
  isProfilePage,
  postShareId,
  sharedPostData,
  index,
  pollReactions,
  myActivityPost,
  reactionName,
  pin,
  campfirePost,
  isPinned,
  campfireDeletedPost,
  campfirePreDetails,
  mostInteractedPostCard,
  totalComments,
  totalParticpants,
  totalInteractions,
  isDisable,
  handleUpdatePostById,
  setRefetch,
  campfireToolsPosts,
}: PollCardProps) {
  const [showComments, setShowComments] = useState(isShowComment || false);
  const postThread = useAppSelector(getForumFeedthread);
  const feedPost = postThread?.find(
    (post) => post?.id === (sharedPostData?.id || postData?.id),
  );
  const [puzzleOption, setPuzzleOption] = useState(postData?.poll_options);
  const [updatedPostData, setUpdatePostData] = useState(postData);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);
  const token = useAppSelector(selectGetToken);

  const calculatePercentage = (data: PollType) => {
    const totalPollAnswered: number = data?.poll_options?.reduce(
      (total, obj) => {
        return total + obj?.analyticsCount;
      },
      0,
    );
    const formatedPollOption = data?.poll_options?.map(
      (option: PollOptionType) => {
        return {
          ...option,
          answerPercentage: Math.round(
            (option?.analyticsCount / totalPollAnswered) * 100,
          ),
        };
      },
    );
    return formatedPollOption;
  };

  const { mutationFunction: pollOptionSelect } = useAuthMutation(
    SELECT_POLL_OPTION,
    (response: { insert_poll_actions_one: { poll: PollType } }) => {
      const pollObj = response?.insert_poll_actions_one?.poll;
      const updatedSharedPost = sharedPostData ? {
        ...sharedPostData,
        noParticipants: ((sharedPostData as any).noParticipants || 0) + 1,
        poll: {
          ...pollObj,
          noParticipants: (sharedPostData as any).poll?.noParticipants || pollObj?.noParticipants,
        },
      } : undefined;

      const pollDispatchObj = {
        ...feedPost,
        ...(sharedPostData
          ? { postShare: updatedSharedPost }
          : { poll: pollObj }),
      };
      dispatch(updateForumFeedByPost(pollDispatchObj));
      const formatedPollOption = calculatePercentage(pollObj);
      setPuzzleOption(formatedPollOption);
      setUpdatePostData(
        sharedPostData
          ? {
              ...pollObj,
              noParticipants: (sharedPostData as any).poll?.noParticipants || pollObj?.noParticipants,
            }
          : pollObj
      );
    },
  );
  const handlePollSelect = (pollOptionId: string) => {
    pollOptionSelect({
      variables: {
        userId,
        pollOptionId,
        pollId: postData?.id,
      },
    });
  };
  useEffect(() => {
    const formatedPollOption = calculatePercentage(postData);
    if (postData?.isAnalytics) {
      setPuzzleOption(formatedPollOption);
    } else {
      setPuzzleOption(postData?.poll_options);
    }
  }, [postData]);

  const handleOverlayClick = async () => {
    dispatch(
      UnhidePost(userId, postData?.id, CardTypeEnum.poll, '', '', postShareId),
    );
    if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  if (isEmpty(postData)) {
    return (
      <div className=" relative">
        <div
          className={`rounded-md bg-green-100 p-1 lg:p-8 xl:p-8 ${sharedPost ? '' : 'mt-5 xl:mt-8'
            }`}
        >
          <NotAvailableCard />
        </div>
      </div>
    );
  }
  function handleCardClick(cardId: string) {
    if (isProfilePage) {
      const customEvent = new Event(`customEventName_${cardId}`);
      document.dispatchEvent(customEvent);
    }
  }

  const campfireDetails = campfirePreDetails
    ? campfirePreDetails
    : postData?.campfire_threads?.length
      ? {
        ...postData?.campfire_threads?.[0]?.campfire,
        campfireThreadId: postData?.campfire_threads?.[0]?.id,
      }
      : null;

  return (
    <div
      className={`relative ${isProfilePage ? ' cursor-pointer' : 'cursor-default'
        }`}
      onClick={() => handleCardClick(postData?.id)}
    >
      {postData?.isHidden && !notOverlay && (
        <OverlayUndo onClick={handleOverlayClick} />
      )}
      <div
        className={` ${clickableCard ? '' : ' rounded-md'
          } ${sharedPost ? '' : 'mt-5 xl:mt-8'} ${campfirePreDetails ? 'xl:!mt-0' : ''
          }`}
      >
        <div
          className={`overlay-conatiner ${postData?.isHidden && !notOverlay ? 'blur-sm' : ''
            }`}
        >
          {postData?.hasPostCreatorRequestedForDeactivation ||
            postData?.isBlocked ? (
            <NotAvailableCard />
          ) : (
            <>
              <div className="mobileForumPosts">
                <ForumCard
                  activeCard={clickableCard ? true : false}
                  admin
                  postType={PostTypeEnum.poll}
                  cardType={CardTypeEnum.poll}
                  // color="transparent"
                  color="bg-green-1300"
                  postId={postData?.id}
                  id={postData?.id}
                  user={postData?.user}
                  commentsCount={postData?.noComments}
                  title={null}
                  isDisable={isDisable}
                  createdAt={postData?.createdAt}
                  participantsCount={postData?.noParticipants}
                  sharesCount={postData?.sharesCount?.aggregate?.count}
                  isBookmarked={postData?.isBookmarked}
                  isSharable
                  canFollow
                  showBookmark
                  toggleComments={setShowComments}
                  showComments={showComments}
                  clickableCard={clickableCard}
                  isHidden={isHidden}
                  isArchived={isArchived}
                  footerDisable={footerDisable}
                  hideActions={hideActions}
                  tag={postData?.categoryName}
                  isCategoryEnabled={
                    postData?.post_categories?.[0]?.category?.is_enabled ||
                    postData?.campfire_threads?.[0]?.campfire?.category
                      ?.is_enabled
                  }
                  isCampfire={postData?.isCampfire}
                  campfireDetails={campfireDetails as CampfireData}
                  campfireName={postData?.campfireName}
                  threadId={threadId}
                  hideFooter={hideFooter}
                  searchedPost={searchedPost}
                  isProfilePage={isProfilePage}
                  index={index}
                  postReaction={
                    pollReactions ? pollReactions : postData?.post_reactions
                  }
                  likesCount={postData?.likes}
                  reactionName={
                    myActivityPost && postData?.post_reactions?.length
                      ? postData?.post_reactions?.[0]?.kofukon?.name
                      : reactionName
                  }
                  pin={pin}
                  campfirePost={campfirePost}
                  isPinned={isPinned}
                  campfireDeletedPost={campfireDeletedPost}
                  mostInteractedPostCard={mostInteractedPostCard}
                  totalComments={totalComments}
                  totalParticpants={totalParticpants}
                  totalInteractions={totalInteractions}
                  handleUpdatePostById={handleUpdatePostById}
                  setRefetch={setRefetch}
                  campfireToolsPosts={campfireToolsPosts}
                  authorName={postData?.user?.name}
                >
                  <PuzzleComponent
                    type="poll"
                    options={puzzleOption}
                    title={postData?.title}
                    handleOptionSelect={handlePollSelect}
                    postData={updatedPostData}
                    searchedPost={searchedPost}
                    clickableCard={clickableCard}
                    isCampfire={postData?.isCampfire}
                    campfireDetails={campfireDetails as CampfireData}
                    campfireName={postData?.campfireName}
                    campfireDeletedPost={campfireDeletedPost}
                    blurClass={
                      (campfirePost || postData?.isCampfire) &&
                        !campfireDetails?.is_public &&
                        userId !== postData?.user?.id &&
                        (!campfireDetails?.isMember || !token)
                        ? 'blur-sm'
                        : ''
                    }
                  />
                </ForumCard>
              </div>
              <div className="thread relative">
                {showComments &&
                  postData?.comments &&
                  postData?.comments[0]?.id && (
                    <Comments
                      postUserId={postData?.user?.id}
                      color="bg-green-1300"
                      key={`${JSON.stringify(postData?.comments || [])}`}
                      postType={PostTypeEnum.poll}
                      postId={postData?.id}
                      campfireDetails={campfireDetails as CampfireData}
                      comments={postData?.comments || []}
                      campfirePost={campfirePost}
                      isCampfireComments
                      authorName={postData?.user?.name}
                      handleUpdatePostById={handleUpdatePostById}
                      campfireJoinTitle={postData?.campfireName}
                    />
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
