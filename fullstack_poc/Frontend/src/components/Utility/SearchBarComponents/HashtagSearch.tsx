import { useRouter } from 'next/router';
import React from 'react';

import HighlightMatch from '@/components/Utility/HighlightMatch';
import { IoIosArrowForward } from 'react-icons/io';

import { hashtags } from '@/components/Utility/CustomSearchList';
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

function HashtagSearch({
  items,
  searchText,
}: {
  items: hashtags[];
  searchText: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const isMobile = useIsMobile();

  const handleClick = (title: string) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    router.push(`/search?query=${title}&viewType=hashtag`).then(() => {
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    });
  };

  const handleSeeAllHashtags = () => {
    const sanitizedSearchText = searchText.startsWith('#')
      ? searchText.slice(1)
      : searchText;

    router
      .push(`/search?query=${sanitizedSearchText}&viewType=hashtag`)
      .then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
  };



  return (
    <div>
      {searchText.includes('#') ? (
        <div className="">
          <div className="ml-4">
            <ul className="py-1">
              {items &&
                items.slice(0, 3).map((data: hashtags) => {
                  return (
                    <li
                      key={data.id}
                      className="cursor-pointer py-1.5"
                      onClick={() => handleClick(data.hashtag_name)}
                    >
                      <Text color="text-primary">#<HighlightMatch text={data.hashtag_name} query={searchText.startsWith('#') ? searchText.slice(1) : searchText} /></Text>
                    </li>
                  );
                })}
            </ul>
          </div>
          <div className="flex items-center justify-end">
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
              <SeeAll
                noButton
                handleClick={handleSeeAllHashtags}
                color="primary"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center">
          <div className="flex-grow">
            <ul className="flex flex-wrap gap-4 py-2">
              {items &&
                items.slice(0, 5).map((data: hashtags) => {
                  return (
                    <li
                      key={data.id}
                      className="cursor-pointer"
                      onClick={() => handleClick(data.hashtag_name)}
                    >
                      <Text color="text-primary">
                        #<HighlightMatch text={data.hashtag_name} query={searchText} />
                      </Text>
                    </li>
                  );
                })}
            </ul>
          </div>
          <div
            className="rounded-full bg-white p-1 shadow"
            onClick={handleSeeAllHashtags}
          >
            <IoIosArrowForward className="cursor-pointer text-black" />
          </div>
        </div>
      )}
    </div>
  );
}

export default HashtagSearch;
