import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useAppSelector } from '@/Hooks/useRedux';
import { QUERY_GET_BLOCK_USERS } from '@/service/graphql/Profile';
import { getUserId, selectGetToken } from '@/state/Slices/auth';

interface BlockedUser {
  id: string;
  blocked_user: {
    id: string;
    name: string;
    profilePicture: string;
  };
}

interface BlockedByResponse {
  blocked_users: BlockedUser[];
}

export function useUsersIBlocked(): Set<string> {
  const token = useAppSelector(selectGetToken);
  const myId = useAppSelector(getUserId);

  const { data, loading, error } = useQuery<BlockedByResponse>(QUERY_GET_BLOCK_USERS, {
    context: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    variables: { userId: myId },
    skip: !token || !myId,
    fetchPolicy: 'cache-and-network',
  });

  return useMemo(() => {
    const entries = data?.blocked_users ?? [];
    return new Set(entries.map((e) => e.blocked_user.id));
  }, [data, loading, error]);
}
