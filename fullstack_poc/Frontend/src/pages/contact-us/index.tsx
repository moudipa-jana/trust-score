{
  /**
   * This is the Contact Us page.
   * - Displays breadcrumb navigation for 'Home' and 'Contact Us'.
   * - Renders the contact header and contact form sections.
   * - Provides a back-to-top button for smooth navigation.
   **/
}

import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ContactFormSec from '@/components/pages/ContactUs/ContactFormSec';
import ContactHeader from '@/components/pages/ContactUs/ContactHeader';
import BackToTop from '@/components/Utility/BackToTop';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

interface ContactProps {
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

export default function Contact({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: ContactProps) {
  const crumbs = [{ title: 'Home', path: '/' }, { title: 'Contact Us' }];

  return (
    <PageBase
      title="Contact Us"
      description="Get in touch with us"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container" id="contactUs">
        <Breadcrumb crumbs={crumbs} />
      </div>
      <ContactHeader />
      <ContactFormSec />
      <BackToTop to="contactUs" />
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {},
  };
});
