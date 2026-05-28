{
  /**
   * This is a forum category page.
   * - Displays a category feed if available.
   * - Handles both authenticated and unauthenticated users with appropriate prompts.
   * - Includes dynamic sections like "About", "Related", and "Topic".
   **/
}

import { useLazyQuery, useMutation } from '@apollo/client/react';
import { get, startCase } from 'lodash';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import type { MenuItem } from '@/types/menu';

const About = dynamic(() => import('@/components/pages/Forum/About'), {
  ssr: false,
});
const Posts = dynamic(() => import('@/components/pages/Forum/posts'), {
  ssr: false,
});
const Related = dynamic(() => import('@/components/pages/Forum/Related'), {
  ssr: false,
});
const Topic = dynamic(() => import('@/components/pages/Forum/Topics'), {
  ssr: false,
});
const AuthPrompter = dynamic(
  () => import('@/components/Utility/AuthPrompter'),
  { ssr: false },
);
const BackToTop = dynamic(() => import('@/components/Utility/BackToTop'), {
  ssr: false,
});
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import StickyFooter from '@/components/pages/Forum/StickyFooter';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import useIsDesktop from '@/Hooks/useIsDesktop';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { BlogService } from '@/service';
import {
  FETCH_CATEGORIES_FEED_MUTATION,
  QUERY_GET_CATEGORY_ID,
} from '@/service/graphql/Category';
import { selectGetToken } from '@/state/Slices/auth';
import { resetOpenComment } from '@/state/Slices/comments';
import {
  fetchForumFeedSuccess,
  resetCategoryThreads,
  toggleForumFeedLoader,
} from '@/state/Slices/necessary';

interface CategoryFeed {
  id: string;
  title: string;
  about: string;
}

interface CategoryProps {
  initialCategoryFeed: CategoryFeed | null;
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials?: Array<{
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

interface FeedResponse {
  getFeed: {
    feed: CategoryFeed;
  };
}

export default function Category({
  initialCategoryFeed,
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: CategoryProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();
  const [refetch, setRefetch] = useState(false);
  const isdesktop = useIsDesktop();
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const token = useAppSelector(selectGetToken);
  const { forumFeed, loading, categories } = useAppSelector((state) => ({
    forumFeed: state.necessary.forumFeed,
    loading: state.necessary.forumFeedLoading,
    categories: state.necessary.categories,
  }));
  const dispatch = useAppDispatch();
  const { categoryName } = router.query;

  useEffect(() => {
    if (categoryName && !hasConsented) {
      const name = (categoryName as string).toLowerCase();
      if (name.includes('hush talk') || name.includes('she read')) {
        setShowSensitiveModal(true);
      }
    }
  }, [categoryName, hasConsented]);
  const category = useMemo(() => {
    return categories.filter(
      (cat) =>
        cat.title?.toLowerCase()?.trim() ===
        (categoryName as string)?.toLowerCase()?.trim(),
    );
  }, [categories, categoryName]);

  // Memoize the category title to prevent unnecessary re-renders
  const categoryTitle = useMemo(() => {
    return category?.[0]?.title;
  }, [category]);
  const [getCategory, { data, error: categoryError }] = useLazyQuery(
    QUERY_GET_CATEGORY_ID,
  );

  const [
    fetchFeed,
    { loading: fetchLoading, data: feedData, error: feedError },
  ] = useMutation<FeedResponse>(FETCH_CATEGORIES_FEED_MUTATION, {
    context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  });

  // Handle category error
  useEffect(() => {
    if (categoryError) {
      emitErrorNotification(formatGraphqlError(categoryError));
    }
  }, [categoryError]);

  // Handle feed completion
  useEffect(() => {
    if (feedData) {
      dispatch(
        fetchForumFeedSuccess({
          forumFeed: get(feedData, 'getFeed.feed'),
        }),
      );
      dispatch(toggleForumFeedLoader(false));
    }
  }, [feedData, dispatch]);

  // Handle feed error
  useEffect(() => {
    if (feedError) {
      dispatch(toggleForumFeedLoader(false));
      fetchForumFeedSuccess({ forumFeed: null });
      emitErrorNotification(formatGraphqlError(feedError));
    }
  }, [feedError, dispatch]);

  // Use refs to store the latest values and prevent infinite re-renders
  const fetchFeedRef = useRef(fetchFeed);
  const getCategoryRef = useRef(getCategory);

  // Update refs when functions change
  useEffect(() => {
    fetchFeedRef.current = fetchFeed;
    getCategoryRef.current = getCategory;
  });

  useEffect(() => {
    if (categoryName) {
      fetchFeedRef.current({
        variables: {
          title: categoryTitle ?? categoryName,
          limit: 10,
          offset: 0,
        },
      });
      getCategoryRef.current({
        variables: {
          categoryName: `%${categoryName}%`,
        },
      });
    }
  }, [refetch, token, categoryTitle, categoryName]);
  useEffect(() => {
    if (initialCategoryFeed && !token) {
      dispatch(
        fetchForumFeedSuccess({
          forumFeed: initialCategoryFeed,
        }),
      );
    }
    return () => {
      dispatch(resetCategoryThreads());
      dispatch(toggleForumFeedLoader(false));
      dispatch(resetOpenComment());
    };
  }, [dispatch, initialCategoryFeed, token]);

  const crumbs = useMemo(
    () => [
      { title: 'Home', path: '/' },
      {
        title: `Category - ${categoryName}`,
        path: `/category/${categoryName}`,
      },
    ],
    [categoryName],
  );
  return (
    <PageBase
      title={`Category - ${categoryName}`}
      description={`Browse posts in ${categoryName} category`}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div
        className="container sticky top-21.1 z-50 hidden xl:block"
        id="paths"
      >
        <div className="container">
          <Breadcrumb crumbs={crumbs} />
        </div>
      </div>
      <div id="category" className="sm-container pageHolder">
        {isAuthenticated ? (
          <div className="">
            <AuthPrompter />
          </div>
        ) : (
          <AuthPrompter />
        )}
        <div className="lg:sm-container my-4">
          {loading || fetchLoading ? (
            <div className="mx-auto mt-20 flex items-center justify-center justify-center py-4 md:w-80">
              <Image
                src="/images/Loader_animation.gif"
                alt="Loading animation"
                width={500}
                height={500}
                quality={25}
              />
            </div>
          ) : forumFeed ? (
            <div className="flex flex-col-reverse xl:grid xl:grid-cols-12 xl:gap-4">
              <div className="postsContainer xl:col-span-8" id={forumFeed.id}>
                <Posts
                  categoryName={forumFeed.title}
                  randomBlogs={randomBlogs}
                  setRefetch={setRefetch}
                />
              </div>
              <div className="xl:col-span-4 realted-posts-col">
                <About
                  key={forumFeed.title}
                  heading={`About ${startCase(forumFeed.title)}`}
                  description={forumFeed.about}
                />
                <div className="py-8">
                  <Related category={(data as any)?.id as string} />
                </div>
                <Topic category={(data as any)?.id as string} />
                {isdesktop && (
                  <div className="sticky top-[88px]">
                    <StickyFooter
                      bottomMenus={initialBottomMenus}
                      initialSocials={initialSocials || []}
                      disclaimer={disclaimer}
                    />{' '}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="layout mt-40 mb-40 flex flex-col items-center justify-center text-center text-black">
                <RiAlarmWarningFill
                  size={60}
                  className="drop-shadow-glow animate-flicker text-red-500"
                />
                <h2 className="mt-8 text-2xl lg:text-3xl">
                  Oops! We could not find anything related to this category
                </h2>
              </div>
            </div>
          )}
        </div>
        {forumFeed && <BackToTop to="category" />}
      </div>
      <SensitiveContentModal
        open={showSensitiveModal}
        onClose={() => router.push('/')}
        onDeny={() => router.push('/')}
        onConfirm={() => {
          setShowSensitiveModal(false);
          setHasConsented(true);
        }}
      />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let randomBlogs: Blog[] = [];
  try {
    const { data } = await BlogService();
    const content = (data as any).sunriseBlogs?.data;
    randomBlogs = content;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      initialCategoryFeed: null,
      randomBlogs,
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
});
