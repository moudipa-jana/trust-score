import React, { useState } from 'react';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { CampfireDetails } from '@/types/campfire';

interface ICapmfireModalOthers {
  data: CampfireDetails;
  handleJoin: () => void;
  handleJoinClick: (e: React.MouseEvent<HTMLElement>) => void;
  joinButtonText?: string;
}
export default function CapmfireModalOther({
  handleJoin,
  data,
  handleJoinClick,
  joinButtonText,
}: ICapmfireModalOthers) {
  const [member, setMember] = useState(false);
  return (
    <div className="sm-container ">
      <div className="xl:p-10">
        <div className="justify-between lg:flex">
          <div className="flex flex-wrap items-center">
            <div className="relative col-span-1 mt-4 mr-2 h-24 w-24 place-items-center rounded-full">
              <CustomImage
                src={getDefaultCampfireImage(data?.picture)}
                width={50}
                height={50}
                alt="campfire profile img"
              ></CustomImage>
            </div>
            <div className="relative pt-4 pl-2">
              <div className="flex items-center xl:mt-4">
                <Text font="font-bold" size="base">
                  {data?.title}
                </Text>
                <div className="ml-1 lg:ml-2">
                  <Text size="base">{data?.category?.title || ''}</Text>
                </div>
              </div>
              <Text size="base">Contributor</Text>
              <Text size="base">
                {data?.noParticipants || 1}
                <span
                  className=" ml-0.5 cursor-pointer text-primary"
                  onClick={() => setMember(!member)}
                >
                  Members
                </span>
              </Text>
            </div>
          </div>
        </div>
        <div className="relative py-4">
          <Text size="base">About</Text>
          <div className="">
            <Text size="sm">{data?.description || ''}</Text>
          </div>
        </div>
        <Button
          block
          onClick={
            joinButtonText && joinButtonText === 'Requested'
              ? handleJoinClick
              : handleJoin
          }
          type={
            joinButtonText && joinButtonText === 'Requested'
              ? 'secondary'
              : 'primary'
          }
        >
          {joinButtonText && joinButtonText === 'Requested'
            ? 'Requested'
            : 'Join'}
        </Button>
      </div>
    </div>
  );
}
