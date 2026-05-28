import { useRouter } from 'next/router';
import React, { useState } from 'react';

import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import Text from '@/elements/Text';
import appDayjs from '@/lib/appDayjs';
import { CampfireData } from '@/types/campfire';

export default function IsNotCampfireMember({
  campfireCard,
  campfireData,
}: {
  campfireCard: boolean;
  campfireData: CampfireData;
}) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/campfire/${encodeURIComponent(campfireData.title)}`);
  };

  const [toggleJoin, setToggleJoin] = useState(false);

  const [campfireMembers, setCampfireMembers] = useState<number>(
    campfireData?.noParticipants,
  );
  return (
    <div className="not-campfire-member" onClick={handleClick}>
      <div className="mb-3">
        <div className=" ">
          <Text font="font-bold">{campfireData?.title}</Text>
        </div>
        <div className="flex items-center py-0.5 gap-2">

          <Text size="sm" customClass='font-semibold'>
            {campfireMembers}
            <span> {campfireMembers > 1 ? 'Members' : 'Member'}</span>
          </Text>
          <div className="campfire-dot !ml-0"></div>
          <Text font="font-medium" size="xs">{campfireData?.category?.title}</Text>
        </div>
        <div className=" flex gap-1 items-center">
          <Text size="xs" color="text-gray-950">
            {campfireData?.noPosts.aggregate.count}
            <span>
              {' '}
              {campfireData?.noPosts.aggregate.count > 1 ? 'Posts' : 'Post'}
            </span>
          </Text>
          <div className="campfire-dot opacity-25 !ml-0"></div>
          {campfireCard && (
            <div className="py-0.5">
              <Text size="xs" color="text-gray-950">
                Created on{' '}
                {appDayjs(campfireData?.createdAt).format('D MMM YYYY')}{' '}
              </Text>
            </div>
          )}
        </div>
      </div>
      <div
        className="pointer-events-auto pt-1"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <JoinModal
          data={campfireData}
          setToggleJoin={setToggleJoin}
          toggleJoin={toggleJoin}
          setCampfireMembers={setCampfireMembers}
          buttonSize="md"
        />
      </div>
    </div>
  );
}
