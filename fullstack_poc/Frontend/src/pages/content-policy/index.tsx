{
  /**
   * This is the Content Policy page.
   * - Displays the content policy using markdown formatting.
   * - Shows the title and description of the content policy.
   * - Provides the last updated date using a helper function to format the date.
   * - Uses `getServerSideProps` to fetch content policy data.
   * - Handles API errors and provides fallback data.
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
import { contentPolicyService } from '@/service';
import type { MenuItem } from '@/types/menu';

interface ContentPolicyAttributes {
  Title: string;
  Description: string;
  publishedAt: string;
}

interface ContentPolicy {
  attributes: ContentPolicyAttributes;
}

interface ContentPolicyResponse {
  contentPolicy: {
    data: ContentPolicy;
  };
}

interface PageProps {
  contentPolicy: ContentPolicy;
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
  contentPolicy,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: PageProps) {
  const CRUMB_OPTIONS = [
    { title: 'Home', path: '/' },
    { title: 'Content Policy' },
  ];

  return (
    <PageBase
      title={contentPolicy?.attributes?.Title || 'Content Policy'}
      description="Our content policy and guidelines"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container" id="ContentPolicyTop">
        <Breadcrumb crumbs={CRUMB_OPTIONS} />
        <Heading font="font-semibold" priority="1">
          {contentPolicy?.attributes?.Title}
        </Heading>
        <div className="termsProse py-10 text-justify markdown">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {contentPolicy?.attributes?.Description}
          </ReactMarkdown>
          <Text size="md">
            <p className="termsProse py-2 lg:py-0">
              Last updated: {formatDate(contentPolicy?.attributes?.publishedAt)}
            </p>
          </Text>
        </div>
      </div>
      <BackToTop to="ContentPolicyTop" />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let contentPolicy: ContentPolicy | undefined;
  try {
    const { data } = (await contentPolicyService()) as {
      data: ContentPolicyResponse;
    };
    contentPolicy = data?.contentPolicy?.data;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      contentPolicy: contentPolicy || {},
    },
  };
});
