import { useState } from 'react';

import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { CampfireDetails } from '@/types/campfire';

export interface IjoinCampfireCard {
  title: string;
  details: string;
  Participants: number;
  data?: CampfireDetails;
}

export default function JoinCapmfireCard({
  title,
  details,
  Participants,
  data,
}: IjoinCampfireCard) {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="text-center flex flex-col flex-1 pt-4">
      <div className="cursor-pointer flex flex-col flex-1">
        <div
          className="h-fit flex-shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Heading priority={5} variant="sm" color="text-black-950" customClass="break-words">
            <span className="font-display">
              {title.length > 32 && !isHovered
                ? title.substring(0, 32) + '...'
                : isHovered
                  ? title
                  : title}
            </span>
          </Heading>
        </div>
        <div className="py-2 flex-grow">
          <Text size="sm" color="text-gray-50 ">
            <span className="line-clamp-4 text-left">{details}</span>
          </Text>
        </div>
        <div className="mt-auto">
          <span className="text-gray-500">.....</span>
        </div>
        <div className="pt-2">
          <Text size="xs" color="text-gray-50">
            {Participants} Participants
          </Text>
        </div>
      </div>
      <div className="flex items-center justify-center pt-4 mt-auto">
        <JoinModal data={data as CampfireDetails} />
      </div>
    </div>
  );
}
