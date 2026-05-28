/**
 * SocialCallback Component
 *
 * This component serves as a visual loading screen after a user authenticates
 * via a third-party social login (e.g., Google, Facebook). It displays a loader
 * and a message while the app processes and validates the user's credentials.
 */

import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

interface SocialCallbackProps {
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

function SocialCallback({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: SocialCallbackProps) {
  return (
    <PageBase
      title="Authentication"
      description="Validating your account"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div
        className="container mt-12 mb-12 flex flex-col items-center justify-center"
        style={{ minHeight: 400 }}
      >
        <TabletLoader />
        <h2 className="text-2xl font-bold">
          Please wait while we validate your account...
        </h2>
      </div>
    </PageBase>
  );
}

export default SocialCallback;

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
