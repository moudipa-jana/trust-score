import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { get } from 'lodash';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { postAuthSuccess } from '@/actions/profile';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Category from '@/components/pages/Forum/Category';
import Posts from '@/components/pages/Forum/posts';
import ForumAnnouncementCard from '@/components/pages/Forum/posts/ForumAnnouncementCard';
import Related from '@/components/pages/Forum/Related';
import Sphere from '@/components/pages/Forum/Sphere';
import StickyFooter from '@/components/pages/Forum/StickyFooter';
import Topic from '@/components/pages/Forum/Topics';
import AuthPrompter from '@/components/Utility/AuthPrompter';
import BackToTop from '@/components/Utility/BackToTop';
import SearchBar from '@/components/Utility/SearchBar';
import { useIsDesktop } from '@/Hooks/useIsDesktop';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FORUM_ANIMATED_PLACEHOLDER } from '@/lib/constants';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import {
  BingeWatchService,
  BlogService,
  FETCH_LIST_OF_KOFUKONS,
  FOOTER_DISCLAIMER,
} from '@/service';
import ApiClient from '@/service/graphql/apiClient';
import {
  FETCH_CATEGORIES_FEED_MUTATION,
  QUERY_TRENDING_CATEGORIES,
} from '@/service/graphql/Category';
import { FEED_ANNOUNCEMENTS_QUERY } from '@/service/graphql/Forum';
import { getUserId } from '@/state/Slices/auth';
import { updateAnnouncementsArray } from '@/state/Slices/campfire';
import { getRefreshHomeFeed, setRefreshHomeFeed } from '@/state/Slices/home';
import {
  fetchForumFeedSuccess,
  toggleForumFeedLoader,
} from '@/state/Slices/necessary';
import { TopCategories } from '@/types/topCategories';

import type { MenuItem } from '../types/menu';
import Loader from '@/components/Utility/Loader';

interface KofukonAttributes {
  k_id: string;
  title: string;
  image: {
    data: [
      {
        attributes: {
          url: string;
          alternativeText: string;
        };
      },
    ];
  };
  altText: string;
}

export interface Kofukon {
  attributes: KofukonAttributes;
}

interface KofukonResponse {
  kofukons: {
    data: Kofukon[];
  };
}

interface IHome {
  topCategories: TopCategories[];
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  bingeWatchList?: any;
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: { title: string; link: string; __typename?: string };
    __typename?: string;
  }>;
  searchData: Blog[];
  disclaimer: {
    data?: { attributes?: { title: string; description: string } };
  };
}

interface IDynamicContent {
  randomBlogs: Blog[];
  bingeWatchList: any;
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: { title: string; link: string; __typename?: string };
    __typename?: string;
  }>;
  disclaimer: {
    data?: { attributes?: { title: string; description: string } };
  };
}

const DynamicContent = ({
  randomBlogs,
  initialBottomMenus,
  initialSocials,
  disclaimer,
  bingeWatchList,
}: IDynamicContent) => {
  const dispatch = useAppDispatch();
  const isdesktop = useIsDesktop();
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector(getUserId);
  const [isSticky, setIsSticky] = useState(false);
  const refreshHomeFeed = useAppSelector(getRefreshHomeFeed);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const announcementsData = useAppSelector(
    (state) => state.campfire.campfireAnnouncements,
  );
  const [refetch, setRefetch] = useState(false);
  const router = useRouter();
  const [
    fetchFeed,
    { data: feedMutationData, error: feedMutationError, loading: feedLoading },
  ] = useMutation(FETCH_CATEGORIES_FEED_MUTATION, {
    context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });
  const {
    refetch: refetchFeedAnnouncements,
    data: queryAnnouncementsData,
    loading: announcementsLoading,
  } = useQuery(FEED_ANNOUNCEMENTS_QUERY, {
    context: { headers: { Authorization: `Bearer ${token}` } },
    fetchPolicy: 'no-cache',
    skip: token === '',
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchForumFeedSuccess({ forumFeed: [] })); 
      dispatch(toggleForumFeedLoader(true));

      fetchFeed({
        variables: { title: '', limit: 10, offset: 0 },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [token]);
  // Handle announcements completion
  useEffect(() => {
    if (queryAnnouncementsData) {
      dispatch(
        updateAnnouncementsArray((queryAnnouncementsData as any).announcements),
      );
    }
  }, [queryAnnouncementsData, dispatch]);

  // Handle feed mutation completion
  useEffect(() => {
    if (feedMutationData) {
      dispatch(
        fetchForumFeedSuccess({
          forumFeed: get(feedMutationData, 'getFeed.feed'),
        }),
      );
      dispatch(toggleForumFeedLoader(false));
      dispatch(setRefreshHomeFeed(false));
    }
  }, [feedMutationData, dispatch]);

  // Handle feed mutation error
  useEffect(() => {
    if (feedMutationError) {
      emitErrorNotification(formatGraphqlError(feedMutationError));
    }
  }, [feedMutationError]);

  // Use refs to store the latest values and prevent infinite re-renders
  const fetchFeedRef = useRef(fetchFeed);
  const refetchFeedAnnouncementsRef = useRef(refetchFeedAnnouncements);

  // Update refs when functions change
  useEffect(() => {
    fetchFeedRef.current = fetchFeed;
    refetchFeedAnnouncementsRef.current = refetchFeedAnnouncements;
  });

  const { pathname } = router;
  const [isHomeRoute] = useState(
    pathname === '/' || pathname === '/kofuku-social',
  );

  useEffect(() => {
    if (!pathname.includes('/category')) {
      fetchFeedRef.current({ variables: { title: '', limit: 10, offset: 0 } });
    }
    if (refreshHomeFeed) {
      refetchFeedAnnouncementsRef.current();
    }
    if (token && userId) {
      dispatch(postAuthSuccess(userId, token) as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshHomeFeed, userId, pathname, refetch]);

  useEffect(() => {
    const handleScroll = () => {
      const stickyElement = document.getElementById('sticky-element');
      const forumContent = document.getElementById('forumContent');
      const headerScrolled = document.getElementById('topHeaderHolder');
      const loaderadd = document.getElementById('loader2');

      const forumContentRect =
        forumContent && forumContent.getBoundingClientRect();
      if (forumContentRect && forumContentRect.top < 250) {
        headerScrolled?.classList.add('scrolled');
      } else {
        headerScrolled?.classList.remove('scrolled');
      }
      if (stickyElement) {
        const { top } = stickyElement.getBoundingClientRect();

        if (isHomeRoute) {
          setIsSticky(top <= 100);
          if (top <= 100) {
            loaderadd?.classList.add('block');
            loaderadd?.classList.remove('hidden');
          } else {
            loaderadd?.classList.remove('block');
            loaderadd?.classList.add('hidden');
          }
        }
      }
    };
    const handleResize = () => setTimeout(handleScroll, 100);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname, dispatch, isHomeRoute]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (!isAuthenticated) window.scrollTo(0, 0);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [isAuthenticated, router.events]);

  return (
    <div id="category" className="sm-container relative">
      <Category />
      {token ? (
        <div
          className={`search-sticky ml-auto w-fit ${
            isSticky ? 'z-120' : 'z-50'
          }`}
          id="sticky-element"
        >
          <AuthPrompter />
        </div>
      ) : (
        <AuthPrompter />
      )}
      <div className="xl:sm-container my-4">
        {isdesktop ? (
          <div
            className="flex flex-col xl:grid xl:grid-cols-12 xl:gap-4"
            id="forumContent"
          >
            <div className="xl:col-span-8">
              {/* <QuestionCard />
              <ReshareQuestionCard />
              <ReshareQuizCard />
              <ResharePollCard /> */}

              {!pathname.includes('/category') && (
                <ForumAnnouncementCard announcementsData={announcementsData} />
              )}
              {feedLoading ? (
                <Loader size="100" variant="circle" />
              ) : (
                <Posts
                  categoryName=""
                  randomBlogs={randomBlogs}
                  setRefetch={setRefetch}
                  bingeWatchList={bingeWatchList}
                />
              )}
            </div>
            <div className="lg:mt-8 xl:col-span-4 realted-posts-col">
              <div className="mt-8 pb-8 ">
                <Related />
              </div>
              <Topic />
              <div
                className={`sticky ${
                  isAuthenticated ? 'top-[88px]' : 'top-[95px]'
                }`}
              >
                <StickyFooter
                  bottomMenus={initialBottomMenus}
                  initialSocials={initialSocials}
                  disclaimer={disclaimer}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mobileForumPosts">
              {!pathname.includes('/category') && (
                <ForumAnnouncementCard announcementsData={announcementsData} />
              )}
              <Posts
                categoryName=""
                randomBlogs={randomBlogs}
                setRefetch={setRefetch}
                bingeWatchList={bingeWatchList}
              />
            </div>
            <Related />
            <Topic />
            <StickyFooter
              bottomMenus={initialBottomMenus}
              initialSocials={initialSocials}
              disclaimer={disclaimer}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default function Home({
  topCategories: initialCategories,
  randomBlogs,
  bingeWatchList,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: IHome) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const clientCategories = initialCategories;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pageHolder">
      <PageBase
        title="Kofuku Social"
        description="Kofuku is a warehouse of health and wellness information"
        showLoader={false}
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        initialSocials={initialSocials}
        searchData={searchData}
      >
        <div className="page hasAnimation show-page">
          <div id="circle">
            {!isScrolled && isAuthenticated && (
              <div className="absolute z-10 w-full">
                <div className="sm-container relative">
                  <SearchBar
                    isAnimatedText
                    placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
                    searchData={searchData}
                  />
                </div>
              </div>
            )}
            {!isScrolled && !isAuthenticated && (
              <div className="absolute z-10 hidden w-full">
                <div className="sm-container relative">
                  <SearchBar
                    isAnimatedText
                    placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
                    searchData={searchData}
                  />
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <Sphere spaceTop topCategories={clientCategories} />
            ) : (
              <Sphere topCategories={clientCategories} />
            )}
          </div>

          <DynamicContent
            randomBlogs={randomBlogs}
            initialBottomMenus={initialBottomMenus}
            initialSocials={initialSocials}
            disclaimer={disclaimer}
            bingeWatchList={bingeWatchList}
          />
          <BackToTop to="circle" />
        </div>
      </PageBase>
    </div>
  );
}

export const getStaticProps: GetStaticProps = withCommonData(async () => {
  const headersVal = {};
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    headers: headersVal,
  });
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: httpLink,
  });
  let kofukons;
  let disclaimer, bingeWatchList;
  try {
    const response = await client.query({
      query: QUERY_TRENDING_CATEGORIES,
      fetchPolicy: 'network-only',
    });
    const categories = get(
      response,
      'data.categories_with_top_threads_view',
      [],
    );
    let randomBlogs;
    try {
      const { data } = await BlogService();
      randomBlogs = (data as any).sunriseBlogs?.data;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = (await FETCH_LIST_OF_KOFUKONS()) as {
        data: KofukonResponse;
      };
      kofukons = data.kofukons?.data;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await ApiClient.getClient().query({
        query: FOOTER_DISCLAIMER,
      });
      disclaimer = data.footerDisclaimer;
    } catch (error) {
      captureSentryException(error);
      disclaimer = { data: { attributes: { title: '', description: '' } } };
    }

    try {
      const { data }: any = await BingeWatchService();
      const content = data.youtubes?.data ?? [];
      bingeWatchList = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        topCategories: categories || [],
        randomBlogs: randomBlogs || [],
        kofukons: kofukons || [],
        initialSocials: [],
        bingeWatchList: bingeWatchList || [],

        disclaimer,
      },
      revalidate: parseInt(process.env.REVALIDATE_INTERVAL || '60', 10),
    };
  } catch (error) {
    return {
      props: {
        topCategories: [],
        randomBlogs: [],
        kofukons: [],
        initialSocials: [],
        bingeWatchList: [],
        disclaimer: { data: { attributes: { title: '', description: '' } } },
      },
      revalidate: parseInt(process.env.REVALIDATE_INTERVAL || '60', 10),
    };
  }
});
