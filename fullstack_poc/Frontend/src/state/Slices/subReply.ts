import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
  openSubReplies: string[];
}

const initialState: InitialState = {
  openSubReplies: [],
};

const subReplySlice = createSlice({
  name: 'subReplies',
  initialState,
  reducers: {
    updateOpenSubReplies: (state, action) => {
      const openSubRepliesIndex = state.openSubReplies.findIndex(
        (replyId) => replyId === action.payload,
      );

      if (openSubRepliesIndex === -1) {
        state.openSubReplies.push(action.payload);
      } else {
        state.openSubReplies.splice(openSubRepliesIndex, 1);
      }
    },
    updateMultipleOpenSubReplies: (state, action) => {
      const replyIdsToAdd = action.payload.filter(
        (replyId: string) => !state.openSubReplies.includes(replyId),
      );
      state.openSubReplies.push(...replyIdsToAdd);
    },
    resetOpenSubReplies: (state) => {
      state.openSubReplies = [];
    },
  },
});

export const {
  updateOpenSubReplies,
  updateMultipleOpenSubReplies,
  resetOpenSubReplies,
} = subReplySlice.actions;

export default subReplySlice;
