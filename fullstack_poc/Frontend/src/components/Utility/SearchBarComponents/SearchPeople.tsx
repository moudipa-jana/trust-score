import { useRouter } from 'next/router';
import React from 'react';

import HighlightMatch from '@/components/Utility/HighlightMatch';

import SearchImage from '/public/images/Ellipse 209searchImage.png';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import Heading from '@/elements/Heading';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  setCampfireSearch,
  setIsCampfirePeopleSearch,
  setIsMemberModalOpen,
} from '@/state/Slices/campfire';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';
import { IPeopleSearch } from '@/types/search';
import null_point from '/public/images/null_point.svg';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';
interface Item {
  user: IPeopleSearch;
}
function SearchPeople({
  items,
  searchText,
  isCampfireSearch,
}: {
  items: IPeopleSearch[];
  searchText: string;
  isCampfireSearch?: boolean;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const profileId = useAppSelector(getUserId);
  const handleClick = (data: IPeopleSearch) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (isCampfireSearch) {
      dispatch(setIsCampfirePeopleSearch(true));
      dispatch(setIsMemberModalOpen(true));
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
      dispatch(setCampfireSearch(data?.name));
    } else {
      if (profileId === data?.id) {
        router.push('/profile#activities').then(() => {
          dispatch(toggleSearchSocialDialog(false));
          dispatch(toggleSearchCampfireDialog(false));
        });
        return;
      }
      router.push(`/user/${encodeURIComponent(data?.name)}`).then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
    }
  };

  const handleSeeAllPeople = () => {
    if (isCampfireSearch) {
      dispatch(setIsCampfirePeopleSearch(true));
      dispatch(setIsMemberModalOpen(true));
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
      dispatch(setCampfireSearch(searchText));
    } else {
      router.push(`/search?query=${searchText}&viewType=people`).then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
    }
  };
  const isMobile = useIsMobile();

  return (
    <div className=" campfire-ser mb-2.75 border-b border-black-150 lg:mb-0 lg:border-b-0">
      <div
        className={`relative flex ${isMobile
          ? 'flex-col items-start gap-3'
          : 'outer-box items-center gap-6'
          }`}
      >
        {isMobile ? (
          <Heading priority={6} color="text-white-350">
            People
          </Heading>
        ) : (
          <Heading priority={2} variant width="w-12">
            <span className="writing-vertical">People</span>
          </Heading>
        )}

        <ul className="w-full py-2">
          {items && items.length > 0 ? (
            items.map((item: IPeopleSearch | Item) => {
              const data = 'user' in item ? item?.user : item;
              return (
                <li
                  key={data?.id}
                  className="search-list search-list-hover"
                  onClick={() => handleClick(data)}
                >
                  {isMobile ? (
                    <div className="flex items-center gap-3">
                      <div className=" h-9 w-9">
                        <CustomImage
                          src={data?.profilePicture || SearchImage}
                          fill
                          fallbackSrc="/images/userImage.svg"
                        />
                      </div>

                      <div className="flex flex-col">
                        <Text size="sm">
                          <HighlightMatch
                            text={data?.name || ''}
                            query={searchText}
                          />
                        </Text>

                        <div className="flex flex-wrap items-center gap-2">
                          <Text color="text-offwhite-1000" size="xs">
                            {data?.postCount} Posts
                          </Text>

                          <span className="campfire-dot-search"></span>

                          <Text color="text-offwhite-1000" size="xs">
                            {data?.followersCount} Followers
                          </Text>

                          <span className="campfire-dot-search"></span>
                          <Text color="text-offwhite-1000" size="xs">
                            {data?.followingCount} Followings
                          </Text>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className=" h-9 w-9">
                        <CustomImage
                          src={data?.profilePicture || SearchImage}
                          fill
                          fallbackSrc="/images/userImage.svg"
                        />
                      </div>
                      <Text size="sm">
                        <HighlightMatch
                          text={data?.name || ''}
                          query={searchText}
                        />
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-offwhite-1000" size="xs">
                        {data?.postCount} Posts
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-offwhite-1000" size="xs">
                        {data?.followersCount} Followers
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-offwhite-1000" size="xs">
                        {data?.followingCount} Followings
                      </Text>
                      <div onClick={(e) => e.stopPropagation()}>
                        <FollowButton
                          postUserId={data?.id}
                          isFollowing={data?.isFollowing}
                        />
                      </div>
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
          <SeeAll noButton handleClick={handleSeeAllPeople} color="primary" />
        </div>
      </div>
    </div>
  );
}

export default SearchPeople;
