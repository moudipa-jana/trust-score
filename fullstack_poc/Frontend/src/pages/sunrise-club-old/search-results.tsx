/* eslint-disable unused-imports/no-unused-vars */
import { isEmpty } from 'lodash';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import CustomTabs from '@/components/Utility/CustomTabs';
import Heading from '@/elements/Heading';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import SearchBlogs, { Blog } from '@/pages/sunrise-club-old/search-blogs';
import SearchVideoBlogs from '@/pages/sunrise-club-old/search-video-blogs';
import { BlogService, UpdateBlogVideoCount } from '@/service';
import type { MenuItem } from '@/types/menu';

interface VideoAttributes {
  Title: string;
  slug: string;
  watch: boolean;
  publish_date: string;
  good_read: boolean;
  pick: boolean;
  video: {
    video: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    coverVideo?: {
      smallVideo: {
        data: {
          attributes: {
            url: string;
          };
        };
      };
    };
    coverImg: {
      image: {
        data: {
          attributes: {
            url: string;
          };
        };
      };
    };
  };
  blog_authors: {
    data: Array<{
      attributes: {
        name: string;
        image: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
      };
    }>;
  };
  blog_categories: {
    data: Array<{
      attributes: {
        slug: string;
        title: string;
      };
    }>;
  };
}

interface VideoBlog {
  id: string;
  attributes: VideoAttributes;
}

interface SearchResultsProps {
  randomBlogs: VideoBlog[] | Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: ForumBingeWatchBlog[];
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

const SearchResults = ({
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: SearchResultsProps) => {
  const router = useRouter();
  const searchText = router.query.q;
  const [videoId] = useState<string>();
  const [preViews] = useState<number>(0);
  const [watched, setWatched] = useState(false);
  const [tabsCollection, setTabsCollection] = useState<
    Array<{
      id: number;
      name: string;
      icon?: boolean;
    }>
  >([]);

  ///***************************** Video Count **************************** ///
  const sendBackendRequest = useCallback(async () => {
    try {
      await UpdateBlogVideoCount(`${videoId}`, preViews + 1);
      return true;
    } catch (error) {
      return false;
    }
  }, [videoId, preViews]);

  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    const handleVideoWatch = () => {
      if (!watched) {
        const today = new Date().toISOString().slice(0, 10);
        const watchedVideos =
          JSON.parse(localStorage.getItem('watchedVideos') ?? '{}') || {};

        if (!watchedVideos[today] || !watchedVideos[today][videoId as string]) {
          sendBackendRequest();

          watchedVideos[today] = {
            ...watchedVideos[today],
            [videoId as string]: true,
          };
          localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));

          setWatched(true);
        }
      }
    };

    const handleVideoTimeUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleVideoWatch, 2000);
    };

    const videoElement = document.getElementById('videoPlayer');
    videoElement?.addEventListener('timeupdate', handleVideoTimeUpdate);

    return () => {
      clearTimeout(timeoutId);
      videoElement?.removeEventListener('timeupdate', handleVideoTimeUpdate);
    };
  }, [videoId, watched, sendBackendRequest]);

  useEffect(() => {
    setTabsCollection([
      {
        id: 1,
        name: 'Blogs',
      },
      {
        id: 2,
        name: 'People Reading',
      },
      {
        id: 3,
        name: 'Videos',
        icon: true,
      },
    ]);
  }, []);

  if (isEmpty(searchText)) {
    return (
      <div className="container">
        <h1>No search string provided</h1>
      </div>
    );
  }

  return (
    <PageBase
      title="Search Results"
      description="Search for people, posts, campfires, and hashtags"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="mt-3 lg:mt-2.5 xl:mt-18">
        <div className="sm-container break-all xl:px-0">
          <Heading
            priority={1}
            variant="md"
            font="font-medium"
            color="text-black-200"
          >
            {searchText}
          </Heading>
        </div>

        <CustomTabs noContain searchTabs tabs={tabsCollection}>
          <SearchBlogs
            randomBlogs={randomBlogs as Blog[]}
            searchText={searchText}
          />
          <SearchBlogs
            randomBlogs={randomBlogs as Blog[]}
            searchText={searchText}
          />
          <SearchVideoBlogs
            randomBlogs={randomBlogs as VideoBlog[]}
            searchText={searchText}
          />
        </CustomTabs>
      </div>
    </PageBase>
  );
};

export default SearchResults;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    let randomBlogs = [];

    try {
      const { data }: any = await BlogService();
      randomBlogs = data.sunriseBlogs?.data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        randomBlogs,
      },
    };
  },
);
