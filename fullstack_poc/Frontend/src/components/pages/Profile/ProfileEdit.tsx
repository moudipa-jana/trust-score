import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import FollowersList from '@/components/pages/Profile/FollowersList';
import Button from '@/components/Utility/Button';
import CustomTabs from '@/components/Utility/CustomTabs';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { selectGetToken } from '@/state/Slices/auth';

interface IProfileEdit {
  duration: string;
  followers: number;
  following: number;
  userId: string;
  isEdit: boolean;
  isGuest?: boolean;
  isDisabled?: boolean;
}
function ProfileEdit({
  duration,
  followers,
  following,
  isEdit,
  userId,
  isGuest,
  isDisabled,
}: IProfileEdit) {
  const [followerModal, setFollowerModal] = useState(false);
  const [index, setIndex] = useState(1);
  const [followerFollowingTabsCollection, setFollowerFollowingTabsCollection] =
    useState<{ id: number; name: string; numberOf: number }[]>([]);

  useEffect(() => {
    setFollowerFollowingTabsCollection([
      {
        id: 1,
        name: 'Followers',
        numberOf: followers,
      },
      {
        id: 2,
        name: 'Following',
        numberOf: following,
      },
    ]);
  }, [followers, following]);
  const token = useAppSelector(selectGetToken);
  useEffect(() => {
    setFollowerModal(false);
  }, [userId]);
  return (
    <>
      <Modal
        id="ProfileEdit"
        isVisible={followerModal}
        onClose={() => setFollowerModal(!followerModal)}
        isFollowingList
      >
        <CustomTabs
          index={index}
          setIndex={setIndex}
          tabs={followerFollowingTabsCollection}
        >
          <div>
            <FollowersList
              tabName="follower"
              index={index}
              token={token}
              userId={userId}
              isGuest={isGuest}
            />
          </div>
          <div>
            <FollowersList
              tabName="userFollowing"
              index={index}
              token={token}
              userId={userId}
              isGuest={isGuest}
            />
          </div>
        </CustomTabs>
      </Modal>

      <div className={isDisabled ? 'pointer-events-none blur-sm' : ''}>
        <Text size="base">Member since: {duration}</Text>
        <div className=" flex pb-2.5 ">
          <Text size="base">
            {Math.max(0, followers)}{' '}
            <span
              onClick={() => (setFollowerModal(!followerModal), setIndex(1))}
              className="cursor-pointer text-primary"
            >
              Followers
            </span>{' '}
          </Text>
          <div className="ml-2">
            <Text size="base">
              {Math.max(0, following)}{' '}
              <span
                onClick={() => (setFollowerModal(!followerModal), setIndex(2))}
                className="cursor-pointer text-primary"
              >
                Following
              </span>{' '}
            </Text>
          </div>
        </div>
        {isEdit && (
          <div className="hidden lg:block">
            <Link href="/profile/edit">
              <Button size="sm" textColor="text-black-800" type="secondary">
                Edit profile
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileEdit;
