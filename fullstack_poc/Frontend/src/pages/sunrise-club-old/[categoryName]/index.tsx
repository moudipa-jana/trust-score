/**
 * Displays the main Sunrise Club page with various blog categories and features:
 * - Loads blogs based on selected category.
 * - Shows recommended, Kofuku Picks, Good Reads, Binge Watch, and Top Reads sections.
 * - Handles scroll restoration when navigating away or refreshing the page.
 * - Dynamically updates the Hero Slider and content sections based on available data.
 * - Includes a menu for exploring categories, and a "Back to Top" button for easier navigation.
 */

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import blogBg from '/public/images/blog/blogBg-2.svg';
import PageBase from '@/components/layout/PageBase';
import BingeWatch from '@/components/pages/Blog/BingeWatch';
import Menu from '@/components/pages/Blog/BlogMenu';
import ExploreBy from '@/components/pages/Blog/ExploreBy';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';
import GoodReads from '@/components/pages/Blog/GoodReads';
import HeroSlider from '@/components/pages/Blog/HeroSlider';
import KofukuPicks from '@/components/pages/Blog/KofukuPicks';
import Recommended from '@/components/pages/Blog/Recommended';
import TopReads from '@/components/pages/Blog/TopReads';
import BackToTop from '@/components/Utility/BackToTop';
import CustomImage from '@/components/Utility/CustomImage';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { BlogCategoryService, BlogService } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';
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
  blogsCategories: Category[];
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
}: SunriseClubProps) {
  const recommendedBlogs = blogsList.some(
    (ele: Blog) => ele.attributes.recommended,
  );
  const kofukuPicsBlogs = blogsList.some((ele: Blog) => ele.attributes.pick);
  const goodReads = randomBlogs.some((ele: Blog) => ele.attributes.good_read);
  const bingeWatch = randomBlogs.some((ele: Blog) => ele.attributes.watch);
  const topReads = blogsList.some((ele: Blog) => ele.attributes.views > 0);

  const [sliderKey, setSliderKey] = useState(0);

  const handleTabClick = useCallback(() => {
    setSliderKey((prevKey) => prevKey + 1);
  }, []);

  const router = useRouter();

  const currentCategoryName =
    (router.query.categoryName as string) ||
    categoryDetails?.[0]?.attributes?.slug ||
    '';

  // filter randomBlogs to only the "Good reads" that belong to this category
  const goodReadsForCategory = (randomBlogs || []).filter(
    (b: Blog) =>
      b?.attributes?.good_read &&
      b?.attributes?.blog_categories?.data?.some(
        (c: any) => c?.attributes?.slug === currentCategoryName,
      ),
  );

  useEffect(() => {
    const handleRouteChange = () => {
      // Save the current scroll position when navigating away from the page
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    const handleBeforeUnload = () => {
      // Save scroll position when the user reloads or leaves the page
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    router.events.on('routeChangeStart', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    // handleScrollRestoration(); // Restore scroll position on initial load

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
      <div className="blog-single ">
        <div className="relative">
          <div className="container">
            <div className="blogBgHolder copy-disable absolute top-[200px] left-0  h-[3880px] w-full overflow-hidden">
              <CustomImage src={blogBg} layout="fill" objectFit="cover" />
            </div>
            <Menu
              onTabClick={handleTabClick}
              blogsCategories={blogsCategories}
            />
          </div>

          <div className="relative" id="blogBody">
            <div className="lg-container">
              {recommendedBlogs && (
                <HeroSlider
                  key={sliderKey}
                  categoryDetails={categoryDetails}
                  blogsList={blogsList}
                />
              )}
            </div>

            <div className="sm-container">
              {recommendedBlogs && <Recommended recommendedBlogs={blogsList} />}

              {kofukuPicsBlogs && <KofukuPicks kofukuPicsBlogs={blogsList} />}
              {/* {goodReads && (
                <GoodReads
                  goodReads={randomBlogs}
                />
              )} */}
              {goodReadsForCategory.length > 0 && (
                <GoodReads
                  goodReads={goodReadsForCategory}
                  categorySlug={currentCategoryName}
                />
              )}
            </div>
            {bingeWatch && <BingeWatch bingeWatch={randomBlogs} />}
            <div className="sm-container">
              {topReads && <TopReads topReads={blogsList} />}
            </div>
          </div>
        </div>
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
        'populate=video.video&populate=video.coverImg.image&populate=coverImg.image&populate=blog_categories',
    };

    let blogsList, blogsCategories, categoryDetails, randomBlogs;

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
          hasSensitiveContent:
            param?.categoryName === 'hush-talks'
              ? false
              : blog?.attributes?.blog_categories?.data?.some((category) =>
                  category.attributes?.slug
                    ?.toLowerCase()
                    .includes('contagion'),
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
          hasSensitiveContent:
            param?.categoryName === 'hush-talk'
              ? false
              : blog?.attributes?.blog_categories?.data?.some((category) =>
                  category.attributes?.slug
                    ?.toLowerCase()
                    .includes('hush-talks'),
                ),
        };
      });

      randomBlogs = content;
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
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
