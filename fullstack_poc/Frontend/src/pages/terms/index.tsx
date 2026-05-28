{
  /**
   * `Terms` is a React component that displays the terms of use for the application.
   * - Fetches terms content on the server side using `TermsService`.
   * - Displays the title, description (rendered using `ReactMarkdown`), and the last updated date of the terms.
   * - Includes a breadcrumb for navigation and a back-to-top button.
   * - Handles error logging using `captureSentryException` in case of failure to fetch the terms.
   **/
}

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import BackToTop from '@/components/Utility/BackToTop';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { formatDate } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { TermsService } from '@/service';
import type { MenuItem } from '@/types/menu';

interface TermsAttributes {
  title: string;
  description: string;
  updatedAt: string;
}

interface TermsData {
  term: {
    data: {
      attributes: TermsAttributes;
    };
  };
}

interface TermsProps {
  terms: {
    attributes: TermsAttributes;
  };
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

export default function Terms({
  terms,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: TermsProps) {
  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Terms of use', path: '' },
  ];
  return (
    <PageBase
      title="Terms of Use"
      description="Terms of Use for Kofuku"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container" id="TermsTop">
        <Breadcrumb crumbs={CRUMB_OPTIONS} />
        <Heading font="font-semibold" priority="1">
          {terms?.attributes?.title}
        </Heading>
        <div className="termsProse py-10 text-justify markdown">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {terms?.attributes?.description}
          </ReactMarkdown>
          <Text size="md">
            <p className="termsProse py-2 lg:py-0">
              Last updated:{' '}
              {terms?.attributes?.updatedAt
                ? formatDate(terms.attributes.updatedAt)
                : 'N/A'}{' '}
            </p>
          </Text>
        </div>
      </div>
      <BackToTop to="TermsTop" />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let terms: TermsData['term']['data'] | null = null;
  try {
    const { data }: any = await TermsService();
    terms = data?.term?.data ?? null;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      terms: terms || null,
      initialMenus: [],
      initialBottomMenus: [],
    },
  };
});
