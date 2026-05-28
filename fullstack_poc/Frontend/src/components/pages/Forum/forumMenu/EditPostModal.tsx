import { get } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { getPostByCampfireId } from '@/actions/campfire';
import {
  createHashtags,
  getAnnouncementById,
  getPostById,
} from '@/actions/forum';
import EditDetails from '@/components/pages/Forum/forumMenu/EditDetails';
import Category from '@/components/pages/Forum/question/Category';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  getThreadIdObject,
  normalizeWhitespace,
} from '@/lib/helpers';
import { MUTATION_CAMPFIRE_ACTIVITIES } from '@/service/graphql/Campfire';
import {
  EDIT_COMMENT_MUTATION,
  EDIT_QUESTION_MUTATION,
  UPDATE_POST_SHARE_TITLE_MUTATION,
} from '@/service/graphql/Forum';
import { updateFeedByAnnouncement } from '@/state/Slices/campfire';
import { toggleEditQuestionDialog } from '@/state/Slices/dialog';
import { updateForumFeedByPost } from '@/state/Slices/necessary';
import { CampfireActivity } from '@/types/campfire';
import { CardTypeEnum } from '@/types/enums';
import { ThreadType } from '@/types/forum';

export type editPostDetailsType = {
  title: string;
  description?: string;
  media_link?: string | null;
  comment?: string;
  categoryId?: string | null;
};

interface EditPostData {
  title: string | { props: { message: string } };
  description?: string;
  media_link?: string | null;
  categoryId?: string;
  editDialogPost?: {
    type: string;
    threadId?: string;
  };
}
function EditPostModal() {
  const [index, setIndex] = useState(0);
  const { pathname } = useRouter();
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const goBack = () => setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  const dispatch = useAppDispatch();
  const dialogVisible = useAppSelector((state) => state.dialog.editPostData?.editPostDialogOpen);
  const editPost = useAppSelector((state) => state.dialog.editPostData as EditPostData);
  const commentId = useAppSelector((state) => state.dialog.editPostData?.parentCommentId);
  const replyId = useAppSelector((state) => state.dialog.editPostData?.replyCommentId);
  const postId = useAppSelector((state) => state.dialog.editPostData?.postId);
  const campfireId = useAppSelector((state) => state.dialog.editPostData?.campfireId);
  const threadId = useAppSelector((state) => state.dialog.editPostData?.editDialogPost?.threadId);
  const isCampfirePost = useAppSelector((state) => state.dialog.editPostData?.isCampfirePost);
  const categoryId = useAppSelector((state) => state.necessary.forumFeed?.id);
  const campfireCategoryId = useAppSelector((state) => state.campfire.campfireDetails?.categoryId);
  const isAnnouncement = useAppSelector((state) => state.dialog.editPostData?.isAnnouncement);
  const handleUpdatePostById = useAppSelector((state) => state.dialog.editPostData?.handleUpdatePostById);
  const setRefetch = useAppSelector((state) => state.dialog.editPostData?.setRefetch);


  const isCampfireType = editPost?.editDialogPost?.type === CardTypeEnum.campfire;
  const isCampfirePage = pathname.includes('/campfire/');

  const titleFromProps = (editPost?.title as { props: { message: string } })?.props;
  const plainTitle = !(editPost?.title as { props: { message: string } })?.props ? editPost?.title : '';

  const router = useRouter();
  const initialEditObj = useMemo(() => ({
    title: plainTitle,
    description: editPost?.description || '',
    media_link: editPost?.media_link || '',
    comment: replyId || commentId ? titleFromProps?.message : null,
    categoryId: editPost?.categoryId
      ? editPost?.categoryId
      : categoryId
        ? categoryId
        : (campfireCategoryId ?? ''),
  }),
    [
      titleFromProps,
      plainTitle,
      editPost?.description,
      editPost?.categoryId,
      categoryId,
      campfireCategoryId,
      replyId,
      commentId,
    ],
  );


  // const initialEditObj = {
  //   title: plainTitle,
  //   description: editPost?.description || '',
  //   media_link: editPost?.media_link || '',
  //   comment: replyId || commentId ? titleFromProps?.message : null,
  //   categoryId: editPost?.categoryId
  //     ? editPost?.categoryId
  //     : categoryId
  //       ? categoryId
  //       : (campfireCategoryId ?? ''),
  // }

  const [loader, setLoader] = useState(false);

  const handleClose = () => {
    dispatch(
      toggleEditQuestionDialog({
        edit: false,
        feedPost: {},
        commentId: '',
        parentCommentId: '',
      }),
    );
  };
  const [editPostDetails, setEditPostDetails] = useState<editPostDetailsType>(initialEditObj as unknown as editPostDetailsType);



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

  const { mutationFunction: submitEditQuestion } = useAuthMutation(
    EDIT_QUESTION_MUTATION,
    async () => {
      nextStep();
      const postData = await getPostById(postId);
      let threadData;
      if (isCampfirePage && postData) {
        const post = { ...getThreadIdObject(postData) };
        post.threadId = threadId;
        threadData = post;
      } else {
        threadData = postData;
      }
      dispatch(updateForumFeedByPost(threadData));
      setLoader(false);
      // Check if current route is /category/[categoryName]
      if (
        router.pathname === '/category/[categoryName]' &&
        router.query.categoryName
      ) {
        const categoryName = (threadData as ThreadType)[
          (threadData as ThreadType)?.type
        ]?.categoryName;
        router.push(`/category/${categoryName}`);
      }
    },
    (error) => {
      emitErrorNotification(formatGraphqlError(error));
      setLoader(false);
    },
  );

  const { mutationFunction: submitEditComment } = useAuthMutation(
    EDIT_COMMENT_MUTATION,
    async () => {
      if (editPost) {
        nextStep();
        if (campfireId) {
          await fetchActivityList({
            variables: { postId, campfireId, limit: 1 },
          });
        } else {
          let threadData;
          if (isCampfireType) {
            threadData = await getPostByCampfireId(postId);
          } else if (isAnnouncement) {
            const announcement = await getAnnouncementById(postId);
            dispatch(updateFeedByAnnouncement(announcement));
          } else {
            threadData = await getPostById(postId);
            if (handleUpdatePostById) {
              handleUpdatePostById(threadData as unknown as ThreadPost);
            }
          }
          dispatch(updateForumFeedByPost(threadData));
        }
      }
    },
  );

  const { mutationFunction: submitEditPostShare } = useAuthMutation(
    UPDATE_POST_SHARE_TITLE_MUTATION,
    async () => {
      nextStep();
      const postData = await getPostById(postId);
      let threadData;
      if (postData) {
        const post = { ...getThreadIdObject(postData) };
        post.threadId = threadId;
        threadData = post;
      } else {
        threadData = postData;
      }
      dispatch(updateForumFeedByPost(threadData));
      setLoader(false);
    },
    (error) => {
      emitErrorNotification(formatGraphqlError(error));
      setLoader(false);
    },
  );

  const handlePostEdit = async () => {
    if (commentId) {
      submitEditComment({
        variables: {
          commentId: commentId === replyId ? commentId : replyId,
          message: editPostDetails?.comment,
        },
      });
      await createHashtags(
        editPostDetails?.comment || '',
        postId as string,
        'question',
        commentId,
        (editPost?.title as { props: { message: string } })?.props?.message,
      );
    } else if (editPost?.editDialogPost?.type === 'postShare') {
      setLoader(true);
      submitEditPostShare({
        variables: {
          id: postId,
          title: normalizeWhitespace(editPostDetails.title),
        },
      });
      await createHashtags(
        editPostDetails?.title || '',
        postId as string,
        'postShare',
      );
    } else {
      setLoader(true);
      submitEditQuestion({
        variables: {
          id: postId,
          description: normalizeWhitespace(editPostDetails.description),
          categoryId:
            editPostDetails.categoryId ?? categoryId ?? campfireCategoryId,
        },
      });
      await createHashtags(
        editPostDetails?.description || editPost?.description || '',
        postId as string,
        'question',
      );
    }
    if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!dialogVisible) {
      setIndex(0);
    }
  }, [dialogVisible]);

  useEffect(() => {
    setEditPostDetails(initialEditObj as unknown as editPostDetailsType);
  }, [initialEditObj]);


  return (
    <Modal
      id="EditPost"
      isVisible={dialogVisible}
      backIcon={commentId ? index > 0 && index !== 1 : index > 0 && index !== 2}
      onBack={goBack}
      onClose={handleClose}
    >
      <SwipeableViews index={index} disabled>
        <EditDetails
          nextStep={nextStep}
          setEditPostDetails={index == 0 ? setEditPostDetails : null}
          editPostDetails={initialEditObj as editPostDetailsType}
          handleEdit={handlePostEdit}
          postType={editPost?.editDialogPost?.type}
          isCampfirePage={isCampfirePage}
          isCampfirePost={isCampfirePost}
          isReply={commentId !== replyId}
        />
        {!commentId &&
          !isCampfirePage &&
          !isCampfirePost &&
          editPost?.editDialogPost?.type !== 'postShare' && (
            <Category
              initialCategoryName={
                editPost?.categoryId ?? categoryId ?? campfireCategoryId
              }
              handleSubmit={handlePostEdit}
              setEditPostDetails={index == 1 ? setEditPostDetails : null}
              editPostDetails={index == 1 ? editPostDetails as editPostDetailsType : null}
              loading={loader}
              load={index == 1 ? true : false}
            />
          )}
        <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
          <Success
            title={
              commentId !== replyId
                ? 'Reply is Edited'
                : commentId
                  ? 'Comment is Edited'
                  : 'Post is Edited'
            }
            isActive={
              commentId ||
                isCampfirePost ||
                editPost?.editDialogPost?.type === 'postShare' ||
                isCampfirePage
                ? index === 1
                : index === 2
            }
            autoClose={handleClose}
          />
        </div>
      </SwipeableViews>
    </Modal>
  );
}
export default EditPostModal;
