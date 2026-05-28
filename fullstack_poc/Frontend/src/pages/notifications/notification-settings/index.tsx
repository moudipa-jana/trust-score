{
  /**
   * `NotificationSettings` handles fetching, displaying, and updating user notification preferences.
   * - Uses GraphQL queries to fetch notification settings from the backend.
   * - Allows users to toggle their preferences for different notification categories (Activity, Recommendations, Campfire).
   * - Uses mutations to update the user's notification preferences on the server.
   * - Provides an option to navigate to the Campfire alerts settings when toggled.
   **/
}

import { useMutation, useQuery } from '@apollo/client/react';
import React, { useEffect, useRef, useState } from 'react';

import SettingsInfo from '/public/images/SettingsInfo.svg';
import SettingsLeftArrow from '/public/images/SettingsLeftArrow.svg';
import SettingsRightArrow from '/public/images/SettingsRightArrow.svg';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CampfireAlerts from '@/components/pages/Notifications/CampfireSettings';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Text from '@/elements/Text';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import {
  GET_NOTIFICATION_SETTINGS_TYPES,
  UPDATE_USER_PREFERENCES,
} from '@/service/graphql/Notifications';
import { getUserId } from '@/state/Slices/auth';
import type { MenuItem } from '@/types/menu';
import { getUserToken } from '@/utils/verifyAuthentication';

interface user_preferences_item {
  isEnabled: boolean;
  notification_type: { type: string };
}

interface NotificationType {
  user_preferences: user_preferences_item[];
}

interface CategoryItem {
  notificationTypeId: string;
  name: string;
  category: string;
  notification_type: NotificationType;
}

interface Category {
  name: string;
  items: CategoryItem[];
}

interface NotificationSettingsProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

const token = getUserToken();

function NotificationSettings({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: NotificationSettingsProps) {
  const userId = useAppSelector(getUserId);
  const [showCampfireAlerts, setShowCampfireAlerts] = useState(
    localStorage.getItem('showCampfireAlerts') === 'true',
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isIpad = useIsipad();

  const { data, loading, error, refetch } = useQuery(
    GET_NOTIFICATION_SETTINGS_TYPES,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      variables: {
        userId,
      },
    },
  );

  const categories: { [key: string]: Category['items'] } = {
    Activity: [],
    Recommendations: [],
    Campfire: [],
  };

  if (data && (data as any)?.notification_settings) {
    (data as any)?.notification_settings.forEach((setting: CategoryItem) => {
      if (categories[setting?.category]) {
        categories[setting.category].push(setting);
      }
    });
  }

  const orderedCategories = [
    { name: 'Activity', items: categories.Activity },
    { name: 'Recommendations', items: categories.Recommendations },
    { name: 'Campfire', items: categories.Campfire },
  ];

  const [updateUserPreferences] = useMutation(UPDATE_USER_PREFERENCES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      refetch();
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const toggleItem = (index: number, idx: number, item: CategoryItem) => {
    if (token) {
      updateUserPreferences({
        variables: {
          notificationId: item.notificationTypeId,
          isEnabled: !item.notification_type.user_preferences[0]?.isEnabled,
          userId,
        },
      });
    } else {
      emitErrorNotification('Login to update prefernces');
    }
  };

  useEffect(() => {
    return () => localStorage.removeItem('toggleStates');
  }, []);

  useEffect(() => {
    if (showCampfireAlerts && contentRef.current) {
      contentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [showCampfireAlerts]);

  useEffect(() => {
    localStorage.setItem('showCampfireAlerts', String(showCampfireAlerts));
    if (showCampfireAlerts) {
      window.scrollTo(0, 0);
    }
  }, [showCampfireAlerts]);

  return (
    <PageBase
      title="Notifications"
      description="View and manage your notifications"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      {!data && loading ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader
            style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
          />
        </div>
      ) : error ? (
        <NotFoundComponent
          showRedirect
          errorMessage="Oops! We couldn't find notification settings"
        />
      ) : (
        <div
          className={`mx-auto mb-10 flex h-full w-3/4 flex-col rounded-md bg-gray-100 ${isMobile ? 'w-full pt-3' : isIpad ? 'w-11/12 pt-5' : 'w-3/4 p-10'
            }`}
        >
          {showCampfireAlerts && (
            <div
              className={`mr-2 ${isMobile
                ? 'ml-4 h-3 w-3'
                : isIpad
                  ? 'ml-6 h-4 w-4'
                  : 'h-6 w-6 pt-10'
                } cursor-pointer `}
              onClick={() => setShowCampfireAlerts(false)}
            >
              <CustomImage src={SettingsLeftArrow} />
            </div>
          )}
          <div
            className={`mx-auto  items-center justify-between ${isMobile ? 'w-11/12' : isIpad ? 'w-11/12' : 'w-3/4'
              }`}
            ref={contentRef}
          >
            <div className="mb-4 flex items-center">
              <Text
                size={isMobile ? 'sm' : 'lg'}
                color="text-blue"
                font="font-semibold"
              >
                Notification settings
              </Text>
            </div>

            {showCampfireAlerts ? (
              <CampfireAlerts />
            ) : (
              <div>
                {orderedCategories.map((category, index) => (
                  <div key={index} className="mb-5 rounded-md bg-white p-3">
                    <div className={`${isMobile ? null : 'mx-4'}`}>
                      <Text size={isMobile ? 'sm' : 'lg'} font="font-thin">
                        {category?.name}
                      </Text>
                    </div>
                    <ul className={`${isMobile ? null : 'ml-4'}  list-disc`}>
                      {category?.name === 'Campfire' && (
                        <li className="my-5 flex flex-col items-start">
                          <div className="flex w-full items-center justify-between">
                            <Text
                              size={isMobile ? 'xs' : 'sm'}
                              color="text-black"
                            >
                              Campfire alerts
                            </Text>

                            <div
                              className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'
                                } mr-3 cursor-pointer`}
                              onClick={() => setShowCampfireAlerts(true)}
                            >
                              <CustomImage src={SettingsRightArrow} />
                            </div>
                          </div>
                        </li>
                      )}
                      {category.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="my-5 flex flex-col items-start"
                        >
                          <div className="flex w-full items-center justify-between">
                            <Text
                              size={isMobile ? 'xs' : 'sm'}
                              color="text-black"
                            >
                              {item.name}
                            </Text>
                            <label className="mx-2 inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={
                                  item?.notification_type?.user_preferences[0]
                                    ?.isEnabled || false
                                }
                                onChange={() => toggleItem(index, idx, item)}
                              />
                              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
                            </label>
                          </div>
                          {item.name === 'Featured content' && (
                            <div className="flex flex-row">
                              <div className="mr-1 h-4 w-4">
                                <CustomImage src={SettingsInfo} />
                              </div>
                              <Text
                                size={isMobile ? 'xxs' : 'xs'}
                                color="text-gray-500"
                                customClass="mt-1"
                              >
                                Get notified when we post blogs and videos of
                                your areas of interest
                              </Text>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});

export default NotificationSettings;
