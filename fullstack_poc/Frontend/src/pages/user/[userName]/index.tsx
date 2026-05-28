/**
 * `GuestUserPage` is a React component that displays a guest user's profile.
 * - It fetches the user data, including posts, comments, and replies.
 * - Displays the information in a tabbed interface, with separate tabs for posts and comments/replies.
 * - Handles loading states, errors, and shows a "not found" message if the user is not found.
 * - Adjusts layout and behavior based on the device type (desktop, iPad, mobile).
 * - Manages visibility and blocking status of the user, and updates UI accordingly.
 **/

import { useLazyQuery } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import StickyFooter from '@/components/pages/Forum/StickyFooter';
import { ProfileActivityHeader } from '@/components/pages/Profile/ProfileActivities';
import ProfileActivitiesComments from '@/components/pages/Profile/ProfileActivitiesComments';
import ProfileActivitiesPost from '@/components/pages/Profile/ProfileActivitiesPost';
import GuestUserPostRender from '@/components/pages/User/GuestUserPostRender';
import UserCampfire from '@/components/pages/User/UserCampfire';
import UserCard from '@/components/pages/User/UserCard';
import CustomTabs from '@/components/Utility/CustomTabs';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';

import { fetchGuestProfile } from '@/actions/profile';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import { useIsDesktop } from '@/Hooks/useIsDesktop';
import { useIsipad } from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  fetchGuestUserProfile,
  getGuestUserBlockedStatus,
  getGuestUserProfile,
  setGuestUserBlockedStatus,
} from '@/state/Slices/profile';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import ApiClient from '@/service/graphql/apiClient';
import {
  QUERY_GET_COUNT_OF_REPLIES_AND_COMMENTS,
  QUERY_GET_GUEST_USER_COMMENT_AND_REPLIES,
  QUERY_GET_GUEST_USER_POST,
  QUERY_GET_USERS_WHO_BLOCKED_ME,
} from '@/service/graphql/Profile';

import { GuestProfile, UserProfile } from '@/types/authentication';
import type { MenuItem } from '@/types/menu';
import { activitiesProfileOption } from '@/types/profile';

interface GuestUserPageProps {
  userName: string;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: Blog[];
  disclaimer: {
    data?: {
      attributes?: {
        title: string;
        description: string;
      };
    };
  };
}

function GuestUserPage({
  userName,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: GuestUserPageProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<GuestProfile | null>(null);
  const [commentsAndRepliesCount, setCommentsAndRepliesCount] = useState(0);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const myId = useAppSelector(getUserId);

  const fetchProfile = useCallback(
    async (username: string) => {
      const userData = await fetchGuestProfile(username);
      if (token && myId && userData?.id) {
        try {
          const result = await ApiClient.getClient().query({
            query: QUERY_GET_USERS_WHO_BLOCKED_ME,
            variables: { myId },
            context: { headers: { Authorization: `Bearer ${token}` } },
            fetchPolicy: 'no-cache',
          });
          const blockers = get(result, 'data.blocked_users', []).map(
            (b: any) => b.userId,
          );
          if (blockers.includes(userData.id)) {
            router.replace('/404');
            return;
          }
        } catch (error) {
          console.error('[fetchProfile] Block check error:', error);
        }
      }
      setUser(userData);
      dispatch(fetchGuestUserProfile(userData));
      dispatch(setGuestUserBlockedStatus(userData?.isBlocked || false));
      setLoading(false);
    },
    [dispatch, router, token, myId],
  );
  const isdesktop = useIsDesktop();
  const isipad = useIsipad();
  const isMobile = useIsMobile();
  const isUserBlocked = useAppSelector(getGuestUserBlockedStatus);
  const guestUserData = useAppSelector(getGuestUserProfile);

  const [fetchNumberOfCommentsAndReplies, { data: commentsRepliesData, error: commentsRepliesError }] = useLazyQuery(
    QUERY_GET_COUNT_OF_REPLIES_AND_COMMENTS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle comments and replies count response
  useEffect(() => {
    if (commentsRepliesData) {
      const count = get(
        commentsRepliesData,
        'users[0].comments_aggregate.aggregate.count',
        0,
      );
      setCommentsAndRepliesCount(count);
    }
  }, [commentsRepliesData]);

  // Handle comments and replies error
  useEffect(() => {
    if (commentsRepliesError) {
      emitErrorNotification(formatGraphqlError(commentsRepliesError));
    }
  }, [commentsRepliesError]);

  const fetchNumberOfCommentsAndRepliesCallback = useCallback(
    (username: string) => {
      fetchNumberOfCommentsAndReplies({
        variables: { username },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    },
    [fetchNumberOfCommentsAndReplies, token],
  );

  const postCount = get(user, 'noPosts', 0);
  const profileOptions = useMemo<activitiesProfileOption[]>(
    () => [
      {
        value: {
          username: userName,
          sort: {
            createdAt: 'asc_nulls_last',
          },
        },
        label: 'All',
      },
      {
        value: {
          username: userName,
          sort: {
            createdAt: 'desc_nulls_last',
          },
        },
        label: 'Recent',
      },
    ],
    [userName],
  );

  const [selectedOption, setSelectedOption] = useState(profileOptions[0]);
  const tabCollection = [
    {
      id: 1,
      name: 'Posts',
      numberOf: postCount || 0,
    },
    {
      id: 2,
      name: 'Comments & Replies',
      numberOf: commentsAndRepliesCount || 0,
    },
  ];

  useEffect(() => {
    if (router.query.userName) {
      fetchProfile(router.query.userName as string);
      fetchNumberOfCommentsAndRepliesCallback(router.query.userName as string);
    }
    setSelectedOption(profileOptions[0]);
  }, [
    router.query,
    fetchProfile,
    fetchNumberOfCommentsAndRepliesCallback,
    profileOptions,
  ]);

  return (
    <PageBase
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      {loading ? (
        <div
          className="m-5 flex items-center justify-center"
          style={{ minHeight: 250 }}
        >
          <TabletLoader style={{ height: isMobile ? 140 : 200 }} />
        </div>
      ) : isEmpty(user) ? (
        <NotFoundComponent
          showRedirect
          errorMessage="Oops! We couldn't find the user"
        />
      ) : (
        <div className="sm-container my-4">
          <div className="lg:grid lg:grid-cols-10 lg:gap-4">
            <div className="tabWidth col-span-6">
              <UserCard user={guestUserData as UserProfile} />
              {isdesktop && (
                <div className="my-20">
                  <CustomTabs tabs={tabCollection}>
                    <GuestUserPostRender
                      profileOptions={profileOptions}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      count={postCount}
                      header={<ProfileActivityHeader title="Posts" />}
                    >
                      <ProfileActivitiesPost
                        query={QUERY_GET_GUEST_USER_POST}
                        selectedOption={selectedOption}
                        count={postCount}
                        header={<ProfileActivityHeader title="Posts" />}
                        userId={user.id}
                        guestUser
                      />
                    </GuestUserPostRender>
                    <GuestUserPostRender
                      profileOptions={profileOptions}
                      selectedOption={selectedOption}
                      setSelectedOption={setSelectedOption}
                      count={commentsAndRepliesCount}
                      header={
                        <ProfileActivityHeader title="Comments & Replies" />
                      }
                    >
                      <ProfileActivitiesComments
                        selectedOption={selectedOption}
                        query={QUERY_GET_GUEST_USER_COMMENT_AND_REPLIES}
                        count={commentsAndRepliesCount}
                        header={
                          <ProfileActivityHeader title="Comments & Replies" />
                        }
                        userId={user.id}
                        guestUser
                      />
                    </GuestUserPostRender>
                  </CustomTabs>
                </div>
              )}
            </div>
            <div className="col-span-4">
              {!isUserBlocked && user.isCampfireVisibility && (
                <UserCampfire userId={user.id} />
              )}
              {isdesktop && (
                <div className="sticky top-[88px]">
                  <StickyFooter
                    bottomMenus={initialBottomMenus}
                    initialSocials={initialSocials}
                    disclaimer={disclaimer}
                  />
                </div>
              )}
            </div>
          </div>
          {!isdesktop && (
            <div className={`${isipad ? 'relative -top-0' : ''}`}>
              <div className="my-4">
                <CustomTabs
                  tabs={tabCollection}
                  width={`${isipad ? 'w-full' : ''}`}
                >
                  <GuestUserPostRender
                    profileOptions={profileOptions}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    count={postCount}
                  >
                    <ProfileActivitiesPost
                      query={QUERY_GET_GUEST_USER_POST}
                      selectedOption={selectedOption}
                      header={<ProfileActivityHeader title="Posts" />}
                      userId={user.id}
                      guestUser
                    />
                  </GuestUserPostRender>
                  <GuestUserPostRender
                    profileOptions={profileOptions}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    count={commentsAndRepliesCount}
                  >
                    <ProfileActivitiesComments
                      selectedOption={selectedOption}
                      query={QUERY_GET_GUEST_USER_COMMENT_AND_REPLIES}
                      count={commentsAndRepliesCount}
                      header={
                        <ProfileActivityHeader title="Comments & Replies" />
                      }
                      userId={user.id}
                      guestUser
                    />
                  </GuestUserPostRender>
                </CustomTabs>
              </div>
            </div>
          )}
        </div>
      )}
    </PageBase>
  );
}

export default GuestUserPage;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const userName = context.params?.userName as string;
    return {
      props: {
        userName,
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        disclaimer: {
          data: {
            attributes: {
              title: '',
              description: '',
            },
          },
        },
      },
    };
  },
);