import React, { useRef, useState, useEffect } from 'react';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import withCommonData from '@/lib/withCommonData';
import captureSentryException from '@/lib/sentryException';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import Card from '@/components/Card';
import PageBase from '@/components/layout/PageBase';
import BackToTop from '@/components/Utility/BackToTop';
import { BingeWatchService, BlogService } from '@/service';
import { dateFormate, getStrapiMedia, getYouTubeVideoId } from '@/lib/helpers';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import BingeWatchCard from '@/pages/sunrise-club/binge-watch/BingeWatchCard';
import Breadcrumb from '@/components/Utility/Breadcrumb';

const BingeWatchDetail = ({
  randomBlogs,
  bingeWatchList,
  initialMenus,
  initialBottomMenus,
  initialSocials = [],
  searchData,
}: any) => {
  // const hasBingeWatch = randomBlogs.some((ele: Blog) => ele.attributes.watch);
  const hasBingeWatch = bingeWatchList?.length > 0;

  const [FilteredData, setFilteredData] = useState<any[]>([]);
  const [elementNo, setElementNo] = useState<number>();
  const bingewatchUrl = '/sunrise-club/binge-watch';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    // const filtered = bingeWatchList.filter(
    //   (data: Blog) =>
    //     data?.attributes?.watch &&
    //     data?.attributes?.video?.video?.data?.attributes?.url
    // );
    setFilteredData(bingeWatchList);
  }, [hasBingeWatch]);

  useEffect(() => {
    setIsPlaying(false);
  }, [slug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handlePlayClick = () => {
    setIsPlaying(true);
    // if (videoRef.current) {
    //   videoRef.current.controls = true;
    //   videoRef.current.play();
    // }
  };

  const currentBlog = React.useMemo(() => {
    if (!slug || !bingeWatchList?.length) return null;
    return bingeWatchList.find((blog: Blog) => blog.attributes?.slug === slug);
  }, [slug, randomBlogs]);

  const handleClickBingeWatchVideo = (data: any) => {
    router.push(`/sunrise-club/binge-watch-detail/${data?.attributes?.slug}`);
  };

  const handleMouseEnter = (id: any) => {
    setHoveredCardId(id);
  };

  const handleMouseLeave = () => {
    setHoveredCardId(null);
  };

  const currentIndex = React.useMemo(() => {
    if (!slug || !FilteredData.length) return -1;

    return FilteredData.findIndex(
      (blog: Blog) => blog.attributes?.slug === slug,
    );
  }, [slug, FilteredData]);

  const nextVideo =
    currentIndex >= 0
      ? FilteredData[(currentIndex + 1) % FilteredData.length]
      : null;

  const prevVideo =
    currentIndex > 0
      ? FilteredData[currentIndex - 1]
      : FilteredData[FilteredData.length - 1];

  const videoBase = `https://www.youtube.com/embed/${getYouTubeVideoId(
    currentBlog?.attributes?.Link,
  )}`;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Sunrise Club', path: '/sunrise-club' },
    { title: 'Binge Watch', path: '/sunrise-club/binge-watch' },
    { title: currentBlog?.attributes?.Title || 'Video Detail' },
  ];

  const handleCoverImageClick = () => {
    setIsPlaying(true);
  };

  return (
    <PageBase
      title="Sunrise Club"
      description="Explore our blog categories"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <BackToTop to="blogBody" />

      <>
        <div className="sm-container pt-10">
          <Breadcrumb homeIcon crumbs={CRUMB_OPTIONS} />
        </div>
        <div className="mb-5">
          <div className="relative">
            <Link
              href={
                prevVideo
                  ? `/sunrise-club/binge-watch-detail/${prevVideo.attributes.slug}`
                  : '#'
              }
              className="absolute left-4 z-20 p-3 opacity-50 hover:opacity-100 flex items-center text-start bg-black-150 hover:bg-[#0000005b] top-44 border border-white rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="#fff"
                className="bi bi-arrow-left-short"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                />
              </svg>
            </Link>
            <div className="mb-5">
              <div className="relative w-full overflow-hidden rounded-lg lg:h-[70vh] h-[50vh]">
                <div className="relative w-full h-full lg:h-[70vh]">
                  {!isPlaying ? (
                    <>
                      <CustomImage
                        src={getStrapiMedia(
                          currentBlog?.attributes?.CoverImg?.data?.attributes
                            ?.url,
                        )}
                        width={1900}
                        height={600}
                        className="object-cover video-cover-img absolute top-0 left-0 w-full h-full z-10"
                        alt="Video cover"
                      />
                      <div
                        className="absolute top-1/2 left-1/2 z-20 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                        onClick={() => {
                          handleCoverImageClick();
                        }}
                      >
                        <div className="play-btn bg-black-50 rounded-full">
                          <CustomImage
                            src="/images/sunrise/play-icon.svg"
                            fill
                            className="!h-9 !w-9 lg:!h-15 lg:!w-15 xl:!h-full xl:!w-full"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      id="bingeWatchIframe"
                      className="w-full h-[70vh] ifram-video absolute top-0 left-0"
                      width="560"
                      height="315"
                      src={`${videoBase}?autoplay=1&mute=0&controls=1&rel=0&enablejsapi=1&origin=${origin}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
            <Link
              href={
                nextVideo
                  ? `/sunrise-club/binge-watch-detail/${nextVideo.attributes.slug}`
                  : '#'
              }
              className="opacity-50 hover:opacity-100 absolute right-4 z-20 p-3 flex items-center text-start bg-black-150 hover:bg-[#0000005b] top-44 border border-white rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="#fff"
                className="bi bi-arrow-right-short"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="sm-container">
          <div className="grid grid-cols-12 lg:mb-12 mb-10">
            <div className="col-span-9">
              <Heading priority={1} variant="lg">
                {currentBlog?.attributes?.Title}
              </Heading>
              <Text size="md" customClass="text-black mt-4">
                {currentBlog?.attributes?.Description}
              </Text>
            </div>
          </div>
          {hasBingeWatch && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-10 video-cards">
                <>
                  {FilteredData?.map((data: Blog) => {
                    // if (data.attributes.watch) {
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
                        onClick={(e) => {
                          handleClickBingeWatchVideo(data);
                        }}
                        onMouseEnter={() => handleMouseEnter(data.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <BingeWatchCard
                          key={data?.id}
                          blogID={data?.id}
                          videoId={
                            getYouTubeVideoId(data?.attributes?.Link) || ''
                          }
                          coverImg={getStrapiMedia(
                            data?.attributes?.CoverImg?.data?.attributes?.url,
                          )}
                          duration={data?.attributes?.watchTime}
                          title={data?.attributes?.Title}
                          date={data?.attributes?.publish_date}
                        />
                      </div>
                    );
                  })}
                </>
              </div>
            </>
          )}
          {/* Video cards section  */}
        </div>
        <SensitiveContentModal
          open={!!selectedBlogSlug}
          onClose={() => setSelectedBlogSlug(null)}
          onDeny={() => setSelectedBlogSlug(null)}
          onConfirm={() => {
            if (selectedBlogSlug) {
              router.push(`${router.asPath}/${selectedBlogSlug}`);
              setSelectedBlogSlug(null);
            }
          }}
        />
      </>
    </PageBase>
  );
};

export default BingeWatchDetail;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params;

    const option = {
      folds:
        'populate=video.video&populate=video.coverImg.image&populate=coverImg.image&populate=blog_categories&populate=sunrise_doctor&populate=blog_authors',
    };
    let randomBlogs, bingeWatchList;

    try {
      const { data }: any = await BingeWatchService();
      const content = data.youtubes?.data ?? [];
      bingeWatchList = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        randomBlogs: randomBlogs || [],
        bingeWatchList: bingeWatchList || [],
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
