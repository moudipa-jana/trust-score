import { useState } from 'react';

import DeletedPosts from '@/components/pages/Campfire/CampfireTools/Overview/DeletedPosts';
import LivePosts from '@/components/pages/Campfire/CampfireTools/Overview/LivePosts';
import ReportedPosts from '@/components/pages/Campfire/CampfireTools/Overview/ReportedPosts';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';

const tabs = {
  live: 'livePosts',
  reported: 'reportedPosts',
  deleted: 'deletedPosts',
};

const overviewTabs = [
  { id: tabs.live, label: 'Live Posts', component: LivePosts },
  { id: tabs.reported, label: 'Reported Posts', component: ReportedPosts },
  { id: tabs.deleted, label: 'Deleted Posts', component: DeletedPosts },
];

interface ICampfirePosts {
  campfireId: string;
}

export default function DetailsAboutPosts({ campfireId }: ICampfirePosts) {
  const [activeTab, setActiveTab] = useState(tabs.live);
  const activeTabConfig = overviewTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabConfig
    ? activeTabConfig.component
    : () => null;
  const isDesktop = useIsDesktop();

  return (
    <div className="sm-container">
      <div
        className={`flex items-center space-x-6 pt-8 ${
          isDesktop ? 'pb-4' : ''
        }`}
      >
        {overviewTabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${
              activeTab === tab.id
                ? 'rounded-full bg-gray-1800 py-1 px-3 lg:py-1 lg:px-4'
                : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Text
              color={activeTab === tab.id ? 'text-gray-1600' : 'text-primary'}
              size="base"
            >
              {tab.label}
            </Text>
          </div>
        ))}
      </div>
      <div>
        <ActiveComponent campfireId={campfireId} />
      </div>
    </div>
  );
}
