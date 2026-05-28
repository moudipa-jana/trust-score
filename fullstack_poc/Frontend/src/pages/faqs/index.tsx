{
  /**
   * This is the FAQ page.
   * - Displays a list of frequently asked questions (FAQs) in an accordion format.
   * - Uses `getServerSideProps` to fetch FAQs data.
   * - Handles API errors and provides fallback data.
   * - Allows users to toggle the visibility of FAQ answers.
   **/
}

import { useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Accordion from '@/components/Utility/Accordion';
import BackToTop from '@/components/Utility/BackToTop';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import Heading from '@/elements/Heading';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { FaqsService } from '@/service';
import type { MenuItem } from '@/types/menu';

interface FaqAttributes {
  question: string;
  answer: string;
}

interface Faq {
  id: string;
  attributes: FaqAttributes;
}

interface FaqsResponse {
  faqs: {
    data: Faq[];
  };
}

interface PageProps {
  faqs: Faq[];
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

export default function Faqs({
  faqs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: PageProps) {
  const CRUMB_OPTIONS = [{ title: 'Home', path: '/' }, { title: 'FAQs' }];
  const [openKey, setOpenKey] = useState<string | undefined>(undefined);

  const handleToggle = (key: string) => {
    setOpenKey(openKey !== key ? key : undefined);
  };

  return (
    <PageBase
      title="FAQs"
      description="Frequently Asked Questions"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container pb-48" id="FAQs">
        <Breadcrumb crumbs={CRUMB_OPTIONS} />
        <div className="pb-8">
          <Heading priority={1} color="text-black-200">
            FAQ
          </Heading>
        </div>
        {faqs?.map((faq: Faq, index: number) => (
          <div className="mb-5 rounded-md bg-skyBlue-300 p-4" key={faq.id}>
            <div className="rounded-md border-[1px] bg-white">
              <Accordion
                faq={faq}
                answer={faq.attributes.answer}
                question={faq.attributes.question}
                index={index}
                toggle={handleToggle}
                open={openKey === faq.id}
                key={faq.id}
              />
            </div>
          </div>
        ))}
      </div>
      <BackToTop to="FAQs" />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let faqs: Faq[] | undefined;
  try {
    const { data } = (await FaqsService()) as { data: FaqsResponse };
    faqs = data?.faqs?.data;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      faqs: faqs || [],
    },
  };
});
