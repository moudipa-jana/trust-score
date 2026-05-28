import dynamic from 'next/dynamic';

import Layout from '@/components/layout/Layout';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import SearchSocialDialog from '@/components/pages/Forum/forumMenu/SearchSocialDialog';
import Seo, { SeoProps } from '@/components/Seo';
import ForgotPasswordDialog from '@/components/Utility/Dialogs/ForgotPasswordDialog';

const LoaderDialog = dynamic(
  () => import('@/components/Utility/Dialogs/LoaderDialog'),
);
const LoginDialog = dynamic(
  () => import('@/components/Utility/Dialogs/LoginDialog'),
);
const ShareDialog = dynamic(
  () => import('@/components/Utility/Dialogs/SharePostDialog'),
);
const SignupDialog = dynamic(
  () => import('@/components/Utility/Dialogs/SignupDialog'),
);
const UpdateProfileDialog = dynamic(
  () => import('@/components/Utility/Dialogs/UpdateProfileDialog'),
);

interface MenuItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

interface IProps extends SeoProps {
  children: React.ReactNode;
  showLoader?: boolean;
  initialMenus?: MenuItem[];
  initialBottomMenus?: MenuItem[];
  initialSocials?: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData?: Blog[];
}

export default function PageBase({
  children,
  showLoader = true,
  initialMenus = [],
  initialBottomMenus = [],
  initialSocials = [],
  searchData = [],
  ...props
}: IProps) {
  return (
    <Layout
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <Seo {...props} />
      {children}
      <LoginDialog />
      <ForgotPasswordDialog />
      <SignupDialog />
      <UpdateProfileDialog />
      <ShareDialog />
      <SearchSocialDialog searchData={searchData} />
      {showLoader && <LoaderDialog />}
    </Layout>
  );
}
