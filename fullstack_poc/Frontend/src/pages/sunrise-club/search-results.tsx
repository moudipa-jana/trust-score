import { get, isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import CustomImage from '@/components/Utility/CustomImage';
import Pagination from '@/components/Utility/pagination';
import Text from '@/elements/Text';
import { getStrapiMedia } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import { getBlogsByTitle } from '@/service';
import type { MenuItem } from '@/types/menu';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';

const FALLBACK_IMAGE = '/images/null_point.svg';

interface SearchResultCardProps {
  title: string;
  description: string;
  author?: string;
  category?: string;
  imageUrl?: string;
  onClick?: () => void;
}

const SearchResultCard = ({
  title,
  description,
  author,
  category,
  imageUrl,
  onClick,
}: SearchResultCardProps) => (
  <div
    className="group flex cursor-pointer items-start gap-4 rounded-lg bg-gray-100/50 p-5 transition-all hover:bg-white hover:shadow-lg lg:gap-8"
    onClick={onClick}
  >
    <div className="relative h-28 w-44 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 lg:h-36 lg:w-60">
      <CustomImage
        src={imageUrl || FALLBACK_IMAGE}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        alt={title}
      />
    </div>

    <div className="flex flex-1 flex-col justify-start min-w-0 py-1">
      <h3
        className="text-black line-clamp-2 leading-tight font-bold lg:text-lg"
      >
        {title}
      </h3>
      <Text
        size="sm"
        color="text-black"
        customClass="mt-2 line-clamp-2 leading-relaxed lg:line-clamp-3 lg:text-base"
      >
        {description}
      </Text>
      {author && (
        <Text size="sm" color="text-[#00B2ED]" customClass="mt-3 font-medium">
          <span className="text-[#8F8F8F]">By</span> {author}
        </Text>
      )}
    </div>

    {category && (
      <div className="hidden flex-shrink-0 self-center pl-4 sm:block">
        <span className="rounded-md bg-gray-200/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 lg:px-4 lg:text-xs">
          {category}
        </span>
      </div>
    )}
  </div>
);

interface SearchResultsProps {
  initialSearchData: any;
  query: string;
  currentPage: number;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: BlogData[];
  initialSocials: any[];
}

const SearchResults = ({
  initialSearchData,
  query,
  currentPage,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: SearchResultsProps) => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'videos'>('blogs');
  const router = useRouter();

  const blogsResults = get(initialSearchData, 'sunriseBlogs.data', []);
  const videoResults = get(initialSearchData, 'youtubes.data', []);
  const blogsMeta = get(initialSearchData, 'sunriseBlogs.meta.pagination', { total: 0, pageCount: 0 });
  const videoMeta = get(initialSearchData, 'youtubes.meta.pagination', { total: 0, pageCount: 0 });

  const currentResults = activeTab === 'blogs' ? blogsResults : videoResults;
  const currentTotal = activeTab === 'blogs' ? blogsMeta.total : videoMeta.total;
  const totalPages = activeTab === 'blogs' ? blogsMeta.pageCount : videoMeta.pageCount;

  const navigateToDetail = (result: any) => {
    if (activeTab === 'blogs') {
      const category = get(result, 'attributes.blog_categories.data[0].attributes.slug', 'general');
      router.push(`/sunrise-club/${category}/${result.attributes.slug}`);
    } else {
      router.push(`/sunrise-club/binge-watch-detail/${result.attributes.slug}`);
    }
  };

  const handlePageChange = (page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, p: page },
    });
  };

  return (
    <PageBase
      title={`Search Results for "${query}"`}
      description={`Find blogs and videos about ${query}`}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1240px] mx-auto px-4 py-10 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-0">
            <nav className="flex gap-12">
              <button
                className={`relative pb-4 text-2xl font-medium tracking-tight transition-all ${activeTab === 'blogs' ? 'text-[#6C6C6C]' : 'text-[#00B2ED] hover:text-[#6C6C6C]'
                  }`}
                onClick={() => {
                  setActiveTab('blogs');
                  handlePageChange(1);
                }}
              >
                Blogs
                {activeTab === 'blogs' && (
                  <span className="absolute bottom-0 left-1/2 h-[4px] w-10 -translate-x-1/2 bg-[#C4C4C4] rounded-full" />
                )}
              </button>
              <button
                className={`relative pb-4 text-2xl font-medium tracking-tight transition-all ${activeTab === 'videos' ? 'text-[#6C6C6C]' : 'text-[#00B2ED] hover:text-[#6C6C6C]'
                  }`}
                onClick={() => {
                  setActiveTab('videos');
                  handlePageChange(1);
                }}
              >
                Binge watch
                {activeTab === 'videos' && (
                  <span className="absolute bottom-0 left-1/2 h-[4px] w-10 -translate-x-1/2 bg-[#C4C4C4] rounded-full" />
                )}
              </button>
            </nav>
            <div className="pb-5">
              <Text size="sm" color="text-black" font="font-bold" customClass="lg:text-base">
                Search Result <span className="text-[#9D9D9D] ml-1 font-medium">({currentTotal})</span>
              </Text>
            </div>
          </div>

          <div className="mt-10 mb-12">
            <h1 className="text-[#6985A7] text-3xl lg:text-5xl tracking-tight opacity-90 font-bold">
              {query}
            </h1>
          </div>

          <div className="flex flex-col gap-8 lg:gap-10">
            {isEmpty(currentResults) ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <div className="h-40 w-40">
                  <CustomImage src={FALLBACK_IMAGE} fill />
                </div>
                <Text color="text-gray-500" size="sm" font="font-bold">
                  No result found
                </Text>
              </div>
            ) : (
              currentResults.map((result: any) => {
                const attrs = result.attributes;
                const isBlog = activeTab === 'blogs';

                return (
                  <SearchResultCard
                    key={result.id}
                    title={attrs.Title}
                    description={isBlog ? attrs.shortDes : attrs.Description}
                    author={isBlog ? get(attrs, 'sunrise_club_author.data.attributes.Name') : undefined}
                    category={get(attrs, 'blog_categories.data[0].attributes.title')}
                    imageUrl={getStrapiMedia(
                      get(attrs, isBlog ? 'coverImg.data.attributes.url' : 'CoverImg.data.attributes.url')
                    )}
                    onClick={() => navigateToDetail(result)}
                  />
                );
              })
            )}
          </div>

          {!isEmpty(currentResults) && (
            <div className="mt-16 flex justify-center">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </PageBase>
  );
};

export default SearchResults;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const query = (context.query.q as string) || '';
    const page = Number(context.query.p) || 1;
    let initialSearchData = null;

    if (query) {
      try {
        const { data }: any = await getBlogsByTitle(query, page, 5);
        initialSearchData = data;
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    return {
      props: {
        initialSearchData,
        query,
        currentPage: page,
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
