/**
 * AfterLoginHeader displays the header for logged-in users.
 * - Shows a search bar on `/sunrise-club` route.
 * - Displays notification icon with unread count.
 * - Toggles visibility of notification and profile dropdowns.
 * - Closes dropdowns on route changes.
 */

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import notificationIcon from '/public/images/notification.svg';
import CustomImage from '@/components/Utility/CustomImage';
import SearchBarClub from '@/components/Utility/SearchBarComponents/SearchBarClub';
import UserImage from '@/elements/UserImage';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FALLBACK_PROFILE_PIC } from '@/lib/constants';
import { getNotificationsLength, setUnreadMarkCount } from '@/state/Slices/notification';
import { UserProfile } from '@/types/authentication';
import { useLazyQuery } from '@apollo/client/react';
import { GET_UNREAD_NOTIFICATION_COUNT } from '@/service/graphql/Notifications';
import { NotificationResponse } from '@/pages/notifications';

interface NotificationElement extends HTMLElement {
  classList: DOMTokenList;
}

function AfterLoginHeader() {
  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notificationSlice = useAppSelector((state) => state.notification);

  const notificationlength = useAppSelector(getNotificationsLength);
  const isIndexRoute =
    router.pathname.startsWith('/sunrise-club') ||
    router.pathname.startsWith('/doctor') ||
    router.pathname.startsWith('/author');

  const [fetchUnreadNotificationCount, { data: unreadCountData }] =
    useLazyQuery<NotificationResponse>(GET_UNREAD_NOTIFICATION_COUNT, {
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, [fetchUnreadNotificationCount]);

  useEffect(() => {
    const notificationTrigger = document.querySelector(
      '.notification-trigger',
    ) as HTMLElement;
    const profileTrigger = document.querySelector(
      '.profile-trigger',
    ) as HTMLElement;
    const notificationDDElem = document.querySelector(
      '.notificationDropdown',
    ) as NotificationElement;
    const profileDDElem = document.querySelector(
      '.profileDropdown',
    ) as NotificationElement;

    document.addEventListener('click', function (event: MouseEvent) {
      if (
        (event.target as HTMLElement).closest('.notificationDropdown') ||
        (event.target as HTMLElement).closest('.notification-trigger')
      ) {
        return;
      }
      notificationDDElem?.classList.add('hidden');
    });

    document.addEventListener('click', function (event: MouseEvent) {
      if (
        (event.target as HTMLElement).closest('.profileDropdown') ||
        (event.target as HTMLElement).closest('.profile-trigger')
      ) {
        return;
      }
      profileDDElem?.classList.add('hidden');
    });

    notificationTrigger.addEventListener('click', function () {
      notificationDDElem?.classList.toggle('hidden');
    });
    profileTrigger.addEventListener('click', function () {
      profileDDElem?.classList.toggle('hidden');
    });

    function handleCloseDropdown() {
      profileDDElem?.classList.add('hidden');
      notificationDDElem?.classList.add('hidden');
    }

    router.events.on('routeChangeStart', handleCloseDropdown);
    router.events.on('hashChangeStart', handleCloseDropdown);

    return () => {
      router.events.off('routeChangeStart', handleCloseDropdown);
      router.events.off('hashChangeStart', handleCloseDropdown);
    };
  }, [router.events]);

  useEffect(() => {
    if (unreadCountData) {
      const count = (unreadCountData as any)?.getNotifications_aggregate.aggregate.count;
      dispatch(setUnreadMarkCount(count));
    }
  }, [unreadCountData]);

  return (
    <div className="flex items-center justify-end gap-2 lg:gap-3">
      {isIndexRoute && <SearchBarClub />}

      <div className="relative">
        <div className="notification-trigger relative h-6 w-6 cursor-pointer">
          <CustomImage src={notificationIcon} />
          {!!notificationlength && (
            <div className="notificationBg">{notificationlength}</div>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="profile-trigger cursor-pointer">
          <UserImage
            src={
              profile?.profilePicture
                ? profile?.profilePicture
                : FALLBACK_PROFILE_PIC
            }
            size="sm"
            gap="0"
            alt="user image"
          />
        </div>
      </div>
    </div>
  );
}

export default AfterLoginHeader;
