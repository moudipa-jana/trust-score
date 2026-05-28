import { get, lowerCase } from 'lodash';

import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import ApiClient from '@/service/graphql/apiClient';
import {
  FETCH_CATEGORIES_FEED_MUTATION,
  SUGGEST_CATEGORY_MUTATION,
} from '@/service/graphql/Category';
import { fetchForumFeedSuccess } from '@/state/Slices/necessary';
import { AppDispatch } from '@/state/store';

// Fetches the category feed based on the given title and dispatches the feed data to the store.
export function fetchCategoryFeed(title: string, token: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await ApiClient.getClient().mutate({
        mutation: FETCH_CATEGORIES_FEED_MUTATION,
        variables: {
          title: lowerCase(title),
          limit: 10,
          offset: 0,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      dispatch(
        fetchForumFeedSuccess({
          forumFeed: get(response, 'data.getFeed.feed'),
        }),
      );
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Fetches trending categories, but the mutation should be updated to a query in the future.
export function fetchTrendings(token: string) {
  return async () => {
    try {
      await ApiClient.getClient().mutate({
        mutation: FETCH_CATEGORIES_FEED_MUTATION, // TODO: update to query
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      // dispatch(fetchFollowings(data.user_followings));
    } catch (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  };
}

// Suggests a new category based on the title and user ID, and sends a success notification.
export async function suggestCategory(
  title: string,
  userId: string,
  token: string,
) {
  try {
    await ApiClient.getClient().mutate({
      mutation: SUGGEST_CATEGORY_MUTATION,
      variables: {
        title,
        userId,
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    emitNotification('success', 'Suggestion request sent successfully!');
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
  }
}
