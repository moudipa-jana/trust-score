import { get } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

import null_point from '/public/images/null_point.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsipad from '@/Hooks/useIsIpad';
import { useIsMobile } from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { BLOG_ANIMATED_PLACEHOLDER, FALLBACK_BLOG_PIC } from '@/lib/constants';
import { getStrapiMedia } from '@/lib/helpers';
import { getBlogsByTitle } from '@/service';
import { selectIsAuthenticated } from '@/state/Slices/auth';
import {
  toggleSearchSocialDialog,
  toggleSignupDialog,
} from '@/state/Slices/dialog';
import { ActionTypeEnum } from '@/types/enums';

interface SearchResult {
  id: string;
  type?: 'blog' | 'video';
  attributes: {
    Title?: string;
    shortDes?: string;
    Description?: string;
    Link?: string;
    Name?: string;
    Name_Slug?: string;
    Designation?: string;
    slug?: string;
    views?: number;
    readDuration?: number;
    Image?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    CoverImg?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    coverImg?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    blog_categories?: {
      data: Array<{
        attributes: {
          slug: string;
          title: string;
        };
      }>;
    };
    sunrise_club_author?: {
      data: {
        attributes: {
          Name: string;
          Name_Slug: string;
        };
      };
    };
  };
}

interface SearchHistoryItem {
  text: string;
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

const SearchBarClub = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [previousSearches, setPreviousSearches] = useState<SearchHistoryItem[]>(
    [],
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const debouncedSearch = useCallback(async (str: string) => {
    const resp = await getBlogsByTitle(str);

    const { data } = resp;

    // Create an array mapping all the results into a unified SearchResult
    const blogsResults =
      (data as any)?.sunriseBlogs?.data?.map((blog: any) => ({
        ...blog,
        type: 'blog',
      })) || [];

    const videoResults =
      (data as any)?.youtubes?.data?.map((video: any) => ({
        ...video,
        type: 'video',
      })) || [];

    const unifiedResults = [...blogsResults, ...videoResults];

    setResults(unifiedResults);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
    setIsDropdownOpen(true);
  };

  const handleSearchBarClick = () => {
    setIsFocused(!isFocused);
  };

  const handleAfterClick = () => {
    setIsDropdownOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      searchBarRef.current &&
      !searchBarRef.current.contains(e.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
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
  }, [isAuthenticated, isDropdownOpen]);

  useEffect(() => {
    const topHeaderHolder = document.getElementById('mainInput');
    if (topHeaderHolder) {
      if (isDropdownOpen) {
        topHeaderHolder.classList.add('search-bg');
        document.body.classList.add('overflow-y-hidden');
      } else {
        topHeaderHolder.classList.remove('search-bg');
        document.body.classList.remove('overflow-y-hidden');
      }
    }
  }, [isDropdownOpen]);

  function handleLinkClick() {
    setQuery('');
  }

  const handlePreviousSearchClick = (previousSearchText: string) => {
    setQuery(previousSearchText);
    debouncedSearch(previousSearchText);
  };

  const handleEnter = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (inputRef?.current?.blur) {
      inputRef?.current.blur();
    }

    setPreviousSearches((prevSearches) => {
      const filtered = prevSearches.filter(
        (item) => item.text.toLowerCase() !== query.toLowerCase(),
      );
      const updated = [{ text: query }, ...filtered];
      localStorage.setItem('search_history', JSON.stringify(updated));
      return updated;
    });
    router.push(`/sunrise-club/search-results?q=${query}`).then(() => {
      setIsDropdownOpen(false);
      setIsFocused(false);
    });
  };
  const ismobile = useIsMobile();
  const isipad = useIsipad();
  const dispatch = useAppDispatch();

  const PlaceholderText = () => {
    return (
      <div
        onClick={() => inputRef?.current?.focus()}
        className="black-400 z-2 short-label absolute top-1/2 -translate-y-1/2 transform overflow-hidden font-sans text-xs font-light tracking-wide sm:left-9 md:whitespace-nowrap"
        style={{ maxWidth: 'calc(100% - 40px)', left: '38px' }}
      >
        <TypeAnimation
          preRenderFirstString
          sequence={BLOG_ANIMATED_PLACEHOLDER}
          speed={50}
          style={{ fontSize: ismobile ? '14px' : '16px', color: '#ABABAB' }}
          repeat={Infinity}
          cursor={false}
        />
      </div>
    );
  };

  const handleActionClick = (chooseAction: ActionTypeEnum) => {
    if (!isAuthenticated) {
      return dispatch(toggleSignupDialog(true));
    }

    switch (chooseAction) {
      case ActionTypeEnum.search:
        return dispatch(toggleSearchSocialDialog(true));
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto ml-2 w-full max-w-md">
      <div
        id="mainInput"
        className="relative"
        ref={searchBarRef}
      >
        {ismobile ? (
          <>
            {!isDropdownOpen && !isFocused && (
              <div
                className="cursor relative flex cursor-pointer flex-col items-center sm:mt-2 sm:mr-1.5"
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
            )}

            {isFocused && (
              <div className="relative" ref={searchBarRef}>
                <form onSubmit={handleEnter}>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search"
                      className="z-999 w-full max-w-42.5 rounded-lg border border-skyBlue-200 py-1.25 pl-8.5 pr-2.5 text-sm leading-5  placeholder-gray-500 focus:border-skyBlue-200 focus:outline-none"
                      value={query}
                      onChange={handleInputChange}
                    />
                    <button type="submit" className="absolute left-2.5 top-[6px] z-20">
                      <svg
                        width={ismobile ? '15' : '20'}
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1830_47491)">
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
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            <form className="relative" onSubmit={handleEnter}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Sunrise club"
                className="w-full rounded-lg border border-skyBlue-200 py-1.25 pl-4 pr-3 text-sm leading-5 placeholder-transparent placeholder-black-400 
                  focus:border-skyBlue-200 focus:outline-none lg:max-w-58.25 lg:py-1.75 lg:pl-9 lg:text-base xl:min-w-85.25"
                value={query}
                onChange={handleInputChange}
                onClick={handleSearchBarClick}
              />
              {!query.length ? <PlaceholderText /> : null}
              <button type="submit" className="absolute left-3 top-1.5 z-20 lg:top-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_1830_47491)">
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
              </button>
            </form>
          </>
        )}

        {isDropdownOpen && (
          <div
            ref={searchBarRef}
            className="absolute z-10 mt-1.5 rounded-lg bg-white px-4 py-4"
            style={{
              width: '150%',
              left: ismobile ? '-25%' : '0',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            {/* Inline search bar inside dropdown */}
            <form
              className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-3"
              onSubmit={handleEnter}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip_search_inline)">
                  <path
                    d="M7.91602 0.416626C3.77388 0.416626 0.416016 3.77449 0.416016 7.91663C0.416016 12.0588 3.77388 15.4166 7.91602 15.4166C9.68686 15.4166 11.3144 14.8029 12.5974 13.7765L18.1601 19.3392C18.4855 19.6647 19.0132 19.6647 19.3386 19.3392C19.664 19.0138 19.664 18.4861 19.3386 18.1607L13.7759 12.598C14.8023 11.315 15.416 9.68747 15.416 7.91663C15.416 3.77449 12.0582 0.416626 7.91602 0.416626ZM2.08268 7.91663C2.08268 4.69496 4.69435 2.08329 7.91602 2.08329C11.1377 2.08329 13.7493 4.69496 13.7493 7.91663C13.7493 11.1383 11.1377 13.75 7.91602 13.75C4.69435 13.75 2.08268 11.1383 2.08268 7.91663Z"
                    fill="#ABABAB"
                  />
                </g>
                <defs>
                  <clipPath id="clip_search_inline">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <input
                type="text"
                className="flex-1 text-sm font-medium text-black outline-none placeholder-gray-400"
                placeholder="Search Sunrise Club"
                value={query}
                onChange={handleInputChange}
                autoFocus
              />
              <button type="submit" className="flex-shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="12" fill="#00B2ED" />
                  <path
                    d="M8 12H16M16 12L12.5 8.5M16 12L12.5 15.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            {/* Previous searches */}
            {!query && previousSearches.length > 0 && (
              <div className="mb-3">
                <Text size="xs" color="text-gray-400">
                  Latest searches
                </Text>
                <ul className="mt-1">
                  {previousSearches.slice(0, 4).map((item) => (
                    <li
                      key={item.text}
                      className="flex cursor-pointer items-center gap-2 py-1.5"
                      onClick={() => handlePreviousSearchClick(item.text)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip_prev_search)">
                          <path
                            d="M7.91602 0.416626C3.77388 0.416626 0.416016 3.77449 0.416016 7.91663C0.416016 12.0588 3.77388 15.4166 7.91602 15.4166C9.68686 15.4166 11.3144 14.8029 12.5974 13.7765L18.1601 19.3392C18.4855 19.6647 19.0132 19.6647 19.3386 19.3392C19.664 19.0138 19.664 18.4861 19.3386 18.1607L13.7759 12.598C14.8023 11.315 15.416 9.68747 15.416 7.91663C15.416 3.77449 12.0582 0.416626 7.91602 0.416626ZM2.08268 7.91663C2.08268 4.69496 4.69435 2.08329 7.91602 2.08329C11.1377 2.08329 13.7493 4.69496 13.7493 7.91663C13.7493 11.1383 11.1377 13.75 7.91602 13.75C4.69435 13.75 2.08268 11.1383 2.08268 7.91663Z"
                            fill="#212121"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip_prev_search">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <Text size="sm">{item.text}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!query && previousSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <div className="h-40 w-40">
                  <CustomImage src={null_point} fill />
                </div>
                <Text color="text-gray-500" size="sm" font="font-bold">
                  No previous search words
                </Text>
              </div>
            )}

            {/* Blog results header with count */}
            {query && (
              <div className="pt-2 pb-1">
                <span className="text-sm font-semibold">Search Result</span>
                <span className="text-sm text-black-900 ml-1">
                  ({results.filter((r) => r.type === 'blog').length})
                </span>
              </div>
            )}

            {query &&
              (results.filter((r) => r.type === 'blog').length > 0 ? (
                results
                  .filter((r) => r.type === 'blog')
                  .map((result: SearchResult) => {
                    const category = get(
                      result,
                      'attributes.blog_categories.data[0].attributes.slug',
                    );

                    return (
                      <Link
                        key={result.id}
                        href={`/sunrise-club/${category}/${result.attributes.slug}`}
                        onClick={handleLinkClick}
                      >
                        <div className="flex cursor-pointer items-start pt-3 gap-3">
                          <div className="flex-shrink-0 h-16 w-24 rounded overflow-hidden">
                            <CustomImage
                              height={64}
                              width={96}
                              src={getStrapiMedia(
                                get(
                                  result,
                                  'attributes.coverImg.data.attributes.url',
                                  FALLBACK_BLOG_PIC,
                                ),
                              )}
                              className="h-full w-full rounded object-cover object-center"
                              alt={result.attributes.Title || ''}
                            />
                          </div>
                          <div className="flex flex-1 min-w-0">
                            <div className="flex flex-col flex-1 min-w-0">
                              <Heading
                                priority={6}
                                variant="xs"
                                font="font-medium"
                                clamp="line-clamp-2"
                              >
                                {result.attributes.Title}
                              </Heading>
                              {result.attributes.shortDes && (
                                <Text size="xs" color="text-black-400">
                                  {result.attributes.shortDes.length > 120
                                    ? result.attributes.shortDes.slice(0, 120) +
                                    '...'
                                    : result.attributes.shortDes}
                                </Text>
                              )}
                              {result.attributes.sunrise_club_author?.data
                                ?.attributes?.Name && (
                                  <span className="text-xs text-primary mt-0.5">
                                    By{' '}
                                    {
                                      result.attributes.sunrise_club_author.data
                                        .attributes.Name
                                    }
                                  </span>
                                )}
                            </div>
                            {result.attributes.blog_categories?.data?.[0] && (
                              <span
                                className="flex-shrink-0 ml-3 self-center rounded px-2.5 py-1 text-xs text-black-600"
                                style={{ backgroundColor: '#F0F0F0' }}
                              >
                                {
                                  result.attributes.blog_categories.data[0]
                                    .attributes.title
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <div className="h-40 w-40">
                    <CustomImage src={null_point} fill />
                  </div>
                  <Text color="text-gray-500" size="sm" font="font-bold">
                    No result found
                  </Text>
                </div>
              ))}

            {query && (
              <div className="mt-3 border-t border-t-offwhite-150 pt-3 pb-1">
                <span className="text-sm font-semibold">Video</span>
                <span className="text-sm text-black-900 ml-1">
                  ({results.filter((r) => r.type === 'video').length})
                </span>
              </div>
            )}

            {query &&
              (results.filter((r) => r.type === 'video').length > 0 ? (
                results
                  .filter((r) => r.type === 'video')
                  .map((result: SearchResult) => {
                    return (
                      <Link
                        key={result.id}
                        href={`/sunrise-club/binge-watch-detail/${result.attributes.slug}`}
                        onClick={handleLinkClick}
                      >
                        <div className="justify-content flex cursor-pointer pt-3">
                          <div className="mr-3 h-11.25 w-full max-w-13.5 rounded lg:w-13.5 lg:min-w-13.5 lg:max-w-full">
                            <CustomImage
                              height={50}
                              width={50}
                              src={getStrapiMedia(
                                get(
                                  result,
                                  'attributes.CoverImg.data.attributes.url',
                                  FALLBACK_BLOG_PIC,
                                ),
                              )}
                              className="h-full w-full rounded object-cover object-center"
                              alt={result.attributes.Title || ''}
                            />
                          </div>
                          <div className="flex flex-col">
                            <Heading
                              priority={6}
                              variant="xs"
                              font="font-medium"
                              clamp="line-clamp-2"
                            >
                              {result.attributes.Title}
                            </Heading>
                            {result.attributes.Description && (
                              <Text size="xs" color="text-black-400">
                                {result.attributes.Description.length > 120
                                  ? result.attributes.Description.slice(
                                    0,
                                    120,
                                  ) + '...'
                                  : result.attributes.Description}
                              </Text>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-4 mt-3">
                  <div className="h-40 w-40">
                    <CustomImage src={null_point} fill />
                  </div>
                  <Text color="text-gray-500" size="sm" font="font-bold">
                    No result found
                  </Text>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBarClub;
