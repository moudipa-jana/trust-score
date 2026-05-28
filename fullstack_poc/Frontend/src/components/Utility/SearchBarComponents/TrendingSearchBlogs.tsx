import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { MouseEvent, useState } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';

import BlogImage from '@/components/Utility/BlogImage';
import { BlogData } from '@/components/Utility/CustomSearchList';
import Heading from '@/elements/Heading';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';

function TrendingSearchBlogs({ items }: { items?: BlogData[] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const profileId = useAppSelector(getUserId);
  const handleClick = (data: BlogData) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (profileId === data.id) {
      router.push('/profile#activities').then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
      return;
    }
    router.push(`/user/${encodeURIComponent(data.name ?? '')}`).then(() => {
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    });
  };

  const isMobile = useIsMobile();

  const handleSeeAllTrendingBlogs = (e: MouseEvent) => {
    e?.stopPropagation();
    router.push('/sunrise-club/trending').then(() => {
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    });
  };

  return (
    <div className="campfire-ser mb-2.75 overflow-x-auto border-b border-black-150 lg:mb-0 lg:border-b-0">
      <div
        className={`relative flex ${isMobile
            ? 'flex-col items-start gap-3'
            : 'outer-box items-center gap-6'
          }`}
      >
        {isMobile ? (
          <Heading priority={6} color="text-white-350">
            Blogs
          </Heading>
        ) : (
          <Heading priority={2} variant width="w-12">
            <span className="writing-vertical">Blogs</span>
          </Heading>
        )}

        <div
          id="trendingBlogsContainer"
          className={`flex  w-full overflow-hidden py-2 ${isMobile ? 'h-90' : 'h-auto'
            }`}
        >
          <ul className={`${isMobile ? 'w-full flex-col' : 'flex'} gap-8`}>
            {items &&
              items.map((data: BlogData, index: number) => {
                return (
                  <li
                    key={data.id}
                    id={'itemId' + index}
                    className="search-list search-list-hover flex-shrink-0"
                    onClick={() => handleClick(data)}
                  >
                    <Link
                      href={`/sunrise-club/${data?.attributes?.blog_categories?.data[0]?.attributes?.slug}/${data.attributes?.slug}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex flex-row items-center gap-3">
                        <div className="flex items-center">
                          <span className="mr-3 text-xl font-bold text-primary" />
                          <div className="h-16 w-16 flex-shrink-0">
                            <BlogImage
                              className="h-full w-full object-cover"
                              src={
                                data?.attributes?.coverImg?.data?.attributes?.url
                              }
                              alt="Blog image"
                              width={16}
                              height={16}
                            />
                          </div>
                        </div>

                        <div
                          className={` ${isMobile ? 'w-full' : 'w-30 text-sm'}`}
                        >
                          <div>
                            {data?.attributes?.Title?.slice(
                              0,
                              isMobile ? 40 : 20,
                            ) + '...'}
                          </div>

                          <div className="text-xs">
                            {
                              data?.attributes?.blog_categories?.data[0]
                                ?.attributes?.title
                            }
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>

        <div
          className={`flex h-full  ${isMobile ? 'w-full items-center justify-center' : null
            }`}
        >
          <div className="flex w-16 flex-shrink-0 items-center justify-center">
            <div
              className="flex items-center justify-center rounded-full p-1 shadow-xl"
              onClick={(e) => handleSeeAllTrendingBlogs(e)}
            >
              {isMobile ? (
                <IoIosArrowDown className="cursor-pointer text-black" />
              ) : (
                <IoIosArrowForward className="cursor-pointer text-black" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingSearchBlogs;
