import { lowerCase } from 'lodash';
import router from 'next/router';
import { useState } from 'react';

import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';

import ExploreCircle from './ExploreCircle';
import { BlogCategory } from '@/pages/sunrise-club-old';

interface ExploreByProps {
  blogsCategories: BlogCategory[];
}

export default function ExploreBy({ blogsCategories }: ExploreByProps) {
  const startingPath = router.pathname.split('/')[1];
  const category = router.query.categoryName;
  const [hushTalksModal, setHushTalksModal] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  return (
    <div className="goodReadsSection pt-20 ">
      <div className="sm-container">
        <div className="pb-5">
          <span className="dottedSectionTitle">Explore by</span>
        </div>
      </div>
      <div className="border-b-[13px] border-white bg-blue-400 ">
        <div className="sm-container relative">
          <div className="exploreCircleHolder">
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
                      link={`/${startingPath}/${data?.attributes.slug}`}
                      type={lowerCase(data?.attributes?.title)}
                      onClick={(e) => {
                        {
                          if (
                            (lowerCase(data?.attributes?.title) === 'hush talks' ||
                              lowerCase(data?.attributes?.title) === 'she read' ||
                              lowerCase(data?.attributes?.title) === 'she reads') &&
                            category !== 'hush-talks' &&
                            category !== 'she-reads' &&
                            category !== 'she-read'
                          ) {
                            e.preventDefault();
                            setSelectedSlug(lowerCase(data?.attributes?.slug));
                            setHushTalksModal(true);
                          }
                        }
                      }}
                    />
                  );
                })}
          </div>
        </div>
      </div>
      <SensitiveContentModal
        open={hushTalksModal}
        onClose={() => setHushTalksModal(!hushTalksModal)}
        onDeny={() => setHushTalksModal(false)}
        onConfirm={() => {
          router.push(`/${startingPath}/${selectedSlug}`);
          setHushTalksModal(false);
        }}
      />
    </div>
  );
}
