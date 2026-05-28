import { shuffle } from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Card from '@/components/Card';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import extractAndCalculateReadTime from '@/components/Utility/CalculateReadtime';
import CustomImage from '@/components/Utility/CustomImage';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import { getStrapiMedia } from '@/lib/helpers';

import { useIsMobile } from '../../../Hooks/useIsMobile';

export default function GoodReads({ goodReads }: { goodReads: Blog[] }) {
  const ismobile = useIsMobile();
  const goodreadUrl = '/sunrise-club/good-read';

  const [shuffledGoodReadsBlogs, setShuffledGoodReadsBlogs] = useState<Blog[]>(
    [],
  );

  useEffect(() => {
    const shuffled = shuffle(goodReads);
    setShuffledGoodReadsBlogs(shuffled);
  }, [goodReads]);

  return (
    <div className="goodReadsSection">
      <div className="flex justify-between space-x-2">
        <div className={`flex-1 ${ismobile ? 'mt-11' : 'mt-6'}`}>
          <div className="flex items-center text-start">
            <Text size="md" color="text-gray-1250" font="font-semibold">
              Good Reads
            </Text>
            <div className={`${ismobile ? 'h-6 w-12' : 'h-8 w-14'}  `}>
              <CustomImage src="/video/Good Read.gif" fill />
            </div>
          </div>
          <div className="line"></div>
        </div>
        <div className="">
          <SeeAll navigate link={goodreadUrl} />
        </div>
      </div>
      <div
        className={`flex ${
          ismobile ? 'flex-col space-y-6' : 'justify-between space-x-6'
        }`}
      >
        {shuffledGoodReadsBlogs &&
          shuffledGoodReadsBlogs
            .filter((data: Blog) => data?.attributes?.good_read)
            .slice(0, 2)
            .map((data: Blog) => {
              const readingTime = extractAndCalculateReadTime(data);
              return (
                <div className={`${ismobile ? '' : 'flex-1'}`} key={data?.id}>
                  <Link
                    href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                  >
                    <Card
                      key={data.id}
                      coverImg={getStrapiMedia(
                        data?.attributes?.coverImg?.data?.attributes?.url,
                      )}
                      fallbackSrc="/images/blog/vaccine.svg"
                      type="forumCover"
                      blogtags={data?.attributes?.blog_categories}
                      imgHeight={20}
                      imgWidth={300}
                      blogId={data?.id}
                      variant={ismobile ? 'horizontal' : 'vertical'}
                      color="bg-green-700"
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
                  </Link>
                </div>
              );
            })}
      </div>
    </div>
  );
}
