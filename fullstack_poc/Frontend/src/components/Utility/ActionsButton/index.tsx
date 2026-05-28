{
  /**
   * ActionsButton is a versatile dropdown menu component that provides contextual actions
   * for forum posts and comments, such as editing, deleting, archiving, hiding, flagging,
   * and blocking users. It dynamically determines available options based on the user's role,
   * post type, route context (e.g., campfire or profile), and the visibility or archived state.
   *
   * It integrates with Redux for state management, utilizes GraphQL mutations for backend operations,
   * and conditionally renders multiple modals for confirmations and further actions (e.g., flag flow, block user, delete reason).
   */
}
import { useMutation } from '@apollo/client/react';
import { get } from 'lodash';
import { useRouter } from 'next/router';
import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';

import {
  blockUser,
  deleteComment,
  getPostById,
  hidePost,
  UnhidePost,
} from '@/actions/forum';
import DeletePost from '@/components/pages/Campfire/RemoveMember';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import BlockModal from '@/components/Utility/BlockModal';
import FlagModals from '@/components/Utility/Flag/FlagModals';
import Modal from '@/components/Utility/Modal';
import RemovalReason from '@/components/Utility/RemovalReason';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  getThreadIdObject,
} from '@/lib/helpers';
import {
  DELETE_CAMPFIRE_POST,
  DELETE_SHARE_CAMPFIRE_SHARE_POST,
  MUTATION_CAMPFIRE_ACTIVITIES,
} from '@/service/graphql/Campfire';
import {
  ARCHIVE_POLL_MUTATION,
  ARCHIVE_POST_SHARE_MUTATION,
  ARCHIVE_QUESTION_MUTATION,
  ARCHIVE_QUIZ_MUTATION,
  DELETE_POLL_MUTATION,
  DELETE_POST_SHARE_MUTATION,
  DELETE_QUESTION_MUTATION,
  DELETE_QUIZ_MUTATION,
} from '@/service/graphql/Forum';
import {
  decreaseActivePostCount,
  getUserId,
  increaseActivePostCount,
} from '@/state/Slices/auth';
import { resetAnnouncementsThread } from '@/state/Slices/campfire';
import {
  toggleEditQuestionDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';
import { setRefreshHomeFeed } from '@/state/Slices/home';
import {
  forumPostArchiveSuccess,
  forumPostDeletionSuccess,
  getForumFeedthread,
  updateForumFeedByPost,
} from '@/state/Slices/necessary';
import { unarchiveSuccess } from '@/state/Slices/profile';
import { CampfireActivity } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { QuestionType, ThreadType } from '@/types/forum';

import ActionList from './ActionsList.json' assert { type: 'json' };

interface FollowingButtonProps {
  postId: string;
  parentCommentId?: string;
  commentId?: string;
  postUserId: string;
  variant?: string;
  cardType: CardTypeEnum;
  description?: string;
  isHidden?: boolean | string;
  title?: string | React.ReactNode;
  isArchived?: boolean;
  postType?: PostTypeEnum;
  campfirePost?: boolean;
  campfireId?: string;
  isCampfire?: boolean;
  campfireThreadId?: string;
  isAnnouncement?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  isCampfireMember?: boolean;
  setCampfireJoin?: React.Dispatch<React.SetStateAction<boolean>>;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  campfireToolsPosts?: boolean;
  media_link?: string | null;
}

interface ActionItem {
  id: number;
  title: string;
  icon: string;
}

function ActionsButton({
  postId,
  commentId,
  postUserId,
  variant,
  cardType,
  parentCommentId,
  title,
  description,
  isHidden,
  isArchived,
  postType,
  campfirePost,
  campfireId,
  isCampfire,
  campfireThreadId,
  isAnnouncement,
  handleUpdatePostById,
  isCampfireMember,
  setCampfireJoin,
  setRefetch,
  campfireToolsPosts,
  media_link,
}: FollowingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [toggleReasonRemoval, setToggleReasonRemoval] = useState(false);
  const [actionsList, setActionList] = useState(ActionList.MenuList);
  const dispatch = useAppDispatch();
  const feedPosts = useAppSelector(getForumFeedthread);
  const feedPost = feedPosts?.find((post) => post.id === postId);
  const loggedUserId = useAppSelector(getUserId) || '';
  const token = useAppSelector((state) => state.auth.token);
  const profile = useAppSelector((state) => state.auth.profile);
  const campfireData = useAppSelector(
    (state) => state.campfire.campfireDetails,
  );

  const router = useRouter();
  const [isDeletedByAdmin, setIsDeletedByAdmin] = useState(false);

  const [flagModal, setFlagModal] = useState(false);
  const [flagSteps, setFlagSteps] = useState(0);
  const [blockModal, setBlockModal] = useState(false);
  const [isBlockTheUser, setBlockTheUser] = useState(false);

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

  const [deleteCampfirePost] = useMutation(DELETE_CAMPFIRE_POST);

  const onCompleteDeletePost = () => {
    dispatch(forumPostDeletionSuccess(postId));
    dispatch(decreaseActivePostCount());
    emitNotification('success', 'Your post has been deleted successfully!');
    if (isArchived) {
      dispatch(unarchiveSuccess(postId));
    }

    if (isCampfire && campfireThreadId) {
      deleteCampfirePost({
        variables: {
          threadId: campfireThreadId,
          deletedBy: loggedUserId,
          ...(selectedReasonId !== '' && { removalReason: selectedReasonId }),
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }
    if (router.pathname === '/post/[postId]' && cardType !== CardTypeEnum.comment) {
      router.push('/');
    } else if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  const [deleteQuestion] = useMutation(DELETE_QUESTION_MUTATION);

  const [deletePoll] = useMutation(DELETE_POLL_MUTATION);

  const [deleteQuiz] = useMutation(DELETE_QUIZ_MUTATION);

  const [deletePostShare] = useMutation(DELETE_POST_SHARE_MUTATION);

  const [deleteCampfireSharePost] = useMutation(
    DELETE_SHARE_CAMPFIRE_SHARE_POST,
  );

  const [archiveQuestion] = useMutation(ARCHIVE_QUESTION_MUTATION);

  const [archivePoll] = useMutation(ARCHIVE_POLL_MUTATION);

  const [archiveQuiz] = useMutation(ARCHIVE_QUIZ_MUTATION);

  const [archivePostShare] = useMutation(ARCHIVE_POST_SHARE_MUTATION);

  const handleClickOutside = (event: globalThis.MouseEvent) => {
    if (
      dropdownRef.current &&
      event.target instanceof Node &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (window.location.toString().includes('campfire')) {
      if (profile?.id === postUserId) {
        if (cardType === CardTypeEnum.poll || cardType === CardTypeEnum.quiz) {
          setActionList(
            isArchived
              ? ActionList.AdminListUnarchive
              : ActionList.AdminList.slice(1),
          );
        } else {
          if (cardType === CardTypeEnum.comment) {
            setActionList(ActionList.AdminList.slice(0, 2));
          } else {
            setActionList(
              isArchived ? ActionList.AdminListUnarchive : ActionList.AdminList,
            );
          }
        }
      } else {
        if (campfireData?.isAdmin) {
          setActionList(ActionList.CampfireAdmin);
          if (commentId) setIsDeletedByAdmin(true);
        } else
          setActionList(isHidden ? ActionList.HiddenList : ActionList.MenuList);
      }
    } else if (router.pathname === '/user/[userName]') {
      setActionList(
        isArchived ? ActionList.AdminListUnarchive : ActionList.UserMenuList,
      );
    } else {
      if (profile?.id === postUserId) {
        if (
          cardType === CardTypeEnum.poll ||
          cardType === CardTypeEnum.quiz ||
          cardType === CardTypeEnum.postShare
        ) {
          setActionList(
            isArchived
              ? ActionList.AdminListUnarchive
              : ActionList.AdminList.slice(1),
          );
        } else {
          if (cardType === CardTypeEnum.comment) {
            setActionList(ActionList.AdminList.slice(0, 2));
          } else if (postType === PostTypeEnum.campfirePostShare) {
            setActionList(ActionList.AdminList.slice(1, 2));
          } else {
            setActionList(
              isArchived ? ActionList.AdminListUnarchive : ActionList.AdminList,
            );
          }
        }
      } else {
        if (
          postType === PostTypeEnum.campfire ||
          postType === PostTypeEnum.campfirePostShare
        ) {
          setActionList(ActionList.MenuList.slice(2));
        } else {
          setActionList(isHidden ? ActionList.HiddenList : ActionList.MenuList);
        }
      }
    }
  }, [
    profile?.id,
    isHidden,
    isArchived,
    campfireData?.isAdmin,
    router.pathname,
    postUserId,
    cardType,
    commentId,
    postType,
  ]);

  const handleDeletePost = async () => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    } else if (cardType === CardTypeEnum.question) {
      const result = await deleteQuestion({
        variables: {
          id: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (result.data) {
        onCompleteDeletePost();
      }
    } else if (cardType === CardTypeEnum.quiz) {
      const result = await deleteQuiz({
        variables: {
          quizId: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (result.data) {
        onCompleteDeletePost();
      }
    } else if (cardType === CardTypeEnum.poll) {
      const result = await deletePoll({
        variables: {
          pollId: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (result.data) {
        onCompleteDeletePost();
      }
    } else if (postType === PostTypeEnum.campfirePostShare && !commentId) {
      const result = await deleteCampfireSharePost({
        variables: {
          id: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (result.data) {
        onCompleteDeletePost();
      }
    } else if (cardType === CardTypeEnum.comment) {
      if (commentId) {
        if (isAnnouncement) {
          dispatch(
            deleteComment(
              commentId,
              postId,
              cardType,
              postType,
              isDeletedByAdmin,
              campfirePost,
              isAnnouncement,
              parentCommentId,
            ),
          );
        } else {
          if (postType === PostTypeEnum.campfire) {
            dispatch(
              deleteComment(
                commentId,
                postId,
                cardType,
                postType,
                isDeletedByAdmin,
                undefined,
                undefined,
                parentCommentId,
                handleUpdatePostById,
              ),
            );
          } else {
            dispatch(
              deleteComment(
                commentId,
                postId,
                cardType,
                undefined,
                isDeletedByAdmin,
                campfirePost,
                undefined,
                parentCommentId,
                handleUpdatePostById,
              ),
            );
            if (campfirePost) {
              await fetchActivityList({
                variables: { postId, campfireId, limit: 1 },
              });
            }
          }
        }
      } else {
        emitErrorNotification(
          'Oops! Something went wrong, refresh and try again',
        );
        return;
      }
    } else if (cardType === CardTypeEnum.postShare) {
      const result = await deletePostShare({
        variables: {
          id: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (result.data) {
        onCompleteDeletePost();
      }
    }

    setIsOpen(false);
    setToggleDeleteModal(false);
    return;
  };

  const handleReasonRemove = () => {
    setToggleDeleteModal(true);
    setToggleReasonRemoval(false);
  };

  const handleActionClick = async (action: ActionItem) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (action.title === 'Delete') {
      if (isCampfire) {
        setToggleReasonRemoval(true);
      } else {
        setToggleDeleteModal(true);
      }
    }
    if (action.title === 'Edit') {
      const thread = feedPost?.type
        ? (feedPost as ThreadType)[feedPost.type]
        : undefined;

      const categoryId =
        (thread as QuestionType)?.post_categories?.[0]?.category?.id ?? '';

      dispatch(
        toggleEditQuestionDialog({
          editPostDialogOpen: true,
          editDialogPost: feedPost,
          title,
          description,
          media_link,
          postId,
          campfireId,
          categoryName:
            feedPost && feedPost.type
              ? ((feedPost as ThreadType)[feedPost.type]?.categoryName ?? '')
              : '',
          replyCommentId: commentId || '',
          parentCommentId: parentCommentId || '',
          isCampfirePost: feedPost?.question?.campfireName,
          isAnnouncement,
          categoryId: categoryId,
          handleUpdatePostById,
          setRefetch,
        }),
      );
      setIsOpen(false);
      return;
    }
    if (['Archive', 'Unarchive'].includes(action.title)) {
      const isArchivedState = action.title === 'Archive' ? true : false;
      let result;

      if (cardType === CardTypeEnum.question) {
        result = await archiveQuestion({
          variables: {
            id: postId,
            isArchived: isArchivedState,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } else if (cardType === CardTypeEnum.quiz) {
        result = await archiveQuiz({
          variables: {
            quizId: postId,
            isArchived: isArchivedState,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } else if (cardType === CardTypeEnum.poll) {
        result = await archivePoll({
          variables: {
            pollId: postId,
            isArchived: isArchivedState,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } else if (cardType === CardTypeEnum.postShare) {
        result = await archivePostShare({
          variables: {
            id: postId,
            isArchived: isArchivedState,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } else if (cardType === CardTypeEnum.comment) {
        emitErrorNotification(
          `Sorry, You cannot ${action.title.toLowerCase()} a comment`,
        );
        return;
      }

      // Handle completion logic that was in onCompleted
      if (result?.data) {
        if (isArchivedState === true) {
          dispatch(forumPostArchiveSuccess(feedPost));
        } else {
          dispatch(unarchiveSuccess(postId));
          dispatch(increaseActivePostCount());
          const threadData = await getPostById(postId);
          dispatch(updateForumFeedByPost(threadData));
        }
      }

      setIsOpen(false);
      if (setRefetch) {
        setRefetch((prev) => !prev);
      }
      emitNotification(
        'success',
        `Your post has been ${
          isArchivedState ? 'archived' : 'unarchived'
        } successfully!`,
      );
      return;
    }
    if (action.title === 'Flag') {
      setFlagModal(!flagModal);
    }
    if (action.title === 'Hide') {
      if (!loggedUserId) {
        dispatch(toggleSignupDialog(true));
      } else {
        dispatch(
          hidePost(
            postId,
            cardType,
            commentId,
            parentCommentId,
            isAnnouncement,
          ),
        );
      }
      if (campfireToolsPosts && setRefetch) {
        setRefetch((prev) => !prev);
      }
    }
    if (action.title === 'UnHide Post') {
      dispatch(
        UnhidePost(
          loggedUserId,
          postId,
          cardType,
          commentId,
          parentCommentId,
          '',
          isAnnouncement,
        ),
      );
    }
    if (action.title === 'Block the user') {
      setBlockTheUser(true);
      setBlockModal(true);
    }
    if (action.title === 'Block this user') {
      if (cardType === CardTypeEnum.user) {
        setBlockModal(true);
      }
    }
    setIsOpen(false);
    return;
  };

  const handleBlockTheUser = () => {
    dispatch(blockUser(postUserId, router.pathname, campfireData?.id));
    dispatch(resetAnnouncementsThread());
    setTimeout(() => {
      dispatch(setRefreshHomeFeed(true));
    }, 500);
  };

  function handleOnActionClick() {
    if (window.location.toString().includes('campfire')) {
      if (campfireData?.isMember) {
        setIsOpen(!isOpen);
      }
    } else {
      setIsOpen(!isOpen);
    }
  }

  return (
    <>
      <Modal
        id="FlagModals"
        isVisible={flagModal}
        backIcon={flagSteps === 1}
        onClose={() => {
          setFlagModal(false);
          setFlagSteps(0);
        }}
        onBack={() => setFlagSteps(flagSteps - 1)}
      >
        <FlagModals
          flagSteps={flagSteps}
          setFlagSteps={setFlagSteps}
          cardType={cardType}
          postId={postId}
          commentId={commentId}
          campfirePost={campfirePost}
          campfireId={campfireId}
          reportedUserId={postUserId}
        />
      </Modal>

      <Modal
        id="BlockModal"
        isVisible={blockModal}
        onClose={() => {
          setBlockModal(false);
          setBlockTheUser(false);
        }}
      >
        <BlockModal
          blockModal={blockModal}
          setBlockModal={setBlockModal}
          postUserId={postUserId}
          handleBlock={handleBlockTheUser}
          isBlockTheUser={isBlockTheUser}
          setBlockTheUser={setBlockTheUser}
          setRefetch={setRefetch}
        />
      </Modal>

      <Modal
        id="DeleteModal"
        isVisible={toggleDeleteModal}
        onClose={() => {
          setToggleDeleteModal(false);
        }}
      >
        <DeletePost
          title={
            parentCommentId !== commentId
              ? 'Delete Reply'
              : commentId
                ? 'Delete Comment'
                : 'Delete Post'
          }
          subTitle={
            parentCommentId !== commentId
              ? 'Are you sure you want to delete this reply?'
              : commentId
                ? 'Are you sure you want to delete this comment?'
                : 'Are you sure you want to delete this post?'
          }
          onCancel={() => setToggleDeleteModal(false)}
          onSend={handleDeletePost}
          onSendText="Delete"
        />
      </Modal>

      <Modal
        id="ReasonModal"
        isVisible={toggleReasonRemoval}
        onClose={() => {
          setToggleReasonRemoval(false);
          setSelectedReasonId('');
        }}
      >
        <RemovalReason
          campfireId={campfireId}
          selectedReasonId={selectedReasonId}
          setSelectedReasonId={setSelectedReasonId}
          handleSumbit={handleReasonRemove}
        />
      </Modal>

      <div className="relative" ref={dropdownRef}>
        <div
          className="cursor-pointer p-2"
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            if (!isCampfireMember && setCampfireJoin) {
              setCampfireJoin(true);
            } else {
              handleOnActionClick();
            }
          }}
        >
          <BsThreeDotsVertical
            size={16}
            color="#272727"
            className="font-bold"
          />
        </div>
        {isOpen && (
          <div
            className={` absolute z-51 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
              variant == 'lg' ? 'top-14 right-9' : 'top-7 right-3'
            }`}
          >
            <div className="py-2" role="none">
              <ul>
                {actionsList.map((data: ActionItem) => {
                  if (data.title === 'Hide' && isAnnouncement) {
                    return null;
                  }
                  return (
                    <li
                      className="group block cursor-pointer px-2"
                      key={data.id}
                      onClick={(e: MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        handleActionClick(data);
                      }}
                    >
                      <div className="flex justify-between rounded-md p-2 hover:bg-gray-100">
                        <Text size="sm" color="group-hover:text-primary">
                          {data.title === 'UnHide Post' && commentId
                            ? commentId === parentCommentId
                              ? 'Unhide Comment'
                              : 'Unhide Reply'
                            : data.title}
                        </Text>
                        <div className=" group-hover:text-primary">
                          <span className={`${data.icon}`} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ActionsButton;
