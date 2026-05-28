import { useQuery } from '@apollo/client/react';
import { capitalize, isEmpty } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Card from '@/components/Card';
import BingeWatch from '@/components/pages/Blog/BingeWatch';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import LoadMore from '@/components/Utility/LoadMore';
import Heading from '@/elements/Heading';
import {
  dateFormate,
  emitErrorNotification,
  formatGraphqlError,
  getStrapiMedia,
} from '@/lib/helpers';
import OtherCards from '@/pages/sunrise-club-old/[categoryName]/OtherCards';
import cmsClient from '@/service/cmsClient';
import { GET_SEARCHED_BLOGS } from '@/service/graphql/Campfire';

interface BlogAttributes {
  Link: string;
  link: string;
  CoverImg: any;
  Title: string;
  views: number;
  slug: string;
  shortDes: string;
  publish_date: string;
  watchTime: string;
  watch: string;
  videoViews: number;
  recommended: boolean;
  trending?: boolean;
  hasSensitiveContent?: boolean;
  video: {
    video: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    coverImg: {
      id: string;
      image: {
        data: {
          attributes: {
            url: string;
          };
        };
      };
      altText: string;
    };
  };
  pick: boolean;
  good_read: boolean;
  blog_authors: {
    data: Array<{
      attributes: {
        name: string;
        image: {
          data: {
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
  coverImg: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  sunrise_club_author?: {
    data: Array<{
      attributes: {
        Name: string;
        altText?: string;
        Image: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
      };
    }>;
  };
}

export interface Blog {
  id: string;
  hasSensitiveContent?: boolean;
  attributes: BlogAttributes;
}

interface SearchBlogsProps {
  randomBlogs: Blog[];
  searchText?: string | string[];
}

const LIMIT = 3;

function SearchBlogs({ randomBlogs, searchText }: SearchBlogsProps) {
  const [normalBlogs, setNormalBlogs] = useState<Blog[]>([]);
  const [loadMoreStatus, setLoadMoreStatus] = useState(true);
  const [searchString, setSearchString] = useState<
    string | string[] | null | undefined
  >(null);

  const {
    refetch: getBlogs,
    data: searchBlogsData,
    error: searchBlogsError,
  } = useQuery(GET_SEARCHED_BLOGS, {
    variables: {
      title: searchText,
      start: 0,
      limit: LIMIT,
    },
    fetchPolicy: 'network-only',
    client: cmsClient,
    skip: searchText === '',
  });

  // Handle search blogs completion
  useEffect(() => {
    if (searchBlogsData) {
      const blogs = (searchBlogsData as any).sunriseBlogs;
      if (searchText === searchString)
        setNormalBlogs([...normalBlogs, ...blogs.data]);
      else {
        setNormalBlogs([...blogs.data]);
        setSearchString(searchText);
        setLoadMoreStatus(true);
      }
      if (blogs.data < LIMIT) setLoadMoreStatus(false);
    }
  }, [searchBlogsData, searchText, searchString, normalBlogs]);

  // Handle search blogs error
  useEffect(() => {
    if (searchBlogsError) {
      emitErrorNotification(formatGraphqlError(searchBlogsError));
    }
  }, [searchBlogsError]);

  function handleLoadMore(): void {
    getBlogs({
      title: searchText,
      start: normalBlogs.length + 1,
      limit: LIMIT,
    });
  }

  return (
    <div className="search-blog">
      <div className="sm-container grid grid-cols-1 gap-6 xl:px-0">
        {!isEmpty(normalBlogs) ? (
          normalBlogs
            .sort((a: Blog, b: Blog) => b.attributes.views - a.attributes.views)
            .map((data: Blog) => {
              return (
                <Link
                  key={data.id}
                  href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data?.attributes?.slug}`}
                >
                  <Card
                    searchCard
                    bookmarkHead
                    date={dateFormate(data?.attributes?.publish_date)}
                    authorName={
                      data?.attributes?.blog_authors.data[0]?.attributes?.name
                    }
                    authorImg={getStrapiMedia(
                      data?.attributes?.blog_authors?.data[0]?.attributes?.image
                        ?.data?.attributes?.url,
                    )}
                    cardTag={
                      data?.attributes?.blog_categories?.data[0]?.attributes
                        ?.title
                    }
                    link={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data?.attributes?.slug}`}
                    color="bg-blue-600"
                    coverImg={getStrapiMedia(
                      data?.attributes?.coverImg?.data?.attributes?.url,
                    )}
                    blogId={data.id}
                    blogtags={data?.attributes?.blog_categories}
                    roundBorder="rounded-lg"
                    flow="column"
                    variant="horizontal"
                    title={capitalize(data?.attributes?.Title)}
                    description={
                      data?.attributes?.shortDes?.slice(0, 85) + '...'
                    }
                    readTime={<span>{extractAndCalculateReadTime(data)}</span>}
                  />
                </Link>
              );
            })
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 rounded-md bg-skyBlue-300 p-10 text-center">
            <RiAlarmWarningFill
              size={60}
              className="drop-shadow-glow animate-flicker text-red-500"
            />
            <Heading priority="5" font="font-normal">
              Oops! No data found
            </Heading>
          </div>
        )}
      </div>
      {!isEmpty(normalBlogs) && loadMoreStatus && (
        <div className="pt-6">
          <LoadMore icon onClick={handleLoadMore}>
            Load More
          </LoadMore>
        </div>
      )}
      <div className="sm-container xl:px-0">
        <OtherCards
          noContainer
          trendingBlogs={randomBlogs}
          goodReadsBlogs={randomBlogs}
        />
      </div>
      <BingeWatch nopadd bingeWatch={randomBlogs} />
    </div>
  );
}

export default SearchBlogs;
