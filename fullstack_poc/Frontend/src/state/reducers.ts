import { combineReducers } from 'redux';

import authSlice from '@/state/Slices/auth';
import campfireSlice from '@/state/Slices/campfire';
import commentSlice from '@/state/Slices/comments';
import dialogSlice from '@/state/Slices/dialog';
import home from '@/state/Slices/home';
import necessarySlice from '@/state/Slices/necessary';
import notificationSlice from '@/state/Slices/notification';
import profileSlice from '@/state/Slices/profile';
import subReply from '@/state/Slices/subReply';

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  dialog: dialogSlice.reducer,
  necessary: necessarySlice.reducer,
  profile: profileSlice.reducer,
  campfire: campfireSlice.reducer,
  notification: notificationSlice.reducer,
  comments: commentSlice.reducer,
  subReplies: subReply.reducer,
  home: home.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
