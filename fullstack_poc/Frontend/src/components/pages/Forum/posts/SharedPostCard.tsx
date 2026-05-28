import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';

import { UnhidePost } from '@/actions/forum';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import Comments from '@/components/Utility/Comments';
import CustomImage from '@/components/Utility/CustomImage';
import ForumCard from '@/components/Utility/ForumCard';
import OverlayUndo from '@/components/Utility/OverlayUndo';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId } from '@/state/Slices/auth';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';
import Link from 'next/link';

interface ShareCardProps {
  postData: PostShare;
  clickableCard?: boolean;
  hideActions?: boolean;
  isArchived?: boolean;
  footerDisable?: boolean;
  isShowComment?: boolean;
  notOverlay?: boolean;
  isHidden?: boolean | string;
  isProfilePage?: boolean;
  searchedPost?: boolean;
  index?: number;
  currentUserSharedPost?: boolean;
  currentUserProfile?: string;
  isDisable?: boolean;
  noPadd?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  reactionName?: string;
  pollReactions?: {
    id: string;
    userId: string;
    kofukon: { id: string; name: string };
  }[];
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  campfireToolsPosts?: boolean;
}

interface EmptyCardProps {
  className?: string;
}

// Type for the data returned by useMemo
type DataToReShare = {
  postId?: string | number;
  type?: string;
  categoryId?: string | number;
};

const EmptyCard = ({ className }: EmptyCardProps) => {
  return (
    <div className="relative">
      <div className={`rounded-md p-2 lg:p-8 ${className}`}>
        <NotAvailableCard />
      </div>
    </div>
  );
};

const SharedPostCard = ({
  postData,
  clickableCard,
  hideActions,
  isArchived,
  footerDisable,
  isShowComment,
  notOverlay,
  isHidden,
  noPadd,
  isProfilePage,
  searchedPost,
  index,
  currentUserSharedPost,
  currentUserProfile,
  isDisable,
  handleUpdatePostById,
  reactionName,
  pollReactions,
  setRefetch,
  campfireToolsPosts,
}: ShareCardProps) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.necessary.categories);
  const userId = useAppSelector(getUserId);
  const [showComments, setShowComments] = useState(isShowComment || false);

  const newPostData = useMemo(() => {
    if (postData?.campfire_thread_share) {
      return {
        ...postData,
        ...(postData?.campfire_thread_share?.question
          ? {
            type: 'question',
            question: postData?.campfire_thread_share?.question,
          }
          : postData?.campfire_thread_share?.poll
            ? { type: 'poll', poll: postData?.campfire_thread_share?.poll }
            : { type: 'quiz', quiz: postData?.campfire_thread_share?.quiz }),
      } as PostShare;
    }
    return postData?.type
      ? postData
      : {
        ...postData,
        type: postData?.question
          ? PostTypeEnum.question
          : postData?.poll
            ? PostTypeEnum.poll
            : PostTypeEnum.quiz,
      };
  }, [postData]);

  const handleOverlayClick = () => {
    dispatch(UnhidePost(userId, newPostData?.id, CardTypeEnum.postShare));
  };

  const router = useRouter();
  const isGuestUser = router.pathname.includes('/user/');

  const dataToReShare = useMemo(() => {
    const data: DataToReShare = {};
    const catName =
      newPostData?.categoryName ??
      (newPostData?.type
        ? newPostData?.[
          newPostData?.type as
          | PostTypeEnum.question
          | PostTypeEnum.poll
          | PostTypeEnum.quiz
        ]?.categoryName
        : null);

    const selectedcat = categories?.find((c) => c?.title === catName);
    if (newPostData && newPostData?.type === 'question') {
      data.postId = newPostData?.question?.id;
      data.type = newPostData?.type;
    } else if (newPostData && newPostData?.type === 'poll') {
      data.postId = newPostData?.poll?.id;
      data.type = newPostData?.type;
    } else if (newPostData && newPostData?.type === 'quiz') {
      data.postId = newPostData?.quiz?.id;
      data.type = newPostData?.type;
    }
    data.categoryId = selectedcat?.id || categories?.[0]?.id;
    return data;
  }, [newPostData, categories]);

  function handleCardClick(cardId: string) {
    if (isProfilePage) {
      const customEvent = new Event(`customEventName_${cardId}`);
      document.dispatchEvent(customEvent);
    }
  }

  const isMobile = useIsMobile();
  if (isEmpty(postData)) {
    return (
      <div className=" relative">
        <div className="mt-5 rounded-md p-1 lg:p-8 xl:mt-8 xl:p-8 ">
          <NotAvailableCard />
        </div>
      </div>
    );
  }
  return (
    <div
      className={`relative ${isProfilePage ? ' cursor-pointer' : 'cursor-default'
        }`}
      onClick={() => handleCardClick(newPostData?.id)}
    >
      {newPostData && newPostData?.isHidden && !notOverlay && (
        <OverlayUndo onClick={handleOverlayClick} />
      )}
      <div>
        <div
          className={`overlay-conatiner ${newPostData && newPostData?.isHidden && !notOverlay ? 'blur-sm' : ''
            }`}
        >
          {newPostData &&
            newPostData?.hasPostCreatorRequestedForDeactivation ? (
            <NotAvailableCard />
          ) : (
            <div>
              <div
                className={`mt-8 rounded-md reshare-card ${noPadd ? '' : ''}`}
              >
                {currentUserSharedPost &&
                  newPostData &&
                  newPostData?.type !== PostTypeEnum.campfire &&
                  newPostData?.type !== PostTypeEnum.campfirePostShare &&
                  newPostData?.type !== PostTypeEnum.postShare && (
                    <div
                      className={` ${isMobile && 'ml-2'} flex space-x-2 py-4`}
                    >
                      <div className="h-6 w-6">
                        <CustomImage src={currentUserProfile} fill />
                      </div>
                      <div className="flex flex-wrap space-x-1.5">
                        <p color="text-black">
                          <span className="font-bold">
                            {router.pathname.includes('/user')
                              ? newPostData && newPostData?.user?.name
                              : 'You'}
                          </span>{' '}
                          shared{' '}
                          {/* <span className="font-medium text-primary cursor-pointer hover:underline">
                            {newPostData?.[newPostData?.type]?.user?.name +
                              "'s"}
                          </span>{' '} */}
                          <Link href={`/user/${newPostData?.[newPostData?.type]?.user?.name}`}>
                            <span className="font-medium text-primary hover:underline">
                              {newPostData?.[newPostData?.type]?.user?.name +
                                "'s"}{' '}
                            </span>
                          </Link>
                          post.
                        </p>
                      </div>
                    </div>
                  )}
                <div className="bg-white">
                  <ForumCard
                    admin
                    // color="transparent"
                    color={
                      newPostData?.type == PostTypeEnum.question
                        ? 'bg-[#BDECFF] reshare-question'
                        : newPostData?.type == PostTypeEnum.poll
                          ? 'bg-[#BFFFB7] reshare-poll'
                          : newPostData?.type == PostTypeEnum.quiz
                            ? 'bg-[#F1CAFF] reshare-quiz'
                            : ''
                    }
                    user={newPostData && newPostData?.user}
                    id={newPostData && newPostData?.id}
                    postId={newPostData && newPostData?.id}
                    isDisable={isDisable}
                    canFollow
                     commentsCount={newPostData && newPostData?.noComments}
                    createdAt={newPostData && newPostData?.createdAt}
                    postType={
                      PostTypeEnum && postData?.campfireId
                        ? PostTypeEnum.campfirePostShare
                        : PostTypeEnum.postShare
                    }
                    cardType={
                      postData?.campfireId
                        ? CardTypeEnum.campfirePostShare
                        : CardTypeEnum.postShare
                    }
                    participantsCount={
                      newPostData && newPostData?.noParticipants
                    }
                    sharesCount={
                      newPostData?.question?.sharesCount?.aggregate?.count ||
                      newPostData?.poll?.sharesCount?.aggregate?.count ||
                      newPostData?.quiz?.sharesCount?.aggregate?.count
                    }
                    title={newPostData && newPostData?.title}
                    isBookmarked={newPostData && newPostData?.isBookmarked}
                    showBookmark
                    isSharable
                    hideActions={hideActions}
                    clickableCard={clickableCard}
                    isArchived={isArchived}
                    footerDisable={footerDisable}
                    toggleComments={setShowComments}
                    showComments={showComments}
                    isHidden={isHidden}
                    dataToReShare={dataToReShare}
                    isProfilePage={isProfilePage}
                    searchedPost={searchedPost}
                    index={index}
                    postReaction={
                      pollReactions
                        ? pollReactions
                        : newPostData && newPostData?.post_reactions
                    }
                    likesCount={newPostData && newPostData?.likes}
                    handleUpdatePostById={handleUpdatePostById}
                    reactionName={reactionName}
                    setRefetch={setRefetch}
                    campfireToolsPosts={campfireToolsPosts}
                    authorName={postData?.user?.name}
                  >
                    <div>
                      {newPostData &&
                        newPostData?.hasPostCreatorRequestedForDeactivation ? (
                        <NotAvailableCard />
                      ) : newPostData && newPostData?.type === 'question' ? (
                        <ForumQuestionCard
                          postData={newPostData?.question as QuestionType}
                          clickableCard={false}
                          hideActions
                          hideFooter
                          sharedPost
                          postShareId={newPostData && newPostData?.id}
                          searchedPost={searchedPost}
                          guestUserSharedPost={isGuestUser}
                        />
                      ) : newPostData && newPostData?.type === 'poll' ? (
                        <div className="relative mt-4">
                          {isEmpty(newPostData?.poll) ? (
                            <EmptyCard className="bg-green-100 " />
                          ) : (
                            <ForumPollCard
                              postData={
                                newPostData && (newPostData?.poll as PollType)
                              }
                              hideFooter
                              sharedPost
                              hideActions
                              postShareId={newPostData && newPostData?.id}
                              searchedPost={searchedPost}
                              sharedPostData={
                                newPostData && (newPostData as PostShare)
                              }
                              clickableCard={false}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="relative mt-4">
                          {isEmpty(newPostData && newPostData?.quiz) ? (
                            <EmptyCard className="bg-pink " />
                          ) : (
                            <ForumQuizCard
                              postData={
                                newPostData && (newPostData?.quiz as QuizType)
                              }
                              hideFooter
                              sharedPost
                              hideActions
                              postShareId={newPostData && newPostData?.id}
                              searchedPost={searchedPost}
                              sharedPostData={newPostData && newPostData}
                              clickableCard={false}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </ForumCard>
                </div>
                <div className="thread relative">
                  {showComments &&
                    newPostData?.comments &&
                    newPostData?.comments[0]?.id && (
                      <Comments
                        postUserId={postData?.user?.id}

                        color={
                          newPostData?.type == PostTypeEnum.question
                            ? 'bg-[#BDECFF]'
                            : newPostData?.type == PostTypeEnum.poll
                              ? 'bg-[#BFFFB7]'
                              : newPostData?.type == PostTypeEnum.quiz
                                ? 'bg-[#F1CAFF]'
                                : ''
                        }
                        key={JSON.stringify(newPostData?.comments || [])}
                        postType={PostTypeEnum.postShare}
                        postId={newPostData?.id || ''}
                        comments={newPostData?.comments || []}
                        authorName={newPostData?.user?.name || 'Anonymous'}
                        handleUpdatePostById={handleUpdatePostById}
                      />
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedPostCard;
