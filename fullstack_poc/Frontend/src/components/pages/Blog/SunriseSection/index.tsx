import { lowerCase } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ExploreCircle from '@/components/pages/Blog/ExploreCircle';
import Line from '@/components/pages/Blog/SunriseSection/Line';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useIsDesktop } from '@/Hooks/useIsDesktop';
import { BlogCategory } from '@/pages/sunrise-club-old';

interface SunriseProps {
  blogsCategories: BlogCategory[];
}

function Sunrise({ blogsCategories }: SunriseProps) {
  const router = useRouter();
  const isdesktop = useIsDesktop();
  const [hushTalksModal, setHushTalksModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);


  return (
    <div className="container relative pt-8 xl:mt-20" id="blogBody">
      {isdesktop && (
        <div className="absolute top-0 bottom-0 left-10 right-0 ">
          <Line blogsCategories={blogsCategories} />
        </div>
      )}
      <div
        className={`m-auto max-w-[627px] ${isdesktop ? 'pb-[500px]' : 'pb-0'
          }  `}
      >
        <div className=" ">
          <Heading priority="1" font="font-normal">
            <span className=" text-[48px] lg:text-[80px]"> Sunrisessss Club</span>
          </Heading>
        </div>
        <div className="m-auto max-w-[628px] ">
          <Text size="md">
            Spending more time walking on the lines and curves of health doesn’t
            need a fancy gym membership or a personal dietitian. Sometimes,
            simple clicks on these illustrations can give you answers! From
            busting anxiety to inspiring empathy, our Sunrise Club is a boon to
            your health and wellbeing!
          </Text>
        </div>
      </div>
      {!isdesktop && (
        <div className="pt-20">
          {blogsCategories &&
            blogsCategories
              .sort(
                (a: BlogCategory, b: BlogCategory) =>
                  (a.id as number) - (b.id as number),
              )
              .map((data: BlogCategory) => {
                return (
                  <ExploreCircle
                    key={data?.id}
                    type={lowerCase(data?.attributes?.title)}
                    variant="secondary"
                    link={`${router.asPath}/${data?.attributes.slug}`}
                    onClick={(e) => {
                      if (lowerCase(data?.attributes?.title) === 'hush talks' || lowerCase(data?.attributes?.title) === 'she read' || lowerCase(data?.attributes?.title) === 'she reads') {
                        e.preventDefault();
                        setSelectedSlug(lowerCase(data?.attributes?.slug));
                        setHushTalksModal(true);
                      }
                    }}
                  />
                );
              })}
        </div>
      )}
      <SensitiveContentModal
        open={hushTalksModal}
        onClose={() => setHushTalksModal(!hushTalksModal)}
        onDeny={() => setHushTalksModal(false)}
        onConfirm={() => router.push(`${router.asPath}/${selectedSlug}`)}
      />
    </div>
  );
}

export default Sunrise;
