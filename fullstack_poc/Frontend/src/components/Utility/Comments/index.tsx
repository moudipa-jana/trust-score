import { get } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaCaretUp } from 'react-icons/fa';

import { UnhidePost } from '@/actions/forum';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import ForumCard from '@/components/Utility/ForumCard';
import LoadMore from '@/components/Utility/LoadMore';
import OverlayUndo from '@/components/Utility/OverlayUndo';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import UnavailablePost from '@/components/Utility/UnavailablePost';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { updateOpenComments } from '@/state/Slices/comments';
import { updateOpenSubReplies } from '@/state/Slices/subReply';
import { CampfireData } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { CommentType, ReplyType, SubReplyType } from '@/types/forum';

const COMMENTS_LENGTH = 5;
const REPLIES_LENGTH = 5;
const SUB_REPLIES_LENGTH = 5;

interface CommentProps {
  postType: PostTypeEnum;
  postId: string;
  comments: CommentType[];
  notOverlay?: boolean;
  authorName?: string;
  pin?: boolean;
  postUserId?: string;
  campfirePost?: boolean;
  campfireDetails?: CampfireData;
  isCampfireComments?: boolean;
  isAnnouncementComment?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  announcementPage?: boolean;
  campfireJoinTitle?: string;
  color?: string;
  media_link?: string;
}
interface ReplyProps {
  postType: PostTypeEnum;
  postId: string;
  parentCommentId: string;
  replies: ReplyType[];
  notOverlay?: boolean;
  authorName?: string;
  campfirePost?: boolean;
  campfireDetails?: CampfireData;
  isCampfireComments?: boolean;
  isAnnouncementComment?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  announcementPage?: boolean;
  blurClass?: string;
  campfireJoinTitle?: string;
  color?: string;
  postUserId?: string;
}

interface SubReplyProps {
  postType: PostTypeEnum;
  postId: string;
  parentCommentId: string;
  parentReplyId?: string;
  subReplies: SubReplyType[];
  notOverlay?: boolean;
  authorName?: string;
  showSubReplies?: boolean;
  campfirePost?: boolean;
  campfireDetails?: CampfireData;
  isCampfireComments?: boolean;
  closeSubReplies: (replyId: string) => void;
  isAnnouncementComment?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  announcementPage?: boolean;
  blurClass?: string;
  campfireJoinTitle?: string;
  color?: string;
  postUserId?: string;
}

export function SubReplies({
  postType,
  postId,
  parentCommentId,
  parentReplyId,
  subReplies,
  notOverlay,
  authorName,
  showSubReplies,
  closeSubReplies,
  campfirePost,
  campfireDetails,
  isCampfireComments,
  isAnnouncementComment,
  handleUpdatePostById,
  announcementPage,
  blurClass,
  campfireJoinTitle,
  color,
  postUserId,
}: SubReplyProps) {
  const router = useRouter();
  const { query, asPath } = router;
  const fragmentId = asPath?.split('#')?.[1];
  const isCommentClick = query?.isCommentClick === 'true';
  const [subRepliesToShow, setSubRepliesToShow] = useState(
    isCommentClick ? subReplies : subReplies?.slice(0, SUB_REPLIES_LENGTH),
  );

  const [highlightedSubReplyId, setHighlightedSubReplyId] = useState<
    string | null
  >(null);

  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (
      isCommentClick &&
      fragmentId &&
      subReplies?.some((subReply) => subReply?.id === fragmentId)
    ) {
      setHighlightedSubReplyId(fragmentId);
      setIsHighlighting(true);
      const timeout = setTimeout(() => {
        setHighlightedSubReplyId(null);
        setIsHighlighting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isCommentClick, fragmentId, subReplies]);

  const handleLoadMore = () => {
    if (subRepliesToShow?.length < subReplies?.length) {
      setSubRepliesToShow((prevState) => [
        ...prevState,
        ...(subReplies?.slice(
          prevState?.length || 0,
          (prevState?.length || 0) + SUB_REPLIES_LENGTH,
        ) || []),
      ]);
    }
  };

  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);
  const handleOverlayClick = async (replyId: string) => {
    dispatch(
      UnhidePost(
        userId,
        postId,
        CardTypeEnum.comment,
        replyId,
        parentCommentId,
        '',
        isAnnouncementComment,
      ),
    );
  };

  return (
    <>
      {subRepliesToShow?.map((subReply) => {
        return (
          <div
            className="relative subreplies-comment"
            key={subReply?.id}
            id={`comment-${subReply?.id}`}
          >
            {showSubReplies && (
              <>
                <div onClick={() => closeSubReplies(parentReplyId ?? '')}>
                  <div className="verticalLine"></div>
                </div>
                <div
                  className="second-child relative ml-4 pt-4 lg:ml-12"
                  key={subReply?.id}
                >
                  {subReply?.isHidden && !notOverlay && (
                    <OverlayUndo
                      onClick={() => {
                        handleOverlayClick(subReply?.id);
                      }}
                      message="This reply has been hidden, You will not see this reply further"
                    />
                  )}
                  <div
                    className={` overlay-conatiner ${subReply?.isHidden && !notOverlay ? 'blur-sm' : ''
                      }`}
                  >
                    {subReply?.hasPostCommentorRequestedForDeactivation ? (
                      <NotAvailableCard />
                    ) : (
                      <div className="relative">
                        <ForumCard
                          parentCommentId={parentCommentId}
                          parentReplyId={parentReplyId}
                          postId={postId}
                          id={subReply?.id}
                          postType={postType}
                          cardType={CardTypeEnum.comment}
                          user={subReply?.user}
                          isCampfireComments={isCampfireComments}
                          campfireDetails={campfireDetails}
                          title={
                            <ShrinkComments
                              message={subReply?.message}
                              isEdited={subReply?.isEdited || false}
                            />
                          }
                          createdAt={subReply?.createdAt}
                          color={
                            isHighlighting &&
                              highlightedSubReplyId === subReply?.id
                              ? 'bg-yellow-1050'
                              : color
                          }
                          canFollow
                          showBookmark={
                            !subReply?.is_deleted_by_admin_of_campfire
                          }
                          footerDisable={announcementPage || false}
                          campfirePost={campfirePost}
                          showReply
                          userName={`<${subReply?.user?.name}|${subReply?.user?.id}>`}
                          authorName={authorName}
                          postReaction={subReply?.post_reactions}
                          likesCount={subReply?.likes}
                          isDisable={
                            subReply?.is_disabled_by_admin ||
                            subReply?.user?.is_disabled_by_admin
                          }
                          hideActions={
                            subReply?.is_deleted_by_admin_of_campfire ||
                            announcementPage
                          }
                          isDeletedByAdminOfCampfire={
                            subReply?.is_deleted_by_admin_of_campfire
                          }
                          hideFooter={subReply?.is_deleted_by_admin_of_campfire}
                          showingError={
                            subReply?.is_deleted_by_admin_of_campfire ? (
                              <UnavailablePost postType="comment" />
                            ) : null
                          }
                          blurState={!!blurClass}
                          blurClass={blurClass}
                          isAnnouncementComment={isAnnouncementComment}
                          handleUpdatePostById={handleUpdatePostById}
                          campfireJoinTitle={campfireJoinTitle}
                          postUserId={postUserId}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
      {showSubReplies && subRepliesToShow?.length < subReplies?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>Load More Replies</LoadMore>
        </div>
      )}
    </>
  );
}

export function Replies({
  postType,
  postId,
  parentCommentId,
  replies,
  notOverlay,
  authorName,
  campfirePost,
  campfireDetails,
  isCampfireComments,
  isAnnouncementComment,
  handleUpdatePostById,
  announcementPage,
  blurClass,
  campfireJoinTitle,
  color,
  postUserId,
}: ReplyProps) {

  const router = useRouter();
  const { query, asPath } = router;
  const fragmentId = asPath?.split('#')?.[1];
  const isCommentClick = query?.isCommentClick === 'true';
  const [repliesToShow, setReplies] = useState(
    isCommentClick ? replies : replies?.slice(0, REPLIES_LENGTH),
  );

  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);

  const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(
    null,
  );

  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (
      isCommentClick &&
      fragmentId &&
      replies?.some((reply) => reply?.id === fragmentId)
    ) {
      setHighlightedReplyId(fragmentId);
      setIsHighlighting(true);
      const timeout = setTimeout(() => {
        setHighlightedReplyId(null);
        setIsHighlighting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isCommentClick, fragmentId, replies]);

  const openSubReplies = useAppSelector(
    (state) => state.subReplies.openSubReplies,
  );

  const handleLoadMore = () => {
    if (repliesToShow?.length < replies?.length) {
      setReplies((prevState) => [
        ...prevState,
        ...(replies?.slice(
          prevState?.length || 0,
          (prevState?.length || 0) + REPLIES_LENGTH,
        ) || []),
      ]);
    }
  };

  const showSubReplies = (replyId: string) => {
    dispatch(updateOpenSubReplies(replyId));
  };

  const handleOverlayClick = async (replyId: string) => {
    dispatch(
      UnhidePost(
        userId,
        postId,
        CardTypeEnum.comment,
        replyId,
        parentCommentId,
        '',
        isAnnouncementComment,
      ),
    );
  };

  const closeSubReplies = (replyId: string) => {
    if (openSubReplies?.includes(replyId)) {
      dispatch(updateOpenSubReplies(replyId));
    }
  };

  return (
    <>
      {repliesToShow?.map((reply) => {
        return (
          <div
            className="relative replies-comment"
            key={reply?.id}
            id={`comment-${reply?.id}`}
          >
            <div
              className="second-child relative mt-4 ml-4 lg:ml-12"
              id={`comment-${reply?.id}`}
              key={reply?.id}
            >
              {reply?.isHidden && !notOverlay && (
                <OverlayUndo
                  onClick={() => {
                    handleOverlayClick(reply?.id);
                  }}
                  message="This reply has been hidden, You will not see this reply further"
                />
              )}
              <div
                className={`overlay-conatiner ${reply?.isHidden && !notOverlay ? 'blur-sm' : ''
                  }`}
              >
                {reply?.hasPostCommentorRequestedForDeactivation ? (
                  <NotAvailableCard />
                ) : (
                  <>
                    <div className="relative">
                      {reply?.repliesToReplies?.length > 0 &&
                        !reply?.is_deleted_by_admin_of_campfire && (
                          <div
                            id={`replyCount_${reply?.id}`}
                            className="replyCount"
                            onClick={() => showSubReplies(reply?.id)}
                          >
                            <div className="">
                              {openSubReplies?.includes(reply?.id) ? (
                                <FaCaretUp size="22px" />
                              ) : (
                                <div>{reply?.repliesToReplies?.length}</div>
                              )}
                            </div>
                          </div>
                        )}
                      <ForumCard
                        parentCommentId={parentCommentId}
                        parentReplyId={reply?.id}
                        postId={postId}
                        id={reply?.id}
                        postType={postType}
                        cardType={CardTypeEnum.comment}
                        user={reply?.user}
                        isCampfireComments={isCampfireComments}
                        title={
                          <ShrinkComments
                            message={reply?.message}
                            isEdited={reply?.isEdited || false}
                          />
                        }
                        campfireDetails={campfireDetails}
                        createdAt={reply?.createdAt}
                        color={
                          isHighlighting && highlightedReplyId === reply?.id
                            ? 'bg-yellow-1050'
                            : color
                        }
                        canFollow
                        showBookmark={!reply?.is_deleted_by_admin_of_campfire}
                        showReply
                        authorName={reply?.user?.name}
                        postReaction={reply?.post_reactions}
                        likesCount={reply?.likes}
                        isDisable={
                          reply?.is_disabled_by_admin ||
                          reply?.user?.is_disabled_by_admin
                        }
                        hideActions={
                          reply?.is_deleted_by_admin_of_campfire ||
                          announcementPage
                        }
                        isDeletedByAdminOfCampfire={
                          reply?.is_deleted_by_admin_of_campfire
                        }
                        hideFooter={reply?.is_deleted_by_admin_of_campfire}
                        showingError={
                          reply?.is_deleted_by_admin_of_campfire ? (
                            <UnavailablePost postType="comment" />
                          ) : null
                        }
                        blurState={!!blurClass}
                        blurClass={blurClass}
                        campfireJoinTitle={campfireJoinTitle}
                        campfirePost={campfirePost}
                        isAnnouncementComment={isAnnouncementComment}
                        handleUpdatePostById={handleUpdatePostById}
                        postUserId={postUserId}
                        footerDisable={announcementPage || false}
                      />
                    </div>
                    {!reply?.is_deleted_by_admin_of_campfire && (
                      <SubReplies
                        key={`${(reply?.repliesToReplies || []).length}`}
                        postType={postType}
                        postId={postId}
                        parentCommentId={reply?.id}
                        subReplies={reply?.repliesToReplies}
                        campfireDetails={campfireDetails}
                        campfirePost={campfirePost}
                        isCampfireComments={isCampfireComments}
                        authorName={authorName}
                        parentReplyId={reply?.id}
                        showSubReplies={openSubReplies?.includes(reply?.id)}
                        closeSubReplies={closeSubReplies}
                        isAnnouncementComment={isAnnouncementComment}
                        handleUpdatePostById={handleUpdatePostById}
                        announcementPage={announcementPage}
                        blurClass={blurClass}
                        campfireJoinTitle={campfireJoinTitle}
                        color={color}
                        postUserId={postUserId}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {repliesToShow?.length < replies?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>Load More Replies</LoadMore>
        </div>
      )}
    </>
  );
}

export default function Comments({
  postType,
  postId,
  comments,
  notOverlay,
  postUserId,
  authorName,
  pin = true,
  campfirePost,
  campfireDetails,
  isCampfireComments,
  isAnnouncementComment,
  handleUpdatePostById,
  announcementPage,
  campfireJoinTitle,
  color,
  media_link,
}: CommentProps) {
  const blockerIds = useUsersWhoBlockedMe();
  const iBlockedIds = useUsersIBlocked();
  const showOpenComments = useAppSelector(
    (state) => state.comments.openComments,
  );
  const openCommentIndex = showOpenComments?.findIndex(
    (comment) => comment?.postId === postId,
  );
  const router = useRouter();
  const { query, asPath } = router;
  const fragmentId = asPath?.split('#')?.[1];
  const isCommentClick = query?.isCommentClick === 'true';
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);

  const [isHighlighting, setIsHighlighting] = useState(false);

  const isUserHiddenByBlock = (userId?: string) => {
    if (!userId) return false;
    return blockerIds.has(userId) || iBlockedIds.has(userId);
  };

  const filterThread = <T extends { user?: { id?: string }; replies?: any[]; repliesToReplies?: any[] }>(
    items: T[],
  ): T[] => {
    return (items || [])
      .filter((item) => !isUserHiddenByBlock(item?.user?.id))
      .map((item) => {
        const clone: any = { ...item };
        if (Array.isArray(clone.replies)) {
          clone.replies = filterThread(clone.replies);
        }
        if (Array.isArray(clone.repliesToReplies)) {
          clone.repliesToReplies = filterThread(clone.repliesToReplies);
        }
        return clone;
      });
  };

  const filteredComments = filterThread(comments || []);

  useEffect(() => {
    if (
      isCommentClick &&
      fragmentId &&
      filteredComments?.some((comment) => comment?.id === fragmentId)
    ) {
      setHighlightedCommentId(fragmentId);
      setIsHighlighting(true);
      const timeout = setTimeout(() => {
        setHighlightedCommentId(null);
        setIsHighlighting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isCommentClick, fragmentId, filteredComments]);

  const [commentsToShow, setComments] = useState(() => {
    if (isCommentClick) {
      return filteredComments;
    } else {
      return openCommentIndex !== -1
        ? filteredComments?.slice(
          0,
          showOpenComments?.[openCommentIndex]?.openCommentsNumber,
        )
        : filteredComments?.slice(0, COMMENTS_LENGTH);
    }
  });

  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    if (commentsToShow?.length < filteredComments?.length) {
      dispatch(
        updateOpenComments({
          postId: postId,
          openCommentsNumber: (commentsToShow?.length || 0) + COMMENTS_LENGTH,
        }),
      );
      setComments((prevState) => [
        ...prevState,
        ...(filteredComments?.slice(
          prevState?.length || 0,
          (prevState?.length || 0) + COMMENTS_LENGTH,
        ) || []),
      ]);
    }
  };
  const userId = useAppSelector(getUserId);
  const token = useAppSelector(selectGetToken);
  const handleOverlayClick = async (commentId: string) => {
    dispatch(
      UnhidePost(
        userId,
        postId,
        CardTypeEnum.comment,
        commentId,
        commentId,
        '',
        isAnnouncementComment,
      ),
    );
  };

  const blurClass =
    router?.pathname?.includes('/post/') &&
      campfireDetails &&
      !campfireDetails?.is_public &&
      (!campfireDetails?.isMember || !token)
      ? 'blur-sm'
      : '';
  return (
    <>
      {commentsToShow?.map((comment) => {
        const participanCount =
          typeof comment?.noParticipants === 'object'
            ? get(comment, 'noParticipants.aggregate.count', 0)
            : comment?.noParticipants || 0;
        return (
          <div
            className="child-thread relative"
            id={`comment-${comment?.id}`}
            key={comment?.id}
          >
            <div key={comment?.id}>
              {comment?.isHidden && !notOverlay && (
                <OverlayUndo
                  onClick={() => {
                    handleOverlayClick(comment?.id);
                  }}
                  message="This comment has been hidden, You will not see this comment further"
                />
              )}
              <div
                className={`overlay-conatiner ${comment?.isHidden && !notOverlay ? 'blur-sm' : ''
                  }`}
              >
                {comment?.hasPostCommentorRequestedForDeactivation ? (
                  <NotAvailableCard />
                ) : (
                  <div className="relative">
                    <ForumCard
                      // color={
                      //   isHighlighting && highlightedCommentId === comment?.id
                      //     ? 'bg-yellow-1050'
                      //     : 'bg-white'
                      // }
                      color={color}
                      postId={postId}
                      id={comment?.id}
                      parentCommentId={comment?.id}
                      user={comment?.user}
                      postType={postType}
                      postUserId={postUserId}
                      cardType={CardTypeEnum.comment}
                      title={
                        <ShrinkComments
                          message={comment?.message}
                          isEdited={comment?.isEdited}
                        />
                      }
                      footerDisable={announcementPage || false}
                      isCampfireComments={isCampfireComments}
                      campfireDetails={campfireDetails}
                      campfirePost={campfirePost}
                      createdAt={comment?.createdAt}
                      participantsCount={participanCount}
                      showBookmark={!comment?.is_deleted_by_admin_of_campfire}
                      canFollow
                      showReply
                      authorName={comment?.user?.name}
                      pin={pin && !comment?.is_deleted_by_admin_of_campfire}
                      isPinned={comment?.ispinned}
                      postReaction={comment?.post_reactions}
                      likesCount={comment?.likes}
                      isDisable={
                        comment?.is_disabled_by_admin ||
                        comment?.user?.is_disabled_by_admin
                      }
                      hideActions={
                        comment?.is_deleted_by_admin_of_campfire ||
                        announcementPage
                      }
                      isDeletedByAdminOfCampfire={
                        comment?.is_deleted_by_admin_of_campfire
                      }
                      hideFooter={comment?.is_deleted_by_admin_of_campfire}
                      showingError={
                        comment?.is_deleted_by_admin_of_campfire ? (
                          <UnavailablePost postType="comment" />
                        ) : null
                      }
                      blurState={!!blurClass}
                      blurClass={blurClass}
                      isAnnouncementComment={isAnnouncementComment}
                      handleUpdatePostById={handleUpdatePostById}
                      campfireJoinTitle={campfireJoinTitle}
                    // media_link={media_link}
                    />
                  </div>
                )}
                {!comment?.is_deleted_by_admin_of_campfire && (
                  <Replies
                    key={`${(comment?.replies || []).length}`}
                    postType={postType}
                    postId={postId}
                    isCampfireComments={isCampfireComments}
                    parentCommentId={comment?.id}
                    campfireDetails={campfireDetails}
                    campfirePost={campfirePost}
                    replies={comment?.replies}
                    authorName={authorName}
                    isAnnouncementComment={isAnnouncementComment}
                    announcementPage={announcementPage}
                    handleUpdatePostById={handleUpdatePostById}
                    blurClass={blurClass}
                    campfireJoinTitle={campfireJoinTitle}
                    color={color}
                    postUserId={postUserId}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
      {commentsToShow?.length < filteredComments?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>Load More Comments</LoadMore>
        </div>
      )}
    </>
  );
}
