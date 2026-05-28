{
  /**
   * `JoinUs` component renders the Join Us page with sections such as job openings, company culture, and team details.
   * - Fetches join us and job openings data from APIs using `getServerSideProps`.
   * - Displays hero sections, company DNA, crew, and current job openings.
   **/
}

import React from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CurrentOpenings, {
  JobOpening,
} from '@/components/pages/JoinUs/CurrentOpenings';
import ExporeJobs from '@/components/pages/JoinUs/ExporeJobs';
import FlamingoText from '@/components/pages/JoinUs/FlamingoText';
import JoinUsCrew from '@/components/pages/JoinUs/JoinUsCrew';
import JoinUsHeroSection from '@/components/pages/JoinUs/JoinUsHeroSection';
import KofukuDna from '@/components/pages/JoinUs/KofukuDna';
import BackToTop from '@/components/Utility/BackToTop';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { jobOpeningsService, JoinUsService } from '@/service';
import { JoinUsData } from '@/types/joinUs';
import type { MenuItem } from '@/types/menu';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface JoinUsProps {
  joinUs: JoinUsData['data'];
  jobOpenings: JobOpening[];
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

function JoinUs({
  joinUs,
  jobOpenings,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: JoinUsProps) {
  const crumbs = [{ title: 'Home', path: '/' }, { title: 'Join Us' }];

  return (
    <PageBase
      title="Join Us"
      description="Join our team and be part of something amazing"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div id="joinUs" className="sr-only"></div>
      <div className="sm-container ">
        <Breadcrumb crumbs={crumbs} />
      </div>
      <ExporeJobs />
      <JoinUsHeroSection
        heroImage={
          joinUs?.attributes?.heroSection?.coverImg?.image?.data?.attributes
            ?.url
        }
      />
      {/* <FlamingoText heroDetails={joinUs?.attributes?.heroSection} />
      <JoinUsCrew JoinUsCrewDetails={joinUs?.attributes?.crewSection} />
      <KofukuDna kofukuDnaDetails={joinUs?.attributes?.dnaSection} />
      <JoinUsHeroSection
        heroImage={joinUs?.attributes?.cultureImage?.data?.attributes?.url}
      /> */}
      <CurrentOpenings jobOpenings={jobOpenings} />
      <BackToTop to="joinUs" />
    </PageBase>
  );
}

export default JoinUs;

export const getServerSideProps = withCommonData(async () => {
  let joinUs, jobOpenings;
  try {
    const { data }: any = await JoinUsService();
    const content = data?.joinUs?.data ?? {};
    joinUs = content;
  } catch (error) {
    captureSentryException(error);
  }
  try {
    const { data }: any = await jobOpeningsService();
    const content = data?.jobOpenings?.data ?? {};
    jobOpenings = content;
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      joinUs: joinUs || {},
      jobOpenings: jobOpenings || [],
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});
