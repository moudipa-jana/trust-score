/* eslint-disable unused-imports/no-unused-vars */
import { isEmpty, shuffle } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import Card from '@/components/Card';
import CustomImage from '@/components/Utility/CustomImage';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { dateFormate, formatShortCount, getStrapiMedia, getYouTubeVideoId } from '@/lib/helpers';
import { UpdateBlogVideoCount } from '@/service';
import BingeWatchCard from '@/pages/sunrise-club/binge-watch/BingeWatchCard';

export interface BlogCategory {
  data: Array<{
    attributes: {
      title: string;
      slug: string;
    };
  }>;
}

interface BlogVideo {
  coverImg: {
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
  video: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
}

interface BlogAttributes {
  Link: string
  CoverImg: any;
  shortDes: string;
  good_read: boolean;
  coverImg: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  trending: unknown;
  watch: boolean;
  blog_categories: BlogCategory;
  Title: string;
  publish_date: string;
  watchTime: string;
  videoViews: number;
  views: number;
  slug: string;
  video: BlogVideo;
}

export interface Blog {
  id: number;
  attributes: BlogAttributes;
}

interface ForumBingeWatchProps {
  bingeWatch: Blog[];
}

export default function ForumBingeWatch({ bingeWatch }: ForumBingeWatchProps) {
  const bingewatchUrl = '/sunrise-club/binge-watch';
  const ismobile = useIsMobile();
  const [shuffledBingeWatchBlogs, setShuffledBingeWatchBlogs] = useState<
    Blog[]
  >([]);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [watched, setWatched] = useState(false);
  const [videoId] = useState<string>('');
  const [preViews] = useState<number>(0);
  const router = useRouter();

  const handleMouseEnter = (id: number) => {
    setHoveredCardId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };

  useEffect(() => {
    const shuffled = shuffle(bingeWatch) as Blog[];
    setShuffledBingeWatchBlogs(shuffled);
  }, [bingeWatch]);

  ///***************************** Video Count **************************** ///
  const sendBackendRequest = useCallback(async () => {
    if (!videoId || typeof preViews !== 'number') return;

    try {
      await UpdateBlogVideoCount(videoId, preViews + 1);
    } catch (_error) {
      return;
    }
  }, [videoId, preViews]);

  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    const handleVideoWatch = () => {
      if (!watched && videoId) {
        const today = new Date().toISOString().slice(0, 10);
        const watchedVideos =
          JSON.parse(localStorage.getItem('watchedVideos') ?? '{}') || {};

        if (
          !watchedVideos[today] ||
          (typeof videoId === 'string' && !watchedVideos[today][videoId])
        ) {
          sendBackendRequest();

          // Update watchedVideos in localStorage
          watchedVideos[today] = { ...watchedVideos[today], [videoId]: true };
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

  const filteredBlogs = shuffledBingeWatchBlogs
    // .filter(
    //   (data) =>
    //     data?.attributes?.watch &&
    //     data?.attributes?.video?.video?.data?.attributes?.url,
    // )
    .slice(0, 2);


  const handleClickBingeWatchVideo = (data: any) => {
    router.push(`/sunrise-club/binge-watch-detail/${data?.attributes?.slug}`);
  }

  if (isEmpty(filteredBlogs)) {
    return null;
  }
  return (
    <div className="">
      <div className="flex justify-between space-x-2">
        <div className={`flex-1 ${ismobile ? 'mt-11' : 'mt-6'}`}>
          <div className="relative flex items-center text-start">
            <div className="z-11">
              <Text size="md" color="text-gray-1250" font="font-semibold">
                Binge Watch
              </Text>
            </div>
            <div
              className={`${ismobile ? 'left-20 h-5 w-10' : 'left-28 h-7 w-14'
                } absolute `}
            >
              <CustomImage src="/video/Binge Watch Icon.gif" fill />
            </div>
          </div>
          <div className="line"></div>
        </div>
        <div className="">
          <SeeAll navigate link={bingewatchUrl} />
        </div>
      </div>
      <div className="mt-2">
        <div
          className={`flex ${ismobile ? 'flex-col space-y-6' : 'flex justify-between space-x-6'
            } video-cards`}
        >
          {filteredBlogs &&
            filteredBlogs.slice(0, 2).map((data: Blog) => {
              return (
                <div
                  key={data?.id}
                  className={`${ismobile ? '' : 'flex-1'}`}
                  onMouseEnter={() => handleMouseEnter(data.id)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => {
                    handleClickBingeWatchVideo(data);
                    e.stopPropagation()
                  }}
                >
                  {/* <Link
                    // href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                  > */}

                  <BingeWatchCard
                    key={data.id}
                    blogID={data?.id}
                    videoId={getYouTubeVideoId(data?.attributes?.Link) || ""}
                    coverImg={getStrapiMedia(data?.attributes?.CoverImg?.data?.attributes?.url)}
                    title={data?.attributes?.Title}
                    date={data?.attributes?.publish_date}
                    duration={data?.attributes?.watchTime}
                  />
                  {/* <Card
                      key={data.id}
                      variant="vertical"
                      coverImg={
                        hoveredCardId === data.id
                          ? '/video/Microsoft Advantage.gif'
                          : getStrapiMedia(
                            data?.attributes?.video?.coverImg?.image?.data
                              ?.attributes?.url,
                          )
                      }
                      cardTag={
                        <div
                          onClick={() => {
                            router.push(
                              `/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}`,
                            );
                          }}
                        >
                          {
                            data?.attributes?.blog_categories?.data[0]
                              ?.attributes?.title
                          }
                        </div>
                      }
                      imgHeight={300}
                      imgWidth={300}
                      date={data?.attributes?.publish_date ? dateFormate(data?.attributes?.publish_date) : '-'}
                      count={formatShortCount(
                        +data?.attributes?.videoViews || 0,
                      )}
                      blogId={data?.id}
                      color="bg-white"
                      size="base"
                      isVideo={hoveredCardId === data.id ? false : true}
                      videoSrc={getStrapiMedia(
                        data.attributes?.video?.video?.data?.attributes?.url,
                      )}
                      title={data?.attributes?.Title}
                      isBingeWatch
                      blogtags={data?.attributes?.blog_categories}
                      isBorderRadius

                      textAlign
                      hovered
                      playIconSrc="/images/Group.png"
                    /> */}
                  {/* </Link> */}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
