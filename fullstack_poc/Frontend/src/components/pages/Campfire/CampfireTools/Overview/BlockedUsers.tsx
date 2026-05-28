import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  GET_BLOCKED_CAMPFIRE_USERS,
  UNBLOCK_CAMPFIRE_USER,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ICampfireBlockedUsers {
  campfireId: string;
  onMembersChanged?: () => void;
}

interface BlockedUser {
  id: string;
  user: {
    id: string;
    name: string;
    profilePicture: string;
    npOfPosts: Array<{
      campfire_threads_aggregate: {
        aggregate: {
          count: number;
        };
      };
    }>;
    followers: number;
    following: number;
  };
}

const BlockedUsers = ({ campfireId, onMembersChanged }: ICampfireBlockedUsers) => {
  const [blockedUsersData, setBlockedUsersData] = useState<BlockedUser[]>([]);
  const [blockedUserId, setBlockuserId] = useState<string>('');
  const router = useRouter();
  const profileId = useAppSelector(getUserId);

  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();

  const { loading, data } = useQuery(GET_BLOCKED_CAMPFIRE_USERS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: {
      campfireId: campfireId,
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if ((data as any)?.campfire_users) {
      setBlockedUsersData((data as any).campfire_users);
    }
  }, [data]);

  const handleClick = (data: BlockedUser['user']) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (profileId === data.id) {
      router.push('/profile#activities');
      return;
    }
    router.push(`/user/${encodeURIComponent(data.name)}`);
  };

  const { mutationFunction: UnblockUser } = useAuthMutation(
    UNBLOCK_CAMPFIRE_USER,
    () => {
      setBlockedUsersData((prevState) => {
        return prevState.filter((user) => user.user.id !== blockedUserId);
      });
      onMembersChanged?.();
    },
  );

  const handleUnblock = (blockUserId: string) => {
    setBlockuserId(blockUserId);
    UnblockUser({
      variables: {
        campfireId: campfireId,
        userId: blockUserId,
        updatedBy: profileId,
      },
    });
  };

  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(blockedUsersData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            No blocked accounts
          </p>
          <p className='text-sm text-gray-500'>
            Anyone you’ve blocked will appear here.
          </p>
        </div>
      ) : (
        <ul>
          {blockedUsersData &&
            blockedUsersData.map((data: BlockedUser) => {
              return (
                <li
                  key={data.id}
                  className="flex items-center"
                  onClick={() => handleClick(data.user)}
                >
                  <div className="mb-2.5 flex cursor-pointer flex-wrap items-center gap-3 rounded-md py-2 px-1 lg:mb-0 lg:border-none">
                    <div className=" h-12 w-12">
                      <CustomImage src={data.user.profilePicture} fill />
                    </div>
                    <Text size="3xl" font="font-medium" color="text-black">
                      {data.user.name || ''}
                    </Text>
                    <span className="campfire-dot-search"></span>
                    <Text color="text-offwhite-1000" size="xs">
                      {data.user.npOfPosts?.[0]?.campfire_threads_aggregate
                        ?.aggregate?.count ?? 0}{' '}
                      Posts
                    </Text>
                    <span className="campfire-dot-search"></span>
                    <Text color="text-offwhite-1000" size="xs">
                      {data.user.followers} Followers
                    </Text>
                    <span className="campfire-dot-search"></span>
                    <Text color="text-offwhite-1000" size="xs">
                      {data.user.following} Followings
                    </Text>
                  </div>
                  <div
                    className="ml-auto"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <Button
                      type="secondary"
                      textColor="text-primary"
                      size="xs"
                      onClick={() => handleUnblock(data.user.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default BlockedUsers;
