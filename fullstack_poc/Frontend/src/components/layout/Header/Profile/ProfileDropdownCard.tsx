import { get, isEmpty } from 'lodash';
import Link from 'next/link';
import React from 'react';

import { logoutForum } from '@/actions/auth';
import PROFILE_NAVIGATION from '@/components/layout/Header/Profile/constant';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import { removeNotificationOnLogout } from '@/state/Slices/notification';
import { UserProfile } from '@/types/authentication';

function ProfileDropdownCard() {
  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;

  const verified = get(profile, 'isVerified', false);
  const dispatch = useAppDispatch();
  const handleClick = (list: {
    id: number;
    name: string;
    link: string;
    image: string;
  }) => {
    if (list.name === 'Sign out') {
      dispatch(logoutForum());
      dispatch(removeNotificationOnLogout());
    }
  };
  if (isEmpty(profile)) {
    return null;
  }
  return (
    <div className="profileDropdown  hidden">
      <div className="p-2">
        <div className="mb-2">
          <Text font="bold">Hi! {get(profile, 'name', '')} </Text>
        </div>
        <div className="mb-2">
          {get(profile, 'email', 'dummy@kofukuhcs.com')}
          <span
            className={` ${
              verified ? 'dotBeforeTextSuccess' : 'dotBeforeText'
            } text-sm text-white-900`}
          >
            {verified ? 'Verified' : 'Verification Pending'}
          </span>
        </div>
        {get(profile, 'createdAt', undefined) && (
          <div className="mb-4">
            Member since:{' '}
            {appDayjs(get(profile, 'createdAt', new Date())).format(
              'D MMM YYYY',
            )}
          </div>
        )}
        <div className="mb-4">
          <Link href="/profile/edit">
            <Button type="outline" size="base">
              Edit profile
            </Button>
          </Link>
        </div>
        {!get(profile, 'about') ? (
          <div className="max-w-[70%]">
            <Text size="sm" color="text-gray-50">
              Your profile is under the weather. Give it a healthy dose of
              attention!
            </Text>
          </div>
        ) : (
          <>
            <div className="mb-1 overflow-hidden">
              <Text size="base">About {get(profile, 'name', '')}</Text>
            </div>
            <div className="overflow-hidden">
              <Text size="sm" color="text-gray-50 break-words">
                {get(profile, 'about')}
              </Text>
            </div>
          </>
        )}
      </div>
      <div className="mt-2">
        {PROFILE_NAVIGATION.map((list) => {
          return (
            <div key={list.id}>
              <Link
                href={list.link}
                onClick={() => handleClick(list)}
                className="my-2 flex items-center"
              >
                <div className="relative mr-3 h-[16px] max-h-[16px] w-[16px] max-w-[16px]">
                  <CustomImage
                    src={list.image}
                    fill
                    style={{ objectFit: 'contain' }}
                    alt={list.name}
                  />
                </div>
                <div className="">
                  <Text size="base">{list.name}</Text>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProfileDropdownCard;
