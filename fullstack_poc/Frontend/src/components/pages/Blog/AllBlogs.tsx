import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Card from '@/components/Card';
import Carousel from '@/components/Utility/Carousel';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import useIsMobile from '@/Hooks/useIsMobile';
import {
  dateFormate,
  formatShortCount,
  getStrapiMedia,
  shortWords,
} from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface AllBlogsProps {
  blogs: Blog[];
  initialCount?: number;
  loadMoreCount?: number;
}

export default function AllBlogs({
  blogs,
  initialCount = 9,
  loadMoreCount = 6,
}: AllBlogsProps) {
  const router = useRouter();
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const isMobile = useIsMobile();

  const sortedBlogs = blogs
    .sort(
      (a: Blog, b: Blog) =>
        new Date(b.attributes?.publish_date).getTime() -
        new Date(a.attributes?.publish_date).getTime(),
    );

  const visibleBlogs = sortedBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < sortedBlogs.length;
  const showLoadMore = sortedBlogs.length > 0;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + loadMoreCount);
  };

  return (
    <div className="allBlogsSection pt-10">
      <div className="pb-5 text-center lg:text-start">
        <span className="dottedSectionTitle">Blogs</span>
      </div>
      {isMobile ? (
        <div className="my-4" id="slider-card">
          <Carousel
            slidesToShow={1}
            mdSlidesToShow={1}
            smSlidesToShow={1}
            slidesToScroll={1}
            arrow={false}
            dots
          >
            {visibleBlogs.map((data: Blog) => (
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
                    link={`${router.asPath}/${data?.attributes?.slug}`}
                    coverImg={getStrapiMedia(
                      data?.attributes?.coverImg?.data?.attributes?.url,
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
                  />
                </Link>
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="my-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleBlogs.map((data: Blog) => (
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
                  link={`${router.asPath}/${data?.attributes?.slug}`}
                  coverImg={getStrapiMedia(
                    data?.attributes?.coverImg?.data?.attributes?.url,
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
                />
              </Link>
            </div>
          ))}
        </div>
      )}

      {showLoadMore && !isMobile && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={!hasMore}
            className={`flex items-center gap-2 rounded-lg border border-cyan-500 bg-white px-6 py-2 text-cyan-500 transition-colors ${hasMore ? 'hover:bg-cyan-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
          >
            Load more
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>
      )}

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

