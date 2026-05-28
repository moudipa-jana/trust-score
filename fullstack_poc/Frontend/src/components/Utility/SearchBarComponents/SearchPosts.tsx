import { useRouter } from 'next/router';
import React from 'react';

import question from '/public/images/question.svg';
import quizsearch from '/public/images/quizsearch.svg';
import pollIcon from '/public/images/whitepoll.svg';
import Icon from '@/components/pages/Forum/forumMenu/icon';
import CustomImage from '@/components/Utility/CustomImage';
import null_point from '/public/images/null_point.svg';
import { searchPostType } from '@/components/Utility/CustomSearchList';
import LinkifyText from '@/components/Utility/LinkifyText';
import Heading from '@/elements/Heading';
import SeeAll from '@/elements/SeeAll';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch } from '@/Hooks/useRedux';
import {
  setCampfireSearch,
  setIsCampfirePostsSearch,
} from '@/state/Slices/campfire';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
} from '@/state/Slices/dialog';

function SearchPosts({
  items,
  searchText,
  isCampfireSearch,
}: {
  items: searchPostType[];
  searchText: string;
  isCampfireSearch?: boolean;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const handlePostClick = (item: searchPostType) => {
    if (isCampfireSearch) {
      const itemType = item?.type as keyof searchPostType;
      const post = item[itemType] as { id: string; title: string } | undefined;
      dispatch(setIsCampfirePostsSearch(true));
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
      dispatch(setCampfireSearch(post?.title));
    } else {
      const id = item?.title
        ? item.id
        : item[item.type as 'quiz' | 'poll' | 'question' | 'post']?.id;
      router.push(`/post/${id}`).then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
    }
  };
  const handleSeeAllPost = () => {
    if (isCampfireSearch) {
      dispatch(setIsCampfirePostsSearch(true));
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
      dispatch(setCampfireSearch(searchText));
    } else {
      router.push(`/search?query=${searchText}&viewType=post`).then(() => {
        dispatch(toggleSearchSocialDialog(false));
        dispatch(toggleSearchCampfireDialog(false));
      });
    }
  };

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
            Posts
          </Heading>
        ) : (
          <Heading priority={2} variant width="w-12">
            <span className="writing-vertical">Posts</span>
          </Heading>
        )}

        <ul className="w-full py-2">
          {items && items.length > 0 ? (
            items.map((data: searchPostType) => {
              return (
                <li
                  key={data.id}
                  className="search-post search-list-hover"
                  onClick={() => handlePostClick(data)}
                >
                  <span className="search-icon text-xl">
                    {data.type == 'question' && <Icon posts icon={question} />}
                    {data.type == 'quiz' && <Icon posts icon={quizsearch} />}
                    {data.type == 'poll' && <Icon posts icon={pollIcon} />}
                  </span>
                  <Text size="sm">
                    <LinkifyText
                      text={
                        data?.title ||
                        data[data.type as 'quiz' | 'poll' | 'question' | 'post']
                          ?.title
                      }
                      isSearch={!isCampfireSearch}
                      query={searchText}
                    />
                  </Text>
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
          <SeeAll noButton handleClick={handleSeeAllPost} color="primary" />
        </div>
      </div>
    </div>
  );
}

export default SearchPosts;
