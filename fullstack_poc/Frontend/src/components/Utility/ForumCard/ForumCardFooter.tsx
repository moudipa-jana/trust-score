import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { get } from 'lodash';
import { useRouter } from 'next/router';
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import { getParticipantsNo, getPostById } from '@/actions/forum';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import BookmarkButton from '@/components/Utility/BookmarkButton';
import CommentField from '@/components/Utility/Comments/CommentField';
import LikeButton from '@/components/Utility/LikeButton';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { formatShortCount, getThreadIdObject } from '@/lib/helpers';
import {
  CampfirePostsById,
  GET_POSTS_COMMENTS,
  GET_PRIVACY_SECURITY,
  MUTATION_CAMPFIRE_ACTIVITIES,
} from '@/service/graphql/Campfire';
import {
  CAMPFIRE_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  POLL_FIELD_FOR_GUEST_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FOR_GUEST_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FOR_GUEST_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FOR_GUEST_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';
import { setPostCampfireId } from '@/state/Slices/campfire';
import { toggleShareDialog } from '@/state/Slices/dialog';
import { updateForumFeedByPost } from '@/state/Slices/necessary';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PostReaction, UserThreadType } from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';

interface CardFooterProps {
  id: string;
  isLastChild?: boolean;
  commentsCount?: number;
  participantsCount?: number;
  followersCount?: number;
  sharesCount?: number;
  variant?: string;
  admin?: boolean;
  showBookmark?: boolean;
  isSharable?: boolean;
  user?: UserThreadType;
  cardType: CardTypeEnum;
  postType: PostTypeEnum;
  parentCommentId?: string;
  commentId?: string;
  postId: string;
  isBookmarked?: boolean;
  showComments?: boolean;
  toggleComments?: Dispatch<SetStateAction<boolean>>;
  footerDisable?: boolean;
  campfireName?: string;
  threadId?: string;
  searchedPost?: boolean;
  showReply?: boolean;
  userName?: string;
  categoryName?: string;
  dataToReShare?: Record<string, string | number>;
  parentReplyId?: string;
  index?: number;
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
  isCamfireMember?: boolean | null;
  setCampfireJoin?: (join: boolean) => void;
  campfireDeletedPost?: boolean;
  isAnnouncement?: boolean;
  campfireId?: string;
  isArchived?: boolean;
  campfirePost?: boolean;
  isCampfireComments?: boolean;
  commentCampfireId?: string;
  isCampfireShare?: boolean;
  footerClickDisable?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  blurClass?: boolean;
}

interface PostCommentRules {
  id: string;
  show_posts_from_removed_users: boolean;
  show_posts_from_left_users: boolean;
  show_comments_from_removed_users: boolean;
  show_comments_from_left_users: boolean;
  collapse_deleted_and_removed_users_comments: boolean;
}

interface PrivacySecurityRules {
  exclude_content_by_blocked_user: boolean;
  recommendation: boolean;
}

interface CampfireActivity {
  id: string;
  type: string;
  // Add other activity fields as needed
}

export default function ForumCardFooter({
  showBookmark,
  admin,
  id,
  variant,
  isLastChild,
  commentsCount,
  participantsCount,
  followersCount,
  isSharable,
  sharesCount,
  toggleComments,
  user,
  postType,
  parentCommentId,
  commentId,
  cardType,
  postId,
  isBookmarked,
  footerDisable,
  campfireName,
  threadId,
  searchedPost,
  showReply,
  userName,
  categoryName,
  dataToReShare,
  parentReplyId,
  index,
  postReaction,
  likesCount,
  isCamfireMember,
  setCampfireJoin,
  campfireDeletedPost,
  isAnnouncement,
  campfireId,
  isArchived,
  campfirePost,
  isCampfireComments,
  commentCampfireId,
  isCampfireShare,
  footerClickDisable,
  handleUpdatePostById,
  blurClass,
}: CardFooterProps) {
  const dispatch = useDispatch();
  const categories = useAppSelector((state) => state.necessary.categories);
  const [showCommentField, setShowCommentField] = useState(false);
  const [hasToggledOnce, setHasToggledOnce] = useState(false);
  const [noOfParticipants, setParticipantsCount] = useState(
    participantsCount || 0,
  );
  const token = getUserToken();
  const profile = useAppSelector((state) => state.auth.profile);
  const router = useRouter();
  const firstScrollRef = useRef(true);
  const { pathname } = router;
  const isHomeRoute = pathname === '/';
  const isCampfirePage = pathname.includes('/campfire/');
  const isMobile = useIsMobile();
  const [postAndCommentRules, setPostAndCommentRules] =
    useState<PostCommentRules | null>(null);
  const [privacySecurityRules, setPrivacySecurityRules] =
    useState<PrivacySecurityRules | null>(null);

  useEffect(() => {
    if (isHomeRoute && (index || index === 0) && index < 2 && isCamfireMember) {
      setShowCommentField(true);
    }
  }, [index, isHomeRoute, isCamfireMember]);

  const handleToggle = () => {
    if (!isCamfireMember && setCampfireJoin) {
      setCampfireJoin(true);
    } else {
      const isFirstTwoItems = isHomeRoute && (index ?? -1) < 2;

      if (isFirstTwoItems && !hasToggledOnce && commentsCount !== 0) {
        setHasToggledOnce(true);
      } else {
        setShowCommentField((prevState) => !prevState);
      }
      if (toggleComments) {
        toggleComments((prevState) => !prevState);
      }
    }
  };

  function handleShareDialog() {
    if (!isCamfireMember && setCampfireJoin) {
      setCampfireJoin(true);
    } else if (window.location.toString().includes('campfire')) {
      dispatch(
        toggleShareDialog({
          open: true,
          postId,
          threadId,
          campfireName,
        }),
      );
    } else {
      if (dataToReShare) {
        dispatch(
          toggleShareDialog({
            open: true,
            postId,
            campfireName,
            postShareData: dataToReShare,
          }),
        );
      } else {
        const selectedcat = categories.find((c) => c.title === categoryName);
        dispatch(
          toggleShareDialog({
            open: true,
            postId,
            campfireName,
            postShareData: {
              categoryId: selectedcat?.id || categories[0]?.id,
              postId,
              type: postType,
            },
          }),
        );
      }
      
      // Notify Trust Service of the UI interaction (Share)
      if (user?.id && categoryName && profile?.id && postType !== PostTypeEnum.comment) {
        fetch('http://localhost:8001/process-reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: `share_${postId}_${Date.now()}`,
            author_id: user.id,
            voter_id: profile.id,
            voter_tier: 'New Voice', // Default
            category: categoryName,
            entity_type: 'post',
            post_text: '',
            comment_text: '',
            reaction_text: 'share',
            signal: 'SHARE',
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Trust service share failed', err));
      }
    }
  }

  const updateParticipantsCount = async () => {
    const updatedCount = await getParticipantsNo(
      id,
      cardType,
      noOfParticipants,
      isAnnouncement,
    );
    setParticipantsCount(updatedCount);
  };

  useEffect(() => {
    setParticipantsCount(participantsCount || 0);
  }, [participantsCount]);

  const [fetchPostsCommentsRules, { data: postsCommentsData }] = useLazyQuery(
    GET_POSTS_COMMENTS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle posts comments rules response
  useEffect(() => {
    if (postsCommentsData) {
      if ((postsCommentsData as any)?.campfire_settings?.length) {
        setPostAndCommentRules(
          (postsCommentsData as any)?.campfire_settings[0],
        );
      }
    }
  }, [postsCommentsData]);

  const [
    fetchPrivacySecurityRules,
    { data: privacySecurityData, error: privacySecurityError },
  ] = useLazyQuery(GET_PRIVACY_SECURITY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (isCampfirePage && campfireId && token !== '') {
      fetchPostsCommentsRules({
        variables: {
          campfireId,
        },
      });
      fetchPrivacySecurityRules({
        variables: {
          campfire_id: campfireId,
        },
      });
    }
  }, [
    isCampfirePage,
    campfireId,
    fetchPostsCommentsRules,
    fetchPrivacySecurityRules,
    token,
  ]);

  const CampfirePostBySettings = CampfirePostsById(
    postAndCommentRules?.collapse_deleted_and_removed_users_comments || false,
    privacySecurityRules?.exclude_content_by_blocked_user || false,
    postAndCommentRules?.show_posts_from_removed_users || false,
    postAndCommentRules?.show_posts_from_left_users || false,
    postAndCommentRules?.show_comments_from_removed_users || false,
    postAndCommentRules?.show_comments_from_left_users || false,
  );

  const fragmentQuery = `
    ${CampfirePostBySettings}
    ${token
      ? USER_FIELDS_FRAGMENT.loc?.source.body
      : USER_FIELDS_FOR_GUEST_FRAGMENT.loc?.source.body
    }
    ${token
      ? QUESTION_FIELDS_FRAGMENT.loc?.source.body
      : QUESTION_FIELDS_FOR_GUEST_FRAGMENT.loc?.source.body
    }
    ${token
      ? POLL_FIELD_FRAGMENT.loc?.source.body
      : POLL_FIELD_FOR_GUEST_FRAGMENT.loc?.source.body
    }
    ${token
      ? QUIZ_FIELDS_FRAGMENT.loc?.source.body
      : QUIZ_FIELDS_FOR_GUEST_FRAGMENT.loc?.source.body
    }
    ${CAMPFIRE_FIELDS_FRAGMENT.loc?.source.body}
    ${FEED_POST_SHARE_FIELDS_FRAGMENT.loc?.source.body}
    ${CAMPFIRE_SHARE_FIELDS_FRAGMENT.loc?.source.body}
    ${COMMENT_FIELDS_FRAGMENT.loc?.source.body}
    ${CAMPFIRE_POST_SHARE_FRAGMENT.loc?.source.body}
    ${COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT.loc?.source
      .body
    }
  `;

  const CampfirePostsByIdQuery = gql(fragmentQuery);

  const [
    fetchCampfirePostById,
    { data: campfirePostData, error: campfirePostError },
  ] = useLazyQuery(CampfirePostsByIdQuery, {
    fetchPolicy: 'no-cache',
  });

  const { mutationFunction: fetchActivityList } = useAuthMutation(
    MUTATION_CAMPFIRE_ACTIVITIES,
    (response) => {
      const activities = get(
        response,
        'getCampfireActivities.activities.threads',
        [],
      ) as CampfireActivity[];
      const formatedArray = activities.map((obj: CampfireActivity) => {
        return getThreadIdObject(obj);
      });
      dispatch(updateForumFeedByPost(formatedArray[0]));
    },
    () => {
      dispatch(updateForumFeedByPost([]));
    },
  );

  return (
    <>
      <div
        className={`flex justify-between ${variant == 'lg' ? 'pt-2' : 'px-1 pt-0 lg:px-0'
          } ${footerClickDisable ? '!pointer-events-none !cursor-default' : ''}`}
      >
        <div
          className={`action-col flex items-center gap-2 xl:gap-4
          ${variant == 'sm'
              ? 'basis-full'
              : variant == 'lg'
                ? ' basis-[96%] lg:basis-3/5'
                : !admin
                  ? ''
                  : ' basis-full lg:basis-9/12'
            } `}
        >
          <LikeButton
            id={id}
            postId={postId}
            cardType={cardType}
            variant={variant}
            footerDisable={footerDisable}
            updateParticipantsCount={updateParticipantsCount}
            postReaction={postReaction}
            likesCount={likesCount}
            isAnnouncement={isAnnouncement}
            isCamfireMember={isCamfireMember}
            setCampfireJoin={setCampfireJoin}
            campfireDeletedPost={campfireDeletedPost}
            commentId={commentId}
            authorId={user?.id}
            category={categoryName}
          />

          {!isLastChild && !searchedPost && !showReply ? (
            <div
              className="flex cursor-pointer items-center"
              onClick={async (e: MouseEvent<HTMLElement>) => {
                if (!footerDisable) {
                  e.stopPropagation();
                  if (!isCamfireMember && setCampfireJoin) {
                    setCampfireJoin(true);
                  } else {
                    handleToggle();
                    let threadData = null;
                    if (
                      cardType === CardTypeEnum.campfirePostShare &&
                      campfireId
                    ) {
                      threadData = await fetchCampfirePostById({
                        variables: {
                          id: postId,
                          commentLimit: 100,
                          commentOffset: 0,
                          campfireId: campfireId,
                        },
                      });
                    } else {
                      if (!campfirePost) {
                        threadData = await getPostById(postId);
                        if (handleUpdatePostById) {
                          handleUpdatePostById(
                            threadData as unknown as ThreadPost,
                          );
                        }
                        if (threadData?.type === 'question') {
                          const questionCampfireId =
                            threadData?.question?.campfire_threads?.[0]
                              ?.campfire?.id;
                          dispatch(setPostCampfireId(questionCampfireId));
                        } else if (threadData?.type === 'quiz') {
                          const quizCampfireId =
                            threadData?.quiz?.campfire_threads?.[0]?.campfire
                              ?.id;
                          dispatch(setPostCampfireId(quizCampfireId));
                        } else if (threadData?.type === 'poll') {
                          const pollCampfireId =
                            threadData?.poll?.campfire_threads?.[0]?.campfire
                              ?.id;
                          dispatch(setPostCampfireId(pollCampfireId));
                        } else if (threadData?.type === 'postShare') {
                          type PostShareTypes = 'question' | 'quiz' | 'poll';
                          const postShareType = threadData?.postShare
                            ?.type as PostShareTypes;
                          const postShareCampfireId =
                            threadData?.postShare?.[postShareType]
                              ?.campfire_threads?.[0]?.campfire?.id;
                          dispatch(setPostCampfireId(postShareCampfireId));
                        } else if (threadData?.type === 'campfirePostShare') {
                          const postCampfireId =
                            threadData?.campfirePostShare?.id;
                          dispatch(setPostCampfireId(postCampfireId));
                        } else if (threadData?.type === 'campfireShare') {
                          const postCampfireId =
                            threadData?.campfireShare?.campfireData?.id;
                          dispatch(setPostCampfireId(postCampfireId));
                        }
                      } else {
                        await fetchActivityList({
                          variables: { postId, campfireId, limit: 1 },
                        });
                      }
                    }
                    if (threadData) {
                      dispatch(updateForumFeedByPost(threadData));
                    }
                  }
                }
              }}
            >
              <div className="relative group flex h-8 w-12  items-center justify-center gap-1">
                <div>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.13145 19.7894C6.38769 19.7026 6.66713 19.7256 6.91304 19.8384C8.86962 20.7362 11.0745 20.9562 13.1766 20.4561C15.4163 19.9233 17.392 18.608 18.7477 16.7474C20.1034 14.8868 20.75 12.6031 20.5709 10.3079C20.3919 8.01276 19.3989 5.85701 17.7711 4.22914C16.1432 2.60128 13.9875 1.60835 11.6923 1.4293C9.3971 1.25024 7.11344 1.89683 5.25282 3.25255C3.39219 4.60827 2.07696 6.58396 1.54413 8.8236C1.04402 10.9257 1.26404 13.1306 2.16179 15.0872C2.27462 15.3331 2.29765 15.6125 2.21079 15.8688L0.850506 19.8816C0.584451 20.6665 1.33375 21.4158 2.11861 21.1497L6.13145 19.7894Z"
                      stroke="#979797"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute bottom-7 mr-2 hidden rounded border border-gray-500  bg-white px-1 py-0.5 text-[10px] font-medium text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-400">
                    Comments
                  </span>

                </div>
                <Text
                  size={
                    variant == 'sm' ? 'xxs' : variant == 'lg' ? 'base' : 'sm'
                  }
                  color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                >
                  {formatShortCount(commentsCount || 0)}
                </Text>
              </div>
              <div className="ml-1 h-1.5 w-1.5 rounded-full bg-gray-950"></div>
            </div>
          ) : null}

          {showReply && (
            <div
              className="cursor-pointer"
              onClick={() => {
                if (!footerDisable) handleToggle();
              }}
            >
              <Text size="sm" color="text-gray-500">
                Reply
              </Text>
            </div>
          )}
          <div className="followersCount">
            {!!followersCount && (
              <Text size={variant == 'sm' ? 'xxs' : 'sm'} color="text-gray-500">
                {formatShortCount(followersCount)} Follower(s)
              </Text>
            )}

            {!showReply && (
              <div
                className={`${variant == 'sm' ? 'flex gap-1 items-center' : 'flex gap-1'} group relative`}
              >

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.4768 3.05159C13.4236 2.25391 11.1585 2.1866 9.06145 2.86096C6.96446 3.53531 5.16315 4.9103 3.95972 6.75527C2.75629 8.60024 2.22395 10.8029 2.45199 12.9939C2.68003 15.1848 3.65459 17.2306 5.21218 18.7882C6.76977 20.3458 8.81562 21.3204 11.0065 21.5484C13.1975 21.7765 15.4002 21.2441 17.2451 20.0407C19.0901 18.8373 20.4651 17.036 21.1395 14.939C21.8138 12.842 21.7465 10.5768 20.9488 8.52359M13.3647 10.6356L18.7407 5.25963M13.9408 11.9796C13.9408 13.04 13.0812 13.8996 12.0208 13.8996C10.9604 13.8996 10.1008 13.04 10.1008 11.9796C10.1008 10.9192 10.9604 10.0596 12.0208 10.0596C13.0812 10.0596 13.9408 10.9192 13.9408 11.9796Z"
                    stroke="#979797"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="absolute bottom-7 -right-10 mr-2 hidden rounded border border-gray-500  bg-white px-1 py-0.5 text-[10px] font-medium text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-400">
                  Participants
                </span>

                <Text
                  size={
                    variant == 'sm'
                      ? 'xxs'
                      : variant == 'lg'
                        ? 'base'
                        : isMobile
                          ? '3xl'
                          : 'sm'
                  }
                  participant
                  color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                >
                  {formatShortCount(noOfParticipants)}
                </Text>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {showBookmark &&
            !searchedPost &&
            !campfireDeletedPost &&
            !isCampfireShare && (
              <div className=" ">
                <BookmarkButton
                  isBookmarked={isBookmarked}
                  postId={postId}
                  postUserId={user?.id}
                  commentId={commentId}
                  cardType={cardType}
                  categoryName={categoryName}
                  footerDisable={footerDisable}
                  parentCommentId={parentCommentId}
                  isCamfireMember={isCamfireMember}
                  setCampfireJoin={setCampfireJoin}
                />
              </div>
            )}
          {isSharable &&
            !isArchived &&
            !searchedPost &&
            !campfireDeletedPost &&
            !isCampfireShare && (
              <div className="flex items-center gap-1">
                <div
                  className="group relative h-5 w-5 cursor-pointer "
                  onClick={(e: MouseEvent<HTMLElement>) => {
                    if (!footerDisable) {
                      e.stopPropagation();
                      handleShareDialog();
                    }
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 13V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H11"
                      stroke="#979797"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 3L12 12"
                      stroke="#818181"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 3H21V9"
                      stroke="#818181"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="absolute top-0 -right-14 mr-2 hidden rounded border border-gray-500  bg-white px-1 py-0.5 text-[10px] font-medium text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-400">
                    Share
                  </span>
                </div>
                {!!sharesCount && (
                  <Text
                    size={
                      variant == 'sm' ? 'xxs' : variant == 'lg' ? 'base' : 'sm'
                    }
                    color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                  >
                    {formatShortCount(sharesCount)}
                  </Text>
                )}
              </div>
            )}
        </div>
      </div>

      {showCommentField &&
        !isLastChild &&
        (pathname.includes('/post/') ? !!blurClass : true) && (
          <CommentField
            firstScrollRef={firstScrollRef}
            commentId={commentId as string}
            postType={postType}
            postId={postId}
            parentCommentId={parentCommentId}
            userName={userName}
            closeCommentInput={() => {
              setShowCommentField(true);
              if (toggleComments) toggleComments(true);
            }}
            parentReplyId={parentReplyId}
            index={index}
            isAnnouncement={isAnnouncement}
            refetchActivityByPostId={
              campfirePost
                ? async () => {
                  await fetchActivityList({
                    variables: {
                      postId,
                      campfireId: isCampfireComments
                        ? commentCampfireId
                        : campfireId,
                      limit: 1,
                    },
                  });
                }
                : null
            }
            handleUpdatePostById={handleUpdatePostById}
          />
        )}
    </>
  );
}
