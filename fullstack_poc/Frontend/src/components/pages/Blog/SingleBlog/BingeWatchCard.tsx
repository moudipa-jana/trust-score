import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';
import CustomImage from "@/components/Utility/CustomImage";
import Heading from '@/elements/Heading';
import { dateFormate, getStrapiMedia } from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { UpdateBlogVideoCount } from '@/service';


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
  const [watched, setWatched] = useState(false);

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

  return KofukuSliders?.map((data: Blog) => {
    if (data.attributes.watch) {
      return (<div className="max-w-xl bg-[#EDEDED] rounded-lg flex gap-2 testing"
        key={data?.id}
        onClick={() =>
          handleClickVideo(
            data.id as unknown as number,
            data.attributes.videoViews,
          )
        }>
        <div className="relative  rounded-l-lg">

          <div className='!h-[110px] w-[178px]  rounded-l-lg'>
            <CustomImage src={
              (data.id as unknown as number) != elementNo
                ? getStrapiMedia(
                  data?.attributes?.video?.coverImg?.image?.data?.attributes
                    ?.url,
                )
                : ''
            } width={178} height={110} className="object-cover !h-[110px] w-[178px]  rounded-l-lg" />
          </div>

          {/* Play Button */}
          <div className="absolute right-0 bottom-0 m-4 z-1">
            <CustomImage src="/images/Group.png" width={20} height={20} className="object-contain !w-10 !h-10" />
          </div>
        </div>
        <div className="flex flex-col justify-between p-4">
          <h3 className="text-base font-semibold text-black line-clamp-2 ">
            {data?.attributes?.Title}
          </h3>
          <div className="flex justify-between items-center">
            <div className="text-sm text-black-300 mt-2">
              {(() => {
                            const formattedDate = dateFormate(data?.attributes?.publish_date);
                            const isInvalidDate = formattedDate.toLowerCase().includes('invalid') || formattedDate.toLowerCase().includes('nan');
                            
                            return (
                                <>
                                    {!isInvalidDate && <span>{formattedDate}&nbsp;</span>}
                                    {data?.attributes?.watchTime && (
                                        <div className="flex items-center gap-1" style={{ color: '#9D9D9D', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '14px' }}>
                                            {!isInvalidDate && <span>•</span>}
                                            <img src="/images/basil_clock-outline.png" alt="clock" width={16} height={16} />
                                            {data?.attributes?.watchTime} mins watch
                                        </div>
                                    )}
                                </>
                            );
                        })()}
            </div>
            <div>
              <span className="cursor-pointer">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" color="#00B2ED" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className='text-primary'><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"></path></svg></span>
            </div>
          </div>
        </div>
      </div>
      );
    }
    return null;
  });
}

export default function BingeWatchCard({
  bingeWatch,
  nopadd,
  noLink,
}: BingeWatchProps) {
  const bingewatchUrl = '/sunrise-club/binge-watch';

  const filteredBlogs = bingeWatch?.filter(
    (data: Blog) =>
      data?.attributes?.watch &&
      data?.attributes?.video?.video?.data?.attributes?.url,
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

        <div className="my-4">
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
            <div className=' grid grid-cols-1 md:grid-cols-2 gap-5'>
              {BlogKofukuPicksDetails(filteredBlogs)}
            </div>
          )}
        </div>

        {!noLink && (
          <div className="flex justify-end mt-4">
            <Link
              href={bingewatchUrl}
              className="flex items-center justify-center bg-white transition-colors hover:bg-cyan-50"
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
