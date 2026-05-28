import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { GET_REMOVED_CAMPFIRE_USERS } from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ICampfireRemovedUsers {
  campfireId: string;
}

interface RemovedUser {
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

interface RemovedUsersResponse {
  campfire_users: RemovedUser[];
}

const RemovedUsers = ({ campfireId }: ICampfireRemovedUsers) => {
  const [removedUsersData, setRemovedUsersData] = useState<RemovedUser[]>([]);
  const router = useRouter();
  const profileId = useAppSelector(getUserId);

  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();

  const { loading, data } = useQuery<RemovedUsersResponse>(
    GET_REMOVED_CAMPFIRE_USERS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      variables: {
        campfireId,
      },
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if (data?.campfire_users) {
      setRemovedUsersData(data.campfire_users);
    }
  }, [data]);

  const handleClick = (data: RemovedUser['user']) => {
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

  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(removedUsersData) ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            Nothing to see here
          </p>
        </div>
      ) : (
        <ul>
          {removedUsersData &&
            removedUsersData.map((data: RemovedUser) => {
              return (
                <li
                  key={data.id}
                  className="search-list"
                  onClick={() => handleClick(data.user)}
                >
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
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default RemovedUsers;
