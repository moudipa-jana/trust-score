import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/state/reducers';
import { logout } from '@/state/Slices/auth';
import { PostTypeEnum } from '@/types/enums';
import { CategoryFeedType, ThreadType } from '@/types/forum';
import { TopCategories } from '@/types/topCategories';

interface NestedObject {
  [key: string]: string | number | boolean | NestedObject;
}
interface InitialState {
  categories: {
    id: string;
    title: string;
    about: string;
  }[];
  loading: boolean;
  topCategories: TopCategories[];
  forumFeed: CategoryFeedType | null;
  forumFeedLoading: boolean;
  forumFeedArchive: {
    [key: string]: string | number | boolean | NestedObject;
  }[];
  threads: ThreadType[];
}

const initialState: InitialState = {
  categories: [],
  loading: false,
  topCategories: [],
  forumFeed: null,
  forumFeedLoading: true,
  forumFeedArchive: [],
  threads: [],
};

const necessarySlice = createSlice({
  name: 'necessary',
  initialState,
  reducers: {
    categoryFetchSuccess: (state, action) => {
      state.categories = action.payload.categories;
      state.loading = false;
    },
    topCategoryFetchSuccess: (state, action) => {
      state.topCategories = action.payload.topCategories;
      state.loading = false;
    },
    toggleForumFeedLoader: (state, action) => {
      state.forumFeedLoading = action.payload;
    },
    fetchForumFeedSuccess: (state, action) => {
      state.forumFeed = action.payload.forumFeed;
      state.forumFeedLoading = false;
      state.threads = action.payload.forumFeed;
      if (action.payload.forumFeed?.threads) {
        state.threads = action.payload.forumFeed.threads;
      }
    },
    fetchPostPageSuccess: (state, action) => {
      state.threads = [action.payload];
    },
    fetchMoreForumFeed: (state, action) => {
      state.threads.push(...action.payload);
    },
    forumPostSuccess: (state, action) => {
      state.threads.unshift(action.payload);
    },

    resetCategoryThreads: (state) => {
      state.threads = [];
    },
    updateForumFeedByPost: (state, action) => {
      const threadIndex = state.threads.findIndex(
        (post) => post.id === action?.payload?.id,
      );
      if (threadIndex !== -1) {
        state.threads[threadIndex] = action.payload;
      }
    },
    forumPostDeletionSuccess: (state, action) => {
      const posts = state.threads.filter((data) => data.id !== action.payload);
      state.threads = posts;
    },

    forumPostArchiveSuccess: (state, action) => {
      const feedData = state.threads.filter(
        (data) => data.id !== action.payload?.id,
      );
      if (state.threads) {
        state.threads = feedData;
      }
    },

    // Removes all threads from the feed that share the same original content
    // (question/poll/quiz) as the hidden post. This ensures hiding an original
    // post also hides its shared versions, and vice versa.
    hideRelatedPosts: (state, action) => {
      const { hiddenThreadId } = action.payload;

      // Find the hidden thread to extract its original content ID
      const hiddenThread = state.threads.find((t) => t.id === hiddenThreadId);
      if (!hiddenThread) return;

      // Extract the original content ID from the hidden thread
      let originalQuestionId: string | undefined;
      let originalPollId: string | undefined;
      let originalQuizId: string | undefined;

      if (hiddenThread.type === 'postShare' && hiddenThread.postShare) {
        // Shared post - get original content ID from nested object
        originalQuestionId = (hiddenThread.postShare as any)?.question?.id;
        originalPollId = (hiddenThread.postShare as any)?.poll?.id;
        originalQuizId = (hiddenThread.postShare as any)?.quiz?.id;
      } else {
        // Original post - get content ID directly
        originalQuestionId = hiddenThread.question?.id;
        originalPollId = hiddenThread.poll?.id;
        originalQuizId = hiddenThread.quiz?.id;
      }

      // If no original content ID found, nothing else to hide
      if (!originalQuestionId && !originalPollId && !originalQuizId) return;

      // Filter out all related threads (but keep the already-hidden one as it
      // was already updated by updateForumFeedByPost with isHidden=true)
      state.threads = state.threads.filter((thread) => {
        if (thread.id === hiddenThreadId) return true; // keep the one we just hid

        // Check if this thread references the same original content
        if (thread.type === 'postShare' && thread.postShare) {
          const ps = thread.postShare as any;
          if (originalQuestionId && ps?.question?.id === originalQuestionId) return false;
          if (originalPollId && ps?.poll?.id === originalPollId) return false;
          if (originalQuizId && ps?.quiz?.id === originalQuizId) return false;
        } else {
          if (originalQuestionId && thread.question?.id === originalQuestionId) return false;
          if (originalPollId && thread.poll?.id === originalPollId) return false;
          if (originalQuizId && thread.quiz?.id === originalQuizId) return false;
        }

        return true;
      });
    },

    postVoteSuccess: (state, action) => {
      const { id, type, data } = action.payload;
      const threadIndex = state.threads.findIndex((post) => post.id === id);
      const modifiedThread = state.threads[threadIndex];
      modifiedThread[type as PostTypeEnum] = Object.assign(
        modifiedThread[type as PostTypeEnum] as unknown as ThreadType,
        data,
      );
      state.threads[threadIndex] = modifiedThread;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.loading = false;
      // state.forumFeed = null; // * Uncomment this to clear the feed on logut while testing
    });
  },
});

export const getCategories = (state: RootState) => state.necessary.categories;

export const getTopCategories = (state: RootState) =>
  state.necessary.topCategories;
export const getForumFeed = (state: RootState) => state.necessary.forumFeed;
export const getForumFeedthread = (state: RootState) => state.necessary.threads;
export const {
  categoryFetchSuccess,
  fetchForumFeedSuccess,
  forumPostDeletionSuccess,
  forumPostSuccess,
  resetCategoryThreads,
  toggleForumFeedLoader,
  topCategoryFetchSuccess,
  updateForumFeedByPost,
  postVoteSuccess,
  forumPostArchiveSuccess,
  fetchMoreForumFeed,
  fetchPostPageSuccess,
  hideRelatedPosts,
} = necessarySlice.actions;

export default necessarySlice;
