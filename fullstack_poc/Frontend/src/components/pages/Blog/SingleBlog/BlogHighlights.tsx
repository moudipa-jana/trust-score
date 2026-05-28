import { capitalize } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Card from '@/components/Card';
import Carousel from '@/components/Utility/Carousel';
import Heading from '@/elements/Heading';
import SeeAll from '@/elements/SeeAll';
import { dateFormate, formatShortCount, getStrapiMedia } from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { UpdateBlogVideoCount } from '@/service';

interface BlogHighlightsProps {
  randomBlogs: Blog[];
}

function BlogKofukuPicksDetails(KofukuSliders: Blog[]) {
  const router = useRouter();
  const [playVideo, setPlayVideo] = useState(true);
  const [elementNo, setElementNo] = useState<number>();
  const [videoId, setVideoId] = useState<string>();
  const handleClickVideo = (ctx: number) => {
    setPlayVideo(!playVideo);
    setElementNo(ctx);
    setVideoId(ctx.toString());
  };

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      setElementNo(0);
    });
  }, [router.events]);
  const [watched, setWatched] = useState(false);
  const sendBackendRequest = useCallback(async () => {
    try {
      await UpdateBlogVideoCount(`${videoId}`, 111);
    } catch (error) {
      return;
    }
  }, [videoId]);

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

  return KofukuSliders.sort(
    (a: Blog, b: Blog) => b.attributes.views - a.attributes.views,
  ).map((slider: Blog) => {
    return (
      <div
        key={slider.id}
        className="blogCard"
        onClick={() => handleClickVideo(slider.id as unknown as number)}
      >
        <Card
          variant="vertical"
          coverImg={
            (slider.id as unknown as number) != elementNo
              ? getStrapiMedia(
                slider?.attributes?.video?.coverImg?.image?.data?.attributes
                  ?.url,
              )
              : ''
          }
          cardTag={
            slider?.attributes?.blog_categories?.data[0]?.attributes?.title
          }
          imgHeight={300}
          imgWidth={300}
          date={dateFormate(slider?.attributes?.publish_date)}
          count={formatShortCount(+slider?.attributes?.videoViews || 0)}
          color="lg:bg-white bg-transparent"
          size="base"
          blogId={slider?.id}
          isVideo={(slider.id as unknown as number) != elementNo ? true : false}
          videoSrc={getStrapiMedia(
            slider.attributes?.video?.video?.data?.attributes?.url,
          )}
          title={capitalize(slider?.attributes?.Title)}
          handleTimeUpdate={undefined}
          isBingeWatch
          blogtags={slider?.attributes?.blog_categories}
        />
      </div>
    );
  });
}

export default function BlogHighlights({ randomBlogs }: BlogHighlightsProps) {
  const bingewatchUrl = '/sunrise-club/binge-watch';

  const filteredVideoData = useMemo(() => {
    return randomBlogs.filter(
      (data) => !!data?.attributes?.video?.video?.data?.attributes?.url,
    );
  }, [randomBlogs]);
  return (
    <div>
      <div className="mb-20 bg-white py-8 pb-10 lg:bg-skyBlue-700">
        <div className="sm-container pb-8">
          <Link href={bingewatchUrl}>
            <div className="text-center lg:text-left">
              <span className="weirdShapeTitle yellow">Binge Watch</span>
            </div>
          </Link>
        </div>
        {BlogKofukuPicksDetails(filteredVideoData).slice(0, 6).length > 0 ? (
          <div
            className="sm-container bg-skyBlue-700 p-4 lg:bg-transparent lg:p-0"
            id="slider-card"
          >
            <Carousel
              slidesToShow={4}
              mdSlidesToShow={2}
              smSlidesToShow={1}
              slidesToScroll={1}
              arrow={false}
              dots
            >
              {BlogKofukuPicksDetails(filteredVideoData).slice(0, 6)}
            </Carousel>
            <div className="mr-5 mt-10 xl:m-0">
              <SeeAll navigate link={bingewatchUrl} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center  gap-6  py-10 text-center">
            <RiAlarmWarningFill
              size={60}
              className="drop-shadow-glow animate-flicker text-red-500"
            />
            <Heading priority="5" font="font-normal">
              Oops! No data found
            </Heading>
          </div>
        )}
      </div>
    </div>
  );
}
