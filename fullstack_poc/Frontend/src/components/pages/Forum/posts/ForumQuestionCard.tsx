import isEmpty from 'lodash/isEmpty';
import { useState } from 'react';

import { UnhidePost } from '@/actions/forum';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import Comments from '@/components/Utility/Comments';
import ForumCard from '@/components/Utility/ForumCard';
import OverlayUndo from '@/components/Utility/OverlayUndo';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId } from '@/state/Slices/auth';
import { CampfireData } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { QuestionType } from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';

interface QuestionCardProps {
  postData: QuestionType;
  clickableCard?: boolean;
  isHidden?: boolean | string;
  isArchived?: boolean;
  footerDisable?: boolean;
  hideActions?: boolean;
  notOverlay?: boolean;
  threadId?: string;
  hideFooter?: boolean;
  sharedPost?: boolean;
  searchedPost?: boolean;
  isShowComment?: boolean;
  isProfilePage?: boolean;
  postShareId?: string;
  index?: number;
  guestUserSharedPost?: boolean;
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

export default function ForumQuestionCard({
  postData,
  clickableCard,
  isHidden,
  isArchived,
  footerDisable,
  hideActions,
  notOverlay,
  threadId,
  hideFooter,
  sharedPost,
  searchedPost,
  isShowComment,
  isProfilePage,
  postShareId,
  index,
  guestUserSharedPost,
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
}: QuestionCardProps) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);
  const token = getUserToken();
  const [showComments, setShowComments] = useState(isShowComment || false);

  const handleOverlayClick = async () => {
    dispatch(
      UnhidePost(
        userId,
        postData?.id,
        CardTypeEnum.question,
        '',
        '',
        postShareId,
      ),
    );
    if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  const campfireDetails = campfirePreDetails
    ? campfirePreDetails
    : postData?.campfire_threads?.length
      ? {
        ...postData?.campfire_threads?.[0]?.campfire,
        campfireThreadId: postData?.campfire_threads?.[0]?.id,
      }
      : null;

  if (isEmpty(postData)) {
    return (
      <div className="pt-2 pb-3 lg:pt-0 lg:pb-0">
        <div className=" relative">
          <div
            className={` ${campfirePreDetails || sharedPost
              ? 'forumQuestionNested'
              : 'forumQuestion'
              }  mt-0 rounded-md p-0 md:p-3 ${sharedPost ? '' : 'bg-skyBlue-300 xl:mt-8 '
              }`}
          >
            <NotAvailableCard />
          </div>
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

  const currentReactionName =
    myActivityPost && postData?.post_reactions?.length
      ? postData?.post_reactions?.[0]?.kofukon?.name
      : reactionName;

  return (
    <div className="pt-2 pb-3 lg:pt-0 lg:pb-0">
      <div
        className={`relative ${isProfilePage ? ' cursor-pointer' : 'cursor-default'
          }`}
        onClick={() => handleCardClick(postData?.id)}
      >
        {postData?.isHidden && !notOverlay && (
          <OverlayUndo onClick={handleOverlayClick} />
        )}
        <div
          className={`${campfirePreDetails || sharedPost
            ? 'forumQuestionNested xl:!mt-0'
            : 'forumQuestion'
            } rounded-md  
            ${guestUserSharedPost ? 'mt-10' : 'mt-0'}  
            ${sharedPost && !guestUserSharedPost
              ? ''
              : // : 'bg-skyBlue-300 xl:mt-8 xl:p-3'
              'xl:mt-8 '
            }`}
        >
          <div
            className={`overlay-conatiner  ${(postData?.isHidden && !notOverlay) ||
              (!token &&
                (campfireDetails ? !campfireDetails?.is_public : false) &&
                postData?.user?.id !== userId)
              ? 'blur-sm'
              : ''
              }`}
          >
            {postData?.hasPostCreatorRequestedForDeactivation ||
              postData?.isBlocked ? (
              <NotAvailableCard />
            ) : (
              <div
                className={`${mostInteractedPostCard ||
                  guestUserSharedPost ||
                  currentReactionName
                  ? ''
                  : 'thread'
                  } relative`}
              >
                <div className="mobileForumPosts">
                  <ForumCard
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.question}
                    admin
                    // color={
                    //   sharedPost && !guestUserSharedPost
                    //     ? 'bg-skyBlue-300'
                    //     : 'bg-white'
                    // }
                    color="bg-skyBlue-300"
                    isDisable={isDisable}
                    postId={postData?.id}
                    id={postData?.id}
                    commentsCount={postData?.noComments}
                    user={postData?.user}
                    title={postData?.title}
                    description={postData?.description}
                    createdAt={postData?.createdAt}
                    participantsCount={postData?.noParticipants}
                    sharesCount={postData?.sharesCount?.aggregate?.count}
                    isBookmarked={postData?.isBookmarked}
                    toggleComments={setShowComments}
                    showComments={showComments}
                    isSharable
                    canFollow
                    showBookmark
                    clickableCard={clickableCard}
                    isHidden={isHidden}
                    isEdited={postData?.isEdited}
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
                    reactionName={currentReactionName}
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
                    media_link={postData?.media_link}
                    authorName={postData?.user?.name}
                  ></ForumCard>
                </div>
                {showComments &&
                  postData?.comments &&
                  postData?.comments[0]?.id && (
                    <Comments
                      postUserId={postData?.user?.id}
                      color="bg-skyBlue-300"
                      key={`${JSON.stringify(postData?.comments || [])}`}
                      postType={PostTypeEnum.question}
                      postId={postData?.id}
                      campfireDetails={campfireDetails as CampfireData}
                      campfirePost={campfirePost}
                      isCampfireComments
                      comments={postData?.comments || []}
                      authorName={postData?.user?.name}
                      handleUpdatePostById={handleUpdatePostById}
                      campfireJoinTitle={postData?.campfireName}
                      media_link={postData?.media_link}
                    />
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
