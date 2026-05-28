import { useLazyQuery } from '@apollo/client/react';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { IoArrowForwardCircle, IoClose } from 'react-icons/io5';

import CustomImage from "@/components/Utility/CustomImage";
import Input from '@/elements/Input';
import Heading from "@/elements/Heading";
import Text from "@/elements/Text";
import HeroImg from "@/../public/images/help-hero-img.png";

import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { FaqSearchData } from '@/service';
import cmsClient from '@/service/cmsClient';

import { DataFaq } from '@/types/helpCenter';

interface HeroSectionProps {
    setTopic?: Dispatch<SetStateAction<any>>;
    heroData?: any;
}

const HeroSection = ({ setTopic, heroData }: HeroSectionProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDropdown, setSearchDropdown] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const isDesktop = useIsDesktop();
    const searchBarRef = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    const [fetchFaqs, { data: searchData }] = useLazyQuery(FaqSearchData, { client: cmsClient, });

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
            if (searchData && (searchData as any).allFaqs.data.length > 0) {
                const firstResult = (searchData as any).allFaqs.data[0];
                if (setTopic) {
                    setTopic(firstResult.attributes);
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

    return (
        <>
            <div className="grid grid-cols-12 gap-4 justify-between items-center">
                <div className="col-span-12 lg:col-span-5 lg:mb-0 mb-15">
                    <Heading priority="1">
                        <span className="text-[#AEAEAE] font-bold lg:text-[48px] text-3xl">{heroData?.Title} </span>
                    </Heading>
                    <Text size="md" customClass="text-primary lg:mb-0 mb-8">{heroData?.SubTitle}</Text>

                    {/* Search functionality */}
                    <div
                        className={`relative ${isMobile ? 'mt-2' : 'mt-8'}`}
                        ref={searchBarRef}
                    >
                        <div className="flex items-center help-search-box">
                            <svg className='left-3 absolute z-10' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.4999 15.5L11.8808 11.8808M11.8808 11.8808C12.4998 11.2617 12.9909 10.5268 13.3259 9.71794C13.661 8.90909 13.8334 8.04216 13.8334 7.16666C13.8334 6.29115 13.661 5.42422 13.326 4.61537C12.9909 3.80651 12.4998 3.07156 11.8808 2.45249C11.2617 1.83342 10.5267 1.34234 9.71788 1.0073C8.90902 0.67226 8.0421 0.499817 7.16659 0.499817C6.29109 0.499817 5.42416 0.67226 4.61531 1.0073C3.80645 1.34234 3.0715 1.83342 2.45243 2.45249C1.20215 3.70276 0.499756 5.3985 0.499756 7.16666C0.499756 8.93481 1.20215 10.6305 2.45243 11.8808C3.7027 13.1311 5.39844 13.8335 7.16659 13.8335C8.93475 13.8335 10.6305 13.1311 11.8808 11.8808Z" stroke="#777676" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <Input
                                type="text"
                                placeholder={selectedItem ? '' : "Come, let us help you"}
                                rounded
                                help
                                value={selectedItem || searchTerm}
                                onChange={handleSearch}
                                onKeyDown={handleKeyDown}
                                readOnly={!!selectedItem}
                            />
                            <div
                                className={`absolute right-2 z-10 ${searchDropdown &&
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
                                                searchData &&
                                                (searchData as any).allFaqs.data.length > 0
                                                ? 'gray'
                                                : '#00B2ED'
                                        }
                                        size={32}
                                    />
                                )}
                            </div>
                            <div className='border-2 border-gray-400 rounded-xl h-18 w-full absolute left-4 top-5 z-0'></div>
                        </div>

                        {/* Search dropdown */}
                        {(searchDropdown &&
                            searchData &&
                            (searchData as any).allFaqs.data.length > 0 && (
                                <div className="rounded-lg bg-white p-2 shadow-lg absolute w-full z-11">
                                    {((searchData as any).allFaqs.data as DataFaq[]).map((faq: DataFaq) => (
                                        <div
                                            key={faq.id}
                                            className="ml-2 cursor-pointer py-1"
                                            onClick={() => {
                                                if (setTopic) {
                                                    setTopic(
                                                        faq?.attributes,
                                                    );
                                                }
                                                // faq?.attributes?.faq_types?.data?.[0]?.attributes?.slug,
                                                // 
                                                const container = document.querySelector('.topicScroll');
                                                if (container) {
                                                    const offset = 100; // pixels
                                                    const top =
                                                        container.getBoundingClientRect().top +
                                                        window.scrollY -
                                                        offset;

                                                    window.scrollTo({ top, behavior: 'smooth' });
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
                            )) as React.ReactNode}
                    </div>
                </div>
                <div className='col-span-1 hidden'></div>
                <div className="col-span-12 lg:col-span-6 lg:order-last order-first">
                    <CustomImage src={heroData?.Banner?.data?.attributes?.url || HeroImg} alt="Description of image" width={580} height={451} />
                </div>
            </div>
        </>
    );
};
export default HeroSection;