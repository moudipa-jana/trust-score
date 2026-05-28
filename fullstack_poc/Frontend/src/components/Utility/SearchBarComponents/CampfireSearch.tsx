import { useRouter } from 'next/router';
import React from 'react';

import HighlightMatch from '@/components/Utility/HighlightMatch';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import CustomImage from '@/components/Utility/CustomImage';
import null_point from '/public/images/null_point.svg';
import Heading from '@/elements/Heading';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { selectGetToken } from '@/state/Slices/auth';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';
import { CampfireDetails } from '@/types/campfire';

function CampfireSearch({
  items,
  searchText,
}: {
  items: CampfireDetails[];
  searchText: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const handleClick = (title: string) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    router.push(`/campfire/${encodeURIComponent(title)}`).then(() => {
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    });
  };
  const handleSeeAllCampfire = () => {
    router.push(`/search?query=${searchText}&viewType=campfire`).then(() => {
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    });
  };

  const isMobile = useIsMobile();

  return (
    <div className="campfire-ser mb-2.75 border-b border-black-150 lg:mb-0 lg:border-b-0">
      <div
        className={`relative flex ${isMobile
          ? 'flex-col items-start gap-3'
          : 'outer-box items-center gap-6'
          }`}
      >
        {isMobile ? (
          <Heading priority={6} color="text-white-350">
            Campfires
          </Heading>
        ) : (
          <Heading priority={2} variant width="w-12">
            <span className="writing-vertical">Campfires</span>
          </Heading>
        )}

        <ul className="w-full py-2">
          {items && items.length > 0 ? (
            items.map((data: CampfireDetails) => {
              return (
                <li
                  key={data.id}
                  className="search-list search-list-hover"
                  onClick={() => handleClick(data.title)}
                >
                  {isMobile ? (
                    <div className="flex items-center gap-3">
                      <div className=" h-9 w-9">
                        <CustomImage
                          src={getDefaultCampfireImage(data?.picture)}
                          width={50}
                          height={50}
                          fallbackSrc="https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc"
                        />
                      </div>

                      <div className="flex flex-col">
                        <Text size="sm">
                          <HighlightMatch text={data.title} query={searchText} />
                        </Text>

                        <div className="flex flex-wrap items-center gap-2">
                          <Text color="text-offwhite-1000" size="xs">
                            {data.category?.title || ''}
                          </Text>

                          <span className="campfire-dot-search"></span>

                          <Text color="text-offwhite-1000" size="xs">
                            <div className="flex items-center">
                              {data.noParticipants}
                              <p className="ml-0.5">{`${
                                data.noParticipants > 1 ? 'members' : 'member'
                              }`}</p>
                            </div>
                          </Text>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className=" h-7.5 w-7.5">
                        <CustomImage
                          src={getDefaultCampfireImage(data?.picture)}
                          width={50}
                          height={50}
                          fallbackSrc="https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc"
                        />
                      </div>
                      <Text size="sm">
                        <HighlightMatch text={data.title} query={searchText} />
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-offwhite-1000" size="xs">
                        {data?.category?.title || ''}
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-offwhite-1000" size="xs">
                        <div className="flex items-center">
                          {data.noParticipants}
                          <p className="ml-0.5">{`${
                            data.noParticipants > 1 ? 'members' : 'member'
                          }`}</p>
                        </div>
                      </Text>
                    </>
                  )}
                </li>
              );
            })
          ) : (
            <div className="flex items-center gap-2 py-4">
              <div className="h-40 w-40">
                <CustomImage src={null_point} fill />
              </div>
              <Text color="text-gray-500" size="sm" font="font-bold">
                No result found
              </Text>
            </div>
          )}
        </ul>
      </div>

      <div className="mb-6 flex items-center justify-end">
        {!isMobile && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="500"
            height="2"
            viewBox="0 0 500 2"
            fill="none"
          >
            <path
              d="M0 1H500"
              stroke="url(#paint0_linear_2697_2099)"
              strokeWidth="2"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2697_2099"
                x1="381.5"
                y1="1"
                x2="85"
                y2="1"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#00B2ED" />
                <stop offset="1" stop-color="#00B2ED" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}

        <div className="ml-2.5">
          <SeeAll noButton handleClick={handleSeeAllCampfire} color="primary" />
        </div>
      </div>
    </div>
  );
}

export default CampfireSearch;
