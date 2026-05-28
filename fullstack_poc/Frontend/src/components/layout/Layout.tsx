import { useQuery } from '@apollo/client/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

import Header from '@/components/layout/Header';
import NotificationDropdownCard from '@/components/layout/Header/Notifiction/NotificationDropdownCard';
import ProfileDropdownCard from '@/components/layout/Header/Profile/ProfileDropdownCard';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FOOTER_DISCLAIMER } from '@/service';
import cmsClient from '@/service/cmsClient';
import { selectIsAuthenticated, toggleAuthLoading } from '@/state/Slices/auth';

const Footer = dynamic(() => import('@/components/layout/Footer'));

interface MenuItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

interface LayoutProps {
  children: ReactNode;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials?: Array<{
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

function Layout({
  children,
  initialMenus = [],
  initialBottomMenus = [],
  initialSocials = [],
  searchData = [],
}: LayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hideFooter =
    router.pathname === '/' ||
    router.pathname === '/kofuku-social' ||
    router.pathname.startsWith('/category/') ||
    router.pathname === '/campfire' ||
    router.pathname.startsWith('/campfire/') ||
    router.pathname === '/account' ||
    router.pathname.startsWith('/account/') ||
    router.pathname.startsWith('/post/') ||
    router.pathname.startsWith('/callback/') ||
    router.pathname.startsWith('/user/') ||
    router.pathname.startsWith('/profile/') ||
    router.pathname.includes('/trending') ||
    router.pathname === '/profile';

  const { data } = useQuery(FOOTER_DISCLAIMER, {
    fetchPolicy: 'network-only',
    client: cmsClient,
    skip: hideFooter,
  });
  const { title } =
    (data as any)?.data?.footerDisclaimer?.data?.attributes ?? {};

  useEffect(() => {
    dispatch(toggleAuthLoading(false));
  }, [dispatch]);

  return (
    <div>
      <Header
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        initialSocials={initialSocials}
        searchData={searchData}
      />
      {isAuthenticated && (
        <div className="container sticky top-20 z-[150]">
          <NotificationDropdownCard />
          <ProfileDropdownCard />
        </div>
      )}

      {children}
      {!hideFooter && (
        <Footer
          disclaimer={(data as any)?.footerDisclaimer}
          subTitle={title}
          initialSocials={initialSocials}
        />
      )}
    </div>
  );
}

export default Layout;
