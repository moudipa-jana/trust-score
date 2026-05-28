import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Card from '@/components/Card';
import Carousel from '@/components/Utility/Carousel';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import SeeAll from '@/elements/SeeAll';
import {
  dateFormate,
  formatShortCount,
  getStrapiMedia,
  shortWords,
} from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface KofukuPicksProps {
  kofukuPicsBlogs: Blog[];
}

export default function KofukuPicks({ kofukuPicsBlogs }: KofukuPicksProps) {
  const router = useRouter();
  const { categoryName } = router.query;
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);

  const kofukuPickUrl = `${categoryName}/kofukus-pick`;

  const filteredBlogs = kofukuPicsBlogs
    .filter((data: Blog) => data.attributes.pick)
    .sort((a: Blog, b: Blog) => b.attributes.views - a.attributes.views);

  return (
    <div className="pickSection pt-10">
      <div className="pb-5">
        <Link href={`${kofukuPickUrl}`}>
          <span className="dottedSectionTitle">Kofuku&apos;s pick</span>
        </Link>
      </div>
      <div className="my-4" id="slider-card">
        <Carousel
          slidesToShow={3}
          mdSlidesToShow={2}
          smSlidesToShow={1}
          slidesToScroll={3}
          arrow={false}
          dots
        >
          {filteredBlogs.map((data: Blog) => (
            <div key={data.id} className="blogCard">
              <Link
                href={`${router.asPath}/${data.attributes?.slug}`}
                onClick={(e) => {
                  if (data?.hasSensitiveContent) {
                    e.preventDefault();
                    setSelectedBlogSlug(data?.attributes?.slug);
                  }
                }}
              >
                <Card
                  link={`${router.asPath}/${data.attributes?.slug}`}
                  coverImg={getStrapiMedia(
                    data.attributes?.coverImg?.data?.attributes?.url,
                  )}
                  cardTag={
                    data?.attributes?.blog_categories?.data[0]?.attributes?.title
                  }
                  blogtags={data?.attributes?.blog_categories}
                  imgHeight={200}
                  imgWidth={300}
                  variant="vertical"
                  blogId={data?.id}
                  date={dateFormate(data.attributes?.publish_date)}
                  count={(data?.attributes as any)?.readDuration ? `${(data?.attributes as any)?.readDuration} min` : undefined}
                  color="bg-white"
                  title={data.attributes?.Title}
                  authorName={(data?.attributes as any)?.sunrise_doctor?.data?.attributes?.Name || (data?.attributes as any)?.blog_authors?.data?.[0]?.attributes?.name}
                />
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
      <div className="flex justify-end mt-4">
        <Link
          href={`${kofukuPickUrl}`}
          className="flex items-center justify-center bg-white transition-colors hover:bg-cyan-50 relative z-1"
          style={{
            gap: '4px',
            padding: '8px 32px',
            borderRadius: '6px',
            border: '1px solid #00B2ED',
            color: '#00B2ED',
            minWidth: '115px',
            height: '38px'
          }}
        >
          See all
        </Link>
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
