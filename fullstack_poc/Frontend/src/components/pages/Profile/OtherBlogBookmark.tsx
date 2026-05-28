import Link from 'next/link';
import React from 'react';

import Card from '@/components/Card';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import useIsMobile from '@/Hooks/useIsMobile';
import { dateFormate, formatShortCount, getStrapiMedia } from '@/lib/helpers';

interface BlogData {
  id: string;
  attributes: {
    Title: string;
    shortDes: string;
    publish_date: string;
    views: number;
    slug: string;
    blog_authors: {
      data: Array<{
        attributes: {
          name: string;
          image?: {
            data?: {
              attributes: {
                url: string;
              };
            };
          };
        };
      }>;
    };
    blog_categories: {
      data: Array<{
        attributes: {
          title: string;
          slug: string;
        };
      }>;
    };
    coverImg?: {
      data?: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

export interface OtherBlogBookmarkType {
  id: string;
  attributes: {
    sunrise_blog: {
      data: BlogData;
    };
  };
}
interface OtherBlogBookmarkProps {
  otherBookmarkBlog: OtherBlogBookmarkType;
}

function OtherBlogBookmark({ otherBookmarkBlog }: OtherBlogBookmarkProps) {
  const blogData = otherBookmarkBlog?.attributes?.sunrise_blog
    ?.data as BlogData;
  const ismobile = useIsMobile();
  const authorName =
    blogData?.attributes?.blog_authors.data[0]?.attributes?.name;
  const authorImg =
    blogData?.attributes?.blog_authors.data[0]?.attributes?.image?.data
      ?.attributes?.url;

  return (
    <div className="blogCard my-2 rounded-md bookmark-card">
      <Link
        href={`/sunrise-club/${blogData?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${blogData?.attributes?.slug}`}
      >
        <Card
          otherBlogCard
          bookmarkHead
          key={blogData?.id}
          coverImg={getStrapiMedia(
            blogData?.attributes?.coverImg?.data?.attributes?.url,
          )}
          // cardTag={
          //   blogData?.attributes?.blog_categories?.data[0]?.attributes?.title
          // }
          // blogtags={blogData?.attributes?.blog_categories}
          type="coverImglg"
          roundBorder="rounded-md"
          authorName={authorName}
          authorImg={getStrapiMedia(authorImg)}
          imgHeight={250}
          imgWidth={200}
          blogId={blogData?.id}
          date={dateFormate(blogData?.attributes?.publish_date)}
          variant="vertical"
          count={formatShortCount(+blogData?.attributes?.views || 0)}
          color="bg-skyBlue-300"
          title={blogData?.attributes?.Title}
          // description={blogData?.attributes?.shortDes?.slice(0, 65) + '...'}
          readTime={String(extractAndCalculateReadTime(blogData))}
            
        />
      </Link>
    </div>
  );
}

export default OtherBlogBookmark;
