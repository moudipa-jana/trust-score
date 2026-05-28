/**
 * Displays all blogs marked as 'Good Read' in Sunrise Club.
 * - Animated hero banner on desktop.
 * - Breadcrumbs for navigation.
 * - Filters and lists Good Read blogs from all blogs.
 * - Server-side data fetching for blog list.
 */

import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import ImageOne from '/public/images/sunrise/illustration-one.png';
import ImageThree from '/public/images/sunrise/illustration-three.png';
import ImageTwo from '/public/images/sunrise/illustration-two.png';
import Card from '@/components/Card';
import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { dateFormate, getStrapiMedia } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { BlogService } from '@/service';
import type { MenuItem } from '@/types/menu';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BlogAuthor {
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
}

interface BlogAttributes {
  Title: string;
  slug: string;
  shortDes: string;
  publish_date: string;
  good_read: boolean;
  blog_authors: {
    data: BlogAuthor[];
  };
  blog_categories: {
    data: Array<{
      attributes: {
        title: string;
        slug: string;
      };
    }>;
  };
  coverImg: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
}

interface Blog {
  id: string;
  attributes: BlogAttributes;
}

interface GoodReadProps {
  randomBlogs: Blog[];
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

function GoodRead({
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: GoodReadProps) {
  const isipad = useIsipad();
  const ismobile = useIsMobile();
  const [loaderComplete, setLoaderComplete] = useState(false); // Track loader completion
  const [animationReady, setAnimationReady] = useState(false); // Track animation readiness

  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Sunrise Club', path: '/sunrise-club' },
    { title: 'Good Read' },
  ];

  const handleScrollToTop = () => {
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    handleScrollToTop();
    // Simulate loading delay for demo purposes
    const timeout = setTimeout(() => {
      // Set animationReady to true after a simulated delay (you can replace this with your loading logic)
      setAnimationReady(true);
    }, 1000); // Simulated delay of 2 seconds

    return () => clearTimeout(timeout); // Clear timeout on unmount or re-render
  }, []);

  useEffect(() => {
    if (loaderComplete) {
      // Scroll function executes after loader completes
      window.scrollTo(0, 0);
    }
  }, [loaderComplete]);

  useEffect(() => {
    if (!ismobile) {
      const mainContent: HTMLElement | null =
        document.getElementById('contentOuter');
      const innerContent: HTMLElement | null =
        document.getElementById('bannerImage');
      const body = document.body;

      body.classList.add('overflow-hidden');
      mainContent?.classList.remove('hideHeroSectionGoodReads');

      const timeout = setTimeout(() => {
        body.classList.remove('overflow-hidden');
        innerContent?.classList.remove('lg:mb-8');
        mainContent?.classList.add('hideHeroSectionGoodReads');

        setLoaderComplete(true);
      }, 4000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [ismobile]);

  return (
    <PageBase
      title="Good Read"
      description="Good Read"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="animate-flickerHide opacity-0">
        <div id="contentOuter" className="mt-0">
          <div>
            {!ismobile && (
              <div
                className="relative overflow-hidden bg-green-500 lg:mb-8"
                id="bannerImage"
              >
                {animationReady ? (
                  <>
                    <div className="container">
                      <div className="mx-0 flex gap-6 xl:mx-14">
                        <CustomImage
                          src={ImageOne}
                          className="animate-fadeInBottom"
                          alt="Banner"
                        />
                        <CustomImage
                          src={ImageTwo}
                          className="animate-3s animate-fadeInBottom"
                          alt="Banner"
                        />
                        <CustomImage
                          src={ImageThree}
                          className="animate-fadeInTop"
                          alt="Banner"
                        />
                      </div>
                    </div>
                    <div className="absolute top-10 w-full text-center">
                      <Heading
                        priority="1"
                        variant="xl"
                        color="text-yellow-450"
                        font="font-extrabold"
                      >
                        Good Reads
                      </Heading>
                    </div>
                  </>
                ) : (
                  <div className="container">Loading animation...</div>
                )}
              </div>
            )}

            <div className="relative z-10">
              <div
                className="container sticky top-21.1 z-50 hidden xl:block"
                id="paths"
              >
                <div className="container">
                  <Breadcrumb homeIcon crumbs={CRUMB_OPTIONS} />
                </div>
              </div>

              <div className="block py-5 text-center lg:hidden lg:text-start">
                <span className="weirdShapeTitle">Good reads</span>
              </div>

              <div className="container relative top-0 w-full bg-white pb-16">
                <div className="container pb-10">
                  <div className="grid grid-cols-1 gap-x-2.5 gap-y-6 pt-2.5 lg:grid-cols-1 xl:grid-cols-3">
                    {randomBlogs &&
                      randomBlogs
                        .filter((data: Blog) => data.attributes.good_read)
                        .map((data: Blog) => {
                          return (
                            <Link
                              key={data?.id}
                              href={`/sunrise-club/good-read/${data?.attributes?.slug}`}
                            >
                              <Card
                                sunrise
                                bookmarkHead
                                authorName={
                                  data?.attributes?.blog_authors.data[0]
                                    ?.attributes?.name
                                }
                                date={dateFormate(
                                  data?.attributes?.publish_date,
                                )}
                                authorImg={getStrapiMedia(
                                  data?.attributes?.blog_authors?.data[0]
                                    ?.attributes?.image?.data?.attributes?.url,
                                )}
                                title={data?.attributes?.Title}
                                coverImg={getStrapiMedia(
                                  data?.attributes?.coverImg?.data?.attributes
                                    ?.url,
                                )}
                                blogId={data?.id}
                                color="bg-blue-600"
                                roundBorder="rounded-lg"
                                flow="column"
                                variant={isipad ? 'horizontal' : 'vertical'}
                                blogtags={data?.attributes?.blog_categories}
                                description={
                                  data?.attributes?.shortDes?.slice(0, 85) +
                                  '...'
                                }
                                readTime={
                                  <span>
                                    {extractAndCalculateReadTime(data)}
                                  </span>
                                }
                              />
                            </Link>
                          );
                        })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBase>
  );
}

export default GoodRead;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    let randomBlogs;
    try {
      const { data }: any = await BlogService();
      const content = data.sunriseBlogs?.data;
      randomBlogs = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        randomBlogs: randomBlogs || [],
      },
    };
  },
);
