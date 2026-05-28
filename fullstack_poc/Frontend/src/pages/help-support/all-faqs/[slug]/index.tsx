import { useLazyQuery, useQuery } from '@apollo/client/react';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IoArrowForwardCircle, IoChevronDown, IoClose } from 'react-icons/io5';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Input from '@/elements/Input';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import type { MenuItem } from '@/types/menu';

import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { FaqData, FaqSearchData, faqTypesService } from '@/service';
import cmsClient from '@/service/cmsClient';
import { DataFaq, FaqType } from '@/types/helpCenter';
import AccountImg from '@/../public/images/account.png';
import ImgFindAns from '@/../public/images/img-find-answer.png';
import CustomImage from '@/components/Utility/CustomImage';
import PostYourQuery from '../../postYourQuery';
import { useRouter } from 'next/router';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { TrimTitleforSlug, shortWords, emitNotification } from '@/lib/helpers';

interface AllFaqsProps {
  faqTypes: FaqType[];
  setTopic?: Dispatch<SetStateAction<string>>;
  initialMenus?: MenuItem[];
  initialBottomMenus?: MenuItem[];
  initialSearchData?: Blog[];
  initialSocials?: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

const AllFaqs = ({
  faqTypes,
  setTopic,
  initialMenus = [],
  initialBottomMenus = [],
  initialSearchData = [],
  initialSocials = [],
}: AllFaqsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { slug, question } = router.query;

  const {
    loading,
    error,
    data: faqData,
  } = useQuery<any>(FaqData, {
    variables: { page: 0, type: slug },
    client: cmsClient,
  });
  const faqTypeData = faqTypes.find(
    (type: any) => type?.attributes?.slug === slug,
  );

  const [searchDropdown, setSearchDropdown] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showFullAnswer, setShowFullAnswer] = useState<{
    [key: number]: boolean;
  }>({});
  const [visibleFaqs, setVisibleFaqs] = useState(5);
  const isDesktop = useIsDesktop();
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (question && faqData?.allFaqs?.data && faqData.allFaqs.data.length > 0) {
      const matchedFaq = faqData.allFaqs.data.find((faq: any) => {
        return question === TrimTitleforSlug(faq.attributes.question);
      });
      if (matchedFaq) {
        setExpandedFaq(matchedFaq.id);
      }
    }
  }, [faqData, question]);

  const handleLoadMore = () => {
    setVisibleFaqs(faqData?.allFaqs?.data.length);
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const toggleReadMore = (id: number) => {
    setShowFullAnswer((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [fetchFaqs, { data: searchFaqData }] = useLazyQuery(FaqSearchData, {
    client: cmsClient,
  });

  const debouncedSearch = useCallback(
    (value: string) => {
      fetchFaqs({
        variables: {
          page: 1,
          searchTerm: value,
        },
      });
    },
    [fetchFaqs],
  );

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      debouncedSearch(value);
      setSearchDropdown(true);
    } else {
      setSearchDropdown(false);
    }
    // Clear selected item when typing new search
    if (selectedItem) {
      setSelectedItem('');
    }
  };

  const handleSearchIconClick = () => {
    const container = document.querySelector('.topicScroll');
    if (container) {
      window.scrollTo({ top: 750, behavior: 'smooth' });
      setSearchTerm('');
      setSelectedItem('');
    }
  };

  const handleClearSelection = () => {
    setSelectedItem('');
    setSearchTerm('');
    setSearchDropdown(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchFaqData && (searchFaqData as any).allFaqs.data.length > 0) {
        const firstResult = (searchFaqData as any).allFaqs.data[0];
        if (setTopic) {
          setTopic(firstResult.attributes.faq_types.data[0].attributes.slug);
        }
        setSelectedItem(firstResult.attributes.question);
        setSearchTerm(firstResult.attributes.question);
        setSearchDropdown(false);
      } else {
        handleSearchIconClick();
      }
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      searchBarRef.current &&
      !searchBarRef.current.contains(e.target as Node)
    ) {
      setSearchDropdown(false);
      setSearchFocused(false);
      if (!selectedItem) {
        setSearchTerm('');
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Removed duplicate local variables for navigation props
  function handleQuerySubmit(text: string): void {
    // For now, just show an alert or log the query.
    // In a real app, you would send this to your backend or support system.
    if (text.trim()) {
      emitNotification('success', 'Your query has been submitted: ' + text);
    } else {
      emitNotification('error', 'Please enter your query before submitting.');
    }
  }

  return (
    <>
      {!loading && (
        <PageBase
          title="Help & Support"
          description="Get help and support for your questions"
          initialMenus={initialMenus}
          initialBottomMenus={initialBottomMenus}
          searchData={initialSearchData}
          initialSocials={initialSocials}
        >
          <div className="container">
            <div className="mx-auto lg:py-7 py-4">
              <div className="text-[#C3C3C3] text-md font-medium">
                Help | {faqTypeData?.attributes?.title}
              </div>
            </div>
            <div className="lg:flex justify-between border-b pb-3 lg:mb-10 mb-5">
              <div className="flex items-center gap-5 lg:mb-0 mb-5">
                <div>
                  <div className="flex gap-2 items-center">
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.4316 0C13.199 6.54732 18.4298 11.7293 25 12.4209V12.5791C18.4298 13.2706 13.199 18.4527 12.4316 25H12.2354C11.481 18.5638 6.41321 13.4469 0 12.6182V12.3818C6.41323 11.5531 11.481 6.43627 12.2354 0H12.4316Z"
                        fill="#309EC1"
                      />
                    </svg>
                    <Heading priority={3}>
                      <span className="font-bold text-[#309EC1] lg:text-[48px] text-4xl">
                        {faqTypeData?.attributes?.title}
                      </span>
                    </Heading>{' '}
                  </div>
                  <Text size="md" customClass="text-[#4D4D4D]">
                    Resolve issues regarding {faqTypeData?.attributes?.title}
                  </Text>
                </div>
                <div className="w-[80px] block lg:hidden ml-auto">
                  <CustomImage
                    src={faqTypeData?.attributes?.Icon?.data?.attributes?.url}
                    width={80}
                    height={160}
                    alt="Account"
                  />
                </div>
              </div>
              <div>
                <div
                  className={`transition-all duration-300 ${searchFocused ? 'w-full lg:min-w-[800px]' : 'w-full lg:min-w-[400px]'}`}
                >
                  {/* Search functionality */}
                  <div
                    className={`relative ${isMobile ? 'mt-2' : 'mt-4'}`}
                    ref={searchBarRef}
                  >
                    <div className="flex items-center  ">
                      <svg
                        className="left-3 absolute z-10"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.4999 15.5L11.8808 11.8808M11.8808 11.8808C12.4998 11.2617 12.9909 10.5268 13.3259 9.71794C13.661 8.90909 13.8334 8.04216 13.8334 7.16666C13.8334 6.29115 13.661 5.42422 13.326 4.61537C12.9909 3.80651 12.4998 3.07156 11.8808 2.45249C11.2617 1.83342 10.5267 1.34234 9.71788 1.0073C8.90902 0.67226 8.0421 0.499817 7.16659 0.499817C6.29109 0.499817 5.42416 0.67226 4.61531 1.0073C3.80645 1.34234 3.0715 1.83342 2.45243 2.45249C1.20215 3.70276 0.499756 5.3985 0.499756 7.16666C0.499756 8.93481 1.20215 10.6305 2.45243 11.8808C3.7027 13.1311 5.39844 13.8335 7.16659 13.8335C8.93475 13.8335 10.6305 13.1311 11.8808 11.8808Z"
                          stroke="#777676"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <Input
                        type="text"
                        placeholder={
                          selectedItem ? '' : 'Search for your queries'
                        }
                        rounded
                        help
                        value={selectedItem || searchTerm}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setSearchFocused(true)}
                        customClass="pl-10 rounded-xl font-base"
                        readOnly={!!selectedItem}
                      />
                      <div
                        className={`absolute right-2 z-10 ${searchDropdown &&
                            searchFaqData &&
                            (searchFaqData as any).allFaqs.data.length > 0
                            ? ''
                            : 'cursor-pointer'
                          }`}
                        onClick={() =>
                          searchDropdown &&
                            searchFaqData &&
                            (searchFaqData as any).allFaqs.data.length > 0
                            ? ''
                            : handleSearchIconClick()
                        }
                      >
                        {selectedItem ? (
                          <IoClose
                            color="#00B2ED"
                            size={32}
                            className="cursor-pointer"
                            onClick={handleClearSelection}
                          />
                        ) : (
                          <IoArrowForwardCircle
                            color={
                              searchDropdown &&
                                searchFaqData &&
                                (searchFaqData as any).allFaqs.data.length > 0
                                ? 'gray'
                                : '#00B2ED'
                            }
                            size={32}
                          />
                        )}
                      </div>
                    </div>

                    {/* Search dropdown */}
                    {
                      (searchDropdown &&
                        searchFaqData &&
                        (searchFaqData as any).allFaqs.data.length > 0 && (
                          <div className="rounded-lg bg-[#F7F7F7] p-2 shadow-lg">
                            {(
                              (searchFaqData as any).allFaqs.data as DataFaq[]
                            ).map((faq: DataFaq) => (
                              <div
                                key={faq.id}
                                className="ml-2 cursor-pointer py-1"
                                onClick={() => {
                                  if (setTopic) {
                                    setTopic(
                                      faq?.attributes?.faq_types?.data?.[0]
                                        ?.attributes?.slug,
                                    );
                                  }
                                  const container =
                                    document.querySelector('.topicScroll');
                                  if (container) {
                                    const offset = 100; // pixels
                                    const top =
                                      container.getBoundingClientRect().top +
                                      window.scrollY -
                                      offset;

                                    window.scrollTo({
                                      top,
                                      behavior: 'smooth',
                                    });
                                  }
                                  setSelectedItem(faq.attributes.question);
                                  setSearchTerm(faq.attributes.question);
                                  setSearchDropdown(false);
                                }}
                              >
                                <Text size="base" color="text-black">
                                  {faq.attributes.question}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )) as React.ReactNode
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
              <div className="col-span-4 hidden lg:block">
                <div className="w-[255px] ">
                  <CustomImage
                    src={faqTypeData?.attributes?.Icon?.data?.attributes?.url}
                    width={255}
                    height={267}
                    alt="Account"
                    className="w-[255px]"
                  />
                </div>
              </div>
              <div className="col-span-8">
                <div className="flex justify-between items-center mb-5">
                  <Heading priority={3}>
                    <span className="font-bold lg:text-2xl text-lg text-gray-1000">
                      Most asked questions
                    </span>
                  </Heading>
                </div>

                <div className="faq-sec space-y-2">
                  {faqData &&
                    faqData?.allFaqs &&
                    !!faqData?.allFaqs?.data.length &&
                    faqData?.allFaqs?.data.map((faq: any) => (
                      <div key={faq.id} className="">
                        <div
                          className="flex justify-between items-center py-4 cursor-pointer transition-colors border-b"
                          onClick={() => toggleFaq(faq.id)}
                        >
                          <Text
                            size="base"
                            customClass="font-semibold flex-1 text-[#5C5C5C]"
                          >
                            {faq?.attributes?.question}
                          </Text>
                          <div className="ml-4">
                            <div
                              className={`transform transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180' : 'rotate-0'}`}
                            >
                              <IoChevronDown
                                size={18}
                                className="text-gray-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedFaq === faq.id
                              ? 'max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="pb-4">
                            <div className="pt-3">
                              <Text
                                size="sm"
                                customClass="text-gray-700 leading-relaxed font-regular"
                              >
                                {showFullAnswer[faq.id]
                                  ? faq?.attributes?.answer
                                  : shortWords(faq?.attributes?.answer, 150)}
                                {faq?.attributes?.answer?.length > 150 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReadMore(faq.id);
                                    }}
                                    className="text-primary text-sm font-medium transition-colors ml-1 inline"
                                  >
                                    {showFullAnswer[faq.id]
                                      ? 'Read less'
                                      : 'Read more'}
                                  </button>
                                )}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Load More Button */}
                  {visibleFaqs < faqData.length && (
                    <div className="text-center mt-15 pt-10">
                      <button
                        onClick={handleLoadMore}
                        className="text-lg font-medium transition-colors flex items-center gap-2 mx-auto text-[#4D4D4D]"
                      >
                        Load more
                        <svg
                          width="61"
                          height="60"
                          viewBox="0 0 61 60"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="1"
                            y="0.5"
                            width="59"
                            height="59"
                            rx="29.5"
                            fill="white"
                          />
                          <rect
                            x="1"
                            y="0.5"
                            width="59"
                            height="59"
                            rx="29.5"
                            stroke="#696969"
                          />
                          <path
                            d="M30.4999 20.2502C30.6989 20.2502 30.8896 20.3292 31.0303 20.4698C31.1709 20.6105 31.2499 20.8012 31.2499 21.0002L31.2499 37.1897L37.4697 30.9699C37.6111 30.8333 37.8006 30.7577 37.9972 30.7594C38.1939 30.7611 38.382 30.84 38.5211 30.979C38.6601 31.1181 38.739 31.3062 38.7407 31.5029C38.7424 31.6995 38.6668 31.889 38.5302 32.0304L31.0302 39.5304C30.8895 39.671 30.6988 39.75 30.4999 39.75C30.3011 39.75 30.1103 39.671 29.9697 39.5304L22.4697 32.0304C22.3331 31.889 22.2575 31.6995 22.2592 31.5029C22.2609 31.3062 22.3398 31.1181 22.4788 30.979C22.6179 30.84 22.806 30.7611 23.0026 30.7594C23.1993 30.7577 23.3887 30.8333 23.5302 30.9699L29.7499 37.1897L29.7499 21.0002C29.7499 20.8012 29.829 20.6105 29.9696 20.4698C30.1103 20.3292 30.301 20.2502 30.4999 20.2502Z"
                            fill="#696969"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <PostYourQuery
              title="Still not able to find answers?"
              description="Write down your concern here and our group of nerds will help you to solve it."
              onSubmit={handleQuerySubmit}
              image={ImgFindAns}
            />
          </div>
        </PageBase>
      )}
    </>
  );
};
export default AllFaqs;

export const getServerSideProps = withCommonData(async () => {
  let faqTypes, pageData, faqs;
  try {
    const { data }: any = await faqTypesService();
    faqTypes = data?.faqTypes?.data ?? {};
  } catch (error) {
    captureSentryException(error);
  }
  return {
    props: {
      faqTypes: faqTypes || [],
      initialSearchData: [],
    },
  };
});
