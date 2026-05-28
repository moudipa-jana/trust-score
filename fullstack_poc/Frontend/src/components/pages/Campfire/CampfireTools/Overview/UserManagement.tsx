import { useState } from 'react';

import Admins from '@/components/pages/Campfire/CampfireTools/Overview/Admins';
import BlockedUsers from '@/components/pages/Campfire/CampfireTools/Overview/BlockedUsers';
import Members from '@/components/pages/Campfire/CampfireTools/Overview/Members';
import RemovedUsers from '@/components/pages/Campfire/CampfireTools/Overview/RemovedUsers';
import Text from '@/elements/Text';

const tabs = {
  blocked: 'blockedUsers',
  removed: 'removedUsers',
  members: 'members',
  admin: 'admin',
};

const overviewTabs = [
  { id: tabs.blocked, label: 'Blocked users', component: BlockedUsers },
  { id: tabs.removed, label: 'Removed users', component: RemovedUsers },
  { id: tabs.members, label: 'Members', component: Members },
  { id: tabs.admin, label: 'Admins', component: Admins },
];

interface ICampfireManagement {
  campfireId: string;
  onMembersChanged?: () => void;
}

export default function UserManagement({
  campfireId,
  onMembersChanged,
}: ICampfireManagement) {
  const [activeTab, setActiveTab] = useState(tabs.blocked);
  const activeTabConfig = overviewTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabConfig
    ? activeTabConfig.component
    : () => null;

  return (
    <div className="sm-container">
      <div className="flex items-center space-x-6 pt-8 pb-4">
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
        <ActiveComponent campfireId={campfireId} onMembersChanged={onMembersChanged} />
      </div>
    </div>
  );
}
