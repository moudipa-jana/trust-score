import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Card from '@/components/Card';
import Carousel from '@/components/Utility/Carousel';
import Heading from '@/elements/Heading';
import { dateFormate, getStrapiMedia, getYouTubeVideoId } from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { UpdateBlogVideoCount } from '@/service';
import BingeWatchCard from '@/pages/sunrise-club/binge-watch/BingeWatchCard';

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

interface BlogCategory {
  data: {
    attributes: {
      slug: string;
      title: string;
    };
  }[];
}

export interface BlogData {
  id: number;
  attributes: {
    Title: string;
    watch: boolean;
    publish_date: string;
    videoViews: number;
    video: BlogVideo;
    blog_categories: BlogCategory;
  };
}

interface BingeWatchProps {
  bingeWatch: Blog[];
  nopadd?: boolean;
  noLink?: boolean;
}

function BlogKofukuPicksDetails(KofukuSliders: Blog[]) {
  const router = useRouter();
  const [playVideo, setPlayVideo] = useState(true);
  const [elementNo, setElementNo] = useState<number>();
  const [videoId, setVideoId] = useState<number>();
  const [preViews, setPreviews] = useState<number>(0);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const handleClickVideo = (ctx: number, id: number) => {
    setPlayVideo(!playVideo);
    setElementNo(ctx);
    setVideoId(ctx);
    setPreviews(id == null ? 0 : id);
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setElementNo(0);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  const [watched, setWatched] = useState(false);
  const sendBackendRequest = useCallback(async () => {
    try {
      await UpdateBlogVideoCount(`${videoId}`, preViews + 1);
    } catch (error) {
      return;
    }
  }, [videoId, preViews]);

  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    const handleVideoWatch = () => {
      if (!watched) {
        const today = new Date().toISOString().slice(0, 10);
        const watchedVideos =
          JSON.parse(localStorage.getItem('watchedVideos') ?? '{}') || {};

        if (!watchedVideos[today] || !watchedVideos[today][videoId as number]) {
          sendBackendRequest();

          watchedVideos[today] = {
            ...watchedVideos[today],
            [videoId as number]: true,
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

  const handleClickBingeWatchVideo = (data: any) => {
    router.push(`/sunrise-club/binge-watch-detail/${data?.attributes?.slug}`);
  }

  const handleMouseEnter = (id: any) => {
    setHoveredCardId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };


  return KofukuSliders?.map((data: Blog) => {
    if (data?.attributes) {
      return (
        <div
          key={data?.id}
          className="cursor-pointer"
          // onClick={() =>
          //   // handleClickVideo(
          //   //   data.id as unknown as number,
          //   //   data.attributes.videoViews,
          //   // )
          // }
          onMouseEnter={() => handleMouseEnter(data.id)}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            handleClickBingeWatchVideo(data);
          }}
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
          {/* <Card
            key={data.id}
            variant="vertical"
            // coverImg={
            //   (data.id as unknown as number) != hoveredCardId
            //     ? getStrapiMedia(
            //       data?.attributes?.video?.coverImg?.image?.data?.attributes
            //         ?.url,
            //     )
            //     : ''
            // }
            coverImg={
              (data.id as unknown as number) == hoveredCardId
                ? '/video/Microsoft Advantage.gif'
                : getStrapiMedia(
                  data?.attributes?.video?.coverImg?.image?.data
                    ?.attributes?.url,
                )
            }
            cardTag={
              data?.attributes?.blog_categories?.data[0]?.attributes?.title
            }
            imgHeight={200}
            imgWidth={300}
            date={dateFormate(data?.attributes?.publish_date)}
            count={
              (data?.attributes as any)?.readDuration
                ? `${(data?.attributes as any)?.readDuration} min`
                : undefined
            }
            blogId={data?.id}
            color="bg-[#EDEDED]"
            size="base"
            isVideo={
              (data?.id as unknown as number) != elementNo ? true : false
            }
            videoSrc={getStrapiMedia(
              data?.attributes?.video?.video?.data?.attributes?.url,
            )}
            title={data?.attributes?.Title}
            isBingeWatch
            blogtags={data?.attributes?.blog_categories}
            playIconSrc="/images/Group.png"
          /> */}
        </div>
      );
    }
    return null;
  });
}

export default function BingeWatch({
  bingeWatch,
  nopadd,
  noLink,
}: BingeWatchProps) {
  const bingewatchUrl = '/sunrise-club/binge-watch';

  const filteredBlogs = bingeWatch?.filter(
    (data: Blog) =>
      data
    // data?.attributes?.watch &&
    // data?.attributes?.video?.video?.data?.attributes?.url,
  );

  return (
    <div className="pickSection pt-10">
      <div className="sm-container">
        <div className="pb-5">
          {noLink ? (
            <span className="dottedSectionTitle">Binge watch</span>
          ) : (
            <Link href={bingewatchUrl}>
              <span className="dottedSectionTitle">Binge watch</span>
            </Link>
          )}
        </div>

        <div className="my-4" id="slider-card">
          {!filteredBlogs || filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
              <RiAlarmWarningFill
                size={60}
                className="drop-shadow-glow animate-flicker text-red-500"
              />
              <Heading priority="5" font="font-normal">
                Oops! No data found
              </Heading>
            </div>
          ) : (
            <Carousel
              slidesToShow={3}
              mdSlidesToShow={2}
              smSlidesToShow={1}
              slidesToScroll={3}
              arrow={false}
              dots
            >
              {BlogKofukuPicksDetails(filteredBlogs)}
            </Carousel>
          )}
        </div>

        {!noLink && (
          <div className="flex justify-end mt-4">
            <Link
              href={bingewatchUrl}
              className="flex items-center justify-center bg-white transition-colors hover:bg-cyan-50 relative z-5"
              style={{
                gap: '4px',
                padding: '8px 32px',
                borderRadius: '6px',
                border: '1px solid #00B2ED',
                color: '#00B2ED',
                minWidth: '115px',
                height: '38px',
              }}
            >
              See all
            </Link>
          </div>
        )}
      </div>


    </div>
  );
}
