{
  /**
   * This is the Help and Support page.
   * - Displays FAQ types, page data, and frequently asked questions.
   * - Uses `getServerSideProps` to fetch data for FAQ types, help center information, and FAQs.
   * - Handles API errors and provides fallback data.
   **/
}

import React from 'react';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Help from '@/components/pages/help-support';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { FaqsService, faqTypesService, helpSupportService } from '@/service';
import { FAQ, FaqType, PageData } from '@/types/helpCenter';
import type { MenuItem } from '@/types/menu';

interface HelpSupportProps {
  faqTypes: FaqType[];
  pageData: PageData;
  faqs: FAQ[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
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

export default function Page({
  faqTypes,
  pageData,
  faqs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: HelpSupportProps) {
  return (
    <Help
      faqTypes={faqTypes}
      pageData={pageData}
      faqs={faqs}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    />
  );
}

export const getServerSideProps = withCommonData(async () => {
  let faqTypes, pageData, faqs;
  try {
    const { data }: any = await faqTypesService();
    faqTypes = data?.faqTypes?.data ?? {};

    const { data: helpSupportData }: any = await helpSupportService();
    pageData = helpSupportData?.helpCenter?.data ?? {};

    const { data: faqsData }: any = await FaqsService();
    faqs = faqsData?.faqs?.data ?? [];
  } catch (error) {
    captureSentryException(error);
  }
  return {
    props: {
      faqTypes: faqTypes || [],
      pageData: pageData || {},
      faqs: faqs || [],
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});
