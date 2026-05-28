import React from 'react';

import { postAuthSuccess } from '@/actions/profile';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import NotAuthenticated from '@/components/Utility/NotAuthenticated';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import type { MenuItem } from '@/types/menu';

interface AccountLayoutProps {
  children: React.ReactNode;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: Blog[];
}

export default function AccountLayout({
  children,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
}: AccountLayoutProps) {
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    if (token && userId) {
      dispatch(postAuthSuccess(userId, token));
    }
  }, [token, dispatch, userId]);

  if (!token) {
    return (
      <PageBase
        title="Account"
        description="Manage your account"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        initialSocials={initialSocials}
        searchData={searchData}
      >
        <main>
          <NotAuthenticated />
        </main>
      </PageBase>
    );
  }
  return (
    <PageBase
      title="Account"
      description="Manage your account"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      {children}
    </PageBase>
  );
}
