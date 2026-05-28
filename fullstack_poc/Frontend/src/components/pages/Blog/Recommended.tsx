import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Card from '@/components/Card';
import Carousel from '@/components/Utility/Carousel';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import {
  dateFormate,
  formatShortCount,
  getStrapiMedia,
  shortWords,
} from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface RecommendedProps {
  recommendedBlogs: Blog[];
}

export default function Recommended({ recommendedBlogs }: RecommendedProps) {
  const router = useRouter();
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);

  if (!recommendedBlogs) return null;

  return (
    <div className="recommendedSection  pt-20 lg:pt-10">
      <div className="pb-5 text-center lg:text-start">
        <span className="twoOvalTitle">Recommended</span>
      </div>
      <div className="my-8" id="slider-card">
        <Carousel
          slidesToShow={3}
          slidesToScroll={1}
          arrow
          dots
          mdSlidesToShow={2}
          smSlidesToShow={1}
        >
          {recommendedBlogs
            .sort(
              (a: Blog, b: Blog) =>
                new Date(b.attributes?.publish_date).getTime() -
                new Date(a.attributes?.publish_date).getTime(),
            )
            .map((data: Blog) => {
              if (data?.attributes?.recommended) {
                return (
                  <div className="blogCard" key={data.id}>
                    <Link
                      href={`${router.asPath}/${data?.attributes?.slug}`}
                      onClick={(e) => {
                        if (data?.hasSensitiveContent) {
                          e.preventDefault();
                          setSelectedBlogSlug(data?.attributes?.slug);
                        }
                      }}
                    >
                      <Card
                        key={data?.id}
                        link={`${router.asPath}/${data?.attributes?.slug}`}
                        coverImg={getStrapiMedia(
                          data?.attributes?.coverImg?.data?.attributes?.url,
                        )}
                        imgHeight={300}
                        imgWidth={385}
                        variant="vertical"
                        blogId={data?.id}
                        date={dateFormate(data?.attributes?.publish_date)}
                        count={formatShortCount(+data?.attributes?.views || 0)}
                        color="bg-white-300"
                        title={data.attributes?.Title}
                        description={
                          shortWords(data?.attributes?.shortDes, 250) + ' ...'
                        }
                      />
                    </Link>
                  </div>
                );
              }
              return null;
            })}
        </Carousel>
      </div>
      <SensitiveContentModal
        open={!!selectedBlogSlug}
        onClose={() => setSelectedBlogSlug(null)}
        onDeny={() => setSelectedBlogSlug(null)}
        onConfirm={() => {
          if (selectedBlogSlug) {
            router.push(`${router.asPath}/${selectedBlogSlug}`);
            setSelectedBlogSlug(null);
          }
        }}
      />
    </div>
  );
}
