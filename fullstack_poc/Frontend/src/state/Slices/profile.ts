import { createSlice } from '@reduxjs/toolkit';

import { ArchivedPost } from '@/components/pages/Profile/ProfileArchive';
import { BookmarkPost } from '@/components/pages/Profile/ProfileBookmark';
import { RootState } from '@/state/reducers';
import { logout } from '@/state/Slices/auth';
import { UserProfile } from '@/types/authentication';
import { CardTypeEnum } from '@/types/enums';
import { CommentType, ThreadType } from '@/types/forum';

interface InitialState {
  hiddenPostFeed: ThreadType[];
  hiddenCommentFeed: CommentType[];
  hiddenReplyFeed: CommentType[];
  archivePosts: ArchivedPost[];
  bookmarkPosts: BookmarkPost[];
  bookmarkPostsCount: number;
  bookmarkBlogCount: number;
  archivePostsCount: number;
  hiddenPostCount: number;
  hiddenCommentCount: number;
  hiddenReplyCount: number;
  isSubscribedNewsletter: boolean;
  isGuestUserBlocked: boolean;
  guestProfileData: UserProfile | null;
}

const initialState: InitialState = {
  hiddenPostFeed: [],
  hiddenCommentFeed: [],
  hiddenReplyFeed: [],
  archivePosts: [],
  bookmarkPosts: [],
  bookmarkPostsCount: 0,
  bookmarkBlogCount: 0,
  archivePostsCount: 0,
  hiddenPostCount: 0,
  hiddenCommentCount: 0,
  hiddenReplyCount: 0,
  isSubscribedNewsletter: false,
  isGuestUserBlocked: false,
  guestProfileData: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchHiddenPostFeedSuccess: (state, action) => {
      state.hiddenPostFeed = action.payload;
    },
    fetchHiddenCommentFeedSuccess: (state, action) => {
      state.hiddenCommentFeed = action.payload;
    },
    fetchHiddenReplyFeedSuccess: (state, action) => {
      state.hiddenReplyFeed = action.payload;
    },
    fetchHiddenPostById: (state, action) => {
      state.hiddenReplyFeed = action.payload;
    },
    fetchHiddenPostCount: (state, action) => {
      state.hiddenPostCount = action.payload;
    },
    fetchHiddenCommentCount: (state, action) => {
      state.hiddenCommentCount = action.payload;
    },
    fetchHiddenReplyCount: (state, action) => {
      state.hiddenReplyCount = action.payload;
    },
    fetchGuestUserProfile: (state, action) => {
      state.guestProfileData = action.payload;
    },
    setBlogBookmarCount: (state, action) => {
      state.bookmarkBlogCount = action.payload;
    },
    setGuestUserBlockedStatus: (state, action) => {
      state.isGuestUserBlocked = action.payload;
    },
    setNewsletterSubscribed: (state, action) => {
      state.isSubscribedNewsletter = action.payload;
    },
    guestFollowUserSuccess: (state, action) => {
      if (state.guestProfileData)
        state.guestProfileData.followersCount = action.payload;
    },
    guestUnfollowUserSuccess: (state, action) => {
      if (state.guestProfileData)
        state.guestProfileData.followersCount = action.payload;
    },
    removeFromHiddenPostFeed: (state, action) => {
      const feedData = state.hiddenPostFeed?.filter((data) => {
        if (action.payload.type === 'question') {
          return data.question?.id !== action.payload.id;
        } else if (action.payload.type === 'quiz') {
          return data.quiz?.id !== action.payload.id;
        } else if (action.payload.type === 'poll') {
          return data.poll?.id !== action.payload.id;
        } else if (action.payload.type === 'postShare') {
          return data.postShare?.id !== action.payload.id;
        } else return true;
      });

      if (state.hiddenPostFeed) {
        state.hiddenPostFeed = feedData;
        state.hiddenPostCount -= 1;
      }
    },
    removeFromCommentPostFeed: (state, action) => {
      const feedData = state.hiddenCommentFeed?.filter(
        (data) => data.id !== action.payload,
      );
      if (state.hiddenCommentFeed) {
        state.hiddenCommentFeed = feedData;
        state.hiddenCommentCount -= 1;
      }
    },
    removeFromReplyPostFeed: (state, action) => {
      if (state.hiddenReplyFeed) {
        const feedData = state.hiddenReplyFeed?.filter(
          (data) => data.id !== action.payload,
        );
        state.hiddenReplyFeed = feedData;
        state.hiddenReplyCount -= 1;
      }
    },
    getArchiveData: (state, action) => {
      const {
        response,
        networkStatus = 1,
        isSortApplied = false,
      } = action.payload;
      if (networkStatus !== 1) {
        if (isSortApplied) state.archivePosts = response?.archivedPosts;
        else {
          state.archivePosts = [
            ...state.archivePosts,
            ...response.archivedPosts,
          ].filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.id === value.id),
          );
        }
      } else {
        state.archivePosts = response?.archivedPosts || [];
      }
              state.archivePosts = response?.archivedPosts || [];

      state.archivePostsCount = response.totalArchives.aggregate.count;
    },
    unarchiveSuccess: (state, action) => {
      state.archivePosts = [...state.archivePosts].filter(
        (data) => data.id !== action.payload,
      );
      state.archivePostsCount -= 1;
    },
    getBookmarkData: (state, action) => {
      const {
        response,
        networkStatus = 1,
        isSortApplied = false,
      } = action.payload;
      if (networkStatus !== 1) {
        if (isSortApplied) state.bookmarkPosts = response?.bookmarks;
        else {
          state.bookmarkPosts = [
            ...state.bookmarkPosts,
            ...response.bookmarks,
          ].filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.id === value.id),
          );
        }
      } else {
        state.bookmarkPosts = response?.bookmarks || [];
      }
      state.bookmarkPostsCount = response.totalBookmarks.aggregate.count;
    },
    bookmarkSuccess: (state, action) => {
      state.bookmarkPosts.push(action.payload.insert_bookmarks_one);
      state.bookmarkPostsCount += 1;
    },
    unbookmarkProfileSuccess: (state, action) => {
      const keyValue = Object.keys(action.payload)[0];
      const trimKeyValue = keyValue.substring(0, keyValue.length - 2);
      state.bookmarkPosts = [...state.bookmarkPosts].filter((data) => {
        return (
          data[trimKeyValue as CardTypeEnum.poll]?.id !==
          action.payload[keyValue]
        );
      });
      state.bookmarkPostsCount -= 1;
    },
    updateBookmarkedPost: (state, action) => {
      const threadIndex = state.bookmarkPosts.findIndex((post) => {
        if (action.payload.type === 'question') {
          return post.question?.id === action.payload.postId;
        }
        if (action.payload.type === 'quiz') {
          return post.quiz?.id === action.payload.postId;
        }
        if (action.payload.type === 'poll') {
          return post.poll?.id === action.payload.postId;
        }
        if (action.payload.type === 'postShare') {
          return post.postShare?.id === action.payload.postId;
        }
        if (action.payload.type === 'comment') {
          return post.comment?.id === action.payload.postId;
        }
        return true;
      });
      if (threadIndex !== -1) {
        if (action.payload.type === 'comment') {
          state.bookmarkPosts[threadIndex] = {
            ...state.bookmarkPosts[threadIndex],
            comment: {
              ...action.payload.threadData,
              postId: action.payload?.parentPostId,
            },
          };
        } else {
          let postData;
          if (
            action.payload.threadData.question &&
            action.payload.threadData.question.comments
          ) {
            const question = {
              ...action.payload.threadData.question,
              comments: [],
            };
            postData = { ...action.payload.threadData, question };
          } else {
            postData = action.payload.threadData;
          }
          state.bookmarkPosts[threadIndex] = postData;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const getHiddenPostFeed = (state: RootState) =>
  state.profile.hiddenPostFeed;
export const getHiddenCommentFeed = (state: RootState) =>
  state.profile.hiddenCommentFeed;
export const getHiddenReplyFeed = (state: RootState) =>
  state.profile.hiddenReplyFeed;
export const getHiddenPost = (state: RootState) =>
  state.profile.hiddenReplyFeed;
export const getArchivedData = (state: RootState) => state.profile.archivePosts;
export const getBookmarkedData = (state: RootState) =>
  state.profile.bookmarkPosts;
export const getHiddenPostCount = (state: RootState) =>
  state.profile.hiddenPostCount;
export const getHiddenCommentCount = (state: RootState) =>
  state.profile.hiddenCommentCount;
export const getHiddenReplyCount = (state: RootState) =>
  state.profile.hiddenReplyCount;
export const getNewsletterSubscribed = (state: RootState) =>
  state.profile.isSubscribedNewsletter;
export const getGuestUserBlockedStatus = (state: RootState) =>
  state.profile.isGuestUserBlocked;
export const getGuestUserProfile = (state: RootState) =>
  state.profile.guestProfileData;
export const {
  fetchHiddenPostFeedSuccess,
  fetchHiddenCommentFeedSuccess,
  removeFromHiddenPostFeed,
  removeFromCommentPostFeed,
  fetchHiddenReplyFeedSuccess,
  fetchGuestUserProfile,
  removeFromReplyPostFeed,
  getArchiveData,
  unarchiveSuccess,
  getBookmarkData,
  bookmarkSuccess,
  unbookmarkProfileSuccess,
  fetchHiddenPostCount,
  fetchHiddenCommentCount,
  fetchHiddenReplyCount,
  updateBookmarkedPost,
  setBlogBookmarCount,
  guestFollowUserSuccess,
  guestUnfollowUserSuccess,
  setGuestUserBlockedStatus,
  setNewsletterSubscribed,
} = profileSlice.actions;

export default profileSlice;
