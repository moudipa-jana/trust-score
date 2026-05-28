import { capitalize } from 'lodash';
import Link from 'next/link';
import React from 'react';

import Card from '@/components/Card';
import { getStrapiMedia } from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface BlogSmallCardsProps {
  randomBlogs: Blog[];
}

export default function BlogSmallCards({ randomBlogs }: BlogSmallCardsProps) {
  return (
    <div className="my-8 grid gap-4">
      {randomBlogs &&
        randomBlogs
          .sort((a: Blog, b: Blog) => b.attributes.views - a.attributes.views)
          .slice(0, 8)
          .map((data: Blog) => {
            return (
              <React.Fragment key={data.id}>
                <div className="blogCard">
                  <Link
                    href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data?.attributes?.slug}`}
                  >
                    <Card
                      key={data.id}
                      type="coverImgSm"
                      cardTag={
                        data?.attributes?.blog_categories?.data[0]?.attributes
                          ?.title
                      }
                      blogtags={data?.attributes?.blog_categories}
                      inlineBookmark
                      size="base"
                      link={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data?.attributes?.slug}`}
                      color="bg-transparent"
                      coverImg={getStrapiMedia(
                        data?.attributes?.coverImg?.data?.attributes?.url,
                      )}
                      blogId={data.id}
                      imgHeight={200}
                      imgWidth={200}
                      variant="horizontal"
                      title={capitalize(data?.attributes?.Title)}
                    />
                  </Link>
                </div>
                <hr />
              </React.Fragment>
            );
          })}
    </div>
  );
}
