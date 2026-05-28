/**
 * NotificationCard component renders different types of notifications for the user.
 * - Handles various notification types such as general notifications, reactions, comments, and campfire requests.
 * - Allows actions like marking notifications as read, deleting, and muting through GraphQL mutations.
 * - Provides UI for accepting or rejecting campfire join requests with buttons for approval or rejection.
 * - Supports conditional rendering based on notification type and visibility settings.
 * - Utilizes Redux hooks for managing global state, including user data and notification management.
 * - Integrates helper functions for error handling and displaying success/failure notifications.
 * - Implements custom image components for displaying profile pictures and reactions.
 */

import { useLazyQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import React, { MouseEvent, useEffect, useRef, useState } from 'react';

import DeleteNotification from '/public/images/DeleteNotification.svg';
import epsilonIcon from '/public/images/epsilonIcon.svg';
import InsideCampfire from '/public/images/InsideCampfire.svg';
import MuteNotification from '/public/images/MuteNotification.svg';
import OutsideCampfire from '/public/images/OutsideCampfire.svg';
import Card from '@/components/Card/index';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import LinkifyText from '@/components/Utility/LinkifyText';
import Text from '@/elements/Text';
import UserImage from '@/elements/UserImage';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { Kofukon } from '@/pages';
import {
  NOTIFIICATION_ACTION_MUTATION,
  QUERY_GET_CAMPFIRE_MEMBER,
} from '@/service/graphql/Campfire';
import {
  DELETE_NOTIFICATION,
  GET_UNREAD_NOTIFICATION_COUNT,
  MARK_READ_MUTATION,
  MUTE_NOTIFICATION,
} from '@/service/graphql/Notifications';
import { QUERY_GET_USER_PROFILE, QUERY_GET_BASIC_USER_NAME } from '@/service/graphql/Profile';
import { campfireMemberFetchSuccess } from '@/state/Slices/campfire';
import {
  deleteNotificationItem,
  deleteRequestNotificationItem,
  deleteUnreadNotificationItem,
  getNotificationsLength,
  markReadNotification,
  setUnreadMarkCount,
} from '@/state/Slices/notification';
import { notification } from '@/types/authentication';
import { NotificationResponse } from '@/pages/notifications';

interface INotificationCard {
  type: string;
  details: notification;
  notificationId: string;
  notificationType?: string;
  notificationInCampfire?: boolean;
  isNotificationPage?: boolean;
  refetchAllNotifications?: () => void;
  markAnnouncementSeen?: (id: string) => void;
}

function NotificationCard({
  type,
  details,
  notificationId,
  notificationType,
  notificationInCampfire,
  isNotificationPage,
  refetchAllNotifications,
  markAnnouncementSeen,
}: INotificationCard) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const campfireDetails = useAppSelector((state) => state.campfire.campfireDetails);
  const userId = useAppSelector((state) => state.auth.profile?.id);
  const notificationlength = useAppSelector(getNotificationsLength);

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const epsilonIconRef = useRef<HTMLDivElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(details.data.isDisabled);
  const isMobile = useIsMobile();
  const isIpad = useIsipad();
  const [clicked, setClicked] = useState({
    accept: details.data.actions?.approveButton?.isClicked || false,
    reject: details.data.actions?.rejectButton?.isClicked || false,
  });
  const [currentUserName, setCurrentUserName] = useState<string>('');

  const kofukons = useAppSelector((state) => state.home.kofukons);

  const [fetchUnreadNotificationCount, { data: unreadCountData }] =
    useLazyQuery<NotificationResponse>(GET_UNREAD_NOTIFICATION_COUNT, {
      fetchPolicy: 'no-cache',
    });

  const [fetchUserProfile, { data: fetchedUserData }] = useLazyQuery<any>(QUERY_GET_BASIC_USER_NAME, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (unreadCountData) {
      const count = (unreadCountData as any)?.getNotifications_aggregate.aggregate.count;
      dispatch(setUnreadMarkCount(count));
    }
  }, [unreadCountData]);

  // Fetch user profile to get current name for dynamic text replacement
  useEffect(() => {
    // Priority: data.data.sentBy (sender) then details.userId (potential recipient/sender fallback)
    const senderId = details?.data?.data?.sentBy || (details as any)?.userId;

    if (senderId && token) {
      fetchUserProfile({
        variables: { userId: senderId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }).catch((err) => {
        console.error('Failed to fetch user profile:', err);
      });
    }
  }, [details, token, fetchUserProfile]);

  // Update current username state when user data arrives
  useEffect(() => {
    if (fetchedUserData?.users_by_pk?.name) {
      setCurrentUserName(fetchedUserData.users_by_pk.name);
    }
  }, [fetchedUserData]);

  // Get notification text with current user name replacement
  const getNotificationText = () => {
    const originalText = details?.data?.text || '';
    if (currentUserName) {
      const parts = originalText.split(/\s+/);
      if (parts.length > 0) {
        parts[0] = currentUserName;
        return parts.join(' ');
      }
    }
    return originalText;
  };

  // Lazily fetches campfire members based on campfire ID and dispatches success action.
  const [campfireMember, { data: campfireMemberData }] = useLazyQuery(
    QUERY_GET_CAMPFIRE_MEMBER,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle campfire member fetch completion
  useEffect(() => {
    if (campfireMemberData && (campfireMemberData as any)?.campfire_users) {
      dispatch(
        campfireMemberFetchSuccess((campfireMemberData as any).campfire_users),
      );
    }
  }, [campfireMemberData, dispatch]);

  // Marks a notification as read and fetches campfire member details after marking read.
  const { mutationFunction: markRead } = useAuthMutation(
    MARK_READ_MUTATION,
    () => {
      dispatch(markReadNotification());
      if (token !== '') {
        campfireMember({
          variables: {
            campfireId: campfireDetails?.id,
            search: '%%',
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      }
    },
  );

  // Deletes notification and removes it from all relevant notification categories.
  const { mutationFunction: deleteNotificationData } = useAuthMutation(
    DELETE_NOTIFICATION,
    () => {
      if (details?.id) {
        dispatch(deleteNotificationItem(details?.id));
        dispatch(deleteUnreadNotificationItem(details?.id));
        dispatch(deleteRequestNotificationItem(details?.id));
      }
    },
  );

  // Mutes a notification and dispatches success notification.
  const { mutationFunction: muteNotificationData } = useAuthMutation(
    MUTE_NOTIFICATION,
    () => {
      emitNotification('success', 'Muted successfully');
    },
  );

  // Handles campfire request actions (approve or reject) and triggers mutation.
  const { mutationFunction: requestCampfire } = useAuthMutation(
    NOTIFIICATION_ACTION_MUTATION,
    () => {
      markRead({ variables: { notificationId } });
      setIsDisabled(true);
      if (refetchAllNotifications) {
        refetchAllNotifications();
      }
    },
    (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  );

  // Handles the notification click to navigate or mark it as read based on the type.
  const handleNotificationClick = async (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (showOptions) {
      setShowOptions(false);
    } else if (
      type !== 'campfireUserRequest' &&
      type !== 'campfireAdminRequest'
    ) {
      const sentByUserId = details.data.data?.sentBy;
      const isProfileRedirect = details.data.redirect?.includes('/user/');

      if (sentByUserId && isProfileRedirect) {
        try {
          const { data } = await fetchUserProfile({
            variables: { userId: sentByUserId },
            context: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          if ((data as any)?.users_by_pk?.name) {
            router.push(`/user/${(data as any).users_by_pk.name}`);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      } else if (details.data.redirect !== '') {
        // Fall back to stored redirect path for other notification types
        router.push(`/${details.data.redirect}`);
      }

      if (type === 'campfireAnnouncement' && markAnnouncementSeen) {
        markAnnouncementSeen(notificationId);
        if (!details.isSeen) {
          dispatch(setUnreadMarkCount(Math.max(0, notificationlength - 1)));
        }
      } else if (!details.isSeen) {
        markRead({ variables: { notificationId } });
      }
    }
  };

  // Handles the approval or rejection of a campfire request and triggers mutation.
  const handleCampfireRequest = (actionId: string) => {
    if (actionId === 'rejectButton') {
      setClicked({ ...clicked, reject: true });
    }
    if (actionId === 'approveButton') {
      setClicked({ ...clicked, accept: true });
    }
    requestCampfire({
      variables: {
        notificationId,
        actionId,
      },
    });
  };

  // Replaces an ID with a reaction (image/text) in the notification content.
  const replaceIdWithReaction = () => {
    const updatedText = getNotificationText();
    const foundIndex = kofukons?.findIndex((item: Kofukon) =>
      updatedText.includes(item?.attributes?.k_id),
    );
    if (
      foundIndex !== -1 &&
      Array.isArray(kofukons) &&
      kofukons[foundIndex]?.attributes?.k_id
    ) {
      const arr = updatedText.split(kofukons[foundIndex]?.attributes?.k_id);
      return (
        <div style={{ fontSize: isMobile || isIpad ? '12px' : '20px' }}>
          <span className={` ${isMobile ? 'mr-1' : ''}`}> {arr[0] + ' '}</span>

          <span className="absolute ml-1 inline-flex items-baseline">
            <CustomImage
              style={{
                height: isIpad || isMobile ? 16 : 25,
                width: isIpad || isMobile ? 16 : 25,
              }}
              height={isIpad || isMobile ? 16 : 25}
              width={isIpad || isMobile ? 16 : 25}
              src={
                kofukons[foundIndex]?.attributes?.image?.data[0]?.attributes
                  ?.url
              }
              alt={kofukons[foundIndex]?.attributes?.title}
            />
          </span>
          <span className={` ${isMobile ? 'ml-5' : 'ml-7'}`}>
            <LinkifyText text={arr[1]} />
          </span>
        </div>
      );
    }
    return <div>{updatedText}</div>;
  };

  // Toggles the visibility of the notification options menu.
  const toggleOptions = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Deletes the notification by calling the delete mutation.
  const handleDeleteNotification = async () => {
    await deleteNotificationData({ variables: { notificationId: details?.id, }, });
    const { data: unreadCountData } = await fetchUnreadNotificationCount();
    if (unreadCountData) {
      const count = (unreadCountData as any)?.getNotifications_aggregate.aggregate.count;
      dispatch(setUnreadMarkCount(count));
    }
  };

  // Mutes the notification by calling the mute mutation.
  const handleMuteNotification = async () => {
    if (details?.data?.data?.sentBy) {
      await muteNotificationData({
        variables: {
          notificationId: details?.id,
          mutedUserId: details?.data?.data?.sentBy,
          userId: userId,
        },
      });
      refetchAllNotifications && refetchAllNotifications();
    } else {
      emitErrorNotification(
        'No user details provided to mute the notifications.',
      );
    }
  };

  // Handles the click on notification options (delete or mute).
  const handleOptionClick = (option: string) => {
    if (option === 'delete') {
      handleDeleteNotification();
    } else if (option === 'mute') {
      handleMuteNotification();
    }
    setShowOptions(false);
  };

  // Closes the options menu when the mouse leaves the notification element.
  const handleMouseLeave = () => { setShowOptions(false); };

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        epsilonIconRef.current &&
        !epsilonIconRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="cursor-pointer" onClick={(e) => handleNotificationClick(e)}>
      {(type === 'followingUser' ||
        type === 'taggedName' ||
        type === 'postCreatedInCampfire' ||
        type === 'featuredContent' ||
        type === 'campfireRulesChanged' ||
        type === 'postDeletedByAdminInCampfire' ||
        type === 'postShared' ||
        type === 'campfireCreated' ||
        type === 'campfireTitleUpdate' ||
        type === 'welcomeMessage' ||
        type === 'campfireShared' ||
        type === 'campfireAnnouncement' ||
        type === 'postReported') && (
          <Card
            notificationCard
            isNotificationPage={isNotificationPage}
            type="user"
            profileImg={details.data.profilePicture || 'images/userImage.svg'}
            variant="sm"
            title={getNotificationText()}
            details={appDayjs(details.createdAt).fromNow()}
            detailsColor="text-gray-200"
            notificationSeen={details?.isSeen}
            notificationMuted={!!details?.isMuted}
            handleDeleteNotification={handleDeleteNotification}
            handleMuteNotification={handleMuteNotification}
            notificationInCampfire={!!notificationInCampfire}
          />
        )}

      {type === 'reactionOnPost' && (
        <div className="relative p-2">
          <div className="relative flex flex-row">
            {details?.isSeen ? null : (
              <div
                className="absolute top-0 left-0 h-3 w-3 rounded-full bg-red-500"
                style={{ border: '2px solid white', top: '-8px', left: '-8px' }}
              ></div>
            )}
            <UserImage
              size="sm"
              src={details.data.profilePicture || 'images/userImage.svg'}
              alt="user image"
            />
            <div className="w-full">
              <div className="flex flex-row items-center justify-between">
                {replaceIdWithReaction()}
                <div>
                  <div
                    className="relative ml-auto h-5 w-5 px-2"
                    onClick={toggleOptions}
                    ref={epsilonIconRef}
                  >
                    <CustomImage src={epsilonIcon} />
                    {showOptions && (
                      <div
                        className="absolute right-0 z-10 mt-2 w-32 rounded-md bg-white shadow-lg"
                        ref={optionsRef}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100">
                          <div className="h-5 w-5">
                            <CustomImage src={DeleteNotification} />
                          </div>
                          <div
                            className="cursor-pointer px-1 pt-1 text-red-500"
                            onClick={() => handleOptionClick('delete')}
                          >
                            Delete
                          </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <div className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100">
                          <div className="h-5 w-5">
                            <CustomImage src={MuteNotification} />
                          </div>
                          <div
                            className="cursor-pointer px-1 pt-1 text-skyBlue-200"
                            onClick={() => handleOptionClick('mute')}
                          >
                            {details?.isMuted === 'True' ? 'Unmute' : 'Mute'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {isNotificationPage && (
                      <div className="h-5 w-5">
                        {notificationInCampfire ? (
                          <CustomImage src={InsideCampfire} />
                        ) : (
                          <CustomImage src={OutsideCampfire} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Text size="base" color="text-gray-200">
                {appDayjs(details.createdAt).fromNow()}
              </Text>
            </div>
          </div>
        </div>
      )}

      {(type === 'commentOnPost' || type === 'replyOnComment') && (
        <Card
          notificationCard
          isNotificationPage={isNotificationPage}
          type="user"
          profileImg={details.data.profilePicture || 'images/userImage.svg'}
          variant="sm"
          title={getNotificationText()}
          notificationSeen={details?.isSeen}
          notificationMuted={!!details?.isMuted}
          handleDeleteNotification={handleDeleteNotification}
          handleMuteNotification={handleMuteNotification}
          notificationInCampfire={!!notificationInCampfire}
        >
          <div className="ml-12">
            <div className="replyComment my-4 flex gap-2">
              {details.data.data && (
                <Text
                  color="text-blue"
                  size="base"
                  customClass="overflow-y-auto max-h-28"
                >
                  <LinkifyText text={details.data.data.description ?? ''} />
                </Text>
              )}
            </div>
            <Text color="text-gray-200" size="base">
              {details.createdAt && appDayjs(details.createdAt).fromNow()}
            </Text>
          </div>
        </Card>
      )}

      {(type === 'campfireUserRequest' || type === 'campfireAdminRequest') && (
        <Card
          notificationCard
          isNotificationPage={isNotificationPage}
          type="user"
          profileImg={details.data.profilePicture || 'images/userImage.svg'}
          variant="sm"
          title={getNotificationText()}
          message={details?.data?.message}
          notificationSeen={details?.isSeen}
          notificationMuted={!!details?.isMuted}
          handleDeleteNotification={handleDeleteNotification}
          handleMuteNotification={handleMuteNotification}
          notificationType={notificationType}
        >
          <div className="ml-12">
            {details?.data?.actions &&
              (details?.data?.actions?.approveButton ||
                details?.data?.actions?.rejectButton) && (
                <div className="mt-4 mb-2 flex gap-2">
                  {details?.data?.actions &&
                    details?.data?.actions?.approveButton && (
                      <Button
                        type="primary"
                        size="sm"
                        isdisabled={isDisabled}
                        onClick={() =>
                          handleCampfireRequest(
                            Object.keys(details?.data?.actions || {})[1],
                          )
                        }
                        customClassName={
                          clicked.accept
                            ? 'border-[3px] rounded-lg border-emerald-500'
                            : ''
                        }
                      >
                        {details?.data?.actions?.approveButton?.text}
                      </Button>
                    )}
                  {details?.data?.actions &&
                    details?.data?.actions?.rejectButton && (
                      <Button
                        type="outline"
                        size="sm"
                        isdisabled={isDisabled}
                        onClick={() =>
                          handleCampfireRequest(
                            Object.keys(details?.data?.actions || {})[0],
                          )
                        }
                        customClassName={
                          clicked.reject
                            ? 'border-[3px] rounded-lg border-rose-400'
                            : ''
                        }
                      >
                        {details?.data?.actions?.rejectButton?.text}
                      </Button>
                    )}
                </div>
              )}
            <Text color="text-gray-200" size="base">
              {details.createdAt ? appDayjs(details.createdAt).fromNow() : ''}
            </Text>
          </div>
        </Card>
      )}

      {type === 'commentPinned' && (
        <Card
          notificationCard
          isNotificationPage={isNotificationPage}
          type="user"
          profileImg={details.data.profilePicture || 'images/userImage.svg'}
          variant="sm"
          title={getNotificationText()}
          details={appDayjs(details.createdAt).fromNow()}
          detailsColor="text-gray-200"
          notificationSeen={details?.isSeen}
          notificationMuted={!!details?.isMuted}
          handleDeleteNotification={handleDeleteNotification}
          handleMuteNotification={handleMuteNotification}
          notificationType={notificationType}
        />
      )}
    </div>
  );
}

export default NotificationCard;
