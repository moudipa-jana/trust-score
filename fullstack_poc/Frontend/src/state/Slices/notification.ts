import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/state/reducers';
import { notification } from '@/types/authentication';

interface InitialState {
  notifications: notification[] | null;
  unreadNotifications: notification[] | null;
  requestNotifications: notification[] | null;
  deleteNotification: number;
  notifiactionMarked: number;
}

const initialState: InitialState = {
  notifications: null,
  unreadNotifications: null,
  requestNotifications: null,
  deleteNotification: 0,
  notifiactionMarked: 0,
};

const preprocessNotifications = (
  notifications: notification[] | null,
): notification[] | null => {
  if (!notifications) return null;
  return notifications.map((notif) => {
    const typesToFix = [
      'reactionOnPost',
      'commentOnPost',
      'replyOnComment',
      'postShared',
    ];
    if (
      typesToFix.includes(notif.data.type) &&
      notif.data.text.trim().endsWith(' on')
    ) {
      // Ensure there is a space after 'on' before appending
      const baseText = notif.data.text.trim();
      return {
        ...notif,
        data: {
          ...notif.data,
          text: `${baseText} your shared post`,
        },
      };
    }
    return notif;
  });
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    notificationFetchSuccess: (state, action) => {
      state.notifications = preprocessNotifications(action.payload);
    },
    updateAllNotification: (state, action) => {
      state.notifications = preprocessNotifications(action.payload);
    },
    updateUnreadNotification: (state, action) => {
      state.unreadNotifications = preprocessNotifications(action.payload);
    },
    updateRequestNotification: (state, action) => {
      state.requestNotifications = preprocessNotifications(action.payload);
    },
    deleteNotificationItem: (state, action) => {
      if (state.notifications) {
        state.notifications = state.notifications?.filter(
          (item) => item.id !== action.payload,
        );
      }
    },
    deleteUnreadNotificationItem: (state, action) => {
      if (state.unreadNotifications) {
        state.unreadNotifications = state.unreadNotifications?.filter(
          (item) => item.id !== action.payload,
        );
      }
    },
    deleteRequestNotificationItem: (state, action) => {
      if (state.requestNotifications) {
        state.requestNotifications = state.requestNotifications?.filter(
          (item) => item.id !== action.payload,
        );
      }
    },
    markAllread: (state) => {
      state.notifiactionMarked = 0;
    },
    setUnreadMarkCount: (state, action) => {
      state.notifiactionMarked = action.payload;
    },
    markReadNotification: (state) => {
      if (state.notifiactionMarked > 0) state.notifiactionMarked -= 1;
    },
    removeNotificationOnLogout: (state) => {
      state.notifications = null;
      state.unreadNotifications = null;
      state.requestNotifications = null;
      state.deleteNotification = 0;
      state.notifiactionMarked = 0;
    },
    appendNotificationsSuccess: (state, action) => {
      state.notifications = [
        ...(state.notifications || []),
        ...(preprocessNotifications(action.payload) || []),
      ];
    },
  },
});

export const {
  setUnreadMarkCount,
  notificationFetchSuccess,
  updateAllNotification,
  updateUnreadNotification,
  updateRequestNotification,
  deleteNotificationItem,
  deleteUnreadNotificationItem,
  deleteRequestNotificationItem,
  markAllread,
  markReadNotification,
  removeNotificationOnLogout,
  appendNotificationsSuccess,
} = notificationSlice.actions;
export const getNotifications = (state: RootState) =>
  state.notification.notifications;

export const getUnreadNotifications = (state: RootState) =>
  state.notification.unreadNotifications;

export const getRequestNotifications = (state: RootState) =>
  state.notification.requestNotifications;

export const getNotificationsLength = (state: RootState) =>
  state.notification.notifiactionMarked;

export default notificationSlice;
