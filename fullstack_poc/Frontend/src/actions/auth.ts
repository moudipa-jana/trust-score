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
  QUERY_GET_USER_PROFILE,
  QUERY_USER_FOLLOWERS_FOLLOWING_COUNT,
  UNFOLLOW_USER_MUTATION,
} from '@/service/graphql/Profile';
import {
  fetchFollowings,
  followUserSuccess,
  logout,
  setUserProfile,
  unFollowSuccess,
} from '@/state/Slices/auth';
import {
  getBookmarkData,
  guestFollowUserSuccess,
  guestUnfollowUserSuccess,
} from '@/state/Slices/profile';
import { AppDispatch } from '@/state/store';
import { removeToken, setCookiesToken } from '@/utils/verifyAuthentication';

export interface UserFollowing {
  id: string;
  name: string;
  profilePicture: string;
  email: string;
}

export interface UserFollowingResponse {
  user_followings: {
    userFollowing: UserFollowing;
  }[];
}

export interface UserProfileResponse {
  users_by_pk: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    followersCount?: { aggregate: { count: number } };
    followingCount?: { aggregate: { count: number } };
  };
}

export interface BookmarkResponse {
  bookmarks: any[];
}

export interface FollowUserResponse {
  insert_user_followers_one: {
    following: UserFollowing;
  };
}

export interface FollowersFollowingCountResponse {
  users?: { followers: number }[];
}

/**
 * logoutForum action logs out the user by removing the token and dispatching logout.
 */
export function logoutForum() {
  return async (dispatch: AppDispatch) => {
    removeToken();
    await dispatch(logout());
  };
}

/**
 * forceLogoutUser forces a logout, redirects to home, and shows a session expired message.
 */
export function forceLogoutUser() {
  return async (dispatch: AppDispatch) => {
    Router.push('/');
    emitErrorNotification(SESSION_EXPIRED_MSG);
    await dispatch(logoutForum() as any);
  };
}

/**
 * Fetches the list of followings for the user.
 */
export function fetchUserFollowings(userId: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().query({
        query:
          QUERY_FETCH_FOLLOWING as TypedDocumentNode<UserFollowingResponse>,
        variables: { userId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const data = result.data as UserFollowingResponse;

      const userFollowingArray: UserFollowing[] = [];
      if (data.user_followings) {
        data.user_followings.forEach((follower) =>
          userFollowingArray.push(follower.userFollowing),
        );
        dispatch(fetchFollowings(userFollowingArray));
      }
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

/**
 * Fetches user bookmarks.
 */
export function fetchBookmarks(token: string, offset = 0, limit = 20) {
  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().query({
        query: QUERY_FETCH_BOOKMARK as TypedDocumentNode<BookmarkResponse>,
        variables: {
          sort: { createdAt: 'desc_nulls_last' },
          limit,
          offset,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
 * Handles post-login actions, fetching user profile, followings, and bookmarks.
 */
export function postAuthSuccess(userId: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      setCookiesToken(token);

      const result = await ApiClient.getClient().query({
        query: QUERY_GET_USER_PROFILE as TypedDocumentNode<UserProfileResponse>,
        variables: { userId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: 'no-cache',
      });

      const data = result.data as UserProfileResponse;

      if (isEmpty(data.users_by_pk)) {
        dispatch(forceLogoutUser() as any);
        return;
      }

      dispatch(
        setUserProfile({
          ...data.users_by_pk,
          // followersCount: data.users_by_pk?.followersCount?.aggregate?.count,
          // followingCount: data.users_by_pk?.followingCount?.aggregate?.count,
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
 * Follows a user and updates the Redux store.
 */
export function followUser(followingId: string, userId: string, token: string) {
  console.log('followUser auth');

  return async (dispatch: AppDispatch) => {
    try {
      const result = await ApiClient.getClient().mutate({
        mutation: FOLLOW_USER_MUTATION as TypedDocumentNode<FollowUserResponse>,
        variables: { userId, followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });

      const data = result.data as FollowUserResponse;

      const countResult = await ApiClient.getClient().query({
        query:
          QUERY_USER_FOLLOWERS_FOLLOWING_COUNT as TypedDocumentNode<FollowersFollowingCountResponse>,
        variables: { userId: followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
      });

      console.log('countResult', countResult);

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
 * Unfollows a user and updates the Redux store.
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

      const countResult = await ApiClient.getClient().query({
        query:
          QUERY_USER_FOLLOWERS_FOLLOWING_COUNT as TypedDocumentNode<FollowersFollowingCountResponse>,
        variables: { userId: followingId },
        context: { headers: { Authorization: `Bearer ${token}` } },
        fetchPolicy: 'no-cache',
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
