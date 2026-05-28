import { useMutation } from '@apollo/client/react';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import OverviewCard from '@/components/pages/Campfire/CampfireTools/Overview/OverviewCard';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  FETCH_CAMPFIRE_INSIGHTS,
  FETCH_CAMPFIRE_USER_GROWTH,
} from '@/service/graphql/Campfire';
import { getUserToken } from '@/utils/verifyAuthentication';

interface IAnalytics {
  campfireId: string;
}

interface CampfireInsightsData {
  traffic: number;
  trafficPercent: number;
  uniqueUsers: number;
  uniqueUsersPercent: number;
  newUsers: number;
  newUsersPercent: number;
  leftUsers: number;
  leftUsersPercent: number;
}

interface UserGrowthData {
  maleUsersCount: number;
  femaleUsersCount: number;
  otherUsersCount: number;
  percentChange: number;
}

interface MutationResponse {
  fetchCampfireUsersInsight: {
    data: CampfireInsightsData;
  };
  fetchCampfireUserGrowth: {
    data: UserGrowthData;
  };
}

const Analytics = ({ campfireId }: IAnalytics) => {
  const [isDurationDropdown, setIsDurationDropdown] = useState<boolean>(false);
  const token = getUserToken();
  const [campfireInsightsData, setCampfireInsightsData] =
    useState<CampfireInsightsData | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData | null>(
    null,
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [campfireInsights, { loading }] = useMutation<MutationResponse>(
    FETCH_CAMPFIRE_INSIGHTS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (res) => {
        setCampfireInsightsData(res.fetchCampfireUsersInsight.data);
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [campfireUserGrowth, { loading: userGrowthLoading }] =
    useMutation<MutationResponse>(FETCH_CAMPFIRE_USER_GROWTH, {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (res) => {
        setUserGrowthData(res.fetchCampfireUserGrowth.data);
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    });

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    setIsDurationDropdown(false);
  };

  const formatDurationText = (duration: number) => {
    return duration === 365 ? 'Last 1 year' : `Last ${duration} days`;
  };

  useEffect(() => {
    if (selectedDuration) {
      campfireInsights({
        variables: {
          campfireId,
          duration: selectedDuration,
        },
      });
      campfireUserGrowth({
        variables: {
          campfireId,
          duration: selectedDuration,
        },
      });
    }
  }, [selectedDuration, campfireId, campfireInsights, campfireUserGrowth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDurationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <div className="mx-4 mt-4 flex items-center justify-between">
        <Text size="md" color="text-black" font="font-medium">
          Analytics
        </Text>
        <div ref={dropdownRef}>
          <div
            className="flex cursor-pointer items-center space-x-2 rounded-full border border-primary px-4 py-1 text-primary"
            onClick={() => setIsDurationDropdown(!isDurationDropdown)}
          >
            <Text size="base" color="text-primary">
              {formatDurationText(selectedDuration)}
            </Text>
            {isDurationDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
          {isDurationDropdown && (
            <div className="absolute z-10 mt-3 space-y-3 rounded-lg border border-primary bg-white py-2 pl-8 pr-2 text-right ">
              <div
                onClick={() => handleDurationChange(7)}
                className="cursor-pointer"
              >
                <Text size="base">Last 7 days</Text>
              </div>
              <div
                onClick={() => handleDurationChange(30)}
                className="cursor-pointer"
              >
                <Text size="base">Last 30 days</Text>
              </div>
              <div
                onClick={() => handleDurationChange(365)}
                className="cursor-pointer"
              >
                <Text size="base">Last year</Text>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading || userGrowthLoading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {campfireInsightsData && (
              <>
                <OverviewCard
                  title="Traffic on this campfire"
                  count={`${campfireInsightsData.traffic || 0}`}
                  description={`in ${formatDurationText(selectedDuration)}`}
                  change={`${campfireInsightsData.trafficPercent}%`}
                  bgColor="bg-blue-1200"
                />
                <OverviewCard
                  title="Unique Users"
                  count={`${campfireInsightsData.uniqueUsers || 0}`}
                  description={`in ${formatDurationText(selectedDuration)}`}
                  change={`${campfireInsightsData.uniqueUsersPercent}%`}
                  bgColor="bg-green-1000"
                />
                <OverviewCard
                  title="New members"
                  count={`${campfireInsightsData.newUsers || 0}`}
                  description={`in ${formatDurationText(selectedDuration)}`}
                  change={`${campfireInsightsData.newUsersPercent}%`}
                  bgColor="bg-green-1000"
                />
                <OverviewCard
                  title="Left members"
                  count={`${campfireInsightsData.leftUsers || 0}`}
                  description={`in ${formatDurationText(selectedDuration)}`}
                  change={`${campfireInsightsData.leftUsersPercent}%`}
                  bgColor="bg-green-1000"
                />
              </>
            )}
          </div>
          <div>
            {userGrowthData && (
              <OverviewCard
                title="User growth"
                maleCount={userGrowthData.maleUsersCount}
                femaleCount={userGrowthData.femaleUsersCount}
                othersCount={userGrowthData.otherUsersCount}
                description={`in ${formatDurationText(selectedDuration)}`}
                change={`${userGrowthData.percentChange}%`}
                bgColor="bg-green-1100"
                isUserGrowth
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Analytics;
