import { RiAlarmWarningFill } from 'react-icons/ri';

import PageBase from '@/components/layout/PageBase';
import HomeRedirect from '@/elements/HomeRedirect';
import withCommonData from '@/lib/withCommonData';
import Heading from '@/elements/Heading';
import Button from '@/components/Utility/Button';

import type { MenuItem } from '../types/menu';

interface NotFoundProps {
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
}

export default function NotFoundPage({
  initialMenus,
  initialBottomMenus,
  initialSocials,
}: NotFoundProps) {
  return (
    <PageBase
      title="Not Found"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
    >
      {/* <main>
        <section className="bg-white">
          <div className="layout flex min-h-screen flex-col items-center justify-center text-center text-black">
            <RiAlarmWarningFill
              size={60}
              className="drop-shadow-glow animate-flicker text-red-500"
            />
            <h1 className="mt-8 text-4xl lg:text-6xl">Page Not Found</h1>
            <HomeRedirect className="mt-4 cursor-pointer underline lg:text-lg">
              Back to Home
            </HomeRedirect>
          </div>
        </section>
      </main> */}
      <main className="min-h-screen bg-white">
        <section className="flex min-h-screen flex-col items-center justify-center px-4">
          {/* Video Section */}
          <div className="w-full max-w-2xl mb-8 md:mb-12">
            <video autoPlay muted loop preload="none" className="w-full h-auto">
              <source src="/video/404.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Caution Message Section */}
          <div className="w-full max-w-xl px-6 md:px-8 mb-16 md:mb-20 text-center">
            <Heading priority={3} variant="light">
              Caution!
            </Heading>

            <p className="text-base md:text-md lg:text-lg text-gray-700 font-semibold leading-relaxed mb-8 md:mb-10">
              The road is temporarily closed and you are requested to turn back
              and head home. This road also goes to Rome but right now, it stops
              somewhere in Kashmir!
            </p>

            <Button
              width="w-max"
              size="lg"
              onClick={() => window.location.replace('/')}
            >
              <div>Go Back</div>
            </Button>
          </div>
        </section>
      </main>
    </PageBase>
  );
}

export const getStaticProps = withCommonData(async () => {
  return {
    props: {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});
