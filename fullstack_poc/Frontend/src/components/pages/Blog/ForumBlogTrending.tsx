import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Card from '@/components/Card';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import CustomImage from '@/components/Utility/CustomImage';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { getStrapiMedia } from '@/lib/helpers';

export default function ForumBlogTrending({
  trendingBlogs,
}: {
  trendingBlogs: Blog[];
}) {
  const trendingUrl = '/sunrise-club/trending';
  const ismobile = useIsMobile();
  const router = useRouter();



  return (
    <div className="rightSection">
      <div className="flex justify-between space-x-2">
        <div className={`flex-1 ${ismobile ? 'mt-11' : 'mt-6'}`}>
          <div className="relative flex items-center text-start">
            <Text size="md" color="text-gray-1250" font="font-semibold">
              Trending
            </Text>
            <div
              className={`${
                ismobile ? 'left-8 h-12 w-20' : 'left-14 h-14 w-24'
              } absolute `}
            >
              <CustomImage src="/video/Trending_Final.gif" fill />
            </div>
          </div>
          <div className="line"></div>
        </div>
        <div className="">
          <SeeAll navigate link={trendingUrl} />
        </div>
      </div>
      <div className="mt-2">
        <div
          className={`flex ${
            ismobile ? 'flex-col space-y-6' : 'flex justify-between space-x-6'
          }`}
        >
          {trendingBlogs
            .filter((data: Blog) => data?.attributes?.trending)
            .sort(
              (a, b) =>
                (b.attributes?.views || 0) - (a.attributes?.views || 0),
            )
            .slice(0, 2)
            .map((data: Blog) => {
              const readingTime = extractAndCalculateReadTime(data);
              return (
                <div className={`${ismobile ? '' : 'flex-1'}`} key={data.id}>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`,
                      )
                    }
                  >
                    <Card
                      type="forumCover"
                      blogtags={data?.attributes?.blog_categories}
                      size="base"
                      color="bg-green-700 text-left"
                      coverImg={getStrapiMedia(
                        data.attributes?.coverImg?.data?.attributes?.url,
                      )}
                      fallbackSrc="/images/blog/vaccine.svg"
                      blogId={data?.id}
                      imgHeight={20}
                      imgWidth={300}
                      variant="vertical"
                      title={data?.attributes?.Title}
                      description={
                        data?.attributes?.shortDes?.slice(0, 60) + '...'
                      }
                      isBorderRadius
                      textAlign
                      forumBlogs
                      isFullHeight
                      readingTime={<span>{readingTime}</span>}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
