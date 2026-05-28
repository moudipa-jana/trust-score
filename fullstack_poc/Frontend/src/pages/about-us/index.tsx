/**
 * About Us page displays various sections
 * that explain the platform's features, including video, who we are, why the platform exists,
 * personalized search options, Kofukons, and memoir sections. These sections are animated
 * based on their visibility within the viewport using the `react-intersection-observer` library.
 * */

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer'; // import the useInView hook

import PageBase from '@/components/layout/PageBase';
import HeroSection from '@/components/pages/About/HeroSection';
import Kofukons from '@/components/pages/About/KofukonSection';
import LineAnimation from '@/components/pages/About/LineAnimation';
import MemoirSection from '@/components/pages/About/MemoirSection';
import PersonalisedSection from '@/components/pages/About/PersonalisedSection';
import VideoSection from '@/components/pages/About/VideoSection';
import Who from '@/components/pages/About/WhoSection';
import Why from '@/components/pages/About/Why';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import useIsDesktop from '@/Hooks/useIsDesktop';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { HomeService, KofukonsService } from '@/service';
import { AboutProps } from '@/types/about';
import type { MenuItem } from '@/types/menu';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AboutPageProps extends AboutProps {
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

export default function About({
  video,
  who,
  why,
  PersonalisedSearch,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
}: AboutPageProps) {
  const [sticky, setSticky] = useState(true);
  const isDeskstop = useIsDesktop();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY >= 180;
      if (isScrolled) {
        setSticky(false);
      } else {
        setSticky(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [refVideo, inViewVideo] = useInView({ threshold: 0.5 }); // use the useInView hook to detect when the VideoSection enters the viewport
  const [refWho, inViewWho] = useInView({ threshold: 0.4 }); // use the useInView hook to detect when the Who section enters the viewport
  const [refWhy, inViewWhy] = useInView({ threshold: 0.4 }); // use the useInView hook to detect when the Why section enters the viewport
  const [refPersonalised, inViewPersonalised] = useInView({ threshold: 0.1 }); // use the useInView hook to detect when the Personalised section enters the viewport
  const [refKofukons, inViewKofukons] = useInView({ threshold: 0.1 }); // use the useInView hook to detect when the Kofukons section enters the viewport
  const [refMemoir, inViewMemoir] = useInView({ threshold: 0.1 });

  return (
    <PageBase
      title="About Us"
      description="Learn more about our platform and mission"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <div
        className={`smooth-transition lg:mt-32 mt-10 ${sticky && isDeskstop ? 'sticky top-[71px]' : 'relative top-0'
          }`}
      >
        <LineAnimation>
          <div className="aboutPage">
            <HeroSection />
            <section
              ref={refVideo}
              className={`${inViewVideo ? 'animate-fadeIn-Fast' : 'animate-fadeOut-Slow'}`}
            >
              <VideoSection video={video.data?.attributes.url} />
            </section>
            <section
              ref={refWho}
              className={`${inViewWho ? 'fadeIn-section' : 'fadeOut-section'}`}
            >
              <Who title={who.title} description={who.description} />
            </section>
            <section
              ref={refWhy}
              className={`${inViewWhy ? 'fadeIn-section' : 'fadeOut-section'}`}
            >
              <Why title={why.title} description={why.description} />
            </section>

            <section
              ref={refPersonalised}
              className={`${inViewPersonalised ? 'fadeIn-section' : 'fadeOut-section'
                } `}
            >
              <PersonalisedSection
                title={PersonalisedSearch.title}
                description={PersonalisedSearch.description}
              />
            </section>
            <section
              ref={refKofukons}
              className={`${inViewKofukons ? 'animate-fadeIn-Slow' : 'animate-fadeOut-Slow'
                }`}
            >
              <Kofukons />
            </section>
            <section
              ref={refMemoir}
              className={`${inViewMemoir ? 'animate-fadeIn-Slow' : 'animate-fadeOut-Slow'
                }`}
            >
              <MemoirSection />
            </section>
          </div>
        </LineAnimation>
      </div>
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  let title,
    video,
    who,
    sunrise,
    why,
    Kofu,
    bottomMenu,
    kofukons,
    PersonalisedSearch,
    memoirs;

  try {
    const { data }: any = await HomeService();
    const content = data?.home?.data?.attributes ?? {};
    title = content?.title;
    video = content?.video;
    who = content?.who ?? {};
    sunrise = content?.sunrise ?? {};
    why = content?.why ?? {};
    Kofu = content?.Kofu ?? {};
    PersonalisedSearch = content?.PersonalisedSearch ?? {};
    memoirs = content?.memoirs.data ?? [];
  } catch (error) {
    captureSentryException(error);
  }

  try {
    const { data }: any = await KofukonsService();
    const content = data?.kofukons?.data ?? {};
    kofukons = content ?? {};
  } catch (error) {
    captureSentryException(error);
  }

  return {
    props: {
      title: title || '',
      video: video || {},
      who: who || {},
      sunrise: sunrise || '',
      why: why || {},
      Kofu: Kofu || '',
      PersonalisedSearch: PersonalisedSearch || {},
      kofukons: kofukons || '',
      bottomMenu: bottomMenu || [],
      memoirs: memoirs || [],
      initialSocials: [],
    },
  };
});
