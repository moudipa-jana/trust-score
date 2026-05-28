/**
 * `JoinUs` component renders the Join Us page with sections such as job openings, company culture, and team details.
 * - Fetches join us and job openings data from APIs using `getServerSideProps`.
 * - Displays hero sections, company DNA, crew, and current job openings.
 **/

import React, { useEffect, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CurrentOpenings, {
  JobOpening,
} from '@/components/pages/JoinUs/CurrentOpenings';
import BackToTop from '@/components/Utility/BackToTop';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import JoinUsCard from '@/pages/join-us/JoinUsCard';
import { jobOpeningsService, JoinUsService } from '@/service';
import { JoinUsData } from '@/types/joinUs';
import type { MenuItem } from '@/types/menu';

import HeroImg from '../../../public/images/Join Us_Hero image.png';
import JoinUsCardMobile from './JoinUsCardMobile';
import TextCarousel from './TextCarousel';

import culture from '../../../public/images/kofuku-cultural-text.svg';
import ImgTeamAdmin from '../../../public/images/Team-Admin.png';
import ImgTeamContent from '../../../public/images/Team-Content.png';
import ImgTeamCreative from '../../../public/images/Team-Creative.png';
import ImgTeamProduct from '../../../public/images/Team-Product.png';
import ImgTeamTechnology from '../../../public/images/Team-Technology.png';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// const CardsData: any = [
//   {
//     title: 'Team- Product',
//     description:
//       'We don’t just make the product, but we craft the whole user experience.',
//     imageUrl: ImgTeamProduct,
//   },
//   {
//     title: 'Team- Content',
//     description: 'The words belong to us. We are the storytellers.',
//     imageUrl: ImgTeamContent,
//   },
//   {
//     title: 'Team- Technology',
//     description:
//       'Like it’s healthcare space, Kofuku isn’t some boring, straight-laced corporate robot. It is like that fun-loving, crazy dude ',
//     imageUrl: ImgTeamTechnology,
//   },
//   {
//     title: 'Team- Creative',
//     description:
//       "Like it's healthcare space, Kofuku isn't some boring, straight-laced corporate robot. It is like that fun-loving, crazy dude",
//     imageUrl: ImgTeamCreative,
//   },
//   {
//     title: 'Team- Admin',
//     description:
//       "Like it's healthcare space, Kofuku isn't some boring, straight-laced corporate robot. It is like that fun-loving, crazy dude",
//     imageUrl: ImgTeamAdmin,
//   },
// ];

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
  const [CardsData, setCardData] = useState<any[]>([]);

  useEffect(() => {
    let array = [];
    if (CardsData.length == 0) {
      array.push({ title: joinUs?.attributes?.TeamProductSection?.Title, description: joinUs?.attributes?.TeamProductSection?.Description, imageUrl: joinUs?.attributes?.TeamProductSection?.coverImg?.data?.attributes?.url })
      array.push({ title: joinUs?.attributes?.TeamContentSection?.Title, description: joinUs?.attributes?.TeamContentSection?.Description, imageUrl: joinUs?.attributes?.TeamContentSection?.coverImg?.data?.attributes?.url })
      array.push({ title: joinUs?.attributes?.TeamTechnologySection?.Title, description: joinUs?.attributes?.TeamTechnologySection?.Description, imageUrl: joinUs?.attributes?.TeamTechnologySection?.coverImg?.data?.attributes?.url })
      array.push({ title: joinUs?.attributes?.TeamCreativeSection?.Title, description: joinUs?.attributes?.TeamCreativeSection?.Description, imageUrl: joinUs?.attributes?.TeamCreativeSection?.coverImg?.data?.attributes?.url })
      array.push({ title: joinUs?.attributes?.TeamAdminSection?.Title, description: joinUs?.attributes?.TeamAdminSection?.Description, imageUrl: joinUs?.attributes?.TeamAdminSection?.coverImg?.data?.attributes?.url })
      setCardData(array)
    }
  }, [joinUs])

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
      <section className="join-us-hero-section">
        <div className="sm-container py-4 relative">
          <div className="lg:block hidden">
            <Heading priority={1} color="text-[#AEAEAE]" variant="bold">
              {joinUs?.attributes?.heroSection?.Title}{' '}
            </Heading>
          </div>
          <div className="grid grid-cols-12 gap-4 my-4">
            <div className="col-span-12 lg:col-span-8 lg:order-first order-last">
              <div className="lg:hidden block mb-5">
                <Heading priority={1} color="text-[#AEAEAE] " variant="bold">
                  {joinUs?.attributes?.heroSection?.Title}{' '}
                </Heading>
              </div>
              <TextCarousel joinUsData={joinUs} />
            </div>
            <div className="col-span-12 lg:col-span-4 flex lg:justify-end justify-start items-center lg:order-last order-first lg:h-[280px]">
              <div className="lg:absolute relative lg:bottom-[-60px] lg:min-w-[500px] -right-[50px]">
                <CustomImage
                  src={joinUs?.attributes?.heroSection?.coverImg?.data?.attributes
                    ?.url}
                  alt={joinUs?.attributes?.heroSection?.coverImg?.altText}
                  width={400}
                  height={400}
                  className='!w-[500px] h-auto'
                />
              </div>
            </div>
          </div>
          <Button
            type="primary w-full"
            size="lg"
            customClassName="lg:w-[400px] w-full lg:mb-10 mb-5"
            onClick={() => {
              const el = document.getElementById('Current openings');
              if (el) {
                const header = document.querySelector('header');
                const headerHeight = header ? (header as HTMLElement).offsetHeight : 80;
                const extraSpacing = 16; // adjust to leave a bit more space
                const top =
                  el.getBoundingClientRect().top + window.pageYOffset - headerHeight - extraSpacing;
                window.scrollTo({ top, behavior: 'smooth' });
              } else {
                window.location.hash = 'Current openings';
              }
            }}
          >
            Explore Our Jobs
          </Button>
        </div>
      </section>

      <div className="sm-container py-4 lg:mb-15 mb-5 lg:block hidden">
        <div className="lg:w-[440px]">
          <CustomImage src={culture} alt="Logo" width={200} />
        </div>
      </div>

      <div className="sm-container py-4 join-us-cards lg:mb-10 mb-4 lg:block hidden">
        {CardsData.map((card: any, index: number) => (
          <JoinUsCard
            key={index}
            index={index}
            imageSrc={card.imageUrl}
            imageAlt={card.title}
            cardTitle={card.title}
            description={card.description}
            totalCards={CardsData.length}
          />
        ))}
      </div>

      <div className="sm-container py-4 join-us-cards lg:mb-10 mb-4 lg:hidden block">
        {CardsData.map((card: any, index: number) => (
          <JoinUsCardMobile
            key={index}
            imageSrc={card.imageUrl}
            imageAlt={card.title}
            cardTitle={card.title}
            description={card.description}
          />
        ))}
      </div>

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
