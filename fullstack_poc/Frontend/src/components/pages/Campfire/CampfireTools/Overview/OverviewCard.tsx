import React from 'react';
import { IoIosArrowRoundUp } from 'react-icons/io';

import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';

interface IOverviewCardprops {
  count?: string;
  title: string;
  description: string;
  change?: string;
  bgColor: string;
  isUserGrowth?: boolean;
  maleCount?: number;
  femaleCount?: number;
  othersCount?: number;
}

const OverviewCard = ({
  count,
  title,
  description,
  change,
  bgColor,
  isUserGrowth,
  maleCount,
  femaleCount,
  othersCount,
}: IOverviewCardprops) => {
  const isDesktop = useIsDesktop();
  const formatChange = (changePercent: string) => {
    if (changePercent) {
      const parsedChange = parseFloat(changePercent);
      return parsedChange.toFixed(2);
    }
    return change;
  };

  return (
    <div className="mt-6 ml-3">
      <div
        className={`relative px-2 py-3 ${bgColor} ${
          isUserGrowth && isDesktop ? 'w-[360px]' : isUserGrowth ? 'w-full' : ''
        }`}
      >
        {!isUserGrowth && (
          <div className="flex space-x-2">
            <Text size="xl" color="text-gray-2000" font="font-semibold">
              {count}
            </Text>
            <div className="mt-5">
              <Text size="sm" color="text-gray-2000" font="font-medium">
                users
              </Text>
            </div>
          </div>
        )}

        <div>
          <Text size={isUserGrowth ? 'xl' : 'sm'} color="text-black-1350">
            {title}
          </Text>
          {isUserGrowth && (
            <div className="mt-2 flex space-x-6">
              <Text size="sm" color="text-gray-2000">
                {maleCount}
                <span className="ml-1 font-semibold">male</span>
              </Text>
              <Text size="sm" color="text-gray-2000">
                {femaleCount}
                <span className="ml-1 font-semibold">female</span>
              </Text>
              <Text size="sm" color="text-gray-2000">
                {othersCount}
                <span className="ml-1 font-semibold">others</span>
              </Text>
            </div>
          )}
          <Text size="xxs" color="text-gray-2000">
            {description}
          </Text>
        </div>
        {change && parseFloat(change) > 0 && (
          <div className="absolute top-2 right-1 flex items-center space-x-1 bg-green-900 px-1 py-0.5">
            <Text color="text-white" size="xxs">
              {formatChange(change)}%
            </Text>
            <IoIosArrowRoundUp color="white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewCard;
