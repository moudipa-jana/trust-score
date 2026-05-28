/**
 * useContentControl hook handles content control for posts within a campfire.
 * - Fetches content control data for the campfire from GraphQL.
 * - Tracks banned content settings for title, body, and domain.
 * - Provides a function `matchesAnyBannedWord` to check if the content contains banned words based on the settings.
 * - Returns the error and the matching function.
 */

import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { useAppSelector } from '@/Hooks/useRedux';
import { FETCH_CONTENT_CONTROL_DATA } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { getCampfireId, getPostCampfireId } from '@/state/Slices/campfire';

export function useContentControl() {
  const token = useAppSelector(selectGetToken);
  const campfireId = useAppSelector(getCampfireId);
  const postCampfireId = useAppSelector(getPostCampfireId);

  const [toggleBannedTitle, setToggleBannedTitle] = useState(false);
  const [toggleBannedBody, setToggleBannedBody] = useState(false);
  const [toggleBannedDomain, setToggleBannedDomain] = useState(false);

  const { error, data: contentControlData } = useQuery(
    FETCH_CONTENT_CONTROL_DATA,
    {
      context: { headers: { Authorization: `Bearer ${token}` } },
      fetchPolicy: 'no-cache',
      variables: { id: postCampfireId || campfireId },
      skip:
        !(postCampfireId || campfireId) ||
        (postCampfireId === '' && campfireId === '') ||
        token === '',
    },
  );

  // Handle content control data
  useEffect(() => {
    if (contentControlData) {
      const response = contentControlData as any;
      if (response?.campfires_by_pk) {
        setToggleBannedTitle(response.campfires_by_pk.iswordsbaninposttitle);
        setToggleBannedBody(response.campfires_by_pk.iswordsbaninpostbody);
        setToggleBannedDomain(response.campfires_by_pk.isDomainBanned);
      }
    }
  }, [contentControlData]);

  function matchesAnyBannedWord(
    str: string,
    bannedList: string[],
    type: 'title' | 'body' | 'domain',
  ) {
    const lowerCaseBannedList = bannedList.map((word) => word.toLowerCase());

    if (
      (type === 'title' && !toggleBannedTitle) ||
      (type === 'body' && !toggleBannedBody) ||
      (type === 'domain' && !toggleBannedDomain)
    ) {
      return false;
    }

    // Use word boundary regex to match complete words only, similar to LinkifyText
    return lowerCaseBannedList.some((bannedWord) => {
      const wordRegex = new RegExp(
        `\\b${bannedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'i',
      );
      return wordRegex.test(str);
    });
  }

  return {
    error,
    matchesAnyBannedWord,
  };
}

export default useContentControl;
