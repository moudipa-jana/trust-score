/**
 * NotificationDropdownCard component displays and manages user notifications.
 * - Fetches and filters notifications (All, Unread, Requests).
 * - Supports infinite scrolling and real-time updates via subscription.
 * - Includes options to mark all as read and adjust notification settings.
 * - Uses Redux hooks for state management and custom hooks for API interactions.
 */

import { useLazyQuery, useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import HorizontalEpsilon from '/public/images/HorizontalEpsilon.svg';
import MarkRead from '/public/images/MarkRead.svg';
import NotificationSetting from '/public/images/NotificationSetting.svg';
import NotificationCard from '@/components/layout/Header/Notifiction/NotificationCard';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { FEED_ANNOUNCEMENTS_QUERY } from '@/service/graphql/Forum';
import {
  GET_INITIAL_NOTIFICATIONS,
  GET_REQUEST_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  GET_UNREAD_NOTIFICATIONS,
  MARK_ALL_READ_MUTATION,
} from '@/service/graphql/Notifications';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  appendNotificationsSuccess, // <-- import this
  getNotifications,
  getNotificationsLength,
  getRequestNotifications,
  getUnreadNotifications,
  notificationFetchSuccess,
  setUnreadMarkCount,
  updateRequestNotification,
  updateUnreadNotification,
} from '@/state/Slices/notification';
import { notification } from '@/types/authentication';

interface NotificationResponse {
  notifications: notification[];
  getNotifications_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

function NotificationDropdownCard() {
  const router = useRouter();
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const notifications = useAppSelector(getNotifications);
  const unreadNotifications = useAppSelector(getUnreadNotifications);
  const requestNotifications = useAppSelector(getRequestNotifications);
  const dispatch = useAppDispatch();

  // Fetch campfire announcements for campfires the user is a member/admin of
  const { data: announcementsData } = useQuery(FEED_ANNOUNCEMENTS_QUERY, {
    context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    fetchPolicy: 'no-cache',
    skip: !token,
  });

  // Helper to get/set seen announcement IDs from localStorage
  const getSeenAnnouncementIds = React.useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem('seenAnnouncementIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  const [announcementRenderTrigger, setAnnouncementRenderTrigger] = useState(0);

  const markAnnouncementSeen = React.useCallback(
    (announcementId: string) => {
      const seen = getSeenAnnouncementIds();
      const rawId = announcementId.replace('announcement-', '');
      seen.add(rawId);
      localStorage.setItem(
        'seenAnnouncementIds',
        JSON.stringify(Array.from(seen)),
      );
      setAnnouncementRenderTrigger((prev) => prev + 1);
    },
    [getSeenAnnouncementIds],
  );

  // Transform announcements into notification-compatible objects with read tracking
  const announcementNotifications: notification[] = React.useMemo(() => {
    const announcements = (announcementsData as any)?.announcements;
    if (!announcements) return [];
    const seenIds = getSeenAnnouncementIds();
    return announcements
      .filter((a: any) => a.campfire?.id) // only campfire announcements
      .map((announcement: any) => ({
        id: `announcement-${announcement.id}`,
        data: {
          text: `📢 New announcement in ${announcement.campfire?.title || 'a campfire'}: ${announcement.title}`,
          type: 'campfireAnnouncement',
          redirect: `campfire/${announcement.campfire?.title}`,
          isDisabled: false,
          profilePicture:
            announcement.user?.profilePicture || 'images/userImage.svg',
          data: {
            campfireId: announcement.campfire?.id,
          },
        },
        createdAt: announcement.createdAt || announcement.scheduled_at,
        isSeen: seenIds.has(announcement.id),
        isMuted: undefined,
      }));
  }, [announcementsData, getSeenAnnouncementIds, announcementRenderTrigger]);

  // Count unseen announcements
  const unseenAnnouncementCount = React.useMemo(() => {
    return announcementNotifications.filter((a) => !a.isSeen).length;
  }, [announcementNotifications]);

  // Merge regular notifications with announcement notifications, sorted by createdAt
  const mergedNotifications = React.useMemo(() => {
    if (!notifications && !announcementNotifications.length)
      return notifications;
    const combined = [...(notifications || []), ...announcementNotifications];
    return combined.sort((a, b) => {
      const timeA = a.createdAt ? appDayjs(a.createdAt).valueOf() : 0;
      const timeB = b.createdAt ? appDayjs(b.createdAt).valueOf() : 0;
      return timeB - timeA;
    });
  }, [notifications, announcementNotifications]);
  const notificationHolderRef = useRef(null);
  const notificationsLength = useAppSelector(getNotificationsLength);
  const lastOffset = useRef(0); // <-- add this

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => setShowOptions(!showOptions);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [isRefetchNotification, setRefetchNotification] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [fetchUnreadNotificationCount, { data: unreadCountData }] =
    useLazyQuery<NotificationResponse>(GET_UNREAD_NOTIFICATION_COUNT, {
      fetchPolicy: 'no-cache',
    });

  // Calculate total unread count (DB unread + unseen announcements) and update Redux
  useEffect(() => {
    let baseCount = 0;
    if (unreadCountData) {
      baseCount =
        (unreadCountData as any)?.getNotifications_aggregate?.aggregate
          ?.count || 0;
    }
    dispatch(setUnreadMarkCount(baseCount + unseenAnnouncementCount));
  }, [unreadCountData, unseenAnnouncementCount, dispatch]);

  const [
    fetchAllNotificationList,
    { error: initialError, data: allNotificationsData },
  ] = useLazyQuery<NotificationResponse>(GET_INITIAL_NOTIFICATIONS, {
    fetchPolicy: 'no-cache',
  });

  const [
    fetchUnreadNotificationList,
    { error: initialUnreadError, data: unreadNotificationsData },
  ] = useLazyQuery<NotificationResponse>(GET_UNREAD_NOTIFICATIONS, {
    fetchPolicy: 'no-cache',
  });

  const [
    fetchRequestNotificationList,
    { error: initialRequestError, data: requestNotificationsData },
  ] = useLazyQuery<NotificationResponse>(GET_REQUEST_NOTIFICATIONS, {
    fetchPolicy: 'no-cache',
  });

  const { mutationFunction: markAllRead } = useAuthMutation(
    MARK_ALL_READ_MUTATION,
    () => {
      emitNotification('success', 'Marked all as read successfully');
    },
  );

  // Handle all notifications response
  useEffect(() => {
    if (allNotificationsData) {
      const newNotifications = (allNotificationsData as any)?.notifications;
      if (lastOffset.current === 0) {
        dispatch(notificationFetchSuccess(newNotifications));
      } else {
        dispatch(appendNotificationsSuccess(newNotifications));
      }
      fetchUnreadNotificationCount();
    }
  }, [allNotificationsData, dispatch]);

  // Handle unread notifications response
  useEffect(() => {
    if (unreadNotificationsData) {
      const newNotifications = (unreadNotificationsData as any)?.notifications;
      dispatch(updateUnreadNotification(newNotifications));
      fetchUnreadNotificationCount();
    }
  }, [unreadNotificationsData, dispatch]);

  // Handle request notifications response
  useEffect(() => {
    if (requestNotificationsData) {
      const newNotifications = (requestNotificationsData as any)?.notifications;
      dispatch(updateRequestNotification(newNotifications));
    }
  }, [requestNotificationsData, dispatch]);

  // Handle errors
  useEffect(() => {
    if (initialError) {
      emitErrorNotification(formatGraphqlError(initialError));
    }
  }, [initialError]);

  useEffect(() => {
    if (initialUnreadError) {
      emitErrorNotification(formatGraphqlError(initialUnreadError));
    }
  }, [initialUnreadError]);

  useEffect(() => {
    if (initialRequestError) {
      emitErrorNotification(formatGraphqlError(initialRequestError));
    }
  }, [initialRequestError]);

  const fetchAllNotifications = React.useCallback(
    (offset = 0) => {
      lastOffset.current = offset;
      fetchAllNotificationList({
        variables: {
          limit: 10,
          offset,
        },
        context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      });
      return undefined;
    },
    [fetchAllNotificationList, token],
  );

  const fetchUnreadNotification = React.useCallback(
    (offset = 0) => {
      fetchUnreadNotificationList({
        variables: {
          limit: 10,
          offset,
        },
        context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      });
    },
    [fetchUnreadNotificationList, token],
  );

  function fetchRequestNotifications() {
    fetchRequestNotificationList({
      variables: {
        userId,
        data1: { type: 'postReported' },
        data2: { type: 'campfireAdminRequest' },
        data3: { type: 'campfireUserRequest' },
      },
      context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    });
    return null;
  }

  useEffect(() => {
    fetchAllNotifications();
    fetchUnreadNotification();
  }, [fetchAllNotifications, fetchUnreadNotification]);

  useEffect(() => {
    const notificationHolderElement: HTMLElement | null =
      notificationHolderRef.current;

    function handleScroll() {
      if (
        (notificationHolderElement as HTMLElement).scrollTop +
          (notificationHolderElement as HTMLElement).clientHeight >=
          (notificationHolderElement as HTMLElement).scrollHeight - 1 &&
        selectedFilter === 'All'
      ) {
        const offset = notifications?.length;
        fetchAllNotifications(offset);
      }
    }

    (notificationHolderElement as unknown as HTMLElement).addEventListener(
      'scroll',
      handleScroll,
    );

    return () => {
      (notificationHolderElement as unknown as HTMLElement).removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, [notifications, fetchAllNotifications, selectedFilter]);

  // Marks all notifications as read if there are any notifications to mark.
  const handleMarkRead = async () => {
    if (
      (isEmpty(notifications) || notificationsLength <= 0) &&
      unseenAnnouncementCount <= 0
    )
      return;
    try {
      if (!isEmpty(notifications) && notificationsLength > 0) {
        await markAllRead({
          variables: {},
          context: token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {},
        });
      }

      if (announcementNotifications && announcementNotifications.length > 0) {
        const seen = getSeenAnnouncementIds();
        announcementNotifications.forEach((a) => {
          const rawId = a.id.replace('announcement-', '');
          seen.add(rawId);
        });
        localStorage.setItem(
          'seenAnnouncementIds',
          JSON.stringify(Array.from(seen)),
        );
        setAnnouncementRenderTrigger((prev) => prev + 1);
      }

      dispatch(setUnreadMarkCount(0));
      refetchAllNotifications();
      setShowOptions(false);
    } catch (error: any) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };

  // Fetches all notifications when the "All" filter is selected.
  const handleAllNotification = () => {
    setSelectedFilter('All');
    fetchAllNotifications();
  };

  // Fetches unread notifications when the "Unread" filter is selected.
  const handleUnreadNotification = () => {
    setSelectedFilter('Unread');
    fetchUnreadNotification();
  };

  // Fetches request notifications when the "Requests" filter is selected.
  const handleRequestsNotification = () => {
    setSelectedFilter('Requests');
    fetchRequestNotifications();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirects to the notifications page when "See All" is clicked.
  const handleSeeAllClick = () => {
    router.push('/notifications');
  };

  // Redirects to the notification settings page when clicked.
  const handleNotificationSettingsClick = () => {
    router.push('/notifications/notification-settings');
  };

  // Refetches all notifications, unread notifications, and request notifications.
  const refetchAllNotifications = () => {
    setRefetchNotification(true);
    fetchAllNotifications();
    fetchUnreadNotification();
    fetchRequestNotifications();
  };

  return (
    <div
      className="notificationDropdown absolute -top-[27px] right-20 hidden"
      ref={notificationHolderRef}
    >
      <div className="flex justify-between p-4">
        <Text size="sm" color="text-blue">
          Notifications
        </Text>
        <div>
          <div
            ref={triggerRef}
            className="relative cursor-pointer"
            onClick={toggleOptions}
          >
            <CustomImage src={HorizontalEpsilon} />
            {showOptions && (
              <div
                ref={optionsRef}
                className="absolute right-0 top-full z-10 mt-2 w-48 rounded-md bg-white shadow-lg"
              >
                <div className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100">
                  <div className="h-5 w-5">
                    <CustomImage src={MarkRead} />
                  </div>
                  <div
                    className="block w-full px-2 py-2 text-left text-skyBlue-200 "
                    onClick={handleMarkRead}
                  >
                    Mark all as read
                  </div>
                </div>
                <div className="bottom-1 mx-2 border border-gray-200" />
                <div
                  className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100"
                  onClick={handleNotificationSettingsClick}
                >
                  <div className="h-5 w-5">
                    <CustomImage src={NotificationSetting} />
                  </div>
                  <div className="block w-full px-2 py-2 text-left text-skyBlue-200 ">
                    Notification settings
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between p-2">
        <div className="flex space-x-2">
          <div
            className={`cursor-pointer px-4 py-2 ${
              selectedFilter === 'All'
                ? 'rounded-full bg-gray-300 text-gray-500'
                : 'text-skyBlue-200'
            } rounded`}
            onClick={handleAllNotification}
          >
            All
          </div>

          <div
            className={`cursor-pointer px-4 py-2 ${
              selectedFilter === 'Unread'
                ? 'rounded-full bg-gray-300 text-gray-500'
                : 'text-skyBlue-200'
            } rounded`}
            onClick={handleUnreadNotification}
          >
            Unread
          </div>

          <div
            className={`cursor-pointer px-4 py-2 ${
              selectedFilter === 'Requests'
                ? 'rounded-full bg-gray-300 text-gray-500'
                : 'text-skyBlue-200'
            } rounded`}
            onClick={handleRequestsNotification}
          >
            Requests
          </div>
        </div>

        <div
          className="cursor-pointer px-4 py-2 text-skyBlue-200"
          onClick={handleSeeAllClick}
        >
          See All
        </div>
      </div>

      <div className="notificationHolder">
        {isEmpty(
          selectedFilter === 'Unread'
            ? unreadNotifications
            : selectedFilter === 'Requests'
              ? requestNotifications
              : mergedNotifications,
        ) ||
        initialError ||
        initialUnreadError ||
        initialRequestError ? (
          <div className="flex justify-center p-4">
            <Text size="base">
              {
                <div className="layout flex flex-col items-center justify-center gap-3 text-center">
                  <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                  <p className="text-sm font-bold text-gray-500">
                    {selectedFilter === 'Unread'
                      ? 'No unread notification'
                      : selectedFilter === 'Requests'
                        ? 'No request notification'
                        : 'No notification found'}
                  </p>
                </div>
              }
            </Text>
          </div>
        ) : (
          (selectedFilter === 'Unread'
            ? unreadNotifications
            : selectedFilter === 'Requests'
              ? requestNotifications
              : mergedNotifications
          )?.map((notificationItem: notification) => {
            return (
              <div key={notificationItem.id}>
                <div className={` ${!notificationItem.read ? 'new' : ''}`}>
                  <NotificationCard
                    type={notificationItem.data.type}
                    details={notificationItem}
                    notificationId={notificationItem.id}
                    refetchAllNotifications={refetchAllNotifications}
                    markAnnouncementSeen={markAnnouncementSeen}
                  />
                </div>
                <div className="border-t border-gray-100"></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationDropdownCard;
