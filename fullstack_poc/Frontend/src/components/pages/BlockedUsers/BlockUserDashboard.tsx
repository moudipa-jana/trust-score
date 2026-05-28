import { useQuery } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';

import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import UserImage from '@/elements/UserImage';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  QUERY_GET_BLOCK_USERS,
  UNBLOCK_USER_MUTATION,
} from '@/service/graphql/Profile';
import { getUserId, selectGetToken } from '@/state/Slices/auth';

interface BlockedUser {
  id: string;
  blocked_user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
  };
}

interface BlockedUsersResponse {
  blocked_users: BlockedUser[];
}

const BlockedUserDashboard = () => {
  const [blockedUserId, setBlockuserId] = useState('');
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [blockUsers, setBlockUsers] = useState<BlockedUser[]>([]);
  const isMobile = useIsMobile();

  const { loading, error, data } = useQuery<BlockedUsersResponse>(
    QUERY_GET_BLOCK_USERS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      variables: {
        userId,
      },
      skip: token === '',
    },
  );

  // Handle query completion
  useEffect(() => {
    if (data?.blocked_users) {
      setBlockUsers(data.blocked_users);
    }
  }, [data]);

  const { mutationFunction: UnblockUser } = useAuthMutation(
    UNBLOCK_USER_MUTATION,
    () => {
      setBlockUsers((prevState) => {
        return prevState.filter(
          (user: BlockedUser) => user?.blocked_user?.id !== blockedUserId,
        );
      });
    },
  );

  const handleUnblockUser = () => {
    UnblockUser({
      variables: {
        blockedUserId,
      },
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setBlockuserId('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Blocked Users" />
        <ProfileActivityErrorComponent errorMessage="Oops something went wrong." />
      </div>
    );
  return (
    <div>
      <div className="sm-container pb-20">
        <Heading font="font-medium" color="text-black-900" variant priority={3}>
          <span className="text-2xl xl:text-4xl">Blocked Users</span>
        </Heading>
        {loading ? (
          <div
            className="m-5 flex items-center justify-center"
            style={{ minHeight: 250 }}
          >
            <TabletLoader
              style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
            />
          </div>
        ) : isEmpty(blockUsers) || error ? (
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
          <div className="my-4 rounded-md bg-skyBlue-300 p-4 lg:p-6">
            <ul>
              {blockUsers?.map((user: BlockedUser) => {
                return (
                  <li
                    key={user?.id}
                    className=" my-2 rounded-md bg-white py-2.5 px-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="lg:settingsLeft flex items-center">
                        <UserImage
                          size="sm"
                          src={
                            get(user, 'blocked_user.profilePicture') ?? Image
                          }
                          alt="user avatar"
                        />
                        <div className="ml-8">
                          <Text size="md" color="">
                            {get(user, 'blocked_user.name') || ''}
                          </Text>
                        </div>
                      </div>

                      <div className="relative my-2 lg:my-0">
                        <div
                          className="cursor-pointer p-2"
                          onClick={() => setBlockuserId(user?.blocked_user?.id)}
                        >
                          <BsThreeDotsVertical
                            size={16}
                            color="#272727"
                            className="font-bold"
                          />
                        </div>

                        {user?.blocked_user?.id === blockedUserId && (
                          <div
                            ref={dropdownRef}
                            className={` absolute z-51 mt-2 h-auto w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${'top-7 right-3'}`}
                          >
                            <div className="py-2" role="none">
                              <ul>
                                <li
                                  className="group block cursor-pointer  px-2 "
                                  onClick={handleUnblockUser}
                                >
                                  <div className="flex justify-between rounded-md p-2 hover:bg-gray-100">
                                    <Text
                                      size="sm"
                                      color="group-hover:text-primary"
                                    >
                                      Unblock
                                    </Text>
                                    <div className=" group-hover:text-primary">
                                      <span className={`${'icon2-blocked'}`} />
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUserDashboard;
