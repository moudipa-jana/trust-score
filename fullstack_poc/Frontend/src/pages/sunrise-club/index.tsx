/**
 * Sunrise Blog Page
 *
 * This page is responsible for displaying blog categories using the Sunrise section.
 */

import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';
import BackToTop from '@/components/Utility/BackToTop';

import CardSlider from './CardSlier';
import HeroSection from './HeroSection';
import withCommonData from '@/lib/withCommonData';
import { BlogCategoryService } from '@/service';
import captureSentryException from '@/lib/sentryException';
import { StaticImageData } from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryAttributes {
  title: string;
  slug: string;
  description?: string;
  iconRegular?: StaticImageData;
  iconHover?: StaticImageData;
  backgroundColor?: string;
}

export interface BlogCategory {
  id: string | number;
  attributes: CategoryAttributes;
}

const SunriseClubNew = ({
  blogsCategories,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: {
  blogsCategories: BlogCategory[];
  initialMenus: any;
  initialBottomMenus: any;
  searchData: BlogData[];
  initialSocials: any;
}) => {
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

      <HeroSection />
      <CardSlider blogsCategories={blogsCategories} />
    </PageBase>
  );
};
export default SunriseClubNew;

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
