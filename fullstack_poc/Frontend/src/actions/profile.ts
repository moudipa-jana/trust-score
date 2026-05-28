import { TypedDocumentNode } from '@apollo/client';
import { isEmpty } from 'lodash';
import Router from 'next/router';

import { SESSION_EXPIRED_MSG } from '@/lib/constants';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import ApiClient from '@/service/graphql/apiClient';
import {
  FOLLOW_USER_MUTATION,
  QUERY_FETCH_BOOKMARK,
  QUERY_FETCH_FOLLOWING,
  QUERY_GET_GUEST_USER_PROFILE,
  QUERY_GET_UPDATED_USER_PROFILE,
  QUERY_GET_USER_PROFILE,
  QUERY_USER_FOLLOWERS_FOLLOWING_COUNT,
  SUBSCRIBED_TO_NEWSLETTER,
  SUBSCRIBED_USERS_LIST,
  UNFOLLOW_USER_MUTATION,
} from '@/service/graphql/Profile';
import {
  fetchFollowings,
  followUserSuccess,
  logout,
  setUserProfile,
  unFollowSuccess,
  updateUserProfile,
} from '@/state/Slices/auth';
import {
  getBookmarkData,
  guestFollowUserSuccess,
  guestUnfollowUserSuccess,
} from '@/state/Slices/profile';
import { AppDispatch } from '@/state/store';
import {
  GuestProfile,
  NewsletterSubscription,
  SubscribedUser,
  UserFollowing,
} from '@/types/authentication';
import {
  getUserToken,
  removeToken,
  setCookiesToken,
} from '@/utils/verifyAuthentication';

/**
 * Redux response interfaces
 */
export interface UserFollowingResponse {
  user_followings: { userFollowing: UserFollowing }[];
}

export interface UserProfileResponse {
  users_by_pk: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    followersCount?: { aggregate: { count: number } };
    followingCount?: { aggregate: { count: number } };
    followers?: number;
    following?: number;
    gender?: string;
  };
}

export interface BookmarkResponse {
  bookmarks: any[];
}

export interface FollowUserResponse {
  insert_user_followers_one: { following: UserFollowing };
}

export interface FollowersFollowingCountResponse {
  users?: { followers: number }[];
}

/**
 * Logs out the user by clearing token and Redux state
 */
export function logoutForum() {
  return async (dispatch: AppDispatch) => {
    removeToken();
    await dispatch(logout());
  };
}

/**
 * Forces logout and redirects
 */
export function forceLogoutUser() {
  return async (dispatch: AppDispatch) => {
    Router.push('/');
    emitErrorNotification(SESSION_EXPIRED_MSG);
    await dispatch(logoutForum() as any);
  };
}

/**
 * Fetch user followings
 */
export function fetchUserFollowings(userId: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().query({
        query:
          QUERY_FETCH_FOLLOWING as TypedDocumentNode<UserFollowingResponse>,
        variables: { userId },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
      });

      const data = result.data as UserFollowingResponse;
      if (data.user_followings) {
        const userFollowingArray = data.user_followings.map(
          (f) => f.userFollowing,
        );
        dispatch(fetchFollowings(userFollowingArray));
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Fetch user bookmarks
 */
export function fetchBookmarks(token: string, offset = 0, limit = 20) {
  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().query({
        query: QUERY_FETCH_BOOKMARK as TypedDocumentNode<BookmarkResponse>,
        variables: { sort: { createdAt: 'desc_nulls_last' }, limit, offset },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
      });

      const data = result.data as BookmarkResponse;
      if (data.bookmarks.length) {
        dispatch(getBookmarkData({ response: data, networkStatus: 2 }));
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Post-auth setup: fetch profile, followings, bookmarks
 */
export function postAuthSuccess(userId: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      setCookiesToken(token);

      const result = await ApiClient.getClient().query({
        query: QUERY_GET_USER_PROFILE as TypedDocumentNode<UserProfileResponse>,
        variables: { userId },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
      });

      const data = result.data as UserProfileResponse;
      if (isEmpty(data.users_by_pk)) {
        dispatch(forceLogoutUser() as any);
        return;
      }
      console.log('data.users_by_pk', data.users_by_pk);

      dispatch(
        setUserProfile({
          ...data.users_by_pk,
        }),
      );

      dispatch(fetchUserFollowings(userId, token) as any);
      dispatch(fetchBookmarks(token, 0, 20) as any);
    } catch (error) {
      captureSentryException(error);
    }
  };
}

/**
 * Follow a user
 */
export function followUser(followingId: string, userId: string, token: string) {
  console.log('followUser profile');

  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().mutate({
        mutation: FOLLOW_USER_MUTATION as TypedDocumentNode<FollowUserResponse>,
        variables: { userId, followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });

      const data = result.data as FollowUserResponse;

      const countResult = await ApiClient.getClient().mutate({
        mutation:
          QUERY_USER_FOLLOWERS_FOLLOWING_COUNT as TypedDocumentNode<FollowersFollowingCountResponse>,
        variables: { userId: followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });

      const countData = countResult.data as FollowersFollowingCountResponse;

      dispatch(fetchUserFollowings(userId, token) as any);
      dispatch(followUserSuccess(data.insert_user_followers_one.following));
      dispatch(guestFollowUserSuccess(countData.users?.[0]?.followers));
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Unfollow a user
 */
export function unFollowUser(
  followingId: string,
  userId: string,
  token: string,
) {
  return async (dispatch: AppDispatch) => {
    try {
      await ApiClient.getClient().mutate({
        mutation: UNFOLLOW_USER_MUTATION as TypedDocumentNode<any>,
        variables: { followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });

      const countResult = await ApiClient.getClient().mutate({
        mutation:
          QUERY_USER_FOLLOWERS_FOLLOWING_COUNT as TypedDocumentNode<FollowersFollowingCountResponse>,
        variables: { userId: followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });

      const countData = countResult.data as FollowersFollowingCountResponse;

      dispatch(fetchUserFollowings(userId, token) as any);
      dispatch(unFollowSuccess() as any);
      dispatch(
        guestUnfollowUserSuccess(countData.users?.[0]?.followers) as any,
      );
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Subscribe user to newsletter
 */
export async function subscribedNewsletter(
  email: string,
): Promise<NewsletterSubscription | Error> {
  try {
    const token = getUserToken();

    const result = await ApiClient.getClient().mutate({
      mutation:
        SUBSCRIBED_TO_NEWSLETTER as TypedDocumentNode<NewsletterSubscription>,
      variables: { email, isSubscribedTo: true },
      context: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    return result.data as NewsletterSubscription;
  } catch (error) {
    return error as Error;
  }
}

/**
 * Fetch subscribed users
 */
export async function fetchSubscribedUsers(
  email: string,
): Promise<SubscribedUser[] | null> {
  try {
    const token = getUserToken();

    const result = await ApiClient.getClient().query({
      query: SUBSCRIBED_USERS_LIST as TypedDocumentNode<{
        subscriptions: SubscribedUser[];
      }>,
      fetchPolicy: 'no-cache',
      variables: { email },
      context: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    return (result.data as { subscriptions: SubscribedUser[] }).subscriptions || null;
  } catch (error) {
    captureSentryException(error);
    return null;
  }
}

/**
 * Update user profile after edit
 */
export function updateEditProfileSuccess(userId: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      setCookiesToken(token);

      const result = await ApiClient.getClient().query({
        query:
          QUERY_GET_UPDATED_USER_PROFILE as TypedDocumentNode<UserProfileResponse>,
        variables: { userId },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
      });

      dispatch(
        updateUserProfile((result.data as UserProfileResponse).users_by_pk),
      );
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Fetch guest profile
 */
export async function fetchGuestProfile(
  username: string,
): Promise<GuestProfile | null> {
  try {
    const token = getUserToken();

    const result = await ApiClient.getClient().query({
      query: QUERY_GET_GUEST_USER_PROFILE as TypedDocumentNode<{
        users: GuestProfile[];
      }>,
      fetchPolicy: 'no-cache',
      variables: { username },
      context: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    return (result.data as { users: GuestProfile[] }).users[0] || null;
  } catch (error) {
    console.error('[fetchGuestProfile] error:', error);
    captureSentryException(error);
    return null;
  }
}
