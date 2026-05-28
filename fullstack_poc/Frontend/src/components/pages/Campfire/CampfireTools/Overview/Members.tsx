import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import RemoveMember from '@/components/pages/Campfire/RemoveMember';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitNotification } from '@/lib/helpers';
import {
  GET_CAMPFIRE_MEMBERS,
  REMOVE_CAMPFIRE_USER,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface Member {
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

interface IMembers {
  campfireId: string;
}

const Members = ({ campfireId }: IMembers) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [removeModal, setRemoveModal] = useState<boolean>(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const router = useRouter();

  const dispatch = useAppDispatch();

  const token = useAppSelector(selectGetToken);
  const profileId = useAppSelector(getUserId);

  const { loading, data } = useQuery(GET_CAMPFIRE_MEMBERS, {
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
      setMembers((data as any).campfire_users);
    }
  }, [data]);

  const { mutationFunction: RemoveUser } = useAuthMutation(
    REMOVE_CAMPFIRE_USER,
    () => {
      setMembers((prevState) => {
        return prevState.filter((user) => user.user.id !== removeId);
      });
      setRemoveModal(false);
      emitNotification('success', 'User has been removed successfully');
    },
  );

  const handleRemove = () => {
    RemoveUser({
      variables: {
        campfireId: campfireId,
        userId: removeId,
        deletedBy: profileId,
      },
    });
  };

  const handleClick = (data: Member['user']) => {
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
      <Modal
        id="RemoveMember"
        isVisible={removeModal}
        onClose={() => setRemoveModal(false)}
      >
        <RemoveMember
          title="Remove Member"
          subTitle="Are you sure you want remove this member?"
          onCancel={() => setRemoveModal(false)}
          onSend={() => handleRemove()}
          onSendText="Remove"
          onCancelText="Cancel"
        />
      </Modal>
      <div>
        {loading ? (
          <div
            className="mt-20 mb-20 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <TabletLoader style={{ height: 150 }} />
          </div>
        ) : isEmpty(members) ? (
          <div className="layout flex flex-col items-center justify-center gap-3 text-center">
            <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
            <p className='text-sm font-bold text-gray-500'>
              No user yet!
            </p>
            <p className='text-sm text-gray-500'>
              You have to invite users to your campfire.
            </p>
          </div>
        ) : (
          <ul>
            {members &&
              members.map((data: Member) => {
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
                          ?.aggregate?.count ?? 0}
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
                        size="sm"
                        type="bgDarkRed"
                        onClick={() => {
                          setRemoveModal(true);
                          setRemoveId(data.user.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Members;
