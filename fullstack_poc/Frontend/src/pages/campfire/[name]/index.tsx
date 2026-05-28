{
  /**
   * This component manages the Campfire page where users can:
   * - View campfire details.
   * - Search for members within the campfire.
   * - Handle errors and loading states.
   * - Manage access control, including blocked users.
   **/
}

import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CampfireDetail from '@/components/pages/Campfire/CampfireDetail';
import BackToTop from '@/components/Utility/BackToTop';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import {
  ADD_CAMPFIRE_VISIT,
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
  QUERY_FETCH_CAMPFIRE_DETAILS,
  QUERY_GET_CAMPFIRE_MEMBER,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  campfireFetchSuccess,
  campfireMemberFetchSuccess,
  getCampfireId,
  getCampfireSearch,
  getIsCampfirePeopleSearch,
  resetBannedData,
  setBannedData,
  setCampfireSearch,
} from '@/state/Slices/campfire';
import { resetOpenComment } from '@/state/Slices/comments';
import { toggleCampfirePage } from '@/state/Slices/dialog';
import type { MenuItem } from '@/types/menu';

interface CampfireProps {
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

export default function Campfire({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: CampfireProps) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const router = useRouter();
  const campfireName = Array.isArray(router?.query?.name)
    ? decodeURIComponent(router?.query?.name[0])
    : decodeURIComponent(router?.query?.name as string);
  const [membersList, setmembersList] = useState('');
  const [bannedDataFetched, setBannedDataFetched] = useState(false);
  const userId = useAppSelector(getUserId);
  const campfireId = useAppSelector(getCampfireId);
  const campfireSearch = useAppSelector(getCampfireSearch);
  const isCampfirePeopleSearch = useAppSelector(getIsCampfirePeopleSearch);
  const campfireData = useAppSelector(
    (state) => state.campfire.campfireDetails,
  );

  const [addCampfireVisit] = useMutation(ADD_CAMPFIRE_VISIT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Fetch banned words and domains for the current campfire
  const [fetchBannedTitle] = useLazyQuery(FETCH_BANNED_WORDS, {
    fetchPolicy: 'no-cache',
  });

  const [fetchBannedBody] = useLazyQuery(FETCH_BANNED_WORDS, {
    fetchPolicy: 'no-cache',
  });

  const [fetchBannedDomains] = useLazyQuery(FETCH_BANNED_DOMAINS, {
    fetchPolicy: 'no-cache',
  });

  const [campfireMember, campfireMemberResult] = useLazyQuery(
    QUERY_GET_CAMPFIRE_MEMBER,
    {
      fetchPolicy: 'network-only',
    },
  );

  const {
    loading,
    error,
    data: campfireQueryData,
  } = useQuery(QUERY_FETCH_CAMPFIRE_DETAILS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireName,
      userId,
    },
    skip: token === '',
  });

  // Handle campfire query completion
  useEffect(() => {
    if (campfireQueryData) {
      const campfireDetails = (campfireQueryData as any)?.campfires[0];
      dispatch(campfireFetchSuccess(campfireDetails));
      if (token !== '') {
        campfireMember({
          variables: {
            campfireId: campfireDetails?.id,
            search: campfireSearch ? `%${campfireSearch}%` : '%%',
          },
          context: {
            headers: {
              Authorization: token ? `Bearer ${token}` : {},
            },
          },
        });
      }
    }
  }, [campfireQueryData, dispatch, campfireMember, token, campfireSearch]);

  // Handle campfire member response
  useEffect(() => {
    if (campfireMemberResult.data) {
      dispatch(
        campfireMemberFetchSuccess(
          (campfireMemberResult.data as any).campfire_users,
        ),
      );
      setmembersList((campfireMemberResult.data as any).campfire_users);
    }
  }, [campfireMemberResult.data, dispatch]);

  // Handle campfire query error
  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const refetchMembersList = useCallback(() => {
    campfireMember({
      variables: {
        campfireId: campfireId,
        search: campfireSearch ? `%${campfireSearch}%` : '%%',
      },
    });
  }, [campfireMember, campfireId, campfireSearch]);

  useEffect(() => {
    setmembersList('');
    refetchMembersList();
  }, [isCampfirePeopleSearch, refetchMembersList]);

  useEffect(() => {
    dispatch(setCampfireSearch(''));
    // Reset banned data when campfire changes
    dispatch(resetBannedData());
    setBannedDataFetched(false);
  }, [campfireName]);

  useEffect(() => {
    dispatch(toggleCampfirePage(true));
    return () => {
      dispatch(resetOpenComment());
      dispatch(toggleCampfirePage(false));
    };
  }, []);

  useEffect(() => {
    if (campfireData && !campfireData.isMember && !campfireData.isRequested) {
      addCampfireVisit({
        variables: {
          campfireId: campfireData.id,
          userId,
        },
      });
    }
  }, [campfireData, addCampfireVisit, userId]);

  const fetchBannedData = useCallback(async () => {
    try {
      const [titleResponse, bodyResponse, domainsResponse] = await Promise.all([
        fetchBannedTitle({
          variables: { campfireId: campfireId || '', postPart: 'title' },
          context: { headers: { Authorization: `Bearer ${token}` } },
        }),
        fetchBannedBody({
          variables: { campfireId: campfireId || '', postPart: 'body' },
          context: { headers: { Authorization: `Bearer ${token}` } },
        }),
        fetchBannedDomains({
          variables: { campfireId: campfireId || '' },
          context: { headers: { Authorization: `Bearer ${token}` } },
        }),
      ]);

      dispatch(
        setBannedData({
          bannedTitleWords:
            (titleResponse.data as any)?.campfire_banned_words || [],
          bannedBodyWords:
            (bodyResponse.data as any)?.campfire_banned_words || [],
          bannedDomains:
            (domainsResponse.data as any)?.campfire_blocked_domains || [],
        }),
      );

      setBannedDataFetched(true);
    } catch (fetchError) {
      fetchError != 'AbortError: The operation was aborted.' &&
        emitErrorNotification('Error fetching banned data');
      setBannedDataFetched(true); // Set to true even on error to prevent infinite loading
    }
  }, [
    campfireId,
    token,
    fetchBannedTitle,
    fetchBannedBody,
    fetchBannedDomains,
  ]);
  // Fetch banned data immediately when campfireId is available
  useEffect(() => {
    if (campfireId && token) {
      fetchBannedData();
    }
  }, [campfireId, token]);

  return (
    <PageBase
      title={`Campfire - ${campfireName}`}
      description={`Join the ${campfireName} campfire community`}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div id="campfireTop" className="sr-only"></div>
      {campfireData && campfireData.campfire_users[0]?.is_blocked ? (
        <NotFoundComponent
          showRedirect
          errorMessage="Oops! You no longer have access to this campfire."
        />
      ) : loading || (campfireId && !bannedDataFetched) ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader />
        </div>
      ) : isEmpty(campfireData) || error ? (
        <NotFoundComponent
          showRedirect
          errorMessage="Oops! We couldn't find the campfire details"
        />
      ) : (
        <>
          <CampfireDetail
            data={campfireData}
            membersList={membersList}
            refetchMembersList={refetchMembersList}
          />
          <BackToTop to="campfireTop" />
        </>
      )}
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
