/**
 * useAuthMutation hook provides a custom mutation handler with authentication.
 * - Automatically adds Authorization header with token for authentication.
 * - Handles error notification using `emitErrorNotification`.
 * - On mutation success or error, executes the provided callback functions.
 * - Ensures the token is present before invoking the mutation.
 */

import { DocumentNode, ErrorLike, OperationVariables } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { useAppSelector } from '@/Hooks/useRedux';
import { SESSION_EXPIRED_MSG } from '@/lib/constants';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { getUserId, selectGetToken } from '@/state/Slices/auth';

interface AuthContext {
  headers: {
    Authorization: string;
  };
}

function useAuthMutation<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  mutation: DocumentNode,
  onCompleted: (data: TData) => void,
  onError?: (error: ErrorLike) => void,
) {
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);

  const [mutationFun, { loading }] = useMutation<TData, TVariables>(mutation, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: onCompleted as (data: TData) => void,
    onError:
      onError ||
      ((err: ErrorLike) => {
        emitErrorNotification(formatGraphqlError(err));
      }),
  });

  const wrappedMutationFunction = useCallback(
    async (options?: any) => {
      if (!token) {
        emitErrorNotification(SESSION_EXPIRED_MSG);
        return;
      }
      await mutationFun(options as any);
    },
    [mutationFun, token],
  );

  return {
    mutationFunction: wrappedMutationFunction,
    loading,
    userId,
  };
}

export default useAuthMutation;
