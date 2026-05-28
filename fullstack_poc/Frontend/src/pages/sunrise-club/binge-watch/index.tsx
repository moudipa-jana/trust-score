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
import { dateFormate, getStrapiMedia, getYouTubeVideoId } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import OtherCards from '@/pages/sunrise-club-old/[categoryName]/OtherCards';
import { BingeWatchService, BlogService } from '@/service';
import { BlogCategoryService, UpdateBlogVideoCount } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';
import GoodReads from '@/components/pages/Blog/GoodReads';
import BlogTrending from '@/components/pages/Blog/BlogTrending';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import BingeWatchCard from './BingeWatchCard';
import Image from 'next/image';
import CustomImage from '@/components/Utility/CustomImage';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import KofukuPicks from '@/components/pages/Blog/KofukuPicks';
import TopReads from '@/components/pages/Blog/TopReads';

const CRUMB_OPTIONS = [
  { title: 'Home', path: '/' },
  { title: 'Sunrise Club', path: '/sunrise-club' },
  { title: 'Binge Watch' },
];

interface VideoAttributes {
  Title: string;
  watch: boolean;
  videoViews: number;
  slug: string;
  publish_date: string;
  watchTime: string;
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
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: ForumBingeWatchBlog[];
  bingeWatchList: any,
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
  bingeWatchList,
}: BingeWatchProps) {
  const router = useRouter();
  const [playVideo, setPlayVideo] = useState(true);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [elementNo, setElementNo] = useState<string>();
  const [videoId, setVideoId] = useState<string>();
  const [preViews, setPreviews] = useState<number>(0);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

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

  const itemsPerPage = 9;
  const bingeBlogs = bingeWatchList
  // .filter(
  //   (data: Blog) =>
  //     !!data?.attributes?.video?.video?.data?.attributes?.url,
  // )


  const [visibleData, setVisibleData] = useState(
    bingeBlogs.slice(0, itemsPerPage),
  );


  useEffect(() => {
    if (bingeBlogs.length > itemsPerPage) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }
  }, [bingeBlogs.length]);

  const handleLoadMore = () => {
    const currentLength = visibleData.length;
    const newData = bingeBlogs.slice(
      currentLength,
      currentLength + itemsPerPage,
    );

    const updatedData = [...visibleData, ...newData];
    setVisibleData(updatedData);

    if (updatedData.length >= bingeBlogs.length) {
      setShowLoadMore(false);
    }
  };

  const filteredVideoData = useMemo(() => {
    return visibleData
    // .filter(
    //   (data: Blog) =>
    //     !!data?.attributes?.video?.video?.data?.attributes?.url,
    // );
  }, [visibleData]);

  const handleClickBingeWatchVideo = (data: any) => {
    router.push(`/sunrise-club/binge-watch-detail/${data?.attributes?.slug}`);
  }

  const handleMouseEnter = (id: any) => {
    setHoveredCardId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };

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
          <div className="pt-10">
            <Breadcrumb homeIcon crumbs={CRUMB_OPTIONS} />
          </div>
          <div className="py-5 text-center lg:text-start xl:pb-10">
            <span className="font-bold text-3xl">Binge Watch</span>
          </div>
        </div>
      </div>

      <div className="container relative mb-6.25 w-full ">
        {filteredVideoData &&
          filteredVideoData
            .slice(-1)
            .map((latestData: any) => {
              const videoUrl = getStrapiMedia(
                latestData?.attributes?.link
              );

              return (
                <>
                  <div className='relative'>
                    {/* hereo section  */}
                    <div className='absolute w-full h-full rounded-md bg-gradient-to-l from-[#fffffff5] to-transparent top-0 left-0 z-1 flex items-center px-5 lg:px-10 justify-end cursor-pointer'>
                      <div className='w-[40%]'>
                        <Heading priority="1" variant="lg" color="text-black-200">
                          {latestData?.attributes?.Title}
                        </Heading>
                        {/* <div className="flex items-center justify-end lg:justify-start">
                          <span
                            className="lineHeight font-regular text-xxs text-primary lg:text-sm"
                          >
                            {
                              latestData?.attributes?.Description
                            }
                          </span>
                        </div> */}
                        <div className='absolute right-3 bottom-3'>
                          <Text customClass="ml-5 flex gap-2 items-center" size="xsm" color="text-gray-850">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.5 4.66602C8.5 4.53341 8.44732 4.40623 8.35355 4.31246C8.25979 4.21869 8.13261 4.16602 8 4.16602C7.86739 4.16602 7.74022 4.21869 7.64645 4.31246C7.55268 4.40623 7.5 4.53341 7.5 4.66602V7.99935C7.49996 8.08412 7.52148 8.16751 7.56253 8.24168C7.60358 8.31585 7.66282 8.37836 7.73467 8.42335L9.73467 9.67335C9.84712 9.74372 9.98292 9.76654 10.1122 9.73678C10.1762 9.72205 10.2367 9.69485 10.2902 9.65674C10.3437 9.61864 10.3892 9.57036 10.424 9.51468C10.4588 9.459 10.4824 9.397 10.4933 9.33223C10.5041 9.26745 10.5022 9.20117 10.4874 9.13716C10.4727 9.07314 10.4455 9.01266 10.4074 8.95916C10.3693 8.90566 10.321 8.86019 10.2653 8.82535L8.5 7.72202V4.66602Z" fill="#919191" />
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.0013 2.16602C6.45421 2.16602 4.97047 2.7806 3.87651 3.87456C2.78255 4.96852 2.16797 6.45225 2.16797 7.99935C2.16797 9.54645 2.78255 11.0302 3.87651 12.1241C4.97047 13.2181 6.45421 13.8327 8.0013 13.8327C9.5484 13.8327 11.0321 13.2181 12.1261 12.1241C13.2201 11.0302 13.8346 9.54645 13.8346 7.99935C13.8346 6.45225 13.2201 4.96852 12.1261 3.87456C11.0321 2.7806 9.5484 2.16602 8.0013 2.16602ZM3.16797 7.99935C3.16797 7.36463 3.29299 6.73612 3.53588 6.14971C3.77878 5.56331 4.1348 5.03048 4.58362 4.58167C5.03244 4.13285 5.56526 3.77683 6.15167 3.53393C6.73807 3.29103 7.36658 3.16602 8.0013 3.16602C8.63602 3.16602 9.26453 3.29103 9.85094 3.53393C10.4373 3.77683 10.9702 4.13285 11.419 4.58167C11.8678 5.03048 12.2238 5.56331 12.4667 6.14971C12.7096 6.73612 12.8346 7.36463 12.8346 7.99935C12.8346 9.28123 12.3254 10.5106 11.419 11.417C10.5126 12.3235 9.28318 12.8327 8.0013 12.8327C6.71942 12.8327 5.49005 12.3235 4.58362 11.417C3.67719 10.5106 3.16797 9.28123 3.16797 7.99935Z" fill="#919191" />
                            </svg>
                            <CalculateVideoDuration videoUrl={videoUrl} />
                          </Text>
                        </div>
                      </div>
                    </div>
                    {latestData?.attributes?.Link ?
                      (() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        return (
                          <iframe width="560" height="315" className='h-[50vh] w-full rounded-md'
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                              latestData?.attributes?.Link
                            )}?autoplay=1&mute=1&controls=0&rel=0&enablejsapi=1&origin=${origin}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>
                          </iframe>
                        );
                      })() :
                      <>
                        <CustomImage
                          src={getStrapiMedia(latestData?.attributes?.CoverImg?.data?.attributes?.url)}
                          width={1900}
                          height={600}
                          className="object-cover w-full h-[70vh] rounded-md"
                          alt="Video cover"
                        />


                      </>
                    }
                  </div >
                </>
              );
            })}
      </div>

      {
        !isEmpty(filteredVideoData) ? (
          <div className="relative w-full  pt-10 pb-4" id="content">
            <div className="container">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-5 xl:grid-cols-3 xl:gap-x-5 xl:gap-y-9 video-cards">
                {filteredVideoData &&
                  filteredVideoData.map((data: Blog) => {

                    return (
                      <div
                        key={data?.id}
                        className="cursor-pointer"
                        onClick={() =>
                          // handleClickVideo(data.id, data.attributes.videoViews)
                          handleClickBingeWatchVideo(data)
                        }
                        onMouseEnter={() => handleMouseEnter(data.id)}
                        onMouseLeave={handleMouseLeave}

                      >
                        <BingeWatchCard
                          key={data.id}
                          blogID={data?.id}
                          videoId={getYouTubeVideoId(data?.attributes?.Link) || ""}
                          duration={data?.attributes?.watchTime}
                          coverImg={getStrapiMedia(data?.attributes?.CoverImg?.data?.attributes?.url)}
                          title={data?.attributes?.Title}
                          date={data?.attributes?.publish_date}
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
        )
      }

      {
        showLoadMore && (
          <div className="pt-6">
            <LoadMore icon onClick={handleLoadMore}>
              Load More
            </LoadMore>
          </div>
        )
      }

      {/* Kofuku's Pick */}
      <div className="container mb-15">
        <div className="lg:px-10">
          {randomBlogs && randomBlogs.some(blog => blog?.attributes?.pick) && (
            <KofukuPicks kofukuPicsBlogs={randomBlogs} />
          )}
        </div>
      </div>

      {/* Top Reads */}
      <div className="container mb-15">
        <div className="lg:px-10">
          {randomBlogs && randomBlogs.some(blog => blog?.attributes?.views > 0) && (
            <TopReads topReads={randomBlogs} />
          )}
        </div>
      </div>

      {/* Trending */}
      <div className="container mb-15">
        <div className="lg:px-10">
          {randomBlogs && <BlogTrending trendingBlogs={randomBlogs} ShowAll={true} />}
        </div>
      </div>
      {/* Good Reads */}
      <div className=" container ">
        <div className="lg:px-10">
          {randomBlogs && <GoodReads goodReads={randomBlogs} ShowAll={true} />}
        </div>
      </div>

      

      {/* <OtherCards trendingBlogs={randomBlogs} goodReadsBlogs={randomBlogs} /> */}
    </PageBase >
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

    let bingeVideo, blogsList, blogsCategories, categoryDetails, randomBlogs, bingeWatchList;

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

    try {
      const { data }: any = await BingeWatchService();
      const content = (data.youtubes?.data ?? [])
      bingeWatchList = content;
    } catch (error) {
      captureSentryException(error);
    }


    return {
      props: {
        categoryDetails: categoryDetails || [],
        blogsList: blogsList || [],
        blogsCategories: blogsCategories || [],
        bingeVideo: bingeVideo || [],
        bingeWatchList: bingeWatchList || [],
        randomBlogs: randomBlogs || [],
      },
    };
  },
);
