import React from 'react';

import AccountLayout from '@/components/pages/Account/AccountLayout';
import Dashboard from '@/components/pages/Account/Dashboard';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import DeleteAccountDialog from '@/components/Utility/Dialogs/DeleteAccountDialog';
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

export default function AccountSetting({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: AccountProps) {
  return (
    <AccountLayout
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <Dashboard />
      <DeleteAccountDialog />
    </AccountLayout>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
