/**
 * useUsersWhoBlockedMe
 *
 * Fetches the set of user IDs that have blocked the currently authenticated user.
 * Returns a Set<string> so callers can do O(1) membership checks to filter out
 * blockers from any people results (the blocker should be invisible to the blocked).
 */
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useAppSelector } from '@/Hooks/useRedux';
import { QUERY_GET_USERS_WHO_BLOCKED_ME } from '@/service/graphql/Profile';
import { getUserId, selectGetToken } from '@/state/Slices/auth';

interface BlockedByEntry {
  userId: string;
}

interface BlockedByResponse {
  blocked_users: BlockedByEntry[];
}

export function useUsersWhoBlockedMe(): Set<string> {
  const token = useAppSelector(selectGetToken);
  const myId = useAppSelector(getUserId);

  const { data, loading, error } = useQuery<BlockedByResponse>(QUERY_GET_USERS_WHO_BLOCKED_ME, {
    context: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    variables: { myId },
    skip: !token || !myId,
    fetchPolicy: 'cache-and-network',
  });

  return useMemo(() => {
    const entries = data?.blocked_users ?? [];
    return new Set(entries.map((e) => e.userId));
  }, [data, loading, error]);
}
