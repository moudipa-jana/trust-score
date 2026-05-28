/**
 * Trending Page
 *
 * This page displays the top 10 trending blogs sorted by publish date.
 */

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import TrendingHills, {
  BlogData,
} from '@/components/pages/Trending/TrendingHills';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { BlogCategoryService } from '@/service';
import { BlogService } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';

interface BlogAttributes {
  trending: boolean;
  publish_date: string;
  video?: {
    video: string;
    coverImg: { image: string };
  };
  readDuration?: number;
  coverImg?: { image: string };
  blog_categories: unknown;
  views: number;
}

interface Blog {
  attributes: BlogAttributes;
}

interface TrendingProps {
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function Trending({
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: TrendingProps) {
  const trendingBlogs = randomBlogs.some(
    (ele: Blog) => ele.attributes.trending === true,
  );

  const filteredBlogs = randomBlogs
    .sort(
      (a: Blog, b: Blog) =>
        (b.attributes?.views || 0) - (a.attributes?.views || 0),
    )
    .filter((data: Blog) => data?.attributes?.trending)
    .slice(0, 10);

  if (trendingBlogs) {
    return (
      <PageBase
        title="Trending"
        description="Trending"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <TrendingHills
          blogsList={filteredBlogs as unknown as BlogData[]}
        ></TrendingHills>
      </PageBase>
    );
  } else {
    return (
      <PageBase
        title="Trending"
        description="Trending"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <div className="m-10 mt-40 flex items-center justify-center text-2xl font-bold">
          No Trending Blogs
        </div>
      </PageBase>
    );
  }
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params || {};

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
      const { data }: any = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        param.categoryName as string,
        option,
      );

      blogsList = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'blog-categories?filters[slug][$eq]',
        param.categoryName as string,
      );
      categoryDetails = data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BlogService();
      const content = data.sunriseBlogs.data;
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
      },
    };
  },
);
