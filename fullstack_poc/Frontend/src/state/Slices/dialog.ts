import { createSlice } from '@reduxjs/toolkit';

import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import { RootState } from '@/state/reducers';
import {
  Asynclogin,
  loginSuccess,
  logout,
  socialAuthSuccess,
} from '@/state/Slices/auth';
import { PostTypeEnum } from '@/types/enums';
import { ThreadType } from '@/types/forum';

export type editpostType = {
  editPostDialogOpen: boolean;
  editDialogPost: ThreadType | null;
  replyCommentId: string;
  parentCommentId: string;
  postId: string;
  title: string;
  campfireId?: string;
  description: string;
  categoryId: string | null;
  isCampfirePost: boolean;
  isAnnouncement?: boolean;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  media_link?: string | null;
};

interface InitialState {
  loginDialogOpen: boolean;
  forgotPasswordDialogOpen: boolean;
  signupDialogOpen: boolean;
  isSocialOnboarding: boolean;
  deleteAccountDialogOpen: boolean;
  accountActionType: 'delete' | 'deactivate' | null;
  updateDialogOpen: boolean;
  searchSocialDialogOpen: boolean;
  searchCampfireDialog: boolean;
  currentCampfireId: string | null;
  askQuestionDialogOpen: boolean;
  askQuestionPollDialogOpen: boolean;
  createQuizDialogOpen: boolean;
  startPollDialogOpen: boolean;
  sharablePostId: string | undefined | null;
  sharePostDialogOpen: boolean;
  updateAvatarDialog: boolean;
  editPostData: editpostType | null;
  campfireName: string | undefined | null;
  threadId: string | undefined | null;
  postShareData: {
    categoryId: string | undefined | null;
    postId: string | undefined | null;
    type: undefined | PostTypeEnum;
  };
  isCampfirePage: boolean;
}

const initialState: InitialState = {
  loginDialogOpen: false,
  forgotPasswordDialogOpen: false,
  signupDialogOpen: false,
  isSocialOnboarding: false,
  deleteAccountDialogOpen: false,
  accountActionType: null,
  updateDialogOpen: false,
  searchSocialDialogOpen: false,
  searchCampfireDialog: false,
  currentCampfireId: null,
  askQuestionDialogOpen: false,
  askQuestionPollDialogOpen: false,
  createQuizDialogOpen: false,
  startPollDialogOpen: false,
  sharePostDialogOpen: false,
  updateAvatarDialog: false,
  sharablePostId: undefined,
  campfireName: undefined,
  threadId: undefined,
  postShareData: {
    categoryId: undefined,
    postId: undefined,
    type: undefined,
  },
  editPostData: {
    editPostDialogOpen: false,
    editDialogPost: null,
    replyCommentId: '',
    parentCommentId: '',
    postId: '',
    title: '',
    description: '',
    categoryId: '',
    isCampfirePost: false,
    media_link: null,
  },
  isCampfirePage: false,
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    toggleLoginDialog: (state, action) => {
      state.signupDialogOpen = false;
      state.loginDialogOpen = action.payload;
    },
    toggleSignupDialog: (state, action) => {
      state.loginDialogOpen = false;
      if (typeof action.payload === 'object') {
        state.signupDialogOpen = action.payload.open;
        state.isSocialOnboarding = action.payload.isSocial || false;
      } else {
        state.signupDialogOpen = action.payload;
        state.isSocialOnboarding = false;
      }
    },

    toggleForgotPasswordDialog: (state, action) => {
      state.forgotPasswordDialogOpen = action.payload;
    },

    toggleDeleteAccountDialog: (state, action) => {
      if (typeof action.payload === 'object') {
        state.deleteAccountDialogOpen = action.payload.open;
        state.accountActionType = action.payload.actionType;
      } else {
        state.deleteAccountDialogOpen = action.payload;
        state.accountActionType = null;
      }
    },

    toggleUpdateProfileDialog: (state, action) => {
      state.updateDialogOpen = action.payload;
    },
    toggleSearchSocialDialog: (state, action) => {
      state.searchSocialDialogOpen = action.payload;
    },
    toggleSearchCampfireDialog: (state, action) => {
      state.searchCampfireDialog = action.payload;
    },
    setCurrentSearchCampfireId: (state, action) => {
      state.currentCampfireId = action.payload;
    },
    toggleAskQuestionDialog: (state, action) => {
      state.askQuestionDialogOpen = action.payload;
    },
    toggleAskQuestionPollDialog: (state, action) => {
      state.askQuestionPollDialogOpen = action.payload;
    },
    toggleCampfirePage: (state, action) => {
      state.isCampfirePage = action.payload;
    },
    toggleCreateQuizDialog: (state, action) => {
      state.createQuizDialogOpen = action.payload;
    },
    toggleStartPollDialog: (state, action) => {
      state.startPollDialogOpen = action.payload;
    },
    toggleShareDialog: (state, action) => {
      state.sharePostDialogOpen = action.payload.open;
      state.sharablePostId = action.payload.postId;
      state.campfireName = action.payload.campfireName;
      state.threadId = action.payload.threadId;
      state.postShareData = action.payload.postShareData;
    },
    toggleEditQuestionDialog: (state, action) => {
      state.editPostData = action.payload;
    },
    toggleUpdateAvatarDialog: (state, action) => {
      state.updateAvatarDialog = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
    builder.addCase(loginSuccess, (state) => {
      state.loginDialogOpen = false;
      state.signupDialogOpen = false;
    });
    builder.addCase(socialAuthSuccess, (state) => {
      state.loginDialogOpen = false;
      state.signupDialogOpen = false;
    });
    builder.addCase(Asynclogin.fulfilled, (state) => {
      state.loginDialogOpen = false;
      state.signupDialogOpen = false;
    });
  },
});

export const getEditPostData = (state: RootState) => state.dialog.editPostData;
export const getCampfirePage = (state: RootState) =>
  state.dialog.isCampfirePage;

export const {
  toggleLoginDialog,
  toggleForgotPasswordDialog,
  toggleSignupDialog,
  toggleUpdateProfileDialog,
  toggleSearchSocialDialog,
  toggleSearchCampfireDialog,
  setCurrentSearchCampfireId,
  toggleAskQuestionDialog,
  toggleCampfirePage,
  toggleDeleteAccountDialog,
  toggleCreateQuizDialog,
  toggleStartPollDialog,
  toggleShareDialog,
  toggleEditQuestionDialog,
  toggleUpdateAvatarDialog,
  toggleAskQuestionPollDialog
} = dialogSlice.actions;

export default dialogSlice;
