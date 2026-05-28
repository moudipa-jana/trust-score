import React from 'react';

import AccountLayout from '@/components/pages/Account/AccountLayout';
import PasswordChange from '@/components/pages/Account/PasswordChange';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

interface ChangePasswordProps {
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

export default function ChangePassword({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: ChangePasswordProps) {
  return (
    <AccountLayout
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <PasswordChange />
    </AccountLayout>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
