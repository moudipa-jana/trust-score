import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import Card from '@/components/Card';
import useIsMobile from '@/Hooks/useIsMobile';
import { dateFormate, formatShortCount, getStrapiMedia } from '@/lib/helpers';
import { UpdateBlogVideoCount } from '@/service';

interface VideoData {
  id: string;
  attributes: {
    Title: string;
    shortDes: string;
    publish_date: string;
    views: number;
    videoViews: number;
    blog_categories: {
      data: Array<{ attributes: { title: string; slug: string } }>;
    };
    video?: {
      coverImg?: { image?: { data?: { attributes: { url: string } } } };
      video?: { data?: { attributes: { url: string } } };
    } | null;
  };
}

interface YouTubeData {
  id: string;
  attributes: {
    Title: string;
    Description: string;
    Link: string;
    publish_date: string;
    CoverImg: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export interface VideoBlogBookmarkType {
  id: string;
  attributes: {
    sunrise_blog?: { data: VideoData };
    youtubes?: { data: YouTubeData };
  };
}

interface VideoBlogBookmarkProps {
  videoBookmarkBlog: VideoBlogBookmarkType;
}

function VideoBlogBookmark({ videoBookmarkBlog }: VideoBlogBookmarkProps) {
  const blogData = videoBookmarkBlog?.attributes?.sunrise_blog?.data;
  const youtubeData = videoBookmarkBlog?.attributes?.youtubes?.data;

  const router = useRouter();
  const [playVideo, setPlayVideo] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preViews, setPreviews] = useState<number | undefined>(undefined);
  const isMobile = useIsMobile();

  const isYouTube = !!youtubeData;
  const hasVideo = isYouTube
    ? !!youtubeData?.attributes?.Link
    : !!blogData?.attributes?.video?.video?.data?.attributes?.url;

  const handleClickVideo = (id: string, currentViews: number | undefined) => {
    if (!hasVideo) return;
    setPlayVideo((prev) => (activeId === id ? !prev : true));
    setActiveId(id);
    setPreviews(currentViews);
  };

  // Ensure cleanup on route change
  useEffect(() => {
    const start = () => {
      setActiveId(null);
      setPlayVideo(false);
    };
    router.events.on('routeChangeStart', start);
    return () => {
      router.events.off('routeChangeStart', start);
    };
  }, [router.events]);

  // Increment video view after ~2s of watch
  const [watched, setWatched] = useState(false);
  const sendBackendRequest = useCallback(async () => {
    if ((!blogData?.id && !youtubeData?.id) || preViews == null) return;
    try {
      if (blogData?.id) {
        await UpdateBlogVideoCount(`${blogData.id}`, preViews + 1);
      }
    } catch {
      /* no-op */
    }
  }, [blogData?.id, youtubeData?.id, preViews]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleVideoWatch = () => {
      const id = blogData?.id || youtubeData?.id;
      if (!watched && id && activeId === id) {
        const today = new Date().toISOString().slice(0, 10);
        const watchedVideos =
          JSON.parse(localStorage.getItem('watchedVideos') ?? '{}') || {};
        if (!watchedVideos[today]?.[id]) {
          sendBackendRequest();
          watchedVideos[today] = {
            ...(watchedVideos[today] || {}),
            [id]: true,
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
  }, [blogData?.id, youtubeData?.id, activeId, watched, sendBackendRequest]);

  if (!blogData && !youtubeData) return null;

  const idStr = blogData?.id || youtubeData?.id || '';
  const coverUrl = isYouTube
    ? getStrapiMedia(youtubeData?.attributes?.CoverImg?.data?.attributes?.url)
    : getStrapiMedia(
      blogData?.attributes?.video?.coverImg?.image?.data?.attributes?.url,
    );
  const videoUrl = isYouTube
    ? youtubeData?.attributes?.Link // Assuming Link is the YouTube URL
    : getStrapiMedia(blogData?.attributes?.video?.video?.data?.attributes?.url);

  // Helper to extract YouTube ID if needed or just use URL if Card supports it
  // Assuming Card supports youtube URL for videoSrc

  return (
    <div
      className="blogCard my-2"
      onClick={() =>
        handleClickVideo(
          idStr,
          isYouTube ? 0 : blogData?.attributes?.videoViews,
        )
      }
    >
      <Card
        videoCard
        key={idStr}
        coverImg={!hasVideo || activeId !== idStr || !playVideo ? coverUrl : ''}
        cardTag={
          isYouTube
            ? 'Binge Watch'
            : blogData?.attributes?.blog_categories?.data?.[0]?.attributes
              ?.title
        }
        blogtags={isYouTube ? undefined : blogData?.attributes?.blog_categories}
        imgHeight={250}
        imgWidth={200}
        isVideo={!hasVideo ? false : !(activeId === idStr && playVideo)}
        blogId={idStr}
        variant="vertical"
        date={dateFormate(
          isYouTube
            ? youtubeData?.attributes?.publish_date || ''
            : blogData?.attributes?.publish_date || '',
        )}
        count={formatShortCount(
          isYouTube ? 0 : +(blogData?.attributes?.views || 0),
        )}
        color="bg-skyBlue-300"
        title={
          isYouTube
            ? youtubeData?.attributes?.Title
            : blogData?.attributes?.Title
        }
        description={
          (
            (isYouTube
              ? youtubeData?.attributes?.Description
              : blogData?.attributes?.shortDes) || ''
          ).slice(0, 200) + '...'
        }
        videoSrc={videoUrl}
      />
    </div>
  );
}

export default VideoBlogBookmark;
