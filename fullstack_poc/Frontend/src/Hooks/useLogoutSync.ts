/**
 * useLogoutSync hook manages real-time user log  const isArchived = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.is_archived_by_admin || false,
    [subscriptionData],
  );
  const isDisabled = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.is_disabled_by_admin || false,
    [subscriptionData],
  );
  const userIsLoggedIn = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.isLoggedIn,on the user's status and local storage events.
 * - Uses a GraphQL subscription to listen for changes in the user's status (archived or disabled).
 * - Automatically logs the user out if they are archived or disabled.
 * - Listens for `storage` events to handle logout across multiple tabs or windows.
 * - Triggers the `logoutForum` action and clears the local storage flag when a logout occurs.
 * - Returns a `handleLogout` function to manually log out the user.
 */

import { useSubscription } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { logoutForum } from '@/actions/auth';
import { emitNotification } from '@/lib/helpers';
import CHECK_FOR_INSTANT_LOGOUT from '@/service/graphql/logout';
import { selectGetToken } from '@/state/Slices/auth';

import { useAppDispatch, useAppSelector } from './useRedux';

interface SubscriptionContext {
  headers: {
    Authorization: string;
  };
}

const useLogoutSync = () => {
  const dispatch = useAppDispatch();
  const id = useAppSelector((state) => state?.auth?.profile?.id);
  const token = useAppSelector(selectGetToken);
  const router = useRouter();
  const [subscriptionContext, setSubscription] =
    useState<SubscriptionContext | null>(null);

  useEffect(() => {
    if (token && !subscriptionContext?.headers?.Authorization) {
      setSubscription({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }, [token, subscriptionContext]);

  const { data: subscriptionData } = useSubscription(CHECK_FOR_INSTANT_LOGOUT, {
    context: subscriptionContext?.headers?.Authorization
      ? subscriptionContext
      : undefined,
    variables: { userId: id },
    skip: !id || !subscriptionContext?.headers?.Authorization,
    fetchPolicy: 'network-only',
  });

  const isArchived = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.is_archived_by_admin || false,
    [subscriptionData],
  );
  const isDisabled = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.is_disabled_by_admin || false,
    [subscriptionData],
  );
  const isLoggedIn = useMemo(
    () => (subscriptionData as any)?.users_by_pk?.isLoggedIn,
    [subscriptionData],
  );

  const handleLogout = useCallback(() => {
    if (!subscriptionContext?.headers?.Authorization) {
      emitNotification('info', 'You have been logged out');
    }
    dispatch(logoutForum());
    localStorage.setItem(
      'subscription_channel',
      JSON.stringify({ logOut: true }),
    );
  }, [dispatch, subscriptionContext]);

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === 'subscription_channel' && event.newValue) {
        const data = JSON.parse(event.newValue);
        if (data.logOut) {
          handleLogout();
        }
      }
    };

    window.addEventListener('storage', onStorageChange);

    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [handleLogout]);

  useEffect(() => {
    if (isLoggedIn === undefined || isLoggedIn === null) {
      return;
    }
    if (isArchived || isDisabled || !isLoggedIn) {
      handleLogout();
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArchived, isDisabled, isLoggedIn, handleLogout]);

  return { handleLogout };
};

export default useLogoutSync;
