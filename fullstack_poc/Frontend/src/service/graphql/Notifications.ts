import { gql } from '@apollo/client';

const GET_NOTIFICATION_SUBSCRIPTION = gql`
  subscription GetNotifications {
    getNotifications(
      limit: 10
      offset: 0
      order_by: { createdAt: desc_nulls_last }
    ) {
      createdAt
      data
      id
      isSeen
      userId
    }
  }
`;

const GET_INITIAL_NOTIFICATIONS = gql`
  query getInitialNotification($limit: Int = 10, $offset: Int = 0) {
    notifications(
      limit: $limit
      offset: $offset
      order_by: { createdAt: desc_nulls_last }
    ) {
      id
      data
      createdAt
      isSeen
      isMuted
      __typename
    }
  }
`;

const GET_UNREAD_NOTIFICATIONS = gql`
  query getUnReadNotifications($limit: Int = 10, $offset: Int = 0) {
    notifications(
      where: { isSeen: { _eq: false } }
      limit: $limit
      offset: $offset
      order_by: { createdAt: desc_nulls_last }
    ) {
      isSeen
      isMuted
      data
      id
      createdAt
    }
  }
`;

const GET_REQUEST_NOTIFICATIONS = gql`
  query getRequestNotifications(
    $data1: jsonb
    $data2: jsonb
    $data3: jsonb
    $userId: uuid!
  ) {
    notifications(
      where: {
        _or: [
          { data: { _contains: $data1 } }
          { data: { _contains: $data2 } }
          { data: { _contains: $data3 } }
        ]
        userId: { _eq: $userId }
      }
      order_by: { createdAt: desc }
    ) {
      id
      data
      isSeen
      isMuted
      userId
      createdAt
    }
  }
`;

const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query getUnReadNotificationCount {
    getNotifications_aggregate: notifications_aggregate(
      where: { isSeen: { _eq: false } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation deleteNotification($notificationId: uuid!) {
    delete_notifications_by_pk(id: $notificationId) {
      id
      data
      isSeen
    }
  }
`;

const MUTE_NOTIFICATION = gql`
  mutation muteNotifcation(
    $userId: uuid!
    $mutedUserId: uuid!
    $muteStartTime: timestamptz = "now()"
    $notificationId: uuid!
  ) {
    insert_mute_preferences(
      objects: {
        userId: $userId
        notificationId: $notificationId
        mutedUserId: $mutedUserId
        muteStartTime: $muteStartTime
      }
    ) {
      affected_rows
    }
    update_notifications_by_pk(
      pk_columns: { id: $notificationId }
      _set: { isMuted: true }
    ) {
      id
    }
  }
`;

const MARK_ALL_READ_MUTATION = gql`
  mutation markAllRead {
    update_notifications(
      where: { isSeen: { _eq: false } }
      _set: { isSeen: true }
    ) {
      affected_rows
    }
  }
`;

const MARK_READ_MUTATION = gql`
  mutation markAsRead($notificationId: uuid!) {
    update_notifications_by_pk(
      pk_columns: { id: $notificationId }
      _set: { isSeen: true }
    ) {
      id
      isSeen
      data
      createdAt
    }
  }
`;

const GET_NOTIFICATION_SETTINGS_TYPES = gql`
  query notificationSettings($userId: uuid!) {
    notification_settings {
      notificationTypeId
      name
      category
      notification_type {
        user_preferences(where: { userId: { _eq: $userId } }) {
          isEnabled
          notification_type {
            type
          }
        }
      }
    }
  }
`;

const UPDATE_USER_PREFERENCES = gql`
  mutation updateUserPreference(
    $notificationId: uuid!
    $userId: uuid!
    $isEnabled: Boolean!
  ) {
    update_user_preferences(
      where: {
        notificationTypeId: { _eq: $notificationId }
        userId: { _eq: $userId }
      }
      _set: { isEnabled: $isEnabled }
    ) {
      affected_rows
    }
  }
`;

const GET_CAMPFIRE_ALERTS = gql`
  query getCampfireAlerts($userId: uuid!) {
    campfire_alerts(
      where: { userId: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
      campfireId
      campfire {
        picture
        category {
          slug
        }
        title
      }
      preference
    }
  }
`;

const UPDATE_CAMPFIRE_NOTIFICATION_PREFS = gql`
  mutation updateCampfireNotificationPrefs(
    $campfireId: uuid!
    $preference: Preference!
    $userId: uuid!
  ) {
    updateCampfireNotificationPrefs(
      campfireId: $campfireId
      preference: $preference
      userId: $userId
    ) {
      message
      success
    }
  }
`;

// eslint-disable-next-line import/prefer-default-export
export {
  DELETE_NOTIFICATION,
  GET_CAMPFIRE_ALERTS,
  GET_INITIAL_NOTIFICATIONS,
  GET_NOTIFICATION_SETTINGS_TYPES,
  GET_NOTIFICATION_SUBSCRIPTION,
  GET_REQUEST_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  GET_UNREAD_NOTIFICATIONS,
  MARK_ALL_READ_MUTATION,
  MARK_READ_MUTATION,
  MUTE_NOTIFICATION,
  UPDATE_CAMPFIRE_NOTIFICATION_PREFS,
  UPDATE_USER_PREFERENCES,
};
