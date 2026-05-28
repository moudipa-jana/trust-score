import { createSlice } from '@reduxjs/toolkit';

export type OpenComments = {
  postId: string;
  openCommentsNumber: number;
};

interface InitialState {
  openComments: OpenComments[];
}

const initialState: InitialState = {
  openComments: [],
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    updateOpenComments: (state, action) => {
      const openCommentIndex = state.openComments.findIndex(
        (comment) => comment.postId === action.payload.postId,
      );

      if (openCommentIndex !== -1) {
        state.openComments[openCommentIndex].openCommentsNumber =
          action.payload.openCommentsNumber;
      } else {
        state.openComments.push({
          postId: action.payload.postId,
          openCommentsNumber: action.payload.openCommentsNumber,
        });
      }
    },
    resetOpenComment: (state) => {
      state.openComments = [];
    },
  },
});

export const { updateOpenComments, resetOpenComment } = commentSlice.actions;

export default commentSlice;
