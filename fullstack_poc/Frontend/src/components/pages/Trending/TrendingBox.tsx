import Link from 'next/link';
import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import { getStrapiMedia } from '@/lib/helpers';

export interface TrendingBoxData {
  attributes: {
    views: number;
    slug: string;
    Title: string;
    readDuration?: number;
    coverImg: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    blog_categories: {
      data: Array<{
        attributes: {
          title: string;
        };
      }>;
    };
  };
  rank: number;
}

function formatNumberWithKMB(number: number): string {
  if (number) {
    if (number >= 1000000000) {
      return (number / 1000000000).toFixed(2) + 'b';
    } else if (number <= -1000000000) {
      return (number / -1000000000).toFixed(2) + 'b';
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + 'm';
    } else if (number <= -1000000) {
      return (number / -1000000).toFixed(2) + 'm';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + 'k';
    } else if (number <= -1000) {
      return (number / -1000).toFixed(2) + 'k';
    } else {
      return number.toString();
    }
  } else {
    return '0';
  }
}

function TrendingBox({ trendingData }: { trendingData: TrendingBoxData }) {
  const views = trendingData?.attributes?.views;
  const numbersToDisplay = [views, views - 1, views - 2, views - 3, views];

  return (
    <Link href={`/sunrise-club/trending/${trendingData.attributes?.slug}`}>
      <div className="trendingBox">
        <div className="trendingNumber absolute z-25 font-bold transition-all duration-1000">
          {trendingData.rank}
        </div>
        <div className="trendingDetails flex items-center gap-2">
          <div className="trendingImg">
            <CustomImage
              height={100}
              width={100}
              src={getStrapiMedia(
                trendingData.attributes?.coverImg?.data?.attributes?.url,
              )}
              alt={trendingData?.attributes?.Title}
              objectFit="contain"
            />
          </div>
          <div>
            <div className="trendingTitle transition-all duration-1000 line-clamp-2">
              {trendingData?.attributes?.Title}
            </div>
            <div className="mt-1 flex">
              <span className="card-tag trendingTag pr-3 text-xs text-primary">
                {
                  trendingData?.attributes?.blog_categories?.data[0]?.attributes
                    ?.title
                }
              </span>
              {/* <span className="trendingViews text-gray-850">
                {formatNumberWithKMB(trendingData?.attributes?.views)} views
              </span> */}
              {trendingData?.attributes?.readDuration && (
                <span className="trendingViews ml-3 text-gray-850">
                  {trendingData.attributes.readDuration}m read
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="boxArrow hidden lg:block"></div>
        <div>
          <div className="numberRotate hidden lg:block">
            <span>
              {trendingData?.attributes?.views > 0 &&
                numbersToDisplay.map((number) => (
                  <div key={`view-${number}-${trendingData.rank}`}>
                    {formatNumberWithKMB(number)}
                  </div>
                ))}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TrendingBox;
