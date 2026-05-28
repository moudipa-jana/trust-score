import { useState } from 'react';

import Analytics from '@/components/pages/Campfire/CampfireTools/Overview/Analytics';
import GraphData from '@/components/pages/Campfire/CampfireTools/Overview/GraphData';
import PostsWithinCampfire from '@/components/pages/Campfire/CampfireTools/Overview/PostsWithinCampfire';
import Map from '@/components/Utility/Map';
import Text from '@/elements/Text';

interface ICampfireInsights {
  campfireId: string;
}

export default function Insights({ campfireId }: ICampfireInsights) {
  const [isOverview, setIsOverview] = useState<boolean>(true);
  const [isPosts, setIsPosts] = useState<boolean>(false);

  return (
    <div>
      <div className="mt-4 ml-4 flex items-center space-x-4">
        <div
          className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${
            isOverview
              ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
              : ''
          }`}
          onClick={() => {
            setIsOverview(true);
            setIsPosts(false);
          }}
        >
          <Text
            color={`${isOverview ? 'text-gray-1600' : 'text-primary'}`}
            size="base"
          >
            Overview
          </Text>
        </div>
        <div
          className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${
            isPosts ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4' : ''
          }`}
          onClick={() => {
            setIsPosts(true);
            setIsOverview(false);
          }}
        >
          <Text
            color={`${isPosts ? 'text-gray-1600' : 'text-primary'}`}
            size="base"
          >
            Posts within campfire
          </Text>
        </div>
      </div>
      <div className="">
        {isOverview && (
          <div>
            <Analytics campfireId={campfireId} />
            <GraphData campfireId={campfireId} />
            <div className="mt-18 ml-4">
              <div className="flex justify-between">
                <Text size="md" font="font-medium">
                  Traffic in different countries
                </Text>
                <div className="mr-8 mt-8 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-purple-300"></div>
                    <Text size="3xl">Mostly used in</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-1300"></div>
                    <Text size="3xl">Mild traffic</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-green-1250"></div>
                    <Text size="3xl">Low traffic</Text>
                  </div>
                </div>
              </div>
              <div className="mt-[-100px]">
                <Map campfireId={campfireId} />
              </div>
            </div>
          </div>
        )}

        {isPosts && (
          <div>
            <PostsWithinCampfire campfireId={campfireId} />
          </div>
        )}
      </div>
    </div>
  );
}
