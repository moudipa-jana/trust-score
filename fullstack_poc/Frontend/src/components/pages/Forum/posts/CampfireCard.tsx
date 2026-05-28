import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuestionCardBody from '@/components/pages/Forum/posts/ForumQuestionCardBody';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import Comments from '@/components/Utility/Comments';
import ForumCard from '@/components/Utility/ForumCard';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { getUserId } from '@/state/Slices/auth';
import { campfirePostShare, campfireShare } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PollType, QuestionType, QuizType } from '@/types/forum';

interface IcampfireCard {
  postData: campfireShare | campfirePostShare;
  footerDisable?: boolean;
  isShowComment?: boolean;
  isCampfireShare?: boolean;
  index?: number;
  isDisable?: boolean;
  reactionName?: string;
  hideActions?: boolean;
  pollReactions?: {
    id: string;
    userId: string;
    kofukon: { id: string; name: string };
  }[];
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  clickableCard?: boolean;
}

function CampfireCard({
  postData,
  footerDisable,
  isShowComment,
  isCampfireShare,
  index,
  isDisable,
  reactionName,
  hideActions,
  pollReactions,
  setRefetch,
  clickableCard,
}: IcampfireCard) {
  const [showComments, setShowComments] = useState(isShowComment || false);
  const router = useRouter();
  const isGuestUser = router.pathname.includes('/user/');
  const isMobile = useIsMobile();
  const userId = useAppSelector(getUserId);

  const dataType =
    (postData as campfirePostShare)?.poll ||
    (postData as campfirePostShare)?.question ||
    (postData as campfirePostShare)?.quiz;

  let campfirePostData;
  if (isCampfireShare) {
    campfirePostData = {
      profileImg: (postData as campfireShare)?.campfireData?.picture,
      message: (postData as campfireShare)?.message,
      postData: (postData as campfireShare)?.campfireData,
    };
  } else {
    campfirePostData = {
      profileImg: (postData as campfirePostShare)?.campfire?.picture,
      message: (postData as campfirePostShare)?.message,
      postData: (postData as campfirePostShare)?.campfire,
    };
  }

  return (
    <div>
      {isCampfireShare ? (
        <div className="mt-3 rounded-md xl:mt-8 campfire-card">
          <div className="mobileForumPosts">
            <ForumCard
              postType={PostTypeEnum.campfire}
              cardType={CardTypeEnum.campfire}
              admin
              color="bg-[#F0F0F0]"
              postId={(postData as campfireShare)?.id}
              id={(postData as campfireShare)?.id}
              user={(postData as campfireShare)?.user}
              title=""
              isDisable={isDisable}
              createdAt={(postData as campfireShare)?.createdAt}
              participantsCount={(postData as campfireShare)?.noParticipants}
              sharesCount={(postData as campfireShare)?.sharesCount?.aggregate?.count}
              isBookmarked={(postData as campfireShare)?.isBookmarked}
              isSharable
              commentsCount={(postData as campfireShare)?.noComments}
              canFollow
              showBookmark
              reactionName={reactionName}
              footerDisable={footerDisable}
              showComments={showComments}
              toggleComments={setShowComments}
              campfireName={(postData as campfireShare)?.campfireData?.title}
              index={index}
              postReaction={
                pollReactions ? pollReactions : postData?.post_reactions
              }
              likesCount={postData?.likes}
              campfireDetails={(postData as campfireShare)?.campfireData}
              isCampfire
              hideActions={
                hideActions
                  ? hideActions
                  : (postData as campfireShare)?.user?.id === userId
              }
              isCampfireShare
              isParentCard
              setRefetch={setRefetch}
              clickableCard={clickableCard}
            >
              <ForumQuestionCardBody
                postData={campfirePostData}
                campfireCard={isCampfireShare}
              />
            </ForumCard>
          </div>
          <div className="thread relative">
            {showComments &&
              (postData as campfireShare)?.comments &&
              (postData as campfireShare)?.comments[0]?.id && (
                <Comments
                  postUserId={postData?.user?.id}

                  key={`${JSON.stringify(
                    (postData as campfireShare)?.comments || [],
                  )}`}
                  postType={PostTypeEnum.campfire}
                  postId={(postData as campfireShare)?.id}
                  comments={(postData as campfireShare)?.comments || []}
                />
              )}
          </div>
        </div>
      ) : (
        dataType && (
          <div className="mt-4 rounded-md reshare-card">
            <ForumCard
              admin
              color={
                (postData as campfirePostShare)?.question
                  ? 'bg-[#BDECFF] reshare-question'
                  : (postData as campfirePostShare)?.poll
                    ? 'bg-[#BFFFB7] reshare-poll'
                    : (postData as campfirePostShare)?.quiz
                      ? 'bg-[#F1CAFF] reshare-quiz'
                      : ''
              }
              user={(postData as campfirePostShare)?.user}
              id={(postData as campfirePostShare)?.id}
              postId={(postData as campfirePostShare)?.id}
              canFollow
              createdAt={(postData as campfirePostShare)?.createdAt}
              postType={PostTypeEnum.campfirePostShare}
              cardType={CardTypeEnum.campfirePostShare}
              postReaction={
                pollReactions
                  ? pollReactions
                  : (postData as campfirePostShare)?.post_reactions
              }
  commentsCount={(postData as campfirePostShare)?.noComments}
                likesCount={(postData as campfirePostShare)?.likes}
              participantsCount={
                (postData as campfirePostShare)?.noParticipants
              }
              sharesCount={
                (postData as campfirePostShare)?.question?.sharesCount?.aggregate?.count ||
                (postData as campfirePostShare)?.poll?.sharesCount?.aggregate?.count ||
                (postData as campfirePostShare)?.quiz?.sharesCount?.aggregate?.count
              }
              title=""
              isBookmarked={(postData as campfirePostShare)?.isBookmarked}
              showBookmark={false}
              isSharable
              footerDisable={footerDisable}
              showComments={showComments}
              toggleComments={setShowComments}
              index={index}
              isCampfire
              hideActions={hideActions}
              isDisable={isDisable}
              campfireDetails={(postData as campfirePostShare)?.campfire}
              reactionName={reactionName}
              isParentCard
              setRefetch={setRefetch}
              authorName={postData?.user?.name}
            >
              <div className={`relative  ${isMobile ? 'pt-3' : 'pt-5'}`}>
                <div className={` ${isMobile ? 'pb-2' : 'pb-5'}`}>
                  <Text size="md">
                    This post is too good to be missed! Check it out
                  </Text>
                </div>
                {dataType?.hasPostCreatorRequestedForDeactivation ? (
                  <NotAvailableCard />
                ) : (postData as campfirePostShare)?.question ? (
                  <ForumQuestionCard
                    clickableCard={false}
                    hideActions
                    hideFooter
                    isShowComment={false}
                    postShareId={dataType?.id}
                    guestUserSharedPost={isGuestUser}
                    postData={dataType as QuestionType}
                    notOverlay
                    isHidden={dataType?.isHidden}
                    isArchived={dataType?.isArchived}
                    isDisable={isDisable}
                    campfirePreDetails={
                      (postData as campfirePostShare)?.campfire
                    }
                  />
                ) : (postData as campfirePostShare)?.poll ? (
                  <ForumPollCard
                    hideFooter
                    sharedPost
                    hideActions
                    postShareId={dataType?.id}
                    sharedPostData={dataType}
                    clickableCard={false}
                    postData={dataType as PollType}
                    isShowComment={false}
                    notOverlay
                    isHidden={dataType?.isHidden}
                    isArchived={dataType?.isArchived}
                    isDisable={isDisable}
                    campfirePreDetails={
                      (postData as campfirePostShare)?.campfire
                    }
                  />
                ) : (postData as campfirePostShare)?.quiz ? (
                  <ForumQuizCard
                    hideFooter
                    sharedPost
                    hideActions
                    postShareId={dataType?.id}
                    sharedPostData={dataType}
                    clickableCard={false}
                    postData={dataType as QuizType}
                    isShowComment={false}
                    notOverlay
                    isHidden={dataType?.isHidden}
                    isArchived={dataType?.isArchived}
                    isDisable={isDisable}
                    campfirePreDetails={
                      (postData as campfirePostShare)?.campfire
                    }
                  />
                ) : (
                  <ForumCard
                    topChildren={
                      <ForumQuestionCardBody
                        isCampfireCoverImg
                        postData={campfirePostData}
                        campfireCard={isCampfireShare}
                      />
                    }
                    admin
                    color="bg-white"
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.question}
                    postId={dataType?.id}
                    id={dataType?.id}
                    isDisable={isDisable}
                    user={dataType?.user}
                    title={dataType?.title}
                    description={dataType?.description}
                    createdAt={dataType?.createdAt || ''}
                    commentsCount={dataType?.noComments}
                    participantsCount={dataType?.noParticipants}
                    isBookmarked={dataType?.isBookmarked}
                    isHidden={dataType?.isHidden}
                    isArchived={dataType?.isArchived}
                    isSharable
                    canFollow
                    showBookmark
                    hideActions
                    hideHeader
                    hideFooter
                    blurState={
                      (postData as campfirePostShare)?.campfire?.is_public
                        ? false
                        : true
                    }
                    showingError={
                      (postData as campfirePostShare)?.campfire?.is_public ? (
                        ''
                      ) : (
                        <div className=" flex items-center gap-1">
                          <FaExclamationCircle className="text-sm text-error" />
                          <Text size="sm" color="text-error">
                            You need to be a part of this campfire to see this
                            post.
                          </Text>
                        </div>
                      )
                    }
                    index={index}
                    postReaction={dataType?.post_reactions}
                    likesCount={dataType?.likes}
                  />
                )}
              </div>
            </ForumCard>
            <div className="thread relative">
              {showComments &&
                (postData as campfireShare)?.comments &&
                (postData as campfireShare)?.comments[0]?.id && (
                  <Comments
                    postUserId={postData?.user?.id}
                    key={`${JSON.stringify(
                      (postData as campfireShare)?.comments || [],
                    )}`}
                    postType={PostTypeEnum.campfirePostShare}
                    postId={(postData as campfireShare)?.id}
                    comments={(postData as campfireShare)?.comments || []}
                  />
                )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default CampfireCard;
