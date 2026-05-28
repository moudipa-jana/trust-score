/**
 * Displays the main Sunrise Club page with various blog categories and features:
 * - Loads blogs based on selected category.
 * - Shows recommended carousel, all blogs grid, Kofuku Picks, Good Reads, Trending, Binge Watch, and Top Reads sections.
 * - Handles scroll restoration when navigating away or refreshing the page.
 * - Dynamically updates the Hero Slider and content sections based on available data.
 * - Includes a menu for exploring categories, and a "Back to Top" button for easier navigation.
 */

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import AllBlogs from '@/components/pages/Blog/AllBlogs';
import BingeWatch from '@/components/pages/Blog/BingeWatch';
import Menu from '@/components/pages/Blog/BlogMenu';
import BlogTrending from '@/components/pages/Blog/BlogTrending';
import ExploreBy from '@/components/pages/Blog/ExploreBy';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';
import GoodReads from '@/components/pages/Blog/GoodReads';
import HeroSlider from '@/components/pages/Blog/HeroSlider';
import KofukuPicks from '@/components/pages/Blog/KofukuPicks';
import TopReads from '@/components/pages/Blog/TopReads';
import BackToTop from '@/components/Utility/BackToTop';
import CustomImage from '@/components/Utility/CustomImage';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { BlogCategoryService, BlogService, BingeWatchService } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';
import { WARNING_SENSITIVE_CATEGORY } from '@/lib/constants';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryAttributes {
  title: string;
  slug: string;
}

interface Category {
  id: string;
  attributes: CategoryAttributes;
}

interface SunriseClubProps {
  blogsCategories: [];
  bingeWatch: any;
  blogsList: Blog[];
  categoryDetails: Category[];
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: BlogData[];
}

function SunriseClub({
  blogsCategories,
  blogsList,
  categoryDetails,
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  initialSocials = [],
  searchData,
  bingeWatch,
}: SunriseClubProps) {
  const hasKofukuPicks = blogsList.some((ele: Blog) => ele.attributes.pick);
  const hasGoodReads = randomBlogs.some(
    (ele: Blog) => ele.attributes.good_read,
  );
  const hasTrending = randomBlogs.some((ele: Blog) => ele.attributes.trending);
  const hasBingeWatch = bingeWatch?.length > 0;
  const hasTopReads = blogsList.some((ele: Blog) => ele.attributes.views > 0);

  const [sliderKey, setSliderKey] = useState(0);

  const handleTabClick = useCallback(() => {
    setSliderKey((prevKey) => prevKey + 1);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    router.events.on('routeChangeStart', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router.events]);

  return (
    <PageBase
      title="Sunrise Club"
      description="Explore our blog categories"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <div className="blog-single">
        <div className="relative">
          <div className="container">
            <Menu
              onTabClick={handleTabClick}
              blogsCategories={blogsCategories}
            />
            {/* Category Title */}
            <h1
              className="mt-8 mb-0 text-2xl font-semibold lg:text-[32px]"
              style={{
                color: '#272727',
                fontFamily: 'Manrope, sans-serif',
                letterSpacing: '0.01em',
                lineHeight: '40px',
              }}
            >
              {categoryDetails[0]?.attributes?.title}
            </h1>
            {/* Hero Slider with Recommended Blogs */}
            <HeroSlider
              key={sliderKey}
              categoryDetails={categoryDetails}
              blogsList={blogsList}
            />
          </div>
          <div className="relative" id="blogBody">
            {/* All Blogs Grid with Load More */}
            <div className="sm-container">
              <AllBlogs blogs={blogsList} initialCount={9} loadMoreCount={6} />
            </div>

            {/* Kofuku's Pick */}
            <div className="sm-container">
              {hasKofukuPicks && <KofukuPicks kofukuPicsBlogs={blogsList} />}
            </div>

            {/* Good Reads */}
            <div className="sm-container">
              {hasGoodReads && <GoodReads goodReads={randomBlogs} />}
            </div>

            {/* Trending */}
            <div className="sm-container">
              {hasTrending && <BlogTrending trendingBlogs={randomBlogs} />}
            </div>

            {/* Binge Watch */}
            {hasBingeWatch && <BingeWatch bingeWatch={bingeWatch} />}

            {/* Top Reads */}
            <div className="sm-container">
              {hasTopReads && <TopReads topReads={blogsList} />}
            </div>
          </div>
        </div>

        {/* Explore By Section */}
        {blogsCategories && <ExploreBy blogsCategories={blogsCategories} />}

        <BackToTop to="blogBody" />
      </div>
    </PageBase>
  );
}
export default SunriseClub;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params;

    const option = {
      folds:
        'populate=video.video&populate=video.coverImg.image&populate=coverImg.image&populate=blog_categories&populate=sunrise_doctor&populate=blog_authors',
    };

    let blogsList, blogsCategories, categoryDetails, randomBlogs, bingeWatch;

    try {
      const { data }: any = await BlogCategoryService();
      const content = data.blogCategories.data;
      blogsCategories = content;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        param?.categoryName as string,
        option,
      );

      blogsList = (data ?? []).map((blog: Blog) => {
        return {
          ...blog,
          hasSensitiveContent: WARNING_SENSITIVE_CATEGORY.includes(
            param?.categoryName as string,
          )
            ? true
            : blog?.attributes?.blog_categories?.data?.some((category) =>
              WARNING_SENSITIVE_CATEGORY.some((slug) =>
                category.attributes?.slug?.toLowerCase().includes(slug),
              ),
            ),
        };
      });
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'blog-categories?filters[slug][$eq]',
        param?.categoryName as string,
      );
      categoryDetails = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BlogService();
      const content = (data.sunriseBlogs?.data ?? []).map((blog: Blog) => {
        return {
          ...blog,
          hasSensitiveContent: WARNING_SENSITIVE_CATEGORY.includes(
            param?.categoryName as string,
          )
            ? true
            : blog?.attributes?.blog_categories?.data?.some((category) =>
              WARNING_SENSITIVE_CATEGORY.some((slug) =>
                category.attributes?.slug?.toLowerCase().includes(slug),
              ),
            ),
        };
      });
      randomBlogs = content;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BingeWatchService();
      const content = data.youtubes?.data ?? [];
      bingeWatch = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        categoryDetails: categoryDetails || [],
        blogsList: blogsList || [],
        blogsCategories: blogsCategories || [],
        randomBlogs: randomBlogs || [],
        initialMenus: [],
        bingeWatch: bingeWatch || [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
