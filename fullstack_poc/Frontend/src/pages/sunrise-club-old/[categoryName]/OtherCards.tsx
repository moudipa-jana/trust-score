import Link from 'next/link';
import { useRouter } from 'next/router';

import Card from '@/components/Card';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import Heading from '@/elements/Heading';
import SeeAll from '@/elements/SeeAll';
import { getStrapiMedia } from '@/lib/helpers';

interface BlogAttributes {
  Title: string;
  slug: string;
  publish_date: string;
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
}

interface Blog {
  id: string;
  attributes: BlogAttributes;
}

interface OtherCardsProps {
  kofukuBlogs?: Blog[];
  topReadsBlogs?: Blog[];
  trendingBlogs?: Blog[];
  goodReadsBlogs?: Blog[];
  noContainer?: boolean;
}

function OtherCards({
  kofukuBlogs,
  topReadsBlogs,
  trendingBlogs,
  goodReadsBlogs,
  noContainer,
}: OtherCardsProps) {
  const router = useRouter();
  const { categoryName } = router.query;
  const dynamicValue = categoryName;

  const kofukuPickUrl = `/sunrise-club/${dynamicValue}/kofukus-pick`;
  const topReadUrl = `/sunrise-club/${dynamicValue}/top-read`;
  const trendingUrl = '/sunrise-club/trending';
  const goodReadsUrl = '/sunrise-club/good-read';

  const kofukuBlogList = kofukuBlogs;
  const topReadBlogList = topReadsBlogs;
  const trendingBlogList = trendingBlogs;
  const goodReadsBlogList = goodReadsBlogs;

  return (
    <div>
      <div className={`${noContainer ? '' : 'container'} relative`}>
        <div className="grid grid-cols-1 gap-10 py-6 xl:grid-cols-2">
          {kofukuBlogList && (
            <div>
              <div className="text-center lg:text-left">
                <Heading priority="2" variant="base" font="font-semibold">
                  Kofuku&apos;s pick
                </Heading>
              </div>
              <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-1">
                {kofukuBlogList &&
                  kofukuBlogList
                    .sort(
                      (a: Blog, b: Blog) =>
                        new Date(b.attributes?.publish_date).getTime() -
                        new Date(a.attributes?.publish_date).getTime(),
                    )

                    .filter((data: Blog) => data?.attributes?.pick)
                    .slice(0, 4)
                    .map((data: Blog) => {
                      return (
                        <div key={data.id}>
                          <Link
                            href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                          >
                            <Card
                              smallCard
                              color="bg-pink-400"
                              roundBorder="rounded-lg"
                              authorImg={getStrapiMedia(
                                data?.attributes?.blog_authors.data[0]
                                  ?.attributes?.image?.data?.attributes?.url,
                              )}
                              imgHeight={300}
                              imgWidth={300}
                              link={`${router.asPath}/${data.attributes?.slug}`}
                              title={data.attributes?.Title}
                              cardTag={
                                data?.attributes?.blog_categories?.data[0]
                                  ?.attributes?.title
                              }
                              blogtags={data?.attributes?.blog_categories}
                              authorName={
                                data?.attributes?.blog_authors?.data[0]
                                  ?.attributes?.name
                              }
                              readTime={
                                <span>{extractAndCalculateReadTime(data)}</span>
                              }
                            />
                          </Link>
                        </div>
                      );
                    })}
              </div>
              <div className="flex justify-center lg:justify-end">
                <SeeAll color="primary" noButton link={kofukuPickUrl} />
              </div>
            </div>
          )}

          {topReadBlogList && (
            <div>
              <div className="text-center lg:text-left">
                <Heading priority="2" variant="base" font="font-semibold">
                  Top reads
                </Heading>
              </div>
              <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-1">
                {topReadBlogList &&
                  topReadBlogList
                    .sort(
                      (a: Blog, b: Blog) =>
                        new Date(b.attributes?.publish_date).getTime() -
                        new Date(a.attributes?.publish_date).getTime(),
                    )
                    .slice(0, 4)
                    .map((data: Blog) => {
                      return (
                        <div key={data.id}>
                          <Link
                            href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                          >
                            <Card
                              smallCard
                              color="bg-green-600"
                              roundBorder="rounded-lg"
                              authorImg={getStrapiMedia(
                                data?.attributes?.blog_authors.data[0]
                                  ?.attributes?.image?.data?.attributes?.url,
                              )}
                              imgHeight={300}
                              imgWidth={300}
                              link={`${router.asPath}/${data.attributes?.slug}`}
                              title={data.attributes?.Title}
                              cardTag={
                                data?.attributes?.blog_categories?.data[0]
                                  ?.attributes?.title
                              }
                              blogtags={data?.attributes?.blog_categories}
                              authorName={
                                data?.attributes?.blog_authors?.data[0]
                                  ?.attributes?.name
                              }
                              readTime={
                                <span>{extractAndCalculateReadTime(data)}</span>
                              }
                            />
                          </Link>
                        </div>
                      );
                    })}
              </div>
              <div className="flex justify-center lg:justify-end">
                <SeeAll color="primary" noButton link={topReadUrl} />
              </div>
            </div>
          )}

          {trendingBlogList && (
            <div>
              <div className="text-center lg:text-left">
                <Heading priority="2" variant="base" font="font-semibold">
                  Trending
                </Heading>
              </div>
              <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-1">
                {trendingBlogList &&
                  trendingBlogList
                    .sort(
                      (a: Blog, b: Blog) =>
                        new Date(b.attributes?.publish_date).getTime() -
                        new Date(a.attributes?.publish_date).getTime(),
                    )
                    .slice(0, 4)
                    .map((data: Blog) => {
                      return (
                        <div key={data.id}>
                          <Link
                            href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                          >
                            <Card
                              smallCard
                              trend
                              color="bg-gradient-to-b from-blue-700 to-pink-500"
                              roundBorder="rounded-lg"
                              authorImg={getStrapiMedia(
                                data?.attributes?.blog_authors.data[0]
                                  ?.attributes?.image?.data?.attributes?.url,
                              )}
                              variant="xl"
                              imgHeight={300}
                              imgWidth={300}
                              link={`${router.asPath} /${data.attributes?.slug}`}
                              title={data.attributes?.Title}
                              cardTag={
                                data?.attributes?.blog_categories?.data[0]
                                  ?.attributes?.title
                              }
                              blogtags={data?.attributes?.blog_categories}
                              authorName={
                                data?.attributes?.blog_authors?.data[0]
                                  ?.attributes?.name
                              }
                              readTime={
                                <span>{extractAndCalculateReadTime(data)}</span>
                              }
                            />
                          </Link>
                        </div>
                      );
                    })}
              </div>
              <div className="flex justify-center lg:justify-end">
                <SeeAll color="primary" noButton link={trendingUrl} />
              </div>
            </div>
          )}

          {goodReadsBlogList && (
            <div>
              <div className="text-center lg:text-left">
                <Heading priority="2" variant="base" font="font-semibold">
                  Good reads
                </Heading>
              </div>
              <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-1">
                {goodReadsBlogList &&
                  goodReadsBlogList
                    .sort(
                      (a: Blog, b: Blog) =>
                        new Date(b.attributes?.publish_date).getTime() -
                        new Date(a.attributes?.publish_date).getTime(),
                    )

                    .filter((data: Blog) => data?.attributes?.good_read)
                    .slice(0, 4)

                    .map((data: Blog) => {
                      return (
                        <div key={data.id}>
                          <Link
                            href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                          >
                            <Card
                              smallCard
                              color="bg-green-350"
                              roundBorder="rounded-lg"
                              authorImg={getStrapiMedia(
                                data?.attributes?.blog_authors.data[0]
                                  ?.attributes?.image?.data?.attributes?.url,
                              )}
                              imgHeight={300}
                              imgWidth={300}
                              link={`${router.asPath}/${data.attributes?.slug}`}
                              title={data.attributes?.Title}
                              cardTag={
                                data?.attributes?.blog_categories?.data[0]
                                  ?.attributes?.title
                              }
                              blogtags={data?.attributes?.blog_categories}
                              authorName={
                                data?.attributes?.blog_authors?.data[0]
                                  ?.attributes?.name
                              }
                              readTime={
                                <span>{extractAndCalculateReadTime(data)}</span>
                              }
                            />
                          </Link>
                        </div>
                      );
                    })}
              </div>

              <div className="flex justify-center lg:justify-end">
                <SeeAll color="primary" noButton link={goodReadsUrl} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtherCards;
