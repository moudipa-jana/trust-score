import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import Carousel from '@/components/Utility/Carousel';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import { getStrapiMedia } from '@/lib/helpers';
import { BlogCategory } from '@/pages/sunrise-club-old';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface HeroSliderProps {
  categoryDetails: BlogCategory[];
  blogsList: Blog[];
}

function BlogHeroSliderDetails(BlogSliders: BlogCategory[], blogsList: Blog[]) {
  const router = useRouter();
  const categoryTitle = BlogSliders[0]?.attributes?.title;

  let filteredBlogs = blogsList.sort((a: Blog, b: Blog) => new Date(b.attributes?.publish_date).getTime() - new Date(a.attributes?.publish_date).getTime())
    .filter((data: Blog) => data?.attributes?.recommended).slice(0, 3);

  if (filteredBlogs.length < 3) {
    filteredBlogs = blogsList
      .sort(
        (a: Blog, b: Blog) =>
          new Date(b.attributes?.publish_date).getTime() -
          new Date(a.attributes?.publish_date).getTime(),
      )
      .slice(0, 3);
  }

  return filteredBlogs.map((data: Blog, i: number) => {
    // Only top 4 latest blogs
    if (i >= 4) return null;
    const blogCategory = data?.attributes?.blog_categories?.data[0]?.attributes?.title || categoryTitle;
    return (
      <div className="relative" key={data.id}>
        <Link href={`${router.asPath}/${data?.attributes?.slug}`}>
          <div className="fullImage blog-full-img black-overlay relative h-125 max-h-125  min-h-125 w-full">
            <CustomImage
              src={getStrapiMedia(
                data?.attributes?.coverImg?.data?.attributes?.url,
              )}
              alt={data.attributes?.Title}
              layout="fill"
              objectFit="cover"
            />
          </div>

          {/* Recommended tag - top left */}
          <div className="absolute top-0 left-0">
            <span className="inline-block rounded-br px-2.5 py-1 text-sm font-medium backdrop-blur-sm" style={{ backgroundColor: '#E0F4FC', color: '#0097DC' }}>
              Recommended
            </span>
          </div>

          {/* Category tag - top right */}
          <div className="absolute top-0 right-0">
            <span className="inline-block rounded-bl px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.24)', letterSpacing: '0.04em' }}>
              {blogCategory}
            </span>
          </div>

          <div className="absolute bottom-8 left-6 max-w-xl text-white">
            <div
              className="mb-2 inline-flex items-center gap-2 rounded px-3 py-1 text-xs backdrop-blur-md whitespace-nowrap"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              <span style={{ color: '#000000', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '12px' }}>
                {data.attributes?.publish_date && new Date(data.attributes.publish_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              {(data.attributes as any)?.readDuration && (
                <>
                  <span style={{ color: '#000000' }}>•</span>
                  <span className="flex items-center gap-1" style={{ color: '#000000', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '12px' }}>
                    <CustomImage src="/images/basil_clock-outline.png" alt="clock" width={12} height={12} />
                    {(data.attributes as any).readDuration} min
                  </span>
                </>
              )}
            </div>
            <div className="text-lg lg:text-xl xl:text-2xl font-semibold">
              {data.attributes?.Title}
            </div>
          </div>
        </Link>
      </div>
    );
  });
}

export default function HeroSlider({
  categoryDetails,
  blogsList,
}: HeroSliderProps) {
  if (categoryDetails && blogsList) {
    return (
      <div className="animated fadeIn faster heroImgSlider mb-14">
        <div className="pt-2" id="slider-card">
          <Carousel
            slidesToShow={1}
            slidesToScroll={1}
            arrow={false}
            dots
            mdSlidesToShow={1}
            smSlidesToShow={1}
            autoplay
            infinite
          >
            {BlogHeroSliderDetails(categoryDetails, blogsList)}
          </Carousel>
        </div>
      </div>
    );
  } else {
    return null;
  }
}
