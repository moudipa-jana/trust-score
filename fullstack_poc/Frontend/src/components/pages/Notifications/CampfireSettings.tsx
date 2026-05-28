import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import RenderItem from '@/components/pages/Notifications/CampfireItem';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  capitalizeFirstLetter,
  emitErrorNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { GET_CAMPFIRE_ALERTS } from '@/service/graphql/Notifications';
import { getUserId } from '@/state/Slices/auth';
import { getUserToken } from '@/utils/verifyAuthentication';

interface SelectedOptions {
  [key: string]: string;
}

interface CampfireAlert {
  campfireId: string;
  preference: string;
  campfire: {
    title: string;
    picture?: string;
    category?: {
      slug: string;
    };
  };
}

interface CampfireAlertsResponse {
  campfire_alerts: CampfireAlert[];
}

function CampfireAlerts() {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const token = getUserToken();
  const userId = useAppSelector(getUserId);
  const [campfireAlerts, setCampfireAlerts] = useState<CampfireAlert[]>([]);

  const { loading, error, data } = useQuery<CampfireAlertsResponse>(
    GET_CAMPFIRE_ALERTS,
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

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setCampfireAlerts(data?.campfire_alerts || []);
      setSelectedOptions(
        data?.campfire_alerts.reduce(
          (acc: SelectedOptions, item: CampfireAlert) => ({
            ...acc,
            [item.campfireId]: capitalizeFirstLetter(item.preference),
          }),
          {},
        ),
      );
    }
  }, [data]);

  return (
    <div>
      {loading ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader
            style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
          />
        </div>
      ) : error || isEmpty(campfireAlerts) ? (
        <NotFoundComponent
          showRedirect
          errorMessage="Oops! We couldn't find campfire alert settings"
        />
      ) : (
        <div className="mb-5 w-full rounded-md bg-white pb-3">
          <div className="p-4">
            <Text size={isMobile ? 'sm' : 'lg'} font="font-thin">
              Campfire {'>'} Campfire Alerts
            </Text>
          </div>

          {campfireAlerts?.map((item: CampfireAlert, index: number) => {
            return (
              <RenderItem
                key={item.campfireId}
                data={item}
                index={index}
                dropdownRef={dropdownRef}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CampfireAlerts;
