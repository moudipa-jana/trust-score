{
  /**
   * CustomSearchList provides a dynamic, responsive search input with autocomplete,
   * recent searches, trending suggestions, and category-based filtering.
   * It supports campfire-specific and general post searches with debounce, animations,
   * and conditional rendering based on input state and authentication.
   */
}
import { useMutation } from '@apollo/client/react';
import Downshift, { StateChangeTypes } from 'downshift';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { TypeAnimation } from 'react-type-animation';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ForumMenu from '@/components/pages/Forum/forumMenu';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import PreviousSearches from '@/components/Utility/PreviousSearches';
import CampfireSearch from '@/components/Utility/SearchBarComponents/CampfireSearch';
import HashtagSearch from '@/components/Utility/SearchBarComponents/HashtagSearch';
import SearchPeople from '@/components/Utility/SearchBarComponents/SearchPeople';
import SearchPosts from '@/components/Utility/SearchBarComponents/SearchPosts';
import TrendingSearchBlogs from '@/components/Utility/SearchBarComponents/TrendingSearchBlogs';
import TagInput from '@/components/Utility/TagInput';
import Text from '@/elements/Text';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  transformText,
} from '@/lib/helpers';
import { CAMPFIRE_SEARCH } from '@/service/graphql/Campfire';
import { SEARCH_POST_MUTATION } from '@/service/graphql/Forum';
import { selectGetToken, selectIsAuthenticated } from '@/state/Slices/auth';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import {
  getCampfireData,
  getCampfireSearch,
  getIsCampfirePeopleSearch,
  getIsCampfirePostsSearch,
  setCampfireSearch,
  setIsCampfirePeopleSearch,
  setIsCampfirePostsSearch,
} from '@/state/Slices/campfire';
import {
  setCurrentSearchCampfireId,
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';
import { CampfireDetails } from '@/types/campfire';
import { ActionTypeEnum } from '@/types/enums';
import { Aggregate } from '@/types/forum';
import { IPeopleSearch } from '@/types/search';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

// Basic interfaces first
export interface CoverImgFormat {
  ext: string;
  hash: string;
  height: number;
  width: number;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  url: string;
}

export interface CoverImgFormats {
  large: CoverImgFormat;
  medium: CoverImgFormat;
  small: CoverImgFormat;
  thumbnail: CoverImgFormat;
}

export interface CoverImgAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
  formats: CoverImgFormats;
}

export interface CoverImgData {
  id: string;
  attributes: CoverImgAttributes;
}

export interface CoverImg {
  data: CoverImgData;
}

export interface BlogCategoryAttributes {
  slug: string;
  title: string;
}

export interface BlogCategory {
  id: string;
  attributes: BlogCategoryAttributes;
}

export interface BlogCategories {
  data: BlogCategory[];
}

export interface BlogAttributes {
  Title: string;
  slug: string;
  trending: boolean;
  views: number;
  videoViews: number;
  readDuration: string;
  shortDes: string;
  createdAt: string;
  publish_date: string;
  publishedAt: string;
  blog_categories: BlogCategories;
  coverImg: CoverImg;
}

export interface BlogData {
  id: string;
  name?: string;
  attributes: BlogAttributes;
}

export type searchPostType = {
  id: string;
  title: string;
  type: 'quiz' | 'poll' | 'question' | 'post' | string;
  quiz: {
    id: 'string';
    title: 'string';
  };
  poll: {
    id: 'string';
    title: 'string';
  };
  question: {
    id: 'string';
    title: 'string';
  };
  post: {
    id: 'string';
    title: 'string';
  };
};

export type hashtags = {
  id: string;
  hashtag_name: string;
  post_hashtags_aggregate: Aggregate;
};

interface SearchData {
  campfires?: CampfireDetails[];
  people?: IPeopleSearch[];
  posts?: searchPostType[];
  hashtags?: hashtags[];
  blogs: Blog[];
}

export type searchHistoryItem = {
  text: string;
};

interface CustomSearchListProps {
  placeholder?: string;
  searchIcon?: boolean;
  noBorder?: boolean;
  modaltop?: boolean;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isAnimatedText?: boolean;
  placeholderSequence?: (string | number)[] | null;
  isScrolled?: boolean;
  modalInput?: boolean;
  campfirePage?: boolean;
  isCampfireSearch?: boolean;
  campfireId?: string;
  searchInitData?: Blog[];
}
function CustomSearchList({
  placeholder,
  searchIcon,
  noBorder,
  modaltop,
  isOpen,
  setIsOpen,
  isAnimatedText = false,
  placeholderSequence = null,
  isScrolled = false,
  modalInput,
  campfirePage,
  isCampfireSearch,
  campfireId,
  searchInitData,
}: CustomSearchListProps) {
  const searchDataInitState = {
    blogs: searchInitData ?? [],
  };
  const [searchData, setSearchData] = useState<SearchData>(searchDataInitState);

  const topTrendingBlogs = useMemo(() => {
    if (!searchInitData) return [];
    return [...searchInitData]
      .sort((a, b) => (b?.attributes?.views || 0) - (a?.attributes?.views || 0))
      .slice(0, 3) as unknown as BlogData[];
  }, [searchInitData]);

  const [isEmptydata, setIsEmptyData] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [previousSearches, setPreviousSearches] = useState<searchHistoryItem[]>(
    [],
  );
  const [isValidSearchText, setValidSearchText] =
    useState<boolean>(!!isCampfireSearch);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const campfireSearchText = useAppSelector(getCampfireSearch);
  const campfireDetails = useAppSelector(getCampfireData);
  const isCampfirePostsSearch = useAppSelector(getIsCampfirePostsSearch);
  const isCampfirePeopleSearch = useAppSelector(getIsCampfirePeopleSearch);
  const dialogVisible = useAppSelector(
    (state) => state.dialog.searchSocialDialogOpen,
  );

  const currentCampfireId = useAppSelector(
    (state) => state.dialog.currentCampfireId,
  );

  const blockerIds = useUsersWhoBlockedMe();

  const [searchPostDetails, { loading }] = useMutation(SEARCH_POST_MUTATION, {
    context: {
      headers: { Authorization: `Bearer ${token}` },
    },
    onCompleted: (response) => {
      if (setIsOpen) setIsOpen(true);

      const data = (response as any).search.data;
      if (data?.people?.length > 0) {
        data.people = data.people.filter(
          (person: any) => !blockerIds.has(person.id),
        );
      }
      setSearchData(data);
      setIsEmptyData(
        !data.campfires[0] &&
          !data.people[0] &&
          !data.posts[0] &&
          !data.hashtags[0] &&
          !data.blogs[0],
      );
    },
    onError: (err) => {
      if (setIsOpen) setIsOpen(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [campfireSearch] = useMutation(CAMPFIRE_SEARCH, {
    context: {
      headers: { Authorization: `Bearer ${token}` },
    },
    onCompleted: (response) => {
      if (setIsOpen) {
        setIsOpen(true);
      }

      const data = (response as any).campfireSearch.data;
      setSearchData(data);
      const checkEmpty = !data.hashtags[0] && !data.people[0] && !data.posts[0];
      setIsEmptyData(checkEmpty);
    },
    onError: (err) => {
      if (setIsOpen) {
        setIsOpen(false);
      }
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  useEffect(() => {
    if (token && !isCampfireSearch && dialogVisible) {
      const stored = localStorage.getItem('search_history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreviousSearches(parsed);
        } catch {
          localStorage.removeItem('search_history');
        }
      }
    }
  }, [searchData, isCampfireSearch, token, dialogVisible]);

  useEffect(() => {
    if (token) {
      if (
        isCampfireSearch &&
        (currentCampfireId || campfireId) &&
        searchText != ''
      ) {
        campfireSearch({
          variables: {
            campfireId: currentCampfireId || campfireId,
            text: '',
          },
        });
      } else {
        if (dialogVisible && searchText != '') {
          searchPostDetails({ variables: { text: '' } });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    isCampfireSearch,
    currentCampfireId,
    campfireId,
    campfireSearch,
    searchPostDetails,
    dialogVisible,
  ]);

  const handleSearchChange = useCallback(
    (text: string) => {
      let processedSearchText = text;

      // Handle hashtags - remove # if it's at the start and doesn't contain spaces
      if (text.startsWith('#') && !text.includes(' ', 1)) {
        processedSearchText = text.substring(1);
      }

      if (isCampfireSearch && (currentCampfireId || campfireId)) {
        campfireSearch({
          variables: {
            campfireId: currentCampfireId || campfireId,
            text: processedSearchText,
          },
        });
      } else {
        searchPostDetails({ variables: { text: processedSearchText } });
      }

      setPreviousSearches((prevSearches) => {
        // Remove existing match (case-insensitive)
        const filtered = prevSearches.filter(
          (item) => item.text.toLowerCase() !== text.toLowerCase(),
        );

        // Add the new item to the top
        const updated = [{ text: text }, ...filtered];

        // Persist to localStorage
        localStorage.setItem('search_history', JSON.stringify(updated));

        return updated;
      });
    },
    [
      isCampfireSearch,
      currentCampfireId,
      campfireId,
      campfireSearch,
      searchPostDetails,
    ],
  );

  const debounceSearchText = useMemo(
    () => debounce(handleSearchChange, 500),
    [handleSearchChange],
  );

  const handleTextChange = (
    searchInput: string,
    { type }: { type: StateChangeTypes },
  ) => {
    if (
      type === Downshift.stateChangeTypes.changeInput ||
      type === Downshift.stateChangeTypes.clickItem
    ) {
      setSearchText(searchInput);

      const hasMinimumLength = searchInput.length >= 3;

      if (!isCampfireSearch) {
        setValidSearchText(!!searchInput && hasMinimumLength);
      }

      if (searchInput && hasMinimumLength) {
        debounceSearchText(searchInput);
      }
      if (!hasMinimumLength) {
        setSearchData(searchDataInitState);
      }
    }
  };

  const handlePreviousSearchClick = (previousSearchText: string) => {
    setSearchText(previousSearchText);
    setValidSearchText(!!previousSearchText && previousSearchText.length >= 3);

    let processedSearchText = previousSearchText;

    // Handle hashtags - remove # if it's at the start and doesn't contain spaces
    if (
      previousSearchText.startsWith('#') &&
      !previousSearchText.includes(' ', 1)
    ) {
      processedSearchText = previousSearchText.substring(1);
    }

    searchPostDetails({ variables: { text: processedSearchText } });
    setPreviousSearches((prevSearches) => {
      // Remove existing match (case-insensitive)
      const filtered = prevSearches.filter(
        (item) => item.text.toLowerCase() !== previousSearchText.toLowerCase(),
      );

      // Add the new item to the top
      const updated = [{ text: previousSearchText }, ...filtered];

      // Persist to localStorage
      localStorage.setItem('search_history', JSON.stringify(updated));

      return updated;
    });
  };

  useEffect(() => {
    setSearchText('');
  }, [router.asPath]);

  const handleActionClick = (chooseAction: ActionTypeEnum) => {
    if (!isAuthenticated) {
      return dispatch(toggleSignupDialog(true));
    }
    if (campfirePage) {
      dispatch(toggleSearchCampfireDialog(true));
    }
    if (campfireId) {
      dispatch(setCurrentSearchCampfireId(campfireId));
    }

    switch (chooseAction) {
      case ActionTypeEnum.search:
        return dispatch(toggleSearchSocialDialog(true));
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(isCampfireSearch && (currentCampfireId || campfireId))) {
      let searchTextWithoutSpecialChars = searchText;
      let viewType = 'post';

      // Handle hashtags
      if (searchText.includes('#')) {
        searchTextWithoutSpecialChars = searchText.substring(1);
        viewType = 'hashtag';
      }

      router
        .push(
          `/search?query=${searchTextWithoutSpecialChars}&viewType=${viewType}`,
        )
        .then(() => {
          dispatch(toggleSearchSocialDialog(false));
          dispatch(toggleSearchCampfireDialog(false));
        });
    }
  };

  const ismobile = useIsMobile();
  const isipad = useIsipad();

  const PlaceholderText = () => {
    return (
      <div
        style={{
          top: modalInput
            ? isipad
              ? 25
              : ismobile
                ? 20
                : 31
            : ismobile
              ? 16
              : 28,
        }}
        className="absolute left-12 mb-2.5 block -translate-y-1/2 transform text-xs font-thin tracking-tighter text-gray-700"
        onClick={() => handleActionClick(ActionTypeEnum.search)}
      >
        {isCampfireSearch ? (
          <span
            style={{
              fontSize: ismobile ? '14px' : isipad ? '16px' : '20px',
              fontWeight: '400',
              lineHeight: '23.7px',
              color: '#ABABAB',
              textAlign: 'center',
            }}
          >
            {`Search ${campfireDetails?.title}`}
          </span>
        ) : (
          <TypeAnimation
            preRenderFirstString
            sequence={placeholderSequence as (string | number)[]}
            speed={50}
            style={{
              fontSize: ismobile ? '14px' : isipad ? '16px' : '20px',
              fontWeight: '400',
              lineHeight: '23.7px',
              color: '#ABABAB',
              textAlign: 'center',
            }}
            repeat={Infinity}
            cursor={false}
          />
        )}
      </div>
    );
  };
  const { pathname } = router;
  const isHomeRoute = pathname === '/' || pathname === '/kofuku-social';

  const [clearAll, setClearAll] = useState(false);

  const handleDeleteSearch = (searchTextToDelete: string) => {
    setSearchText('');

    setPreviousSearches((prevSearches) => {
      const updated = prevSearches.filter(
        (searchValue) => searchValue.text !== searchTextToDelete,
      );
      localStorage.setItem('search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllSearches = () => {
    setPreviousSearches([]);
    setSearchText('');
    setClearAll(true);
    localStorage.removeItem('search_history');
  };

  return (
    <Downshift
      onInputValueChange={
        handleTextChange as unknown as (inputValue: string) => void
      }
      itemToString={(item) => (item ? item.value : '')}
      onOuterClick={() => {
        if (setIsOpen) setIsOpen(false);
      }}
    >
      {({ getInputProps, getMenuProps }) => (
        <div className="flex justify-end">
          <div className={`relative flex  ${isScrolled ? 'w-1/2' : 'w-full'}`}>
            {searchIcon ? (
              <div
                className={`cursor relative flex cursor-pointer flex-col items-center sm:mt-2 ${
                  isipad && !isHomeRoute ? 'sm:mr-0.75' : 'sm:mr-1.5'
                }`}
                onClick={() => handleActionClick(ActionTypeEnum.search)}
              >
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1830_47491)">
                    <path
                      d="M7.91602 0.416626C3.77388 0.416626 0.416016 3.77449 0.416016 7.91663C0.416016 12.0588 3.77388 15.4166 7.91602 15.4166C9.68686 15.4166 11.3144 14.8029 12.5974 13.7765L18.1601 19.3392C18.4855 19.6647 19.0132 19.6647 19.3386 19.3392C19.664 19.0138 19.664 18.4861 19.3386 18.1607L13.7759 12.598C14.8023 11.315 15.416 9.68747 15.416 7.91663C15.416 3.77449 12.0582 0.416626 7.91602 0.416626ZM2.08268 7.91663C2.08268 4.69496 4.69435 2.08329 7.91602 2.08329C11.1377 2.08329 13.7493 4.69496 13.7493 7.91663C13.7493 11.1383 11.1377 13.75 7.91602 13.75C4.69435 13.75 2.08268 11.1383 2.08268 7.91663Z"
                      fill="#00B2ED"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1830_47491">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                <Text variant color="text-black-300">
                  <div
                    style={{
                      fontSize: isipad ? '10px' : '8px',
                      color: '#00B2ED',
                    }}
                    className="lg:block"
                  >
                    Search
                  </div>
                </Text>
              </div>
            ) : (
              <div className="w-full">
                <div
                  style={{
                    height: modalInput
                      ? isipad
                        ? 45
                        : ismobile
                          ? 35
                          : 62
                      : ismobile
                        ? 30
                        : 52,
                  }}
                  className="main-searchbar z-10"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.04348 1C4.15347 1 1 4.15347 1 8.04348C1 11.9335 4.15347 15.087 8.04348 15.087C9.70653 15.087 11.235 14.5106 12.4399 13.5467L17.664 18.7708C17.9696 19.0764 18.4652 19.0764 18.7708 18.7708C19.0764 18.4652 19.0764 17.9696 18.7708 17.664L13.5467 12.4399C14.5106 11.235 15.087 9.70653 15.087 8.04348C15.087 4.15347 11.9335 1 8.04348 1ZM2.56522 8.04348C2.56522 5.01792 5.01792 2.56522 8.04348 2.56522C11.069 2.56522 13.5217 5.01792 13.5217 8.04348C13.5217 11.069 11.069 13.5217 8.04348 13.5217C5.01792 13.5217 2.56522 11.069 2.56522 8.04348Z"
                      fill="#00B2ED"
                    />
                  </svg>
                </div>
                <form
                  onSubmit={handleSubmit}
                  style={{ width: '100%' }}
                  className=""
                >
                  {!isOpen ? (
                    // Use original simple input for campfire pages
                    <input
                      {...getInputProps()}
                      autoFocus={modaltop}
                      placeholder={
                        isAnimatedText ? undefined : transformText(placeholder)
                      }
                      className={`w-full rounded-md 
                        ${
                          campfirePage
                            ? 'min-w-[220px] lg:min-w-[590px] xl:min-w-[900px]'
                            : 'xl:min-w-105.75'
                        }
                      ${
                        noBorder
                          ? 'bg-gray-100 py-2 pl-12 text-sm lg:bg-white lg:py-3 lg:text-base xl:py-3.25 xl:text-2xl'
                          : campfirePage
                            ? ' bg-white py-2 pl-12 text-sm lg:bg-gray-100 lg:text-base xl:text-2xl'
                            : 'border border-skyBlue-200 py-0.5 pl-11 text-base lg:py-3 xl:py-3.5'
                      }
                      
                      pr-12 placeholder-gray-500 focus:border-skyBlue-200 focus:outline-none `}
                      value={searchText}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchText(value);
                        // Handle the change through Downshift's handleTextChange
                        handleTextChange(value, {
                          type: Downshift.stateChangeTypes.changeInput,
                        });
                      }}
                      onClick={() => handleActionClick(ActionTypeEnum.search)}
                    />
                  ) : (
                    // Use TagInput for general search pages
                    <div className="search-tag-input-wrapper max-w-[366px] lg:max-w-full lg:h-[68px]">
                      <TagInput
                        {...getInputProps()}
                        autoFocus={modaltop}
                        placeholder={
                          isAnimatedText
                            ? undefined
                            : transformText(placeholder)
                        }
                        className={`w-full rounded-md 
                          ${
                            campfirePage
                              ? 'min-w-[220px] lg:min-w-[590px] xl:min-w-[900px]'
                              : 'xl:min-w-105.75'
                          }
                        ${
                          noBorder
                            ? 'bg-gray-100 py-2 pl-12 text-sm lg:bg-white lg:py-2.75 lg:text-base xl:py-3.25 xl:text-2xl'
                            : campfirePage
                              ? ' bg-white py-2 pl-12 text-sm lg:bg-gray-100 lg:text-base xl:text-2xl'
                              : 'border border-skyBlue-200 py-0.5 pl-11 text-base lg:py-2.75 xl:py-3.5'
                        }
                        
                        pr-4 placeholder-gray-500 focus:border-skyBlue-200 focus:outline-none `}
                        value={searchText}
                        onChange={(value: string) => {
                          setSearchText(value);
                          // Handle the change through Downshift's handleTextChange
                          handleTextChange(value, {
                            type: Downshift.stateChangeTypes.changeInput,
                          });
                        }}
                        onClick={() => handleActionClick(ActionTypeEnum.search)}
                        singleLine
                        dark={noBorder}
                        outline={!noBorder}
                      />
                      <style jsx>{`
                        .search-tag-input-wrapper
                          :global(.w-full__highlighter) {
                          background: transparent !important;
                          color: transparent !important;
                          visibility: hidden !important;
                        }
                        .search-tag-input-wrapper
                          :global(.w-full__highlighter__substring) {
                          visibility: hidden !important;
                          color: transparent !important;
                        }
                        .search-tag-input-wrapper :global(.w-full__input) {
                          padding-left: 48px !important;
                          padding-right: 48px !important;
                        }
                        .search-tag-input-wrapper
                          :global(.mentions__suggestions__item) {
                          background: white;
                        }
                        .search-tag-input-wrapper
                          :global(.mentions__suggestions__item--focused) {
                          background: #f3f4f6;
                        }
                      `}</style>
                    </div>
                  )}
                  {isAnimatedText && placeholderSequence && !searchText ? (
                    <PlaceholderText />
                  ) : null}
                </form>
                {!modalInput &&
                  campfireSearchText &&
                  campfirePage &&
                  (isCampfirePeopleSearch || isCampfirePostsSearch) && (
                    <RxCross2
                      className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-500"
                      onClick={() => {
                        dispatch(setCampfireSearch(''));
                        dispatch(setIsCampfirePeopleSearch(false));
                        dispatch(setIsCampfirePostsSearch(false));
                      }}
                    />
                  )}
                <div>
                  {modalInput && (
                    <div className="mx-3">
                      {ismobile || isipad || isCampfireSearch ? null : (
                        <ForumMenu campModal />
                      )}
                    </div>
                  )}
                  <div className="searchbar-ul  mt-6 mb-4 rounded-lg bg-white lg:mt-14">
                    {modalInput &&
                    !clearAll &&
                    !isValidSearchText &&
                    !loading &&
                    !isEmptydata ? (
                      <PreviousSearches
                        onPreviousSearchClick={handlePreviousSearchClick}
                        onDeleteSearch={handleDeleteSearch}
                        onClearAll={handleClearAllSearches}
                        previousSearches={previousSearches}
                      />
                    ) : null}
                    {modalInput &&
                      !isValidSearchText &&
                      !loading &&
                      !isEmptydata && (
                        <div className="m-5">
                          {!isCampfireSearch && (
                            <TrendingSearchBlogs
                              items={topTrendingBlogs}
                            />
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            <ul
              {...getMenuProps()}
              className={`searchbar-ul mt-6 mb-4 rounded-lg ${
                isCampfireSearch ? 'lg:mt-6' : 'lg:mt-14'
              } `}
            >
              {loading && isOpen ? (
                <div
                  className="m-5 flex items-center justify-center"
                  style={{ minHeight: 200 }}
                >
                  <TabletLoader />
                </div>
              ) : isEmptydata && isOpen ? (
                <div className="layout flex flex-col items-center justify-center gap-3 text-center">
                  <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                  <p className="text-sm font-bold text-gray-500">
                    No result found
                  </p>
                  {!isCampfireSearch && (
                    <div className="mt-5 w-full text-left">
                      <TrendingSearchBlogs
                        items={topTrendingBlogs}
                      />
                    </div>
                  )}
                </div>
              ) : (
                isOpen &&
                searchData &&
                (!isCampfireSearch || isValidSearchText) && (
                  <li className="">
                    <div className="py-0 px-0 shadow-none lg:py-5 lg:px-5.75 lg:shadow-4xl xl:px-9.5 xl:pt-8 xl:pb-4">
                      {isValidSearchText && (!isCampfireSearch ||
                        (((searchData?.people as [])?.length > 0 ||
                          (searchData?.posts as [])?.length > 0) &&
                          searchText.length >= 3)) && (
                        <>
                          {searchData?.hashtags?.length && !isCampfireSearch
                            ? searchData?.hashtags[0] && (
                                <HashtagSearch
                                  items={searchData?.hashtags}
                                  searchText={searchText}
                                />
                              )
                            : null}

                          {searchData?.people && (
                            <SearchPeople
                              key={searchText}
                              items={searchData?.people}
                              searchText={searchText}
                              isCampfireSearch={isCampfireSearch}
                            />
                          )}

                          {searchData?.posts && (
                            <SearchPosts
                              items={searchData?.posts}
                              searchText={searchText}
                              isCampfireSearch={isCampfireSearch}
                            />
                          )}

                          {searchData?.campfires && (
                            <CampfireSearch
                              items={searchData?.campfires?.slice(0, 3)}
                              searchText={searchText}
                            />
                          )}
                        </>
                      )}
                      
                      {!isCampfireSearch && (!modalInput || isValidSearchText) && (
                        <TrendingSearchBlogs
                          items={topTrendingBlogs}
                        />
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </Downshift>
  );
}

export default CustomSearchList;
