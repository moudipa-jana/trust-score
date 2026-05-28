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
import { SELECT_QUIZ_OPTION } from '@/service/graphql/Quiz';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  getForumFeedthread,
  updateForumFeedByPost,
} from '@/state/Slices/necessary';
import { CampfireData } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';

interface QuizCardProps {
  postData: QuizType;
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

export default function ForumQuizCard({
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
}: QuizCardProps) {
  const [showComments, setShowComments] = useState(isShowComment || false);
  const postThread = useAppSelector(getForumFeedthread);
  const [puzzleOption, setPuzzleOption] = useState(postData?.quiz_options);
  const [updatedPostData, setUpdatePostData] = useState(postData);

  useEffect(() => {
    setPuzzleOption(postData?.quiz_options);
    setUpdatePostData(postData);
  }, [postData]);
  const feedPost = postThread?.find(
    (post) => post?.id === (sharedPostData?.id || postData?.id),
  );
  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);
  const token = useAppSelector(selectGetToken);
  const { mutationFunction: quizOptionSelect } = useAuthMutation(
    SELECT_QUIZ_OPTION,
    async (response: { insert_quiz_actions_one: { quiz: QuizType } }) => {
      const quizObj = response?.insert_quiz_actions_one?.quiz;
      const updatedSharedPost = sharedPostData ? {
        ...sharedPostData,
        noParticipants: ((sharedPostData as any).noParticipants || 0) + 1,
        quiz: {
          ...quizObj,
          noParticipants: (sharedPostData as any).quiz?.noParticipants || quizObj?.noParticipants,
        },
      } : undefined;

      const quizDispatchObj = {
        ...feedPost,
        ...(sharedPostData
          ? { postShare: updatedSharedPost }
          : { quiz: quizObj }),
      };
      dispatch(updateForumFeedByPost(quizDispatchObj));
      setPuzzleOption(quizObj?.quiz_options);
      setUpdatePostData(
        sharedPostData
          ? {
              ...quizObj,
              noParticipants: (sharedPostData as any).quiz?.noParticipants || quizObj?.noParticipants,
            }
          : quizObj
      );
    },
  );

  const handleQuizSelect = async (quizOptionId: string) => {
    await quizOptionSelect({
      variables: {
        userId,
        quizOptionId,
        quizId: postData?.id,
      },
    });
  };

  const handleOverlayClick = () => {
    dispatch(
      UnhidePost(userId, postData?.id, CardTypeEnum.quiz, '', '', postShareId),
    );
    if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  if (isEmpty(postData)) {
    return (
      <div className=" relative">
        <div
          className={`rounded-md bg-pink p-2 lg:p-8 ${sharedPost ? '' : 'mt-8'
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
      className={`relative ${isProfilePage ? ' cursor-pointer' : 'cursor-default'}`}
      onClick={() => handleCardClick(postData?.id)}
    >
      {postData?.isHidden && !notOverlay && (
        <OverlayUndo onClick={handleOverlayClick} />
      )}
      <div
        className={`${clickableCard ? '' : 'rounded-md '}        ${sharedPost ? '' : 'mt-8'} ${campfirePreDetails ? 'xl:!mt-0' : ''}`}
      >
        <div
          className={`overlay-conatiner ${postData?.isHidden && !notOverlay ? 'blur-sm' : ''}`}
        >
          {postData?.hasPostCreatorRequestedForDeactivation ||
            postData?.isBlocked ? (
            <NotAvailableCard />
          ) : (
            <>
              <div className="mobileForumPosts test">
                <ForumCard
                  activeCardPink={clickableCard ? true : false}
                  admin
                  postType={PostTypeEnum.quiz}
                  cardType={CardTypeEnum.quiz}
                  // color="transparent"
                  color="bg-pink"
                  postId={postData?.id}
                  id={postData?.id}
                  user={postData?.user}
                  title={null}
                  commentsCount={postData?.noComments}
                  isDisable={isDisable}
                  createdAt={postData?.createdAt}
                  participantsCount={postData?.noParticipants}
                  sharesCount={postData?.sharesCount?.aggregate?.count}
                  isBookmarked={postData?.isBookmarked}
                  isSharable
                  canFollow
                  showBookmark
                  showComments={showComments}
                  toggleComments={setShowComments}
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
                    type="quiz"
                    options={puzzleOption}
                    title={postData?.title}
                    handleOptionSelect={handleQuizSelect}
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
                      color="bg-pink"
                      key={`${JSON.stringify(postData?.comments || [])}`}
                      postType={PostTypeEnum.quiz}
                      postId={postData?.id}
                      campfireDetails={campfireDetails as CampfireData}
                      campfirePost={campfirePost}
                      isCampfireComments
                      comments={postData?.comments || []}
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
