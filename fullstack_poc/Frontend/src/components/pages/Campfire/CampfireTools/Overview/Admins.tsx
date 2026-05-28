import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { GET_CAMPFIRE_ADMINS } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';

interface IAdmins {
  campfireId: string;
}

interface AdminUser {
  id: string;
  user: {
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

const Admins = ({ campfireId }: IAdmins) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const token = useAppSelector(selectGetToken);

  const { loading, data } = useQuery(GET_CAMPFIRE_ADMINS, {
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
      setAdmins((data as any).campfire_users);
    }
  }, [data]);
  return (
    <div>
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(admins) ? (
        <div
          className="mt-20 mb-20 flex flex-col items-center justify-center text-center text-black"
          style={{ minHeight: 300 }}
        >
          <RiAlarmWarningFill
            size={60}
            className="drop-shadow-glow animate-flicker text-red-500"
          />
          <h2 className="mt-8 text-2xl md:text-3xl">No Member found</h2>
        </div>
      ) : (
        <ul>
          {admins &&
            admins.map((data: AdminUser) => {
              return (
                <li key={data.id} className="search-list">
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

export default Admins;
