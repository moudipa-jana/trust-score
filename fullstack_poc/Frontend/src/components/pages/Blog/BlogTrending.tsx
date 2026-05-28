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

interface BlogTrendingProps {
  trendingBlogs: Blog[];
  ShowAll?: boolean;

}

export default function BlogTrending({ trendingBlogs, ShowAll }: BlogTrendingProps) {
  const router = useRouter();
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const { categoryName } = router.query;

  const trendingUrl = `/sunrise-club/trending`;

  const filteredBlogs = trendingBlogs
    ?.filter((data) => data?.attributes?.trending)
    .sort(
      (a, b) =>
        (b.attributes?.views || 0) - (a.attributes?.views || 0),
    );

  return (
    <div className="trendingSection pt-10">
      <div className="pb-5">
        <Link href={`${trendingUrl}`}>
          <span className="dottedSectionTitle">Trending</span>
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
          {filteredBlogs?.map((data) => {
            const blogCategorySlug = data?.attributes?.blog_categories?.data[0]?.attributes?.slug;
            const blogLink = `/sunrise-club/${blogCategorySlug}/${data?.attributes?.slug}`;

            return (
              <div className="blogCard" key={data.id}>
                <Link
                  href={blogLink}
                  onClick={(e) => {
                    if (data?.hasSensitiveContent) {
                      e.preventDefault();
                      setSelectedBlogSlug(data?.attributes?.slug);
                    }
                  }}
                >
                  <Card
                    link={blogLink}
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
                    date={dateFormate(data?.attributes?.publish_date)}
                    count={(data?.attributes as any)?.readDuration ? `${(data?.attributes as any)?.readDuration} min` : undefined}
                    color="bg-white"
                    title={data?.attributes?.Title}
                    authorName={(data?.attributes as any)?.sunrise_doctor?.data?.attributes?.Name || (data?.attributes as any)?.blog_authors?.data?.[0]?.attributes?.name}
                    trend
                  />
                </Link>
              </div>
            );
          })}
        </Carousel>
      </div>
      <div className="flex justify-end mt-4">
        <Link
          href={`${trendingUrl}`}
          className="flex items-center justify-center bg-white transition-colors hover:bg-cyan-50 relative z-5"
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
