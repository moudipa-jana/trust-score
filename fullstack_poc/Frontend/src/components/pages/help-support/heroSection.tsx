import { useLazyQuery } from '@apollo/client/react';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IoArrowForwardCircle } from 'react-icons/io5';

import CustomImage from '@/components/Utility/CustomImage';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { FaqSearchData } from '@/service';
import cmsClient from '@/service/cmsClient';
import { DataFaq } from '@/types/helpCenter';

interface HeroSectionProps {
  setTopic: Dispatch<SetStateAction<string>>;
  title: string;
  description: string;
  bgImage: string;
}

export default function HeroSection({
  setTopic,
  title,
  description,
  bgImage,
}: HeroSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDropdown, setSearchDropdown] = useState<boolean>(false);
  const isDesktop = useIsDesktop();
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const [fetchFaqs, { data: searchData }] = useLazyQuery(FaqSearchData, {
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
    debouncedSearch(value);
    setSearchDropdown(true);
  };

  const handleSearchIconClick = () => {
    const container = document.querySelector('.topicScroll');
    if (container) {
      window.scrollTo({ top: 750, behavior: 'smooth' });
      setSearchTerm('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchData && (searchData as any).allFaqs.data.length > 0) {
        const firstResult = (searchData as any).allFaqs.data[0];
        setTopic(firstResult.attributes.faq_types.data[0].attributes.slug);
        setSearchTerm('');
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
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative">
      <CustomImage src={bgImage} height={444} width={1280} />
      <div
        className={`absolute inset-0 w-[265px]  lg:w-[514px] xl:w-[647px] ${
          isDesktop ? 'ml-20 py-10' : 'ml-6 py-4'
        }`}
      >
        <Text size="base" variant color="text-white" font="semibold">
          {title ?? 'Help From Kōfuku'}
        </Text>
        <Text size="md" variant color="text-green-800" font="bold">
          {description ?? 'Let our health nerds be your solution today'}
        </Text>
        <div
          className={`relative ${isMobile ? 'mt-2' : 'mt-8'}`}
          ref={searchBarRef}
        >
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Come, let us help you xx"
              rounded
              help
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
            />
            <div
              className={`absolute right-2 ${
                searchDropdown &&
                searchData &&
                (searchData as any).allFaqs.data.length > 0
                  ? ''
                  : 'cursor-pointer'
              }`}
              onClick={() =>
                searchDropdown &&
                searchData &&
                (searchData as any).allFaqs.data.length > 0
                  ? ''
                  : handleSearchIconClick()
              }
            >
              <IoArrowForwardCircle
                color={
                  searchDropdown &&
                  searchData &&
                  (searchData as any).allFaqs.data.length > 0
                    ? 'gray'
                    : '#00B2ED'
                }
                size={32}
              />
            </div>
          </div>

          {/* ✅ Move dropdown inside the ref container */}
          {
            (searchDropdown &&
              searchData &&
              (searchData as any).allFaqs.data.length > 0 && (
                <div className="rounded-lg bg-white p-2 shadow-lg">
                  {((searchData as any).allFaqs.data as DataFaq[]).map(
                    (faq: DataFaq) => (
                      <div
                        key={faq.id}
                        className="ml-2 cursor-pointer py-1"
                        onClick={() => {
                          setTopic(
                            faq?.attributes?.faq_types?.data?.[0]?.attributes
                              ?.slug,
                          );
                          const container =
                            document.querySelector('.topicScroll');
                          if (container) {
                            const offset = 100; // pixels
                            const top =
                              container.getBoundingClientRect().top +
                              window.scrollY -
                              offset;

                            window.scrollTo({ top, behavior: 'smooth' });
                          }
                          setSearchTerm('');
                          setSearchDropdown(false);
                        }}
                      >
                        <Text size="base" color="text-black">
                          {faq.attributes.question}
                        </Text>
                      </div>
                    ),
                  )}
                </div>
              )) as React.ReactNode
          }
        </div>
      </div>
    </div>
  );
}
