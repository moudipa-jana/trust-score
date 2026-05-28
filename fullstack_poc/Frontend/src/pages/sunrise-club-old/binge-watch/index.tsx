/**
 * Displays a collection of binge-worthy video blogs.
 * - Handles video play/pause and updates video view count.
 * - Shows related blogs at the bottom.
 */

import { isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Card from '@/components/Card';
import VideoComponent from '@/components/Card/VideoComponent';
import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import CalculateVideoDuration from '@/components/Utility/CalculateVideoDuration';
import LoadMore from '@/components/Utility/LoadMore';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { dateFormate, getStrapiMedia } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import OtherCards from '@/pages/sunrise-club-old/[categoryName]/OtherCards';
import { BlogService } from '@/service';
import { BlogCategoryService, UpdateBlogVideoCount } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';

interface VideoAttributes {
  Title: string;
  watch: boolean;
  videoViews: number;
  slug: string;
  publish_date: string;
  pick: boolean;
  good_read: boolean;
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
  video: {
    video: {
      data: {
        attributes: {
          url: string;
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
  blog_categories: {
    data: Array<{
      attributes: {
        title: string;
        slug: string;
      };
    }>;
  };
}

interface VideoBlog {
  id: string;
  attributes: VideoAttributes;
}

interface BingeWatchProps {
  randomBlogs: VideoBlog[];
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

function BingeWatch({
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: BingeWatchProps) {
  const router = useRouter();
  const [playVideo, setPlayVideo] = useState(true);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [elementNo, setElementNo] = useState<string>();
  const [videoId, setVideoId] = useState<string>();
  const [preViews, setPreviews] = useState<number>(0);

  // Handle VideoPlay or Pause //
  const handleClickVideo = (ctx: string, views: number) => {
    setPlayVideo(!playVideo);
    setElementNo(ctx);
    setVideoId(ctx);
    setPreviews(views ?? 0);
  };

  //When Router Change
  useEffect(() => {
    const handleRouteChange = () => {
      setElementNo('0');
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  ///***************************** Video Count **************************** ///
  const [watched, setWatched] = useState(false);
  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    const sendBackendRequest = async () => {
      try {
        await UpdateBlogVideoCount(`${videoId}`, preViews + 1);
      } catch (error) {
        return;
      }
    };

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
  }, [videoId, watched, preViews]);

  const itemsPerPage = 4;
  const bingeBlogs = randomBlogs.filter(
    (data: VideoBlog) => data.attributes.watch,
  );
  const [visibleData, setVisibleData] = useState(
    bingeBlogs.slice(0, itemsPerPage),
  );
  const handleLoadMore = () => {
    const currentLength = visibleData.length;
    const newData = bingeBlogs.slice(
      currentLength,
      currentLength + itemsPerPage,
    );

    setVisibleData([...visibleData, ...newData]);

    if (newData.length < 4) {
      setShowLoadMore(false);
    } else {
      setShowLoadMore(true);
    }
  };

  const filteredVideoData = useMemo(() => {
    return visibleData.filter(
      (data: VideoBlog) =>
        !!data?.attributes?.video?.video?.data?.attributes?.url,
    );
  }, [visibleData]);

  return (
    <PageBase
      title="Binge Watch"
      description="Binge Watch"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div>
        <div className="container">
          <div className="py-5 text-center lg:text-start xl:pb-10">
            <span className="weirdShapeTitle yellow">Binge Watch</span>
          </div>
        </div>
      </div>

      <div className="container relative mb-6.25 w-full">
        {randomBlogs &&
          randomBlogs
            .filter((data: VideoBlog) => data.attributes.watch)
            .slice(-1)
            .map((latestData: VideoBlog) => {
              const videoUrl = getStrapiMedia(
                latestData?.attributes?.video?.video?.data?.attributes?.url,
              );
              return (
                <VideoComponent bingeBanner key={latestData?.id}>
                  <div
                    className="absolute bottom-1 right-2.5 max-w-900 text-right lg:top-1/2 lg:bottom-auto lg:right-200
                    lg:max-w-66 lg:-translate-y-1/2 lg:text-left xl:right-1100 xl:max-w-82.5"
                  >
                    <Heading priority="1" variant="lg" color="text-black-200">
                      {latestData?.attributes?.Title}
                    </Heading>
                    <div className="flex items-center justify-end lg:justify-start">
                      <Link
                        className="lineHeight font-regular text-xxs text-primary lg:text-sm"
                        href={`/sunrise-club/${latestData?.attributes?.blog_categories?.data[0]?.attributes?.slug}`}
                      >
                        {
                          latestData?.attributes?.blog_categories?.data[0]
                            ?.attributes?.title
                        }
                      </Link>
                      <Text customClass="ml-5" size="xsm" color="text-gray-850">
                        <CalculateVideoDuration videoUrl={videoUrl} />
                      </Text>
                    </div>
                  </div>
                </VideoComponent>
              );
            })}
      </div>

      {!isEmpty(filteredVideoData) ? (
        <div className="relative w-full bg-skyBlue-700 pt-4 pb-4" id="content">
          <div className="container">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-5">
              {filteredVideoData &&
                filteredVideoData.map((data: VideoBlog) => {
                  const videoUrl = getStrapiMedia(
                    data?.attributes?.video?.video?.data?.attributes?.url,
                  );
                  return (
                    <div
                      key={data?.id}
                      className="blogCard"
                      onClick={() =>
                        handleClickVideo(data.id, data.attributes.videoViews)
                      }
                    >
                      <Card
                        bingeCard
                        isBingeWatch
                        key={data.id}
                        variant="vertical"
                        coverImg={
                          data?.id != elementNo
                            ? getStrapiMedia(
                              data?.attributes?.video?.coverImg?.image?.data
                                ?.attributes?.url,
                            )
                            : ''
                        }
                        cardTag={
                          <Link
                            href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}`}
                          >
                            {
                              data?.attributes?.blog_categories?.data[0]
                                ?.attributes?.title
                            }
                          </Link>
                        }
                        imgHeight={300}
                        imgWidth={300}
                        date={dateFormate(data?.attributes?.publish_date)}
                        count={<CalculateVideoDuration videoUrl={videoUrl} />}
                        blogId={data?.id}
                        color="bg-white"
                        size="base"
                        isVideo={data?.id != elementNo ? true : false}
                        videoSrc={videoUrl}
                        title={data?.attributes?.Title}
                        blogtags={data?.attributes?.blog_categories}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="sm-container flex flex-col items-center justify-center gap-6 rounded-md bg-skyBlue-300 p-10 text-center">
          <RiAlarmWarningFill
            size={60}
            className="drop-shadow-glow animate-flicker text-red-500"
          />
          <Heading priority="5" font="font-normal">
            Oops! No data found
          </Heading>
        </div>
      )}

      {showLoadMore && (
        <div className="pt-6">
          <LoadMore icon onClick={handleLoadMore}>
            Load More
          </LoadMore>
        </div>
      )}

      <OtherCards trendingBlogs={randomBlogs} goodReadsBlogs={randomBlogs} />
    </PageBase>
  );
}

export default BingeWatch;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params || {};

    const option = {
      folds:
        'populate=video.video&populate=video.coverImg.image&populate=coverImg.image&populate=blog_categories&populate=blog_authors&populate=blog_authors.image&populate=video.coverVideo.smallVideo',
      image: 'coverImg',
    };

    let bingeVideo, blogsList, blogsCategories, categoryDetails, randomBlogs;

    try {
      const { data }: any = await BlogCategoryService();
      const content = data.blogCategories.data;
      blogsCategories = content;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'blogs?filters[blog_categories][slug][$eq]',
        param.categoryName as string,
        option,
      );

      blogsList = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'blog-categories?filters[slug][$eq]',
        param.categoryName as string,
      );
      categoryDetails = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        param.categoryName as string,
        option,
      );

      bingeVideo = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BlogService();
      const content = data.sunriseBlogs?.data;
      randomBlogs = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        categoryDetails: categoryDetails || [],
        blogsList: blogsList || [],
        blogsCategories: blogsCategories || [],
        bingeVideo: bingeVideo || [],
        randomBlogs: randomBlogs || [],
      },
    };
  },
);
