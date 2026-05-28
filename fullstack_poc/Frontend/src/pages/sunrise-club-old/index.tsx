/**
 * Sunrise Blog Page
 *
 * This page is responsible for displaying blog categories using the Sunrise section.
 */

import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';
import Sunrise from '@/components/pages/Blog/SunriseSection';
import BackToTop from '@/components/Utility/BackToTop';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { BlogCategoryService } from '@/service';
import type { MenuItem } from '@/types/menu';

interface CategoryAttributes {
  title: string;
  slug: string;
  description?: string;
}

export interface BlogCategory {
  id: string | number;
  attributes: CategoryAttributes;
}

interface BlogProps {
  blogsCategories: BlogCategory[];
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function Blog({
  blogsCategories,
  initialMenus,
  initialBottomMenus,
  initialSocials = [],
  searchData,
}: BlogProps) {
  return (
    <PageBase
      title="Sunrise Club"
      description="Explore our blog categories"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <Sunrise blogsCategories={blogsCategories} />
      <BackToTop to="blogBody" />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let blogsCategories: BlogCategory[] | null = null;
  try {
    const { data }: any = await BlogCategoryService();
    blogsCategories = data?.blogCategories?.data ?? null;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      blogsCategories: blogsCategories || [],
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});
