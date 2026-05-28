import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import ActionLog from '@/components/pages/Campfire/CampfireTools/Moderations/ActionLog';
import ContentControl from '@/components/pages/Campfire/CampfireTools/Moderations/ContentControl';
import PrivacyAndSecurity from '@/components/pages/Campfire/CampfireTools/Moderations/PrivacyAndSecurity';
import RulesAndRemoval from '@/components/pages/Campfire/CampfireTools/Moderations/RulesAndRemoval';
import DetailsAboutPosts from '@/components/pages/Campfire/CampfireTools/Overview/DetailsAboutPosts';
import Insights from '@/components/pages/Campfire/CampfireTools/Overview/Insights';
import UserManagement from '@/components/pages/Campfire/CampfireTools/Overview/UserManagement';
import GeneralSettings from '@/components/pages/Campfire/CampfireTools/Settings/GeneralSettings';
import PostsAndComments from '@/components/pages/Campfire/CampfireTools/Settings/PostsAndComments';
import { CAMPFIRE_TOOLS_CATEGORIES } from '@/components/pages/Campfire/Constant';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import useIsipad from '@/Hooks/useIsIpad';

interface ICampfireTools {
  campfireId: string;
  isCustomize: boolean;
  setIsCustomize: Dispatch<SetStateAction<boolean>>;
  refetchMembersList?: () => void;
}

export default function CampfireTools({
  campfireId,
  isCustomize,
  setIsCustomize,
  refetchMembersList,
}: ICampfireTools) {
  const isIpad = useIsipad();

  const [selectedItem, setSelectedItem] = useState<{
    itemName: string;
  }>(() => {
    if (isCustomize) {
      return { itemName: 'General settings' };
    } else {
      return { itemName: 'Details about posts' };
    }
  });

  const showContent = (itemName: string) => {
    setSelectedItem({ itemName });
    if (itemName !== 'General settings') {
      setIsCustomize(false);
    }
  };

  useEffect(() => {
    if (isCustomize) {
      setSelectedItem({ itemName: 'General settings' });
    }
  }, [isCustomize]);

  const router = useRouter();

  useEffect(() => {
    if (selectedItem?.itemName === 'Help') {
      router.push('/help-support');
    }
  }, [selectedItem, router]);

  return (
    <div className="m-2 flex h-full mb-10 ">
      {/* Sidebar */}
      <div className="h-full w-1/4 flex-shrink-0 rounded-md">
        {CAMPFIRE_TOOLS_CATEGORIES.map((category) => (
          <div
            key={category?.name}
            className={`mb-5 rounded-md bg-skyBlue-700 text-skyBlue-200 ${
              isIpad ? 'p-2' : 'p-4'
            }`}
          >
            <Text color="text-black" font="font-semibold" customClass="mb-2">
              {category?.name}
            </Text>
            <ul className="mb-2">
              {category?.items.map((item) => (
                <li key={item?.name}>
                  <a
                    href="#"
                    className={`flex items-center p-2 text-sm hover:rounded-md hover:bg-white hover:text-gray-700 ${
                      selectedItem?.itemName === item?.name
                        ? 'rounded-md bg-white text-gray-700'
                        : ''
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      showContent(item?.name);
                    }}
                  >
                    <div className="mr-2 h-5 w-5">
                      <CustomImage src={item?.icon} width={2} height={2} />
                    </div>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="ml-5 h-full w-3/4 flex-grow rounded-lg border border-skyBlue-200 p-2 !mb-10">
        {selectedItem && (
          <div className="block h-full">
            {/* Overview */}
            {selectedItem?.itemName === 'Details about posts' && (
              <DetailsAboutPosts campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'User management' && (
              <UserManagement
                campfireId={campfireId}
                onMembersChanged={refetchMembersList}
              />
            )}
            {selectedItem?.itemName === 'Insights' && (
              <Insights campfireId={campfireId} />
            )}

            {/* Moderations */}
            {selectedItem?.itemName === 'Rules and removal' && (
              <RulesAndRemoval campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'Content controls' && (
              <ContentControl campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'Action log' && (
              <ActionLog campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'Privacy & Security' && (
              <PrivacyAndSecurity campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'General settings' && (
              <GeneralSettings campfireId={campfireId} />
            )}
            {selectedItem?.itemName === 'Posts and comments' && (
              <PostsAndComments campfireId={campfireId} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
