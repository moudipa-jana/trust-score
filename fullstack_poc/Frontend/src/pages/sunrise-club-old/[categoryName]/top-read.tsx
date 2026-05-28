import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Banner from '/public/images/top-read.png';
import Card from '@/components/Card';
import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import HeroSection from '@/components/pages/sunrise-club/HeroSection';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { dateFormate, getStrapiMedia } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';

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

interface TopReadProps {
  blogsList: Blog[];
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

function TopRead({
  blogsList,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: TopReadProps) {
  const router = useRouter();
  const { categoryName } = router.query;
  const isipad = useIsipad();
  const ismobile = useIsMobile();
  const dynamicValue = categoryName; // url value
  const [loaderComplete, setLoaderComplete] = useState(false); // Track loader completion
  const [animationReady, setAnimationReady] = useState(false); // Track animation readiness

  const formatCategoryName = (name: string | string[] | undefined): string => {
    if (typeof name === 'string') {
      return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    }
    return String(categoryName); // Convert to string to ensure consistent return type
  };

  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Sunrise Club', path: '/sunrise-club' },
    {
      title: formatCategoryName(categoryName),
      path: `/sunrise-club/${categoryName}`,
    },
    { title: 'Top Read' },
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
      // Set animationReady to true after a simulated delay
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
      const breadcrumbPath: HTMLElement | null =
        document.getElementById('paths');
      const body = document.body;

      body.classList.add('overflow-hidden');
      if (breadcrumbPath) {
        breadcrumbPath.style.transition = 'opacity 1s ease-in-out';
        breadcrumbPath.style.opacity = '0';
      }
      if (mainContent) {
        mainContent.classList.remove('hideHeroSection');
        mainContent.classList.add('mt-0');
      }

      const timeout = setTimeout(() => {
        body.classList.remove('overflow-hidden');
        if (mainContent) {
          mainContent.classList.remove('mt-0');
          mainContent.classList.add('hideHeroSection');
        }
        if (breadcrumbPath) {
          breadcrumbPath.style.transition = 'opacity 1s ease-in-out';
          breadcrumbPath.style.opacity = '1';
        }

        setLoaderComplete(true);
      }, 4000);

      return () => clearTimeout(timeout); // Clear timeout on unmount or re-render
    }
    return undefined;
  }, [ismobile]);

  return (
    <PageBase
      title="Top Read"
      description="Top Read"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="top-reads animate-flickerHide opacity-0">
        <div id="contentOuter" className="mt-0">
          {!ismobile && (
            <div className="fixedImage relative xl:h-calc" id="bannerImage">
              {animationReady ? (
                <HeroSection src={Banner} />
              ) : (
                /* Placeholder or loader component while animation data is loading */
                <div className="container">Loading animation...</div>
              )}
            </div>
          )}

          <div className="lg:mt-6 xl:mt-14">
            <div
              className="container sticky top-21.1 z-50 hidden xl:block"
              id="paths"
            >
              <div className="container">
                <Breadcrumb homeIcon crumbs={CRUMB_OPTIONS} />
              </div>
            </div>

            <div className="block py-5 text-center lg:hidden lg:text-start">
              <span className="weirdShapeTitle">Top reads</span>
            </div>

            <div
              className="container relative top-0 w-full bg-white pb-16"
              id="content"
            >
              <div className="container pb-10">
                <div className="grid grid-cols-1 gap-x-2.5 gap-y-6 pt-2.5 lg:grid-cols-1 xl:grid-cols-3">
                  {blogsList &&
                    blogsList.map((data: Blog) => {
                      return (
                        <Link
                          key={data?.id}
                          href={`/sunrise-club/${dynamicValue}/${data?.attributes?.slug}`}
                        >
                          <Card
                            sunrise
                            bookmarkHead
                            authorName={
                              data?.attributes?.blog_authors.data[0]?.attributes
                                ?.name
                            }
                            authorImg={getStrapiMedia(
                              data?.attributes?.blog_authors?.data[0]
                                ?.attributes?.image?.data?.attributes?.url,
                            )}
                            title={data?.attributes?.Title}
                            coverImg={getStrapiMedia(
                              data?.attributes?.coverImg?.data?.attributes?.url,
                            )}
                            blogId={data?.id}
                            date={dateFormate(data?.attributes?.publish_date)}
                            color="bg-blue-600"
                            roundBorder="rounded-lg"
                            flow="column"
                            variant={isipad ? 'horizontal' : 'vertical'}
                            blogtags={data?.attributes?.blog_categories}
                            description={
                              data?.attributes?.shortDes?.slice(0, 85) + '...'
                            }
                            // cardTag={data?.attributes?.blog_categories?.data[0]?.attributes
                            //   ?.title}
                            readTime={
                              <span>{extractAndCalculateReadTime(data)}</span>
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
    </PageBase>
  );
}

export default TopRead;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params || {};
    let blogsList;
    const options = {
      folds:
        'populate=firstFold.coverImg.image&populate=secondFold.coverImg.image&populate=thirdFold.coverImg.image&populate=fourthFold.coverImg.image&populate=fifthFold.coverImg.image&populate=sixthFold.coverImg.image&populate=seventhFold.coverImg.image&populate=eighthFold.coverImg.image&populate=ninthFold.coverImg.image&populate=tenthFold.coverImg.image&populate=eleventhFold.coverImg.image&populate=twelfthFold.coverImg.image&populate=thirteenthFold.coverImg.image&populate=fourteenthFold.coverImg.image&populate=fifteenthFold.coverImg.image&populate=coverImg&populate=blog_authors.image',
      image: 'coverImg',
    };

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        param.categoryName as string,
        options,
      );
      blogsList = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        blogsList: blogsList || [],
      },
    };
  },
);
