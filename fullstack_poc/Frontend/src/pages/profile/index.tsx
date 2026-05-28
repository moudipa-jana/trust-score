{
  /**
   * `Profile` component displays a user's profile, activities, bookmarks, archive, and hidden posts.
   * - Fetches user data and supports pagination for archived and bookmarked posts.
   * - Responsive layout with desktop grid and mobile swipeable tabs.
   * - Includes a Campfire creation modal and sticky footer for desktop.
   * - Handles errors and displays a "Back to Top" button for navigation.
   **/
}

import { ErrorLike } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CreateCampfire from '@/components/pages/Forum/campfire/CreateCampfire';
import StickyFooter from '@/components/pages/Forum/StickyFooter';
import ProfileActivities from '@/components/pages/Profile/ProfileActivities';
import ProfileArchive from '@/components/pages/Profile/ProfileArchive';
import ProfileBookmark from '@/components/pages/Profile/ProfileBookmark';
import ProfileCard from '@/components/pages/Profile/ProfileCard';
import ProfileHidden from '@/components/pages/Profile/ProfileHidden/profileHidden';
import ProfileSetting from '@/components/pages/Profile/ProfileSetting';
import UserCampfire from '@/components/pages/User/UserCampfire';
import BackToTop from '@/components/Utility/BackToTop';
import CustomTabs from '@/components/Utility/CustomTabs';
import Modal from '@/components/Utility/Modal';
import NotAuthenticated from '@/components/Utility/NotAuthenticated';
import Heading from '@/elements/Heading';
import { useIsipad } from '@/Hooks/useIsIpad';
import { useIsMobile } from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import {
  QUERY_ARCHIVE_POST,
  QUERY_FETCH_BOOKMARK,
  QUERY_GET_USER_PROFILE,
} from '@/service/graphql/Profile';
import { GetBookmarksTotalCount } from '@/service';
import {
  getUserId,
  selectGetToken,
  selectGetUserProfile,
  setUserProfile,
} from '@/state/Slices/auth';
import { getArchiveData, getBookmarkData } from '@/state/Slices/profile';
import type { MenuItem } from '@/types/menu';

const footerSectionDisableState = true;

interface TabData {
  id: number;
  name: string;
  numberOf: number;
  hash: string;
}

interface ProfileProps {
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

export default function Profile({
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: ProfileProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectGetToken);
  const [bookmarkLoadMoreStatus, setBookmarkLoadMoreStatus] = useState(true);
  const [archiveLoadMoreStatus, setArchiveLoadMoreStatus] = useState(true);
  const [isSortApplied, setIsSortApplied] = useState(false);
  const profile = useAppSelector(selectGetUserProfile);
  const userId = useAppSelector(getUserId);
  const archiveCount = useAppSelector(
    (state) => state.profile.archivePostsCount,
  );
  const bookmarkCount = useAppSelector(
    (state) => state.profile.bookmarkPostsCount,
  );
  const bookmarkBlogCount = useAppSelector(
    (state) => state.profile.bookmarkBlogCount,
  );

  const profileId = useMemo(() => profile?.id, [profile?.id]);

  const [backIcon, setBackIcon] = useState(false);
  const [campfireModalVisible, setCampfireModalVisible] = useState(false);
  const [swipeableIndex, setSwipeableIndex] = useState(0);
  const nextStep = () => {
    setSwipeableIndex((prevIndex) => prevIndex + 1);
    setBackIcon(true);
  };
  const onBack = () => {
    setSwipeableIndex(0);
    setBackIcon(false);
  };

  const openCampfireModal = () => {
    setCampfireModalVisible(true);
  };

  const onClose = () => {
    setCampfireModalVisible(false);
    setSwipeableIndex(0);
    setBackIcon(false);
  };

  useEffect(() => {
    if (profileId) {
      // TODO: Replace with appropriate profile fetching logic
      // dispatch(fetchProfileById(profileId, token));
      // dispatch(fetchBlogBookmarkTotalCount(profileId));
    }
  }, [profileId, dispatch, token, router.asPath]);

  const hiddenPostCount =
    (profile?.noHidden?.aggregate?.count ?? 0) +
    (profile?.noHiddenComments?.aggregate?.count ?? 0);
  const activityPostCount = profile?.noActivities?.totalCount;
  const [tabsCollection, setTabsCollection] = useState<TabData[]>([]);

  const { data: userData }: any = useQuery(QUERY_GET_USER_PROFILE, {
    variables: {
      userId,
    },
    skip: !userId,
  });

  // prefer server-side total when available, fall back to local counts
  const { data: bookmarkTotalData } = useQuery(GetBookmarksTotalCount, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const serverBookmarkTotal =
    (bookmarkTotalData as any)?.bookMarks?.meta?.pagination?.total ?? null;

  const totalBookmarks =
    serverBookmarkTotal ??
    Number(bookmarkBlogCount || 0) + Number(bookmarkCount || 0);

  useEffect(() => {
    setTabsCollection([
      {
        id: 1,
        name: 'My Activities',
        numberOf: activityPostCount || 0,
        hash: '#activities',
      },
      {
        id: 2,
        name: 'Archive',
        numberOf: archiveCount,
        hash: '#archived',
      },
      {
        id: 3,
        name: 'Bookmark',
        numberOf: totalBookmarks,
        hash: '#bookmark',
      },
      {
        id: 4,
        name: 'Hidden',
        numberOf: hiddenPostCount || 0,
        hash: '#hidden',
      },
    ]);
  }, [
    activityPostCount,
    archiveCount,
    bookmarkCount,
    hiddenPostCount,
    bookmarkBlogCount,
    userData,
    totalBookmarks,
  ]);

  useEffect(() => {
    dispatch(setUserProfile(userData?.users_by_pk || null));
  }, [userData]);

  const {
    error: archiveError,
    refetch: archiveRefetch,
    networkStatus: archiveNetworkStatus,
    data: archiveData,
  } = useQuery(QUERY_ARCHIVE_POST, {
    fetchPolicy: 'no-cache',
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: {
      sort: {
        archivedAt: 'desc_nulls_last',
      },
      userId: userId,
      limit: 3,
      offset: 0,
    },
    skip: token === '',
  });

  // Handle archive data
  useEffect(() => {
    if (archiveData) {
      dispatch(
        getArchiveData({
          response: archiveData,
          networkStatus: archiveNetworkStatus,
          isSortApplied,
        }),
      );
      setArchiveLoadMoreStatus(!!(archiveData as any).archivedPosts.length);
      setIsSortApplied(false);
    }
  }, [archiveData, dispatch, archiveNetworkStatus, isSortApplied]);

  // Handle archive error
  useEffect(() => {
    if (archiveError) {
      emitErrorNotification(formatGraphqlError(archiveError));
    }
  }, [archiveError]);

  const {
    error: bookmarkError,
    refetch: bookmarkRefetch,
    networkStatus,
    data: bookmarkData,
  } = useQuery(QUERY_FETCH_BOOKMARK, {
    fetchPolicy: 'no-cache',
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: {
      sort: {
        createdAt: 'asc_nulls_last',
      },
      limit: 3,
      offset: 0,
    },
    notifyOnNetworkStatusChange: true,
    skip: token === '',
  });

  // Handle bookmark data
  useEffect(() => {
    if (bookmarkData) {
      dispatch(
        getBookmarkData({
          response: bookmarkData,
          networkStatus,
          isSortApplied,
        }),
      );
      setBookmarkLoadMoreStatus(!!(bookmarkData as any).bookmarks.length);
      setIsSortApplied(false);
    }
  }, [bookmarkData, dispatch, networkStatus, isSortApplied]);

  // Handle bookmark error
  useEffect(() => {
    if (bookmarkError) {
      emitErrorNotification(formatGraphqlError(bookmarkError));
    }
  }, [bookmarkError]);

  const [cardWidth, setCardWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth - 16);
      }
    };

    window.addEventListener('resize', updateCardWidth);
    updateCardWidth();

    return () => {
      window.removeEventListener('resize', updateCardWidth);
    };
  }, [cardRef]);

  const ismobile = useIsMobile();
  const isipad = useIsipad();

  if (!token) {
    return (
      <PageBase
        title="User Profile Page"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <NotAuthenticated />
      </PageBase>
    );
  }

  return (
    <PageBase
      title="User Profile Page"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div id="ProfileCard" className="sr-only"></div>
      <div className="sm-container my-4">
        <Modal
          key="modal"
          id="CampfireCreateModal"
          backIcon={backIcon}
          isVisible={campfireModalVisible}
          onBack={onBack}
          onClose={onClose}
          isOverlayWhite
        >
          <CreateCampfire
            swipeableIndex={swipeableIndex}
            nextStep={nextStep}
            onClose={onClose}
          />
        </Modal>

        <div className="py-2">
          <Heading priority={3}>My Profile</Heading>
        </div>
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-9 lg:gap-4">
          <div className="profileLeft card-width lg:col-span-6" ref={cardRef}>
            <ProfileCard />
            {!ismobile && (
              <div className="pt-14">
                <CustomTabs tabs={tabsCollection}>
                  <div>
                    <ProfileActivities />{' '}
                  </div>
                  <div>
                    <ProfileArchive
                      error={archiveError as ErrorLike}
                      refetch={archiveRefetch}
                      loadMoreStatus={archiveLoadMoreStatus}
                      setIsSortApplied={setIsSortApplied}
                      networkStatus={archiveNetworkStatus}
                      footerDisable={footerSectionDisableState}
                    />
                  </div>
                  <div id="bookmark-overlay">
                    <ProfileBookmark
                      error={bookmarkError as ErrorLike}
                      refetch={bookmarkRefetch}
                      loadMoreStatus={bookmarkLoadMoreStatus}
                      setIsSortApplied={setIsSortApplied}
                      networkStatus={networkStatus}
                      footerDisable={footerSectionDisableState}
                    />{' '}
                  </div>
                  <div>
                    <ProfileHidden />
                  </div>
                </CustomTabs>
              </div>
            )}
          </div>
          <div className="py-6 lg:col-span-3 lg:py-0">
            <ProfileSetting />
            <UserCampfire
              userId={profile?.id}
              setCampfireModal={openCampfireModal}
            />
            {ismobile && (
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
        {ismobile && (
          <div className={`${isipad ? 'relative -top-40 pt-10' : ''}`}>
            <CustomTabs
              tabs={tabsCollection}
              width={`${isipad ? cardWidth : ''}`}
            >
              <div>
                <ProfileActivities />{' '}
              </div>
              <div>
                <ProfileArchive
                  error={archiveError as ErrorLike}
                  refetch={archiveRefetch}
                  loadMoreStatus={archiveLoadMoreStatus}
                  setIsSortApplied={setIsSortApplied}
                  networkStatus={archiveNetworkStatus}
                  footerDisable={footerSectionDisableState}
                />
              </div>
              <div id="bookmark-overlay">
                <ProfileBookmark
                  error={bookmarkError as ErrorLike}
                  refetch={bookmarkRefetch}
                  setIsSortApplied={setIsSortApplied}
                  networkStatus={networkStatus}
                  loadMoreStatus={bookmarkLoadMoreStatus}
                  footerDisable={footerSectionDisableState}
                />{' '}
              </div>
              <div>
                <ProfileHidden />
              </div>
            </CustomTabs>
          </div>
        )}
      </div>
      <BackToTop to="ProfileCard" />
    </PageBase>
  );
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    return {
      props: {
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
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
