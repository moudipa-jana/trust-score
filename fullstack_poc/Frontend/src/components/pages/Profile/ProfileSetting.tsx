import Link from 'next/link';
import React from 'react';

import { logoutForum } from '@/actions/auth';
import PROFILE_NAVIGATION from '@/components/layout/Header/Profile/constant';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { useAppDispatch } from '@/Hooks/useRedux';
import { removeNotificationOnLogout } from '@/state/Slices/notification';

function ProfileSetting() {
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
  return (
    <div className="mb-4 overflow-y-auto rounded border border-white-800 bg-white p-4 xl:max-h-[80vh] xl:min-h-[284px] xl:min-w-[340px]">
      <div className="xl:p-3">
        {PROFILE_NAVIGATION.map(
          (list: { id: number; name: string; link: string; image: string }) => {
            return (
              <div key={list.id}>
                <Link
                  href={list.link}
                  onClick={() => handleClick(list)}
                  className="flex items-center py-1.5"
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
          },
        )}
      </div>
    </div>
  );
}

export default ProfileSetting;
