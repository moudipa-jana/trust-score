'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardDate,
  CardTime,
  CardTitle,
} from '@/components/Utility/Card';
import CustomImage from '@/components/Utility/CustomImage';
import Pagination from '@/components/Utility/pagination';
import { validateImageUrl } from '@/lib/helpers';

type BlogEntity = {
  id: string | number;
  attributes: {
    slug: string;
    Title: string;
    publish_date?: string | null;
    publishedAt?: string | null;
    readDuration?: number | null;
    coverImg?: {
      data?: {
        attributes?: {
          url?: string;
          alternativeText?: string;
        };
      };
    };
    blog_categories?: {
      data: { attributes?: { title?: string } }[];
    };
  };
};

type BlogsData = {
  blogs?: {
    data: BlogEntity[];
  };
};

type Props = {
  authorBlogsData?: BlogsData | null;
  doctorBlogsData?: BlogsData | null;
  combined?: boolean;
  perPageData?: number;
  titles?: { combined?: string; doctor?: string; author?: string };
  hideTitles?: boolean; // <--- NEW
};

export default function AuthorPageBlogList({
  authorBlogsData,
  doctorBlogsData,
  combined = true,
  perPageData = 9,
  titles = {
    combined: 'Articles',
    doctor: 'Doctor Articles',
    author: 'Author Articles',
  },
  hideTitles = false, // <--- NEW (default: false)
}: Props) {
  const authorBlogs = authorBlogsData?.blogs?.data ?? [];
  const doctorBlogs = doctorBlogsData?.blogs?.data ?? [];

  // Merge (if combined) and sort newest first using publish_date/publishedAt
  const mergedBlogs = useMemo(() => {
    const list = [...doctorBlogs, ...authorBlogs];
    return list.sort((a, b) => {
      const da = a.attributes.publish_date || a.attributes.publishedAt;
      const db = b.attributes.publish_date || b.attributes.publishedAt;
      const ta = da ? Date.parse(da) : 0;
      const tb = db ? Date.parse(db) : 0;
      return tb - ta;
    });
  }, [authorBlogs, doctorBlogs]);

  // Decide which list(s) to paginate/render
  const listForPagination = combined ? mergedBlogs : undefined;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    const total = combined ? (listForPagination?.length ?? 0) : 0;
    return combined ? Math.max(1, Math.ceil(total / perPageData)) : 1;
  }, [combined, listForPagination?.length, perPageData]);

  const pagedBlogs = useMemo(() => {
    if (!combined) return [];
    const start = (currentPage - 1) * perPageData;
    return (listForPagination ?? []).slice(start, start + perPageData);
  }, [combined, listForPagination, currentPage, perPageData]);

  useEffect(() => {
    if (combined && currentPage > totalPages) setCurrentPage(1);
  }, [combined, totalPages, currentPage]);

  const pageChangeHandler = (page: number) => setCurrentPage(page);

  // Reusable card renderer
  const renderGrid = (items: BlogEntity[]) => {
    return (
      <div className="mt-5 mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        {items.map((blog) => {
          const date =
            blog.attributes.publish_date || blog.attributes.publishedAt || '';
          const category =
            blog.attributes.blog_categories?.data?.[0]?.attributes?.title;
          const bannerSrc =
            blog.attributes.coverImg?.data?.attributes?.url ||
            '/images/poster.jpeg';
          const bannerAlt =
            blog.attributes.coverImg?.data?.attributes?.alternativeText ||
            blog.attributes.Title ||
            'Blog banner';

          return (
            <Link
              href={`/sunrise-club/${blog.attributes?.blog_categories?.data[0]?.attributes?.title}/${blog.attributes.slug}`}
              key={blog.id}
            >
              <Card className="relative transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="relative h-48">
                    <div className="relative h-48">
                      <div className="relative h-full w-full overflow-hidden rounded-t-xl">
                        {/* <Image
                          src={validateImageUrl(bannerSrc)}
                          alt={bannerAlt}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 370px, (max-width:1280px) 340px, 380px"
                          priority={false}
                        /> */}
                        <CustomImage
                          src={validateImageUrl(bannerSrc)}
                          alt={bannerAlt}
                          width={120}
                          height={120}
                          className="object-cover h-full w-full"
                        />
                      </div>

                      {category && (
                        <span className="absolute top-3 right-3 z-[5] rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                          {category}
                        </span>
                      )}
                    </div>
                    {category && (
                      <span className="absolute top-3 right-3 z-[5] rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                        {category}
                      </span>
                    )}
                  </div>

                  <div className="p-3 xl:p-5">
                    <CardTitle className="mb-3">
                      {blog.attributes.Title}
                    </CardTitle>
                    <div className="flex items-center gap-2 xl:gap-3">
                      {date ? <CardDate>{date}</CardDate> : null}
                      {blog.attributes.readDuration ? (
                        <CardTime>
                          {blog.attributes.readDuration} minutes
                        </CardTime>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div id="blogs">
      <div className="mt-3 pt-5">
        {combined ? (
          <>
            {!hideTitles && (
              <h2 className="mb-2 text-xl font-semibold">{titles.combined}</h2>
            )}
            {pagedBlogs.length > 0 ? (
              <>
                {renderGrid(pagedBlogs)}
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={pageChangeHandler}
                />
              </>
            ) : (
              <div className="p-20 text-center text-gray-500">
                No blogs to show
              </div>
            )}
          </>
        ) : (
          <>
            {!hideTitles && (
              <h2 className="text-xl font-semibold">{titles.doctor}</h2>
            )}
            {doctorBlogs.length ? (
              renderGrid(doctorBlogs)
            ) : (
              <div className="p-10 text-center text-gray-500">
                No doctor blogs
              </div>
            )}

            {!hideTitles && (
              <h2 className="mt-10 text-xl font-semibold">{titles.author}</h2>
            )}
            {authorBlogs.length ? (
              renderGrid(authorBlogs)
            ) : (
              <div className="p-10 text-center text-gray-500">
                No author blogs
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
