import { useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Card from '@/components/Card';
import VideoComponent from '@/components/Card/VideoComponent';
import CalculateVideoDuration from '@/components/Utility/CalculateVideoDuration';
import LoadMore from '@/components/Utility/LoadMore';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import {
  dateFormate,
  emitErrorNotification,
  formatGraphqlError,
  getStrapiMedia,
} from '@/lib/helpers';
import OtherCards from '@/pages/sunrise-club-old/[categoryName]/OtherCards';
import cmsClient from '@/service/cmsClient';
import { GET_SEARCHED_BLOG_VIDEOS } from '@/service/graphql/Campfire';

interface VideoAttributes {
  Title: string;
  watch: boolean;
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

interface SearchVideoBlogsProps {
  randomBlogs: VideoBlog[];
  searchText?: string | string[];
}

const LIMIT = 4;

function SearchVideoBlogs({ randomBlogs, searchText }: SearchVideoBlogsProps) {
  const [playVideo, setPlayVideo] = useState(true);
  const [elementNo, setElementNo] = useState<string>();
  const [videoBlogs, setVideoBlogs] = useState<VideoBlog[]>([]);
  const [loadMoreStatus, setLoadMoreStatus] = useState(true);
  const [searchString, setSearchString] = useState<
    string | string[] | null | undefined
  >(null);

  const {
    refetch: getVideoBlogs,
    data: searchVideoBlogsData,
    error: searchVideoBlogsError,
  } = useQuery(GET_SEARCHED_BLOG_VIDEOS, {
    variables: {
      title: searchText,
      start: 0,
      limit: LIMIT,
    },
    fetchPolicy: 'no-cache',
    client: cmsClient,
    skip: searchText === '',
  });

  // Handle search video blogs completion
  useEffect(() => {
    if (searchVideoBlogsData) {
      const blogs = (searchVideoBlogsData as any).blogs;
      if (searchText === searchString) {
        setVideoBlogs([...videoBlogs, ...blogs.data]);
      } else {
        setVideoBlogs([...blogs.data]);
        setSearchString(searchText);
        setLoadMoreStatus(true);
      }

      if (blogs.data.length < LIMIT) setLoadMoreStatus(false);
    }
  }, [searchVideoBlogsData, searchText, searchString, videoBlogs]);

  // Handle search video blogs error
  useEffect(() => {
    if (searchVideoBlogsError) {
      emitErrorNotification(formatGraphqlError(searchVideoBlogsError));
    }
  }, [searchVideoBlogsError]);

  const handleClickVideo = (ctx: string) => {
    setPlayVideo(!playVideo);
    setElementNo(ctx);
  };

  function handleLoadMore(): void {
    getVideoBlogs({
      title: searchText,
      start: videoBlogs.length + 1,
      limit: LIMIT,
    });
  }

  return (
    <div>
      <div className="sm-container relative !mb-6.25 w-full xl:px-0">
        {randomBlogs &&
          randomBlogs
            .filter((data: VideoBlog) => data.attributes.watch)
            .slice(-1)
            .map((latestData: VideoBlog) => {
              const videoUrl = getStrapiMedia(
                latestData?.attributes?.video?.video?.data?.attributes?.url,
              );
              return (
                <VideoComponent
                  bingeBanner
                  key={latestData?.id}
                  src={getStrapiMedia(
                    latestData.attributes?.video?.coverVideo?.smallVideo?.data
                      ?.attributes?.url,
                  )}
                  coversrc={getStrapiMedia(
                    latestData.attributes?.video?.video?.data?.attributes?.url,
                  )}
                >
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

      {!isEmpty(videoBlogs) ? (
        <div className="relative w-full bg-skyBlue-700 pt-4 pb-4" id="content">
          <div className="sm-container xl:px-0">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-5">
              {videoBlogs.map((data: VideoBlog) => {
                if (data.attributes.watch) {
                  const videoUrl = getStrapiMedia(
                    data?.attributes?.video?.video?.data?.attributes?.url,
                  );
                  return (
                    <div
                      key={data?.id}
                      className="blogCard"
                      onClick={() => handleClickVideo(data.id)}
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
                        videoSrc={getStrapiMedia(
                          data.attributes?.video?.video?.data?.attributes?.url,
                        )}
                        title={data?.attributes?.Title}
                        blogtags={data?.attributes?.blog_categories}
                      />
                    </div>
                  );
                }
                return null;
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

      {!isEmpty(videoBlogs) && loadMoreStatus && (
        <div className="pt-6">
          <LoadMore icon onClick={handleLoadMore}>
            Load More
          </LoadMore>
        </div>
      )}

      <div className="sm-container xl:px-0">
        <OtherCards
          noContainer
          trendingBlogs={randomBlogs}
          goodReadsBlogs={randomBlogs}
        />
      </div>
    </div>
  );
}

export default SearchVideoBlogs;
