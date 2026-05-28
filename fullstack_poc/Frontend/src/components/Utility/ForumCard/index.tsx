import { get, startCase, toLower } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useContext } from 'react';
import { TrustScoreContext } from '@/context/TrustScoreContext';
import announceSpeaker from '/public/images/announceSpeaker.svg';
import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import ReactedInfo from '@/components/pages/Profile/reactedInfo';
import ActionsButton from '@/components/Utility/ActionsButton';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import ForumIcon from '@/components/Utility/ForumCard/ForumIcon';
import Pin from '@/components/Utility/Pin';
import Puzzle from '@/components/Utility/Puzzle';
import Tag from '@/components/Utility/Tag';
import Text from '@/elements/Text';
import UserImage from '@/elements/UserImage';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import { FALLBACK_PROFILE_PIC } from '@/lib/constants';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { getCampfireData } from '@/state/Slices/campfire';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { UserProfile } from '@/types/authentication';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import {
  CampfireThreadDetails,
  PostReaction,
  QuizOption,
  UserThreadType,
} from '@/types/forum';

import ForumCardBody from './ForumCardBody';
import ForumCardContainer from './ForumCardContainer';
import ForumCardFooter from './ForumCardFooter';
import ForumCardHeading from './ForumCardHeading';
import { formatShortCount } from '@/lib/helpers';

interface ForumCardProps {
  id: string;
  parentCommentId?: string;
  postId: string;
  postType: PostTypeEnum;
  cardType: CardTypeEnum;
  postUserId?: string;
  createdAt: string | Date;
  user?: UserThreadType;
  title: string | React.ReactNode;
  description?: string;
  isLastChild?: boolean;
  commentsCount?: number;
  participantsCount?: number;
  sharesCount?: number;
  isBorder?: boolean;
  size?: string;
  showBookmark?: boolean;
  detailsColor?: string;
  variant?: string;
  color?: string;
  admin?: boolean;
  isSharable?: boolean;
  children?: React.ReactNode;
  canFollow?: boolean;
  puzzle?: boolean;
  isBookmarked?: boolean;
  quizOptions?: QuizOption;
  showComments?: boolean;
  toggleComments?: Dispatch<SetStateAction<boolean>>;
  hideUserImage?: boolean;
  tag?: string;
  postedBy?: boolean;
  hideActions?: boolean;
  clickableCard?: boolean;
  isHidden?: boolean | string;
  isEdited?: boolean;
  isArchived?: boolean;
  footerDisable?: boolean;
  topChildren?: React.ReactNode;
  hideHeader?: boolean;
  campfireDetails?: CampfireThreadDetails;
  hideFooter?: boolean;
  sideCard?: boolean;
  campfireName?: string;
  isCampfire?: boolean;
  threadId?: string;
  showingError?: React.ReactNode;
  blurState?: boolean;
  searchedPost?: boolean;
  showReply?: boolean;
  isProfilePage?: boolean;
  userName?: string;
  dataToReShare?: Record<string, string | number>;
  authorName?: string;
  relatedCard?: boolean;
  activeCard?: boolean;
  activeCardPink?: boolean;
  pin?: boolean;
  parentReplyId?: string;
  isPinned?: boolean;
  index?: number;
  guestUserComment?: boolean;
  guestParentId?: string;
  postUsername?: string;
  replyUsername?: string;
  postReaction?:
    | PostReaction[]
    | {
        id: string;
        userId: string;
        kofukon: {
          id: string;
          name: string;
        };
      }[];
  likesCount?: number;
  reactionName?: string;
  campfirePost?: boolean;
  isAnnouncement?: boolean;
  campfireDeletedPost?: boolean;
  mostInteractedPostCard?: boolean;
  totalComments?: number;
  totalParticpants?: number;
  totalInteractions?: number;
  isDisable?: boolean;
  isDeletedByAdminOfCampfire?: boolean;
  isCampfireComments?: boolean;
  isAnnouncementComment?: boolean;
  isCategoryEnabled?: boolean;
  isCampfireShare?: boolean;
  footerClickDisable?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  isParentCard?: boolean;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  campfireToolsPosts?: boolean;
  otherLink?: string;
  blurClass?: string;
  campfireJoinTitle?: string;
  media_link?: string;
}
function ForumCard({
  showComments,
  toggleComments,
  canFollow,
  puzzle,
  children,
  admin,
  color,
  variant,
  detailsColor,
  size,
  id,
  createdAt,
  title,
  description,
  isLastChild,
  commentsCount,
  participantsCount,
  sharesCount,
  quizOptions,
  showBookmark,
  isBorder,
  user,
  isSharable,
  hideUserImage,
  tag,
  postedBy,
  hideActions,
  postId,
  clickableCard,
  postType,
  cardType,
  parentCommentId,
  isBookmarked,
  isEdited,
  isArchived,
  footerDisable,
  topChildren,
  hideHeader,
  campfireDetails,
  hideFooter,
  isHidden,
  sideCard,
  campfireName,
  isCampfire,
  threadId,
  showingError,
  blurState,
  searchedPost,
  showReply,
  userName,
  dataToReShare,
  isProfilePage,
  authorName,
  relatedCard,
  activeCard,
  activeCardPink,
  pin,
  parentReplyId,
  isPinned,
  index,
  guestUserComment,
  postUserId,
  guestParentId,
  postUsername,
  replyUsername,
  postReaction,
  likesCount,
  reactionName,
  campfirePost,
  isAnnouncement,
  campfireDeletedPost,
  mostInteractedPostCard,
  totalComments,
  totalParticpants,
  totalInteractions,
  isDisable,
  isDeletedByAdminOfCampfire,
  isCampfireComments,
  isAnnouncementComment,
  isCategoryEnabled,
  isCampfireShare,
  footerClickDisable,
  handleUpdatePostById,
  isParentCard,
  setRefetch,
  campfireToolsPosts,
  otherLink,
  blurClass,
  campfireJoinTitle,
  media_link,
}: ForumCardProps) {
  const link = otherLink ? otherLink : `/post/${postId}`;
  const router = useRouter();
  const userId = useAppSelector(getUserId);
  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();
  const campfireData = useAppSelector(getCampfireData);
  const isCampfirePage = router.pathname.includes('/campfire/');
  const [toggleJoin, setToggleJoin] = useState(false);
  const [camfireJoin, setCampfireJoin] = useState(false);
  const isMobile = useIsMobile();
  const isNonMemberCampfire = !campfireData?.isMember && isCampfirePage;

  const currentCampfireData: {
    title: string | undefined;
    id: string;
    isRequested?: boolean;
    category?: {
      title: string;
    };
    campfireThreadId?: string;
    is_public?: boolean;
    isMember?: boolean;
    picture?: string;
  } | null = campfireDetails
    ? {
        ...campfireDetails,
        title:
          !!blurClass && campfireJoinTitle ? campfireJoinTitle : campfireName,
      }
    : null;

  const handleNonMemberClick = useCallback(() => {
    setToggleJoin(true);
  }, []);

  const handleUserNavigation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (user?.id === userId) {
      router.push('/profile#activities');
    } else {
      router.push(`/user/${user?.name}`);
    }
  };

  const handleCampfireNavigation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    router.push(
      `/campfire/${campfireName}${
        !(isCampfireShare || isAnnouncement) ? `?postId=${postId}` : ''
      }`,
    );
  };

  const handleCategoryNavigation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (toLower(router.query?.categoryName as string) !== toLower(tag)) {
      router.push(`/category/${tag}`);
    }
  };
  const eventName = `customEventName_${postId}`;

  const handleLink = useCallback(() => {
    if (clickableCard && !isDisable) {
      if (
        isNonMemberCampfire ||
        (isCampfire &&
          campfireDetails &&
          !campfireDetails?.is_public &&
          !campfireDetails?.isMember)
      ) {
        handleNonMemberClick();
        return;
      }
      if (token) {
        let finalLink = link;
        if (guestUserComment && !otherLink) {
          finalLink = `${link}?isCommentClick=true#${id}`;
        }
        router.push(finalLink);
      } else {
        dispatch(toggleSignupDialog(true));
      }
    }
  }, [
    clickableCard,
    isDisable,
    isNonMemberCampfire,
    isCampfire,
    campfireDetails,
    token,
    handleNonMemberClick,
    link,
    guestUserComment,
    otherLink,
    router,
    id,
    dispatch,
  ]);

  useEffect(() => {
    if (!eventName) return undefined;

    document.addEventListener(eventName, handleLink);
    return () => {
      document.removeEventListener(eventName, handleLink);
    };
  }, [eventName, handleLink]);

  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;
  const loggedInUsername = profile?.name;

  const trustScoresMap = useContext(TrustScoreContext);
  const mapScore = user?.id ? trustScoresMap[user.id] : undefined;

  const [localTrustScore, setLocalTrustScore] = useState<number | null>(null);

  useEffect(() => {
    if (mapScore !== undefined) {
      setLocalTrustScore(mapScore);
      return;
    }
    
    if (!user?.id) return;
    
    // Fallback: If not in context map, fetch individually
    const fetchTrustScore = async () => {
      try {
        const response = await fetch('http://localhost:8080/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': 'myadminsecretkey'
          },
          body: JSON.stringify({
            query: `
            query GetUserTrustScores($userId: uuid!) {
              trust_scores(where: {author_id: {_eq: $userId}}) {
                trust_score
              }
            }
          `,
            variables: { userId: user.id }
          })
        });
        const data = await response.json();
        const scores = data?.data?.trust_scores;
        if (scores && scores.length > 0) {
          const total = scores.reduce((sum: number, item: any) => sum + Number(item.trust_score), 0);
          setLocalTrustScore(total / scores.length);
        } else {
          setLocalTrustScore(50.0);
        }
      } catch (err) {
        setLocalTrustScore(50.0);
      }
    };
    fetchTrustScore();
  }, [user?.id, mapScore]);

  const trustScore = localTrustScore !== null ? localTrustScore : 50.0;

  const isValidBucketImage = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.includes('kofuku-production-cms') && !url.includes('uno-jobs');
  };
  return (
    <>
      <div className="relative">
        {/* {clickableCard && (
          <div onClick={handleLink}>
            <div
              className={`${sideCard ? 'overlay-sidecard' : ''} cursor-pointer`}
            ></div>
          </div>
        )} */}
        <div
          onClick={handleLink}
          //   className={`${activeCard
          //     ? 'rounded-md bg-green-100 p-1 lg:p-8 xl:p-8'
          //     : activeCardPink
          //       ? 'rounded-md bg-pink p-2 lg:p-8'
          //       : ''
          //     }
          // ${clickableCard ? 'cursor-pointer' : ''}`}
        >
          {reactionName && (
            <div className="mb-2">
              <ReactedInfo reactionText={reactionName} />
            </div>
          )}
          {guestUserComment && (
            <div className="flex space-x-2 py-2">
              <div className="flex h-6 w-6 shrink-0">
                <CustomImage
                  src={user?.profilePicture ?? '/images/userImage.svg'}
                  fallbackSrc="/images/userImage.svg"
                  fill
                />
              </div>
              <div className="flex flex-wrap">
                <Text color="text-black" size="3xl">
                  {user?.name === loggedInUsername ? (
                    <span className="font-medium">You</span>
                  ) : (
                    <span className="font-medium">{user?.name}</span>
                  )}{' '}
                  {guestParentId ? 'replied on' : 'commented on'}{' '}
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    href={`user/${replyUsername ? replyUsername : postUsername}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {replyUsername ? replyUsername + "'s" : postUsername + "'s"}
                  </Link>{' '}
                  {replyUsername ? 'comment.' : 'post.'}
                </Text>
              </div>
            </div>
          )}

          {mostInteractedPostCard && (
            <div className="pb-2">
              <Text size="xl" font="font-semibold" color="text-gray-2000">
                Most Interacted Post
              </Text>
            </div>
          )}

          {isNonMemberCampfire && (
            <div
              className=" overlay-non-member cursor-pointer"
              onClick={handleNonMemberClick}
            ></div>
          )}
          <JoinModal
            data={campfireData}
            toggleJoin={toggleJoin}
            setToggleJoin={setToggleJoin}
            postId={postId}
            isHide
          />
          <JoinModal
            data={currentCampfireData}
            toggleJoin={camfireJoin}
            setToggleJoin={setCampfireJoin}
            isHide
            postId={postId}
          />
          <ForumCardContainer
            color={color}
            variant={variant}
            isBorder={isBorder}
            isDisable={isDisable}
          >
            {topChildren}
            <div
              className={`${
                variant == 'horizontal'
                  ? 'grid grid-cols-6 items-center justify-center'
                  : ''
              }`}
            >
              {/* card top section  */}
              <div
                className={`break-words card-top-section mb-2 px-3 lg:px-10 rounded-xl py-3 lg:py-5 ${variant == 'vertical' || variant == 'horizontal' ? 'p-4' : 'p-0'}
                ${variant == 'horizontal' && 'col-span-4'} ${
    color
      ? `${color}`
      : postType === PostTypeEnum.poll
        ? 'bg-[#DFFFDB]'
        : postType === PostTypeEnum.question
          ? 'bg-[#E0F4FC]'
          : postType === PostTypeEnum.quiz
            ? 'bg-[#F5EAF9]'
            : ''
  }`}
              >
                {!hideHeader && (
                  <>
                    <div className="flex justify-between mb-3">
                      <div
                        className={`flex gap-1 flex-wrap ${
                          canFollow && isCampfire ? ' mr-4 ' : ''
                        } ${hideActions && !tag && ''} items-center`}
                      >
                        {isCampfire &&
                        cardType !== CardTypeEnum.campfirePostShare &&
                        !isCampfirePage ? (
                          <div className="relative">
                            <div
                              className={`${
                                isMobile ? 'h-15 w-15' : 'h-20 w-20'
                              } relative cursor-pointer rounded-full`}
                              onClick={handleCampfireNavigation}
                            >
                              <CustomImage
                                src={getDefaultCampfireImage(
                                  campfireDetails?.picture ?? '',
                                )}
                                alt={campfireName}
                                height={300}
                                width={300}
                              />
                            </div>
                            <div
                              className={` absolute z-1 cursor-pointer ${
                                isMobile
                                  ? 'left-8 top-7 h-8 w-8'
                                  : 'left-9 top-10  h-12 w-12'
                              }`}
                              onClick={handleUserNavigation}
                            >
                              <CustomImage
                                height={150}
                                width={150}
                                src={
                                  !user?.profilePicture ||
                                  !isValidBucketImage(user?.profilePicture)
                                    ? '/images/kofuku-logo.svg'
                                    : user?.profilePicture
                                }
                                alt={user?.name}
                              />
                            </div>
                          </div>
                        ) : !hideUserImage ? (
                          <div
                            className={`${
                              !isAnnouncement && user !== null
                                ? 'cursor-pointer'
                                : 'cursor-default'
                            } relative`}
                            onClick={(e: MouseEvent<HTMLElement>) => {
                              if (!isAnnouncement && user !== null) {
                                handleUserNavigation(e);
                              }
                            }}
                          >
                            <UserImage
                              size={
                                size
                                  ? size
                                  : variant == 'lg' || admin
                                    ? ''
                                    : 'sm'
                              }
                              src={
                                isAnnouncement && user === null
                                  ? '/images/kofuku-logo.svg'
                                  : !user?.profilePicture
                                    ? FALLBACK_PROFILE_PIC
                                    : user?.profilePicture.includes('uno-jobs')
                                      ? FALLBACK_PROFILE_PIC
                                      : user?.profilePicture
                              }
                              alt={user?.name}
                            />
                          </div>
                        ) : null}
                        <ForumCardHeading
                          trustScore={trustScore}
                          relatedCard={relatedCard}
                          isCampfire={
                            isCampfire &&
                            cardType !== CardTypeEnum.campfirePostShare &&
                            !isCampfirePage
                          }
                          campfireName={campfireName ?? 'kōfuku'}
                          userName={
                            postedBy
                              ? `Posted by ${user?.name ?? ''}`
                              : (user?.name ?? 'kōfuku')
                          }
                          userTag={!postedBy ? user?.userTag : ''}
                          detailsColor={detailsColor}
                          variant={variant}
                          handleUserNavigation={handleUserNavigation}
                          handleCampfireNavigation={handleCampfireNavigation}
                          duration={appDayjs(createdAt).fromNow()}
                          campfireCategoryName={
                            campfireDetails?.category?.title
                          }
                          isCategoryEnabled={
                            campfireDetails?.category?.is_enabled
                          }
                          isProfilePage={isProfilePage}
                          isAnnouncement={isAnnouncement}
                          blurClass={
                            (isCampfire &&
                              campfireDetails &&
                              !campfireDetails?.is_public &&
                              user?.id !== userId &&
                              (!campfireDetails?.isMember || !token) &&
                              (isParentCard !== undefined
                                ? !isParentCard
                                : true)) ||
                            !!blurClass
                              ? 'blur-sm'
                              : ''
                          }
                        />

                        {canFollow &&
                          !hideFooter &&
                          (!campfireDetails ||
                            campfireDetails.is_public ||
                            (!campfireDetails.is_public &&
                              campfireDetails.isMember)) && (
                            <FollowButton
                              isFollowing={user?.isFollowing}
                              postUserId={user?.id as string}
                              isCampfire={
                                isCampfire &&
                                !isCampfirePage &&
                                cardType !== CardTypeEnum.campfirePostShare
                              }
                            />
                          )}

                        {tag && !sideCard && (
                          <div
                            className="mobileTag font-semibold text-sm"
                            onClick={(e: MouseEvent<HTMLElement>) =>
                              e.stopPropagation()
                            }
                          >
                            <Tag bg="bg-white " type="card" isActive size="sm">
                              {!isProfilePage && isCategoryEnabled ? (
                                <Link href={`/category/${tag}`} className="">
                                  {startCase(tag)}
                                </Link>
                              ) : (
                                <Link href={`/category/${tag}`} className="">
                                  {startCase(tag)}
                                </Link>
                              )}
                            </Tag>
                          </div>
                        )}
                        {/* Pin  */}
                        {(pin || isPinned) &&
                          !isAnnouncementComment &&
                          !blurClass &&
                          (userId == postUserId || isPinned || isCampfire) && (
                            <div className="ml-2 self-center">
                              <Pin
                                commentId={
                                  cardType === CardTypeEnum.comment
                                    ? id
                                    : undefined
                                }
                                disablePin={
                                  (userId !== postUserId && !isCampfire) ||
                                  (isCampfire && !pin)
                                    ? true
                                    : false
                                }
                                postId={postId}
                                isPinned={isPinned}
                                campfirePost={campfirePost}
                                threadId={threadId}
                                campfireId={
                                  isCampfire ? currentCampfireData?.id : ''
                                }
                              />
                            </div>
                          )}
                      </div>
                      <div className="flex">
                        {tag && sideCard && (
                          <div className="ml-2 ">
                            <Tag
                              bg="bg-white"
                              type="card"
                              isActive
                              size="xs"
                              onClick={(e: MouseEvent<HTMLElement>) => {
                                if (!postedBy) {
                                  handleCategoryNavigation(e);
                                }
                              }}
                            >
                              {!isProfilePage &&
                              isCategoryEnabled &&
                              !postedBy ? (
                                <Link href={`/category/${tag}`}>
                                  {startCase(tag)}
                                </Link>
                              ) : (
                                <span>{startCase(tag)}sssdds</span>
                              )}
                            </Tag>
                          </div>
                        )}

                        {/* Author */}
                        {authorName &&
                          !sideCard &&
                          postUserId &&
                          user?.id === postUserId && (
                            <div className="ml-2 self-center">
                              <Text
                                size="sm"
                                color="text-primary font-semibold"
                              >
                                Author
                              </Text>
                            </div>
                          )}

                        {!hideActions && (
                          <div className="flex items-center">
                            <ActionsButton
                              postId={postId}
                              parentCommentId={parentCommentId}
                              commentId={
                                cardType === CardTypeEnum.comment
                                  ? id
                                  : undefined
                              }
                              cardType={cardType}
                              variant={variant}
                              postUserId={user?.id as string}
                              title={title}
                              description={description}
                              media_link={media_link}
                              isHidden={isHidden}
                              isArchived={isArchived}
                              postType={postType}
                              campfirePost={campfirePost}
                              campfireId={campfireDetails?.id}
                              isCampfire={isCampfire}
                              campfireThreadId={
                                campfireDetails?.campfireThreadId
                              }
                              isAnnouncement={isAnnouncementComment}
                              handleUpdatePostById={handleUpdatePostById}
                              isCampfireMember={
                                isCampfire &&
                                cardType !== CardTypeEnum.campfirePostShare
                                  ? !!currentCampfireData?.isMember
                                  : blurClass
                                    ? false
                                    : true
                              }
                              setCampfireJoin={setCampfireJoin}
                              setRefetch={setRefetch}
                              campfireToolsPosts={campfireToolsPosts}
                            />
                          </div>
                        )}
                        {isAnnouncement && (
                          <div
                            className={`absolute ${isMobile ? '-top-2 -right-0 h-[29px] w-[29px]' : '-top-4 -right-4 h-35 w-25'}`}
                          >
                            <CustomImage
                              alt="speaker"
                              src={announceSpeaker}
                              width={120}
                              height={125}
                              style={{ width: '91%' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {isCampfire &&
                      !sideCard &&
                      isMobile &&
                      !isAnnouncement &&
                      campfireDetails?.category?.title && (
                        <div
                          className="mt-2 w-1/3"
                          onClick={(e: MouseEvent<HTMLElement>) =>
                            e.stopPropagation()
                          }
                        >
                          <Tag bg="bg-white" type="card" isActive size="xxs">
                            {!isProfilePage && isCategoryEnabled ? (
                              <Link
                                href={`/category/${campfireDetails?.category?.title}`}
                              >
                                {startCase(campfireDetails?.category?.title)}
                              </Link>
                            ) : (
                              <span>
                                {startCase(campfireDetails?.category?.title)}
                              </span>
                            )}
                          </Tag>
                        </div>
                      )}
                  </>
                )}
                {puzzle && <Puzzle question={quizOptions} title={title} />}
                <ForumCardBody
                  color={color}
                  title={isDeletedByAdminOfCampfire ? null : title}
                  description={description}
                  variant={variant}
                  cardType={cardType}
                  isEdited={isEdited}
                  showingError={showingError}
                  blurState={blurState}
                  postId={postId}
                  clickableCard={clickableCard}
                  categoryTag={tag}
                  isCampfire={isCampfire}
                  campfireDetails={campfireDetails}
                  blurClass={
                    (campfirePost || isCampfire) &&
                    campfireDetails &&
                    !campfireDetails?.is_public &&
                    user?.id !== userId &&
                    (!campfireDetails?.isMember || !token)
                      ? 'blur-sm'
                      : ''
                  }
                  media_link={media_link}
                >
                  {children}
                </ForumCardBody>
                <ForumIcon postType={postType} />
              </div>
              {/* Card footer  */}
              <div
                className={`post-card-footer px-3 lg:px-7 py-2 rounded-xl ${color ? `${color}` : ''} `}
              >
                {/* {!hideFooter && <div className="line" />} */}

                {!hideFooter && (
                  <ForumCardFooter
                    id={id}
                    user={user}
                    commentId={
                      cardType === CardTypeEnum.comment ? id : undefined
                    }
                    parentCommentId={parentCommentId}
                    admin={admin}
                    categoryName={tag || campfireDetails?.category?.title}
                    variant={variant}
                    commentsCount={commentsCount}
                    participantsCount={participantsCount}
                    sharesCount={sharesCount}
                    isSharable={isSharable}
                    showBookmark={showBookmark && !isAnnouncementComment}
                    isLastChild={isLastChild}
                    showComments={showComments}
                    toggleComments={toggleComments}
                    postId={postId}
                    postType={postType}
                    cardType={cardType}
                    isBookmarked={isBookmarked}
                    footerDisable={footerDisable}
                    campfireName={campfireName}
                    threadId={threadId}
                    searchedPost={searchedPost}
                    showReply={showReply}
                    userName={userName}
                    dataToReShare={dataToReShare}
                    parentReplyId={parentReplyId}
                    index={index}
                    footerClickDisable={footerClickDisable}
                    postReaction={postReaction}
                    likesCount={likesCount}
                    isCamfireMember={
                      isCampfire && cardType !== CardTypeEnum.campfirePostShare
                        ? currentCampfireData?.isMember
                        : blurClass
                          ? false
                          : true
                    }
                    setCampfireJoin={setCampfireJoin}
                    campfireDeletedPost={campfireDeletedPost}
                    isAnnouncement={isAnnouncement || isAnnouncementComment}
                    campfireId={isCampfire ? currentCampfireData?.id : ''}
                    isCampfireComments={isCampfireComments}
                    commentCampfireId={
                      isCampfireComments ? currentCampfireData?.id : ''
                    }
                    isArchived={isArchived}
                    campfirePost={campfirePost}
                    isCampfireShare={isCampfireShare}
                    handleUpdatePostById={handleUpdatePostById}
                    blurClass={
                      isCampfire && cardType !== CardTypeEnum.campfirePostShare
                        ? currentCampfireData?.isMember
                        : blurClass
                          ? false
                          : true
                    }
                  />
                )}
              </div>
            </div>
          </ForumCardContainer>

          {mostInteractedPostCard && (
            <div className="mt-3 flex flex-row items-center">
              <Text font="font-semibold" color="text-gray-1250">
                Total comments {formatShortCount(totalComments || 0)}
              </Text>
              <div className="mx-2 h-1 w-1 rounded-full bg-gray-1100" />
              <Text font="font-semibold" color="text-gray-1250">
                Total participants {formatShortCount(totalParticpants || 0)}
              </Text>
              <div className="mx-2 h-1 w-1 rounded-full bg-gray-1100" />
              <Text font="font-semibold" color="text-gray-1250">
                Total interactions {formatShortCount(totalInteractions || 0)}
              </Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForumCard;
