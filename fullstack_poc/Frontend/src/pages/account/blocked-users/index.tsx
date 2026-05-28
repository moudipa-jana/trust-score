import React from 'react';

import AccountLayout from '@/components/pages/Account/AccountLayout';
import BlockedUserDashboard from '@/components/pages/BlockedUsers/BlockUserDashboard';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

interface AccountProps {
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

const BlockUser = ({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: AccountProps) => {
  return (
    <div>
      <AccountLayout
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <BlockedUserDashboard />
      </AccountLayout>
    </div>
  );
};

export default BlockUser;

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
