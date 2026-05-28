/**
 * `Notifications` handles fetching and displaying different types of notifications (All, Unread, Requests).
 * - Uses GraphQL queries and subscriptions to manage notifications.
 * - Displays notifications with options to filter by type and mark as read/unread.
 * - Handles infinite scrolling to load more notifications.
 * - Provides a link to notification settings.
 * - Uses Redux for managing notification state and fetching.
 **/

import { useLazyQuery, useQuery, useSubscription } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import NotificationSetting from '/public/images/NotificationSetting.svg';
import NotificationCard from '@/components/layout/Header/Notifiction/NotificationCard';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import { FEED_ANNOUNCEMENTS_QUERY } from '@/service/graphql/Forum';
import {
  GET_INITIAL_NOTIFICATIONS,
  GET_NOTIFICATION_SUBSCRIPTION,
  GET_REQUEST_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  GET_UNREAD_NOTIFICATIONS,
} from '@/service/graphql/Notifications';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  appendNotificationsSuccess,
  getNotifications,
  getRequestNotifications,
  getUnreadNotifications,
  notificationFetchSuccess,
  setUnreadMarkCount,
  updateRequestNotification,
  updateUnreadNotification,
} from '@/state/Slices/notification';
import { notification } from '@/types/authentication';
import type { MenuItem } from '@/types/menu';

export interface NotificationResponse {
  notifications: notification[];
  getNotifications_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

interface NotificationsProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

function Notifications({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: NotificationsProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const notifications = useAppSelector(getNotifications);
  const unreadNotifications = useAppSelector(getUnreadNotifications);
  const requestNotifications = useAppSelector(getRequestNotifications);
  const dispatch = useAppDispatch();
  const notificationHolderRef = useRef<HTMLDivElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const lastOffsetRef = useRef(0);

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

  // Handle all notifications response
  useEffect(() => {
    if (allNotificationsData) {
      const newNotifications = (allNotificationsData as any)?.notifications;
      if (lastOffsetRef.current === 0) {
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
      lastOffsetRef.current = offset;
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

  useSubscription(GET_NOTIFICATION_SUBSCRIPTION, {
    context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    fetchPolicy: 'network-only',
    onData: ({ data }) => {
      dispatch(notificationFetchSuccess((data as any)?.data.getNotifications));
      fetchUnreadNotificationCount();
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  useEffect(() => {
    fetchAllNotifications();
    fetchUnreadNotification();
  }, [fetchAllNotifications, fetchUnreadNotification]);

  useEffect(() => {
    const notificationHolderElement = notificationHolderRef.current;

    function handleScroll() {
      if (notificationHolderElement) {
        const scrollPosition = notificationHolderElement.scrollTop;
        const scrollHeight = notificationHolderElement.scrollHeight;
        const clientHeight = notificationHolderElement.clientHeight;

        if (scrollPosition + clientHeight >= scrollHeight - 1) {
          const offset = notifications?.length;
          fetchAllNotifications(offset);
        }
      }
    }

    if (notificationHolderElement) {
      notificationHolderElement.addEventListener('scroll', handleScroll);

      return () => {
        notificationHolderElement.removeEventListener('scroll', handleScroll);
      };
    }
    return undefined;
  }, [notifications, fetchAllNotifications]);

  const handleAllNotification = () => {
    setSelectedFilter('All');
    fetchAllNotifications();
  };

  const handleUnreadNotification = () => {
    setSelectedFilter('Unread');
    fetchUnreadNotification();
  };

  const handleRequestsNotification = () => {
    setSelectedFilter('Requests');
    fetchRequestNotifications();
  };

  const handleNotificationSettingsClick = () => {
    router.push('/notifications/notification-settings');
  };

  const refetchAllNotifications = () => {
    fetchAllNotifications();
    fetchUnreadNotification();
    fetchRequestNotifications();
  };

  return (
    <PageBase
      title="Notifications"
      description="View and manage your notifications"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div
        className={`mx-auto mb-10 rounded-md bg-gray-100 ${
          isMobile ? 'w-full' : 'w-3/4'
        }`}
      >
        <div className={`mx-auto ${isMobile ? 'w-11/12' : 'w-3/4'} pb-24`}>
          <div className="flex items-center justify-between py-4">
            <Text font="font-semibold" size="lg">
              Notifications
            </Text>
            <div>
              <div
                className="flex cursor-pointer flex-row items-center py-2 pl-2 hover:bg-gray-100"
                onClick={handleNotificationSettingsClick}
              >
                <div className={`${isMobile ? 'h-4 w-4' : 'h-8 w-8'}`}>
                  <CustomImage src={NotificationSetting} />
                </div>
                <div
                  className={`block w-full px-1 text-left ${
                    isMobile ? null : 'py-2'
                  }`}
                >
                  <Text color="text-skyBlue-200" size={isMobile ? 'sm' : 'md'}>
                    Notification settings
                  </Text>
                </div>
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
                <Text size="sm" font="font-semibold">
                  All
                </Text>
              </div>

              <div
                className={`cursor-pointer px-4 py-2 ${
                  selectedFilter === 'Unread'
                    ? 'rounded-full bg-gray-300 text-gray-500'
                    : 'text-skyBlue-200'
                } rounded`}
                onClick={handleUnreadNotification}
              >
                <Text size="sm" font="font-semibold">
                  Unread
                </Text>
              </div>

              <div
                className={`cursor-pointer px-4 py-2 ${
                  selectedFilter === 'Requests'
                    ? 'rounded-full bg-gray-300 text-gray-500'
                    : 'text-skyBlue-200'
                } rounded`}
                onClick={handleRequestsNotification}
              >
                <Text size="sm" font="font-semibold">
                  Requests
                </Text>
              </div>
            </div>
          </div>

          <div className="h-152 overflow-y-auto" ref={notificationHolderRef}>
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
              )?.map((notificationItem) => {
                return (
                  <div key={notificationItem.id} className="bg-white">
                    <div className={` ${!notificationItem.read ? 'new' : ''}`}>
                      <NotificationCard
                        type={notificationItem.data.type}
                        details={notificationItem}
                        notificationId={notificationItem.id}
                        notificationType={notificationItem?.data?.type}
                        notificationInCampfire={
                          notificationItem?.data?.data?.isCampfire
                        }
                        isNotificationPage
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
      </div>
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});

export default Notifications;
