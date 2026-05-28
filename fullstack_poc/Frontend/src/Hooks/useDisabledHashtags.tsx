/**
 * useDisabledHashtags hook  const { loading, error, data } = useLazyQuery<HashtagData>(
    GET_DISABLED_HASHTAGS,
    {
      fetchPolicy: 'no-cache',
    },
  );f the provided value contains any disabled hashtags.
 * - It uses a lazy query to fetch disabled hashtags.
 * - It matches hashtags in the provided value and checks them against the disabled list.
 * - If a match is found, it triggers a flag (`setHasInvalidHashtag`) to indicate the presence of an invalid hashtag.
 * - If there is an error during fetching or matching, it reports via error notification or Sentry.
 */

import { useLazyQuery } from '@apollo/client/react';
import { useEffect } from 'react';

import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import { GET_DISABLED_HASHTAGS } from '@/service/graphql/Forum';

interface DisabledHashtags {
  value: string;
  setHasInvalidHashtag?: (value: boolean) => void;
}

interface Hashtag {
  hashtag_name: string;
}

interface HashtagData {
  hashtags: Hashtag[];
}

const useDisabledHashtags = ({
  value,
  setHasInvalidHashtag,
}: DisabledHashtags) => {
  const [
    getDisabledHashtags,
    { data: disabledHashtagsData, error: disabledHashtagsError },
  ] = useLazyQuery<HashtagData>(GET_DISABLED_HASHTAGS, {
    fetchPolicy: 'no-cache',
  });

  // Handle disabled hashtags error
  useEffect(() => {
    if (disabledHashtagsError) {
      emitErrorNotification(formatGraphqlError(disabledHashtagsError));
    }
  }, [disabledHashtagsError]);

  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        await getDisabledHashtags();
      } catch (err) {
        captureSentryException(err);
      }
    };

    fetchHashtags();
  }, [getDisabledHashtags]);

  useEffect(() => {
    if (disabledHashtagsData && (disabledHashtagsData as any).hashtags) {
      const disabledList = (disabledHashtagsData as any).hashtags.map(
        (tag: any) => tag.hashtag_name,
      );

      const hashtagMatches = value.match(/#\w+/g) || [];

      const foundInvalid = hashtagMatches.some((tag: string) =>
        disabledList.includes(tag.replace('#', '')),
      );

      if (setHasInvalidHashtag) {
        setHasInvalidHashtag(foundInvalid);
      }
    }
  }, [value, disabledHashtagsData, setHasInvalidHashtag]);

  return [];
};

export default useDisabledHashtags;
