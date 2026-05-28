import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import Checkbox from 'react-custom-checkbox';
import * as Icon from 'react-icons/fi';

import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  EXCLUDE_CONTENT_BY_BLOCKED_USER,
  GET_PRIVACY_SECURITY,
  UPDATE_RECOMMENDATIONS,
} from '@/service/graphql/Campfire';
import { getUserToken } from '@/utils/verifyAuthentication';

interface ICampfirePrivacySecurity {
  campfireId: string;
}

export default function PrivacyAndSecurity({
  campfireId,
}: ICampfirePrivacySecurity) {
  const isMobile = useIsMobile();
  const token = getUserToken();
  const [recommendedData, setRecommendedData] = useState('');
  const [isExcluded, setIsExcluded] = useState(false);

  const { data: privacySecurityData } = useQuery(GET_PRIVACY_SECURITY, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfire_id: campfireId,
    },
    skip: token === '',
  });

  // Handle privacy security data completion
  useEffect(() => {
    if ((privacySecurityData as any)?.campfires?.[0]) {
      setIsExcluded(
        (privacySecurityData as any)?.campfires[0]
          ?.exclude_content_by_blocked_user,
      );
      setRecommendedData(
        (privacySecurityData as any)?.campfires[0]?.recommendation,
      );
    }
  }, [privacySecurityData]);

  const [toggleExcludeContentByBlockedUser] = useMutation(
    EXCLUDE_CONTENT_BY_BLOCKED_USER,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        setIsExcluded(
          (response as any)?.update_campfires_by_pk
            ?.exclude_content_by_blocked_user,
        );
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [updateRecommendations] = useMutation(UPDATE_RECOMMENDATIONS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleToggle = () => {
    toggleExcludeContentByBlockedUser({
      variables: {
        id: campfireId,
        exclude_content_by_blocked_user: !isExcluded,
      },
    });
  };

  const handleRecommendations = (recommendation: string) => {
    setRecommendedData(recommendation);
    updateRecommendations({
      variables: {
        id: campfireId,
        recommendation,
      },
    });
  };

  return (
    <div className="p-3">
      <div className="mb-5">
        <Text font="font-semibold">Safety Tools</Text>
      </div>

      <div className="mb-5 flex flex-row justify-between">
        <div>
          <Text>Exclude content by blocked user</Text>
          <Text size="sm" color="text-gray-500">
            Posts/content are excluded from blocked user
          </Text>
        </div>

        <div>
          <label className="mx-2 my-3 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isExcluded}
              onChange={() => handleToggle()}
            />
            <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>
      </div>

      <div>
        <Text>Get recommended to users</Text>
        <div className="mb-1 w-3/4">
          <Text size="sm" color="text-gray-500">
            Get recommended to new and old users who show interest in topics
            related to your campfire during onboarding or every user on the
            platform.
          </Text>
        </div>

        <div>
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={recommendedData === 'all'}
                onChange={() => handleRecommendations('all')}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />
              <span className="ml-2 text-sm">All</span>
            </label>
          </div>

          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={recommendedData === 'new'}
                onChange={() => handleRecommendations('new')}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />
              <span className="ml-2 text-sm">All new users</span>
            </label>
          </div>

          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={recommendedData === 'similar_category'}
                onChange={() => handleRecommendations('similar_category')}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />
              <span className="ml-2 text-sm">
                Users who are interested in similar categories
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
