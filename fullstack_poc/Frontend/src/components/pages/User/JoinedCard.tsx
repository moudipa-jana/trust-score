import React from 'react';
import { VscMute } from 'react-icons/vsc';

import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { selectGetUserProfile } from '@/state/Slices/auth';
import { formatShortCount } from '@/lib/helpers';
interface Campfire {
  id: string;
  title: string;
  picture?: string;
  noParticipants: number;
  campfire_users: {
    length: number;
    mute?: boolean;
  }[];
}

interface IJoinedCard {
  name: string;
  picture: string;
  data: Campfire;
  members: number;
  isMute?: boolean;
  userId?: string;
}
function JoinedCard({
  picture,
  name,
  data,
  members,
  isMute,
  userId,
}: IJoinedCard) {
  const profile = useAppSelector(selectGetUserProfile);

  return (
    <div className="flex justify-between gap-4 py-2 lg:py-0 items-center">
      <div className="flex space-x-2 flex-1 min-w-0">
        <div className="h-9 w-9 min-w-[36px]">
          <CustomImage
            src={
              picture ||
              'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc'
            }
            fill
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Text
              customClass="line-clamp-2 break-all"
              size="sm"
              color="text-black-1100"
            >
              {name}
            </Text>
            {userId === profile?.id && isMute && (
              <VscMute className="min-w-[14px] text-primary" size={14} />
            )}
          </div>
          <div className="flex space-x-1">
            <Text size="xs" color="text-black-1100" font="font-light">
              {formatShortCount(members)}
            </Text>
            <Text size="xs" color="text-primary">
              members
            </Text>
          </div>
        </div>
      </div>
      <div>
        <div className="mr-4" onClick={(e) => e.stopPropagation()}>
          <JoinModal data={data} buttonSize="sm" />
        </div>
      </div>
    </div>
  );
}

export default JoinedCard;
