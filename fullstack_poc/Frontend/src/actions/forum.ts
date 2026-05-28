import { DocumentNode } from 'graphql';
import { get } from 'lodash';

import { forceLogoutUser } from '@/actions/auth';
import { getPostByCampfireId } from '@/actions/campfire';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  isIgnorableHashtagMutationError,
} from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import ApiClient from '@/service/graphql/apiClient';
import { VOTE_CAMPFIRE_MUTATION } from '@/service/graphql/Campfire';
import {
  FETCH_CATEGORIES_FEED_MUTATION,
  QUERY_GET_CATEGORIES,
} from '@/service/graphql/Category';
import { ADD_COMMENT_MUTATION } from '@/service/graphql/Comment';
import {
  BOOKMARK_POST_MUTATION,
  CREATE_HASHTAG,
  DELETE_COMMENT_MUTATION,
  DELETE_POST_HASHTAG,
  FETCH_ANNOUNCEMENT_PARTICIPANTS,
  FETCH_CAMPFIRE_POST_SHARE_PARTICIPANTS,
  FETCH_CAMPFIRESHARE_PARTICIPANTS,
  FETCH_COMMENT_PARTICIPANTS,
  FETCH_POLL_PARTICIPANTS,
  FETCH_POSTSHARE_PARTICIPANTS,
  FETCH_QUESTION_PARTICIPANTS,
  FETCH_QUIZ_PARTICIPANTS,
  GET_ANNOUNCEMENT_BY_ID,
  QUERY_POST_BY_ID,
  QUERY_POST_BY_ID_WITHOUT_COMMENTS,
  QUERY_UNAUTHENTICATED_POST_BY_ID,
  REMOVE_VOTE_MUTATION,
  UNBOOKMARK_POST_MUTATION,
  VOTE_COMMENT_MUTATION,
  VOTE_FEED_POST_SHARE_MUTATION,
  VOTE_POLL_MUTATION,
  VOTE_QUESTION_MUTATION,
  VOTE_QUIZ_MUTATION,
} from '@/service/graphql/Forum';
import {
  BLOCK_USER_MUTATION,
  HIDE_COMMENT_MUTATION,
  HIDE_POST_MUTATION,
  UNHIDE_COMMENT_MUTATION,
  UNHIDE_POST_MUTATION,
} from '@/service/graphql/Profile';
import {
  blockUserSuccess,
  decreaseActivePostCount,
  decreaseHiddenPostCount,
  increaseActivePostCount,
  increaseHiddenPostCount,
} from '@/state/Slices/auth';
import { updateFeedByAnnouncement } from '@/state/Slices/campfire';
import {
  categoryFetchSuccess,
  fetchMoreForumFeed,
  hideRelatedPosts,
  postVoteSuccess,
  updateForumFeedByPost,
} from '@/state/Slices/necessary';
import {
  removeFromCommentPostFeed,
  removeFromHiddenPostFeed,
  removeFromReplyPostFeed,
  updateBookmarkedPost,
} from '@/state/Slices/profile';
import { AppDispatch } from '@/state/store';
import { CardTypeEnum, PostTypeEnum, variableType } from '@/types/enums';
import {
  CommentType,
  ReplyType,
  SubReplyType,
  ThreadType,
} from '@/types/forum';
import findMissingHashtags from '@/utils/generateHashtag';
import { getUserToken } from '@/utils/verifyAuthentication';

// Fetches a thread by its ID and returns the formatted thread data.
export async function getPostById(
  id: string | undefined,
  limit = 10,
  offset = 0,
  query = false,
): Promise<ThreadType | null> {
  try {
    const token = getUserToken();
    const response: any = await ApiClient.getClient().query({
      query: query
        ? QUERY_POST_BY_ID_WITHOUT_COMMENTS
        : token
          ? QUERY_POST_BY_ID
          : QUERY_UNAUTHENTICATED_POST_BY_ID,
      fetchPolicy: 'no-cache',
      variables: { id, limit, offset },
      context: {
        headers:
          token && token?.length > 0
            ? { Authorization: `Bearer ${token}` }
            : {},
      },
    });

    if (!response.data.threads.length) {
      return null;
    } else {
      const threadData = response.data.threads[0];
      const getId = () => {
        if (threadData.poll) {
          return threadData.poll.id;
        }
        if (threadData.quiz) {
          return threadData.quiz.id;
        }
        if (threadData.question) {
          return threadData.question.id;
        }
        if (threadData.postShare) {
          return threadData.postShare.id;
        }
        return threadData.id;
      };
      const formatedThreadData = { ...threadData, id: getId() };
      return formatedThreadData;
    }
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
    return null;
  }
}

// Dispatches an action to fetch categories and store them in the state.
export function fetchCategories() {
  return async (dispatch: AppDispatch) => {
    try {
      const { data }: any = await ApiClient.getClient().query({
        query: QUERY_GET_CATEGORIES,
        fetchPolicy: 'cache-first',
      });
      dispatch(categoryFetchSuccess({ categories: data.categories }));
    } catch (error) {
      captureSentryException(error);
      emitErrorNotification();
    }
  };
}

// Fetches more threads for a specific category and updates the feed in the store.
export function fetchMoreCategoryFeed(
  categoryName: string,
  offset = 0,
  limit = 10,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      const { data } = await ApiClient.getClient().mutate({
        mutation: FETCH_CATEGORIES_FEED_MUTATION,
        variables: { title: categoryName, limit, offset },
        context: token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : {},
      });
      const finalValue = get(data, 'getFeed.feed.threads', []);
      dispatch(fetchMoreForumFeed(finalValue));
    } catch (error) {
      emitErrorNotification();
    }
  };
}

// Dispatches an action to bookmark a post for a specific user.
export function bookmarkPost(
  postId: string,
  type: keyof typeof variableType,
  userId: string,
) {
  return async (dispatch: AppDispatch) => {
    const token = getUserToken();
    if (!token) {
      dispatch(forceLogoutUser());
      return;
    }
    try {
      const key = variableType[type];
      await ApiClient.getClient().mutate({
        mutation: BOOKMARK_POST_MUTATION,
        variables: {
          userId,
          [key]: postId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } catch (error) {
      captureSentryException(error);
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Dispatches an action to unbookmark a post by its bookmark ID.
export function unBookmarkPost(bookmarkId: string) {
  return async (dispatch: AppDispatch) => {
    const token = getUserToken();
    if (!token) {
      dispatch(forceLogoutUser());
      return;
    }
    try {
      await ApiClient.getClient().mutate({
        mutation: UNBOOKMARK_POST_MUTATION,
        variables: {
          id: bookmarkId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } catch (error) {
      captureSentryException(error);
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Votes for a post (question, poll, quiz, etc.) and returns updated vote counts.
export const voteForPost = async (
  id: string,
  type: CardTypeEnum,
  isUpvoted: boolean,
  userId: string,
) => {
  try {
    const token = getUserToken();
    if (!token) {
      emitErrorNotification('Session expired');
      return null;
    }
    let response: any;
    const context = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const variables = {
      userId,
      [`${type}Id`]: id,
      isUpvoted,
    };
    if (type === CardTypeEnum.question) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_QUESTION_MUTATION,
        variables,
        context,
      });
    } else if (type === CardTypeEnum.poll) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_POLL_MUTATION,
        variables,
        context,
      });
    } else if (type === CardTypeEnum.quiz) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_QUIZ_MUTATION,
        variables,
        context,
      });
    } else if (type === CardTypeEnum.comment) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_COMMENT_MUTATION,
        variables,
        context,
      });
    } else if (type === CardTypeEnum.campfire) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_CAMPFIRE_MUTATION,
        variables,
        context,
      });
    } else if (type === CardTypeEnum.postShare) {
      response = await ApiClient.getClient().mutate({
        mutation: VOTE_FEED_POST_SHARE_MUTATION,
        variables,
        context,
      });
    }

    const postData = response?.data.insert_user_actions_one[type];
    const { noDownValues, noParticipants, noUpValues } = postData;
    return { noDownValues, noParticipants, noUpValues };
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
    return null;
  }
};

// Removes a vote for a post and returns success status.
export const removeVoteForPost = async (
  postId: string,
  type: CardTypeEnum,
  userId: string,
) => {
  try {
    const token = getUserToken();
    if (!token) {
      emitErrorNotification('Session expired');
      return false;
    }
    await ApiClient.getClient().mutate({
      mutation: REMOVE_VOTE_MUTATION,
      variables: {
        [`${type}Id`]: postId,
        userId,
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    return true;
  } catch (error) {
    emitErrorNotification();
    return false;
  }
};

// Dispatches an action to vote for a post and updates the feed accordingly.
export function _voteForPostOld(
  id: string,
  type: CardTypeEnum,
  isUpvoted: boolean,
  userId: string,
  postId: string,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      let response: any;
      const context = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const variables = {
        userId,
        [`${type}Id`]: id,
        isUpvoted,
      };
      if (type === CardTypeEnum.question) {
        response = await ApiClient.getClient().mutate({
          mutation: VOTE_QUESTION_MUTATION,
          variables,
          context,
        });
      } else if (type === CardTypeEnum.poll) {
        response = await ApiClient.getClient().mutate({
          mutation: VOTE_POLL_MUTATION,
          variables,
          context,
        });
      } else if (type === CardTypeEnum.quiz) {
        response = await ApiClient.getClient().mutate({
          mutation: VOTE_QUIZ_MUTATION,
          variables,
          context,
        });
      } else if (type === CardTypeEnum.comment) {
        response = await ApiClient.getClient().mutate({
          mutation: VOTE_COMMENT_MUTATION,
          variables,
          context,
        });
      } else if (type === CardTypeEnum.campfire) {
        response = await ApiClient.getClient().mutate({
          mutation: VOTE_CAMPFIRE_MUTATION,
          variables,
          context,
        });
      }
      const postData = response?.data.insert_user_actions_one[type];
      if (type !== CardTypeEnum.comment) {
        dispatch(postVoteSuccess({ data: postData, id, type: type }));
      } else {
        const threadData = await getPostById(postId);
        dispatch(updateForumFeedByPost(threadData));
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Dispatches an action to remove a vote for a post and updates the feed accordingly.
export function _removeVoteForPostOlc(
  postId: string,
  type: CardTypeEnum,
  userId: string,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      await ApiClient.getClient().mutate({
        mutation: REMOVE_VOTE_MUTATION,
        variables: {
          [`${type}Id`]: postId,
          userId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } catch (error) {
      captureSentryException(error);
      emitErrorNotification();
    }
  };
}

// Fetches an announcement by ID and returns the announcement data.
export async function getAnnouncementById(id: string | undefined) {
  try {
    const token = getUserToken();
    const response: any = await ApiClient.getClient().query({
      query: GET_ANNOUNCEMENT_BY_ID,
      fetchPolicy: 'no-cache',
      variables: { id },
      context: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    return response.data.announcements_by_pk;
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
    return null;
  }
}

// Dispatches an action to delete a comment and updates the feed.
export function deleteComment(
  id: string,
  postId: string,
  cardType?: CardTypeEnum,
  postType?: PostTypeEnum,
  isDeletedByAdmin?: boolean,
  campfirePost?: boolean,
  isAnnouncement?: boolean,
  parentId?: string,
  handleUpdatePostById?: (threadData: ThreadPost) => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      await ApiClient.getClient().mutate({
        mutation: DELETE_COMMENT_MUTATION,
        variables: {
          commentId: id,
          isDeletedByAdmin,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      if (isAnnouncement) {
        const announcement = await getAnnouncementById(postId);
        dispatch(updateFeedByAnnouncement(announcement));
      } else if (campfirePost) {
        dispatch(decreaseActivePostCount());
      } else {
        let threadData;
        if (postType === PostTypeEnum.campfire) {
          threadData = await getPostByCampfireId(postId);
        } else {
          threadData = await getPostById(postId);
        }
        if (handleUpdatePostById) {
          handleUpdatePostById(threadData as unknown as ThreadPost);
        }
        dispatch(updateForumFeedByPost(threadData));
        dispatch(decreaseActivePostCount());
      }
      emitNotification(
        'success',
        parentId === id
          ? 'Your comment has been deleted successfully!'
          : 'Your reply has been deleted successfully!',
      );
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Dispatches an action to add a new comment and updates the corresponding post feed.
export function addNewComment(
  payload:
    | {
        [x: string]: string;
        userId: string;
        message: string;
        parentId: string;
      }
    | {
        [x: string]: string | undefined;
        userId: string;
        message: string;
        parentId?: undefined;
      }
    | {
        userId: string;
        message: string;
        parentId?: string;
        campfire_post_share_id?: string;
        announcementId?: string;
        questionId?: string;
        quizId?: string;
        pollId?: string;
      },
  postId: string,
  cb: (success: boolean, commentId?: string) => void,
  isAnnouncement?: boolean,
  skipDispatchFeedByPost?: boolean,
  handleUpdatePostById?: (threadData: ThreadPost) => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        cb(false);
        dispatch(forceLogoutUser());
        return;
      }
      const commentData: any = await ApiClient.getClient().mutate({
        mutation: ADD_COMMENT_MUTATION,
        variables: payload,
        context: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
      let threadData;
      if (skipDispatchFeedByPost) {
        cb(true, commentData.data.insert_comments_one.id);
      } else {
        const campfireShareId =
          commentData?.data.insert_comments_one?.parent?.campfireShareId ||
          commentData?.data.insert_comments_one?.parent?.parent
            ?.campfireShareId;
        if (
          (
            payload as {
              [x: string]: string;
              userId: string;
              message: string;
              parentId: string;
            }
          ).campfireShareId ||
          campfireShareId
        ) {
          threadData = await getPostByCampfireId(postId);
        } else if (isAnnouncement) {
          threadData = await getAnnouncementById(postId);
        } else {
          threadData = await getPostById(postId);
          if (handleUpdatePostById) {
            handleUpdatePostById(threadData as unknown as ThreadPost);
          }
        }
        if (threadData && isAnnouncement) {
          cb(true, commentData.data.insert_comments_one.id);
          dispatch(updateFeedByAnnouncement(threadData));
          dispatch(increaseActivePostCount());
        } else if (threadData) {
          cb(true, commentData.data.insert_comments_one.id);
          dispatch(updateForumFeedByPost(threadData));
          dispatch(increaseActivePostCount());
        } else {
          cb(false);
          emitErrorNotification();
        }
      }
    } catch (error) {
      cb(false);
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Dispatches an action to hide a post or comment and updates the feed.
export function hidePost(
  postId: string,
  type: CardTypeEnum,
  commentId?: string | undefined,
  parentId?: string,
  isAnnouncement?: boolean,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      const variables = {
        [`${type}Id`]: postId,
      };
      let response;
      if (type === CardTypeEnum.comment) {
        response = await ApiClient.getClient().mutate({
          mutation: HIDE_COMMENT_MUTATION,
          variables: {
            commentId: commentId,
          },
          context: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });
      } else {
        response = await ApiClient.getClient().mutate({
          mutation: HIDE_POST_MUTATION,
          variables: variables,
          context: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });
      }
      if (response) {
        if (isAnnouncement) {
          const announcement = await getAnnouncementById(postId);
          dispatch(updateFeedByAnnouncement(announcement));
        } else {
          if (type === CardTypeEnum.comment && parentId === commentId) {
            emitNotification('success', 'Comment is hidden');
          } else if (type === CardTypeEnum.comment) {
            emitNotification('success', 'Reply is hidden');
          } else {
            emitNotification('success', 'Post is hidden');
          }
          let threadData;
          if (type === CardTypeEnum.comment) {
            threadData = await getPostById(postId);
          } else {
            threadData = await getPostById(postId, undefined, undefined, true);
          }

          dispatch(updateForumFeedByPost(threadData));
          if (type !== CardTypeEnum.comment && threadData?.id) {
            dispatch(hideRelatedPosts({ hiddenThreadId: threadData.id }));
          }
          dispatch(increaseHiddenPostCount(type));
          if (threadData) {
            const post = threadData[threadData.type];
            if (type === CardTypeEnum.comment) {
              const cmtIndex = post?.comments.findIndex(
                (cmt: CommentType) => commentId === cmt.id,
              );
              let commentData: CommentType | SubReplyType | undefined =
                post?.comments[cmtIndex ?? 0];

              if (parentId !== commentId) {
                const newComment = post?.comments.filter((cmt: CommentType) => {
                  const replies = cmt.replies.filter((reply: ReplyType) => {
                    return reply.id === parentId;
                  });
                  return replies.length > 0 ? true : false;
                });
                let idx, replyData;
                if (newComment?.length) {
                  idx = newComment[0].replies.findIndex(
                    (cmt: ReplyType) => parentId === cmt.id,
                  );
                  replyData = newComment[0].replies[idx].repliesToReplies.find(
                    (reply: SubReplyType) => commentId === reply.id,
                  );
                  commentData = replyData;
                } else {
                  idx = post?.comments.findIndex(
                    (cmt: CommentType) => parentId === cmt.id,
                  );
                  replyData = post?.comments[idx ?? 0].replies.find(
                    (reply: ReplyType) => commentId === reply.id,
                  );
                  commentData = replyData;
                }
              }
              dispatch(
                updateBookmarkedPost({
                  postId: commentId,
                  threadData: commentData,
                  type,
                  parentPostId: postId,
                }),
              );
            } else {
              dispatch(updateBookmarkedPost({ postId, threadData, type }));
            }
          }
        }
      } else {
        emitErrorNotification();
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Unhides a post or comment based on the provided parameters and updates the feed.
export function UnhidePost(
  userId: string | undefined,
  postId: string,
  type: CardTypeEnum,
  commentId?: string | undefined,
  parentId?: string,
  postShareId?: string,
  isAnnouncement?: boolean,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      const variables = {
        [`${type}Id`]: postId,
      };
      const variableComment = {
        userId,
        commentId,
      };
      let response;
      if (type === CardTypeEnum.comment) {
        response = await ApiClient.getClient().mutate({
          mutation: UNHIDE_COMMENT_MUTATION,
          variables: variableComment,
          context: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });
      } else {
        response = await ApiClient.getClient().mutate({
          mutation: UNHIDE_POST_MUTATION,
          variables: variables,
          context: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });
      }

      if (response) {
        if (isAnnouncement) {
          const announcement = await getAnnouncementById(postId);
          dispatch(updateFeedByAnnouncement(announcement));
        } else {
          if (type === CardTypeEnum.comment && parentId === commentId) {
            dispatch(removeFromCommentPostFeed(commentId));
          } else if (parentId !== commentId) {
            dispatch(removeFromReplyPostFeed(commentId));
          } else {
            dispatch(removeFromHiddenPostFeed({ id: postId, type }));
          }
          const threadData: ThreadType | null = await getPostById(
            postShareId || postId,
          );
          dispatch(updateForumFeedByPost(threadData));
          dispatch(decreaseHiddenPostCount(type));
          if (type === CardTypeEnum.comment && parentId === commentId) {
            emitNotification('success', 'Comment is unhidden');
          } else if (type === CardTypeEnum.comment) {
            emitNotification('success', 'Reply is unhidden');
          } else {
            emitNotification('success', 'Post is unhidden');
          }
          if (threadData) {
            const post = threadData[threadData.type];
            if (type === CardTypeEnum.comment) {
              const cmtIndex = post?.comments.findIndex(
                (cmt: CommentType) => commentId === cmt.id,
              );
              let commentData: CommentType | SubReplyType | undefined =
                post?.comments[cmtIndex ?? 0];
              if (parentId !== commentId) {
                const newComment = post?.comments.filter((cmt: CommentType) => {
                  const replies = cmt.replies.filter((reply: ReplyType) => {
                    return reply.id === parentId;
                  });
                  return replies.length > 0 ? true : false;
                });
                let idx, replyData;
                if (newComment?.length) {
                  idx = newComment[0].replies.findIndex(
                    (cmt: ReplyType) => parentId === cmt.id,
                  );
                  replyData = newComment[0].replies[idx].repliesToReplies.find(
                    (reply: SubReplyType) => commentId === reply.id,
                  );
                  commentData = replyData;
                } else {
                  idx = post?.comments.findIndex(
                    (cmt: CommentType) => parentId === cmt.id,
                  );
                  replyData = post?.comments[idx ?? 0].replies.find(
                    (reply: ReplyType) => commentId === reply.id,
                  );
                  commentData = replyData;
                }
              }
              dispatch(
                updateBookmarkedPost({
                  postId: commentId,
                  threadData: commentData,
                  type,
                  parentPostId: postId,
                }),
              );
            } else {
              dispatch(updateBookmarkedPost({ postId, threadData, type }));
            }
          }
        }
      } else {
        emitErrorNotification();
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Fetches the number of participants for a specific post or event type.
export async function getParticipantsNo(
  id: string | undefined,
  type: CardTypeEnum,
  currentParticipant: number,
  isAnnouncement?: boolean,
): Promise<number> {
  try {
    const token = getUserToken();
    const QUERY_MAP: Record<string, DocumentNode> = {
      question: FETCH_QUESTION_PARTICIPANTS,
      poll: FETCH_POLL_PARTICIPANTS,
      quiz: FETCH_QUIZ_PARTICIPANTS,
      comment: FETCH_COMMENT_PARTICIPANTS,
      campfireShare: FETCH_CAMPFIRESHARE_PARTICIPANTS,
      postShare: FETCH_POSTSHARE_PARTICIPANTS,
      announcement: FETCH_ANNOUNCEMENT_PARTICIPANTS,
      campfirePostShare: FETCH_CAMPFIRE_POST_SHARE_PARTICIPANTS,
    };

    const queryType = isAnnouncement ? 'announcement' : type;

    const selectedQuery = QUERY_MAP[queryType];

    if (!selectedQuery) {
      throw new Error(`Invalid type: ${queryType}`);
    }
    const response: any = await ApiClient.getClient().query({
      query: selectedQuery,
      fetchPolicy: 'no-cache',
      variables: { id, type: isAnnouncement ? 'announcement' : type },
      context: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });

    const dataType =
      type === 'quiz'
        ? `${type}_by_pk`
        : type === CardTypeEnum.postShare
          ? 'post_shares_by_pk'
          : type === CardTypeEnum.campfirePostShare
            ? 'campfire_thread_shares_by_pk'
            : isAnnouncement
              ? 'announcements_by_pk'
              : `${type}s_by_pk`;

    const noOfParticipants = response?.data?.[dataType]?.noParticipants;
    if (!noOfParticipants && noOfParticipants !== 0) {
      return currentParticipant;
    } else {
      return noOfParticipants;
    }
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
    return currentParticipant;
  }
}

// Blocks a user based on the provided user ID and optionally a campfire ID.
export function blockUser(
  userId: string,
  pathname?: string,
  campfireId?: string,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const token = getUserToken();
      const isCampfirePage = pathname ? pathname.includes('/campfire/') : null;
      if (!token) {
        dispatch(forceLogoutUser());
        return;
      }
      const variables = isCampfirePage
        ? { blockedUserId: userId, campfireId }
        : { blockedUserId: userId };

      const response = await ApiClient.getClient().mutate({
        mutation: BLOCK_USER_MUTATION,
        variables: variables,
        context: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
      if (response) {
        dispatch(blockUserSuccess(userId));
        emitNotification('success', 'User has been blocked successfully!');
      } else {
        emitErrorNotification();
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Creates or deletes hashtags for a given post or comment, handling hashtag text and deletion logic.
export async function createHashtags(
  hashtagText: string,
  postId: string,
  postType: string,
  commentId?: string,
  deleteHashtagText?: string,
) {
  try {
    const token = getUserToken();
    const generateValidHashtags = (text: string) => {
      const regex = /#\w+/g;
      const matches = text.match(regex) || [];
      const hashtags = matches.map((tag) => tag.slice(1));
      return hashtags;
    };

    const hashtagToCreate = generateValidHashtags(hashtagText);
    const variables = {
      hashtags: '[' + hashtagToCreate.join(', ') + ']',
      postId,
      postType,
      commentId,
    };
    const response = await ApiClient.getClient().mutate({
      mutation: CREATE_HASHTAG,
      variables: variables,
      context: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    if (deleteHashtagText?.toString()) {
      const originalHashtags = generateValidHashtags(deleteHashtagText);
      const hashtagsToDelete = findMissingHashtags(
        originalHashtags,
        hashtagToCreate,
      );

      const deleteHashtagVariable = {
        postId,
        hashtagNames: '[' + hashtagsToDelete.join(', ') + ']',
      };
      const deleteResponse = await ApiClient.getClient().mutate({
        mutation: DELETE_POST_HASHTAG(postType),
        variables: deleteHashtagVariable,
        context: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
      if (!deleteResponse) {
        emitErrorNotification();
      }
    }
    if (!response) {
      emitErrorNotification();
    }
  } catch (error) {
    if (isIgnorableHashtagMutationError(error)) {
      return;
    }
    emitErrorNotification(formatGraphqlError(error));
  }
}

export default fetchCategories;
