{
  /**
   * `PrivacyPolicy` displays the privacy policy content with a title, description, and last updated date.
   * - Fetches privacy policy data on server-side using `getServerSideProps`.
   * - Renders the title, description (using `ReactMarkdown`), and last updated date.
   * - Includes breadcrumb navigation and a "Back to Top" button for easy navigation.
   **/
}

import { GetServerSideProps } from 'next';
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
import { PrivacyPolicyService } from '@/service';
import type { MenuItem } from '@/types/menu';

interface PrivacyPolicyAttributes {
  title: string;
  description: string;
  updatedAt: string;
}

interface PrivacyPolicy {
  attributes: PrivacyPolicyAttributes;
}

interface PrivacyPolicyProps {
  privacyPolicy: PrivacyPolicy;
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

export default function PrivacyPolicy({
  privacyPolicy,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: PrivacyPolicyProps) {
  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Privacy Policy' },
  ];
  return (
    <PageBase
      title={privacyPolicy?.attributes?.title || 'Privacy Policy'}
      description="Read our privacy policy"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container" id="PrivacyPolicyTop">
        <Breadcrumb crumbs={CRUMB_OPTIONS} />
        <Heading font="font-semibold" priority="1">
          {privacyPolicy?.attributes?.title}
        </Heading>
        <div className=" termsProse py-10 text-justify markdown">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {privacyPolicy?.attributes?.description}
          </ReactMarkdown>
          <Text size="md">
            <p className="termsProse py-2 lg:py-0">
              Last updated: {formatDate(privacyPolicy?.attributes?.updatedAt)}
            </p>
          </Text>
        </div>
      </div>
      <BackToTop to="PrivacyPolicyTop" />
    </PageBase>
  );
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    let privacyPolicy;
    try {
      const { data }: any = await PrivacyPolicyService();
      const content = data?.privacyPolicie?.data ?? [];
      privacyPolicy = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        privacyPolicy: privacyPolicy || [],
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
