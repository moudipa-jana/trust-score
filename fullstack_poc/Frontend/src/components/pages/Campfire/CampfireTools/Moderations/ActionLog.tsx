import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { FETCH_CAMPFIRE_ACTION_LOG } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface IActionLog {
  campfireId: string;
}

interface ActionLogItem {
  id: string;
  created_at: string;
  action: string;
  reason: string | null;
  user_name: string | null;
  user_profile_picture: string | null;
}

interface DateTimeFormatOptions {
  hour: '2-digit';
  minute: '2-digit';
  hour12: boolean;
}

interface DateFormatOptions {
  day: '2-digit';
  month: 'short';
  year: 'numeric';
}

export default function ActionLog({ campfireId }: IActionLog) {
  const token = useAppSelector(selectGetToken);
  const [actionLogData, setActionLogData] = useState<ActionLogItem[]>([]);
  const isMobile = useIsMobile();

  const { loading, error, data } = useQuery(FETCH_CAMPFIRE_ACTION_LOG, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireId,
    },
  });

  // Handle query completion
  useEffect(() => {
    if ((data as any)?.campfire_admin_actions) {
      setActionLogData((data as any).campfire_admin_actions);
    }
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeOptions: DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const dateOptions: DateFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    const timePart = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
    const datePart = new Intl.DateTimeFormat('en-US', dateOptions).format(date);

    return `${timePart} on ${datePart}`;
  };

  return (
    <div>
      <div className="ml-4">
        <Text size="md" color="text-black" font="font-medium">
          Action log
        </Text>
      </div>
      {loading ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader
            style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
          />
        </div>
      ) : isEmpty(actionLogData) || error ? (
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            Nothing to see here
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-blue-1250">
                <th className="py-4 px-4 text-left text-sm text-black-900">
                  Time
                </th>
                <th className="py-4 px-4 text-left text-sm text-black-900">
                  Admin
                </th>
                <th className="py-4 px-4 text-left text-sm text-black-900">
                  Action
                </th>
                <th className="py-4 px-4 text-left text-sm text-black-900">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {actionLogData &&
                actionLogData.map((action: ActionLogItem, index: number) => (
                  <tr
                    key={action.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-white-1100'}
                  >
                    <td className="py-4 px-4 text-xs text-gray-50">
                      {formatDate(action.created_at)}
                    </td>
                    <td className="py-4 px-4 text-xs text-primary">
                      <div className="flex items-center">
                        <div className="mr-1 h-5 w-5">
                          <CustomImage
                            src={
                              action?.user_profile_picture ??
                              '/images/userImage.svg'
                            }
                            fallbackSrc="/images/userImage.svg"
                            fill
                          />
                        </div>
                        {action?.user_name ?? 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-primary">
                      {action.action}
                    </td>
                    <td className="max-w-xs py-4 px-4 text-xs text-gray-1250">
                      {action.reason ?? 'N/A'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
