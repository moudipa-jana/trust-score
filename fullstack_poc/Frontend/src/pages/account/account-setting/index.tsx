import React from 'react';

import AccountLayout from '@/components/pages/Account/AccountLayout';
import AcSetting from '@/components/pages/Account/AcSetting';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

interface AccountSettingProps {
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
}: AccountSettingProps) {
  return (
    <AccountLayout
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <AcSetting />
    </AccountLayout>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
    },
  };
});
