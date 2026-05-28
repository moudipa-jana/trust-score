import { useLazyQuery } from '@apollo/client/react';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { IoArrowForwardCircle, IoChevronDown, IoClose } from 'react-icons/io5';

import PageBase from "@/components/layout/PageBase";
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Input from '@/elements/Input';
import Heading from "@/elements/Heading";
import Text from "@/elements/Text";
import type { MenuItem } from '@/types/menu';

import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { FaqSearchData } from '@/service';
import cmsClient from '@/service/cmsClient';
import { DataFaq } from '@/types/helpCenter';
import ImgSerachResult from "@/../public/images/img-search-result.png"
import ImgFindAns from "@/../public/images/img-find-answer.png"
import CustomImage from '@/components/Utility/CustomImage';
import PostYourQuery from '../postYourQuery';

interface SearchResultProps {
    setTopic?: Dispatch<SetStateAction<string>>;
}


const SearchResult = ({ setTopic }: SearchResultProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDropdown, setSearchDropdown] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [searchFocused, setSearchFocused] = useState<boolean>(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showFullAnswer, setShowFullAnswer] = useState<{ [key: number]: boolean }>({});
    const [visibleFaqs, setVisibleFaqs] = useState(5);
    const isDesktop = useIsDesktop();
    const searchBarRef = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    const faqData = [
        {
            id: 1,
            question: "How to delete my account?",
            answer: "To delete your account, go to your account settings and scroll down to the 'Account Management' section. Click on 'Delete Account' and follow the confirmation steps. Please note that this action is irreversible and all your data will be permanently removed from our servers. Before deleting, make sure to download any important data you wish to keep. The deletion process may take up to 7 business days to complete.",
            shortAnswer: "To delete your account, go to your account settings and scroll down to the 'Account Management' section. Click on 'Delete Account' and follow the confirmation steps..."
        },
        {
            id: 2,
            question: "How to add badges in my account?",
            answer: "Badges are earned through various activities on the platform. You can earn badges by completing your profile, making your first post, engaging with the community, reaching certain milestones, and participating in special events. Some badges are automatically awarded when you meet specific criteria, while others may require manual verification. To view your current badges and see available ones to earn, visit the 'Achievements' section in your profile settings.",
            shortAnswer: "Badges are earned through various activities on the platform. You can earn badges by completing your profile, making your first post, engaging with the community..."
        },
        {
            id: 3,
            question: "How do I change my account to a creator account?",
            answer: "To upgrade to a creator account, navigate to your account settings and look for the 'Account Type' section. Click on 'Upgrade to Creator' and complete the verification process. You'll need to provide additional information such as your content creation experience, social media links, and agree to creator terms and conditions. Creator accounts unlock additional features like advanced analytics, monetization options, exclusive creator tools, and priority support. The approval process typically takes 2-3 business days.",
            shortAnswer: "To upgrade to a creator account, navigate to your account settings and look for the 'Account Type' section. Click on 'Upgrade to Creator' and complete the verification process..."
        },
        {
            id: 4,
            question: "How can I recover my forgotten password?",
            answer: "To recover your forgotten password, go to the login page and click on 'Forgot Password' link. Enter your registered email address and we'll send you a password reset link. Check your email inbox and spam folder for the reset email. Click on the reset link and follow the instructions to create a new password. Make sure your new password is strong and unique. If you don't receive the email within 10 minutes, try requesting another reset or contact our support team for assistance.",
            shortAnswer: "To recover your forgotten password, go to the login page and click on 'Forgot Password' link. Enter your registered email address and we'll send you a password reset link..."
        },
        {
            id: 5,
            question: "How do I update my profile information?",
            answer: "To update your profile information, navigate to your account settings by clicking on your profile picture and selecting 'Settings'. In the profile section, you can edit your display name, bio, profile picture, cover photo, and contact information. Make sure to save your changes after editing. Some changes may require email verification for security purposes. You can also manage your privacy settings to control who can see your profile information and posts.",
            shortAnswer: "To update your profile information, navigate to your account settings by clicking on your profile picture and selecting 'Settings'. In the profile section, you can edit your display name, bio, profile picture..."
        },
        {
            id: 6,
            question: "How do I manage my notification preferences?",
            answer: "To manage your notification preferences, go to Settings and select 'Notifications'. Here you can customize which types of notifications you want to receive via email, push notifications, or in-app notifications. You can control notifications for new posts, comments, likes, follows, messages, and system updates. Toggle each notification type on or off according to your preferences. You can also set quiet hours during which you won't receive notifications, and choose the frequency of email digests.",
            shortAnswer: "To manage your notification preferences, go to Settings and select 'Notifications'. Here you can customize which types of notifications you want to receive via email, push notifications..."
        },
        {
            id: 7,
            question: "How can I report inappropriate content?",
            answer: "To report inappropriate content, click on the three dots menu next to the post or comment and select 'Report'. Choose the reason for reporting from the available options such as spam, harassment, inappropriate content, or copyright violation. Provide additional details if necessary to help our moderation team understand the issue. All reports are reviewed by our content moderation team within 24-48 hours. You can also block users to prevent them from interacting with your content.",
            shortAnswer: "To report inappropriate content, click on the three dots menu next to the post or comment and select 'Report'. Choose the reason for reporting from the available options..."
        },
        {
            id: 8,
            question: "How do I enable two-factor authentication?",
            answer: "To enable two-factor authentication (2FA), go to Account Settings and select 'Security'. Click on 'Enable Two-Factor Authentication' and choose your preferred method: SMS or authenticator app. If using SMS, enter your phone number and verify it with the code sent. If using an authenticator app, scan the QR code with apps like Google Authenticator or Authy. Once set up, you'll need to enter a verification code along with your password when logging in. Keep your backup codes in a safe place for account recovery.",
            shortAnswer: "To enable two-factor authentication (2FA), go to Account Settings and select 'Security'. Click on 'Enable Two-Factor Authentication' and choose your preferred method: SMS or authenticator app..."
        },
        {
            id: 9,
            question: "How can I download my data?",
            answer: "To download your data, go to Account Settings and select 'Privacy & Data'. Click on 'Download My Data' and choose what information you want to include in your download such as posts, comments, messages, and profile information. The data will be prepared in a downloadable format (usually ZIP file) and you'll receive an email notification when it's ready. The download link will be valid for 7 days. This feature helps you keep a backup of your data or transfer it to another platform if needed.",
            shortAnswer: "To download your data, go to Account Settings and select 'Privacy & Data'. Click on 'Download My Data' and choose what information you want to include in your download..."
        }
    ];

    const handleLoadMore = () => { setVisibleFaqs(faqData.length); };

    const toggleFaq = (id: number) => { setExpandedFaq(expandedFaq === id ? null : id); };

    const toggleReadMore = (id: number) => { setShowFullAnswer(prev => ({ ...prev, [id]: !prev[id] })); };

    const [fetchFaqs, { data: searchData }] = useLazyQuery(FaqSearchData, { client: cmsClient, });

    const debouncedSearch = useCallback((value: string) => { fetchFaqs({ variables: { page: 1, searchTerm: value }, }); }, [fetchFaqs]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
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

    const initialMenus: MenuItem[] = [];
    const initialBottomMenus: MenuItem[] = [];
    const searchDataProp: Blog[] = [];
    const initialSocials: Array<{
        id: string;
        attributes: {
            title: string;
            link: string;
            __typename?: string;
        };
        __typename?: string;
    }> = [];
    function handleQuerySubmit(text: string): void {
        // For now, just show an alert or log the query.
        // In a real app, you would send this to your backend or support system.
        if (text.trim()) {
            alert('Your query has been submitted: ' + text);
        } else {
            alert('Please enter your query before submitting.');
        }
    }

    return (
        <>
            <PageBase
                title="Help & Support"
                description="Get help and support for your questions"
                // faqTypes={faqTypes}
                // pageData={pageData}
                // faqs={faqs}
                initialMenus={initialMenus}
                initialBottomMenus={initialBottomMenus}
                searchData={searchDataProp}
                initialSocials={initialSocials}
            >
                <div className="container">

                    <div className="lg:flex justify-between border-b pb-3 lg:mb-10 mb-5">
                        <div className='flex items-center gap-5 lg:mb-0 mb-5'>
                            <div>
                                <div className="flex gap-2 items-center">

                                    <Heading priority={3}>
                                        <span className="font-bold text-[#AEAEAE] lg:text-[48px] text-xl">How can we help?</span>
                                    </Heading>
                                </div>
                                <Text size="md" customClass="text-primary">Let our health nerds be your solution today</Text>
                            </div>
                            <div className='w-[80px] block lg:hidden ml-auto' >
                                <CustomImage src={ImgSerachResult} width={80} height={160} alt="Account" />
                            </div>
                        </div>
                        <div>
                            <div className={`transition-all duration-300 ${searchFocused ? 'w-full lg:min-w-[800px]' : 'w-full lg:min-w-[400px]'}`}>
                                {/* Search functionality */}
                                <div
                                    className={`relative ${isMobile ? 'mt-2' : 'mt-4'}`}
                                    ref={searchBarRef}
                                >
                                    <div className="flex items-center  ">
                                        <svg className='left-3 absolute z-10' width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.4999 15.5L11.8808 11.8808M11.8808 11.8808C12.4998 11.2617 12.9909 10.5268 13.3259 9.71794C13.661 8.90909 13.8334 8.04216 13.8334 7.16666C13.8334 6.29115 13.661 5.42422 13.326 4.61537C12.9909 3.80651 12.4998 3.07156 11.8808 2.45249C11.2617 1.83342 10.5267 1.34234 9.71788 1.0073C8.90902 0.67226 8.0421 0.499817 7.16659 0.499817C6.29109 0.499817 5.42416 0.67226 4.61531 1.0073C3.80645 1.34234 3.0715 1.83342 2.45243 2.45249C1.20215 3.70276 0.499756 5.3985 0.499756 7.16666C0.499756 8.93481 1.20215 10.6305 2.45243 11.8808C3.7027 13.1311 5.39844 13.8335 7.16659 13.8335C8.93475 13.8335 10.6305 13.1311 11.8808 11.8808Z" stroke="#777676" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        <Input
                                            type="text"
                                            placeholder={selectedItem ? '' : "Search for your queries"}
                                            rounded
                                            help
                                            value={selectedItem || searchTerm}
                                            onChange={handleSearch}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => setSearchFocused(true)}
                                            customClass='pl-10 rounded-xl font-base'
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

                                    </div>

                                    {/* Search dropdown */}
                                    {(searchDropdown &&
                                        searchData &&
                                        (searchData as any).allFaqs.data.length > 0 && (
                                            <div className="rounded-lg bg-[#F7F7F7] p-2 shadow-lg">
                                                {((searchData as any).allFaqs.data as DataFaq[]).map((faq: DataFaq) => (
                                                    <div
                                                        key={faq.id}
                                                        className="ml-2 cursor-pointer py-1"
                                                        onClick={() => {
                                                            if (setTopic) {
                                                                setTopic(
                                                                    faq?.attributes?.faq_types?.data?.[0]?.attributes?.slug,
                                                                );
                                                            }
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

                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">

                        <div className='col-span-8'>
                            <div className="flex justify-between items-center mb-5">
                                <Heading priority={3}><span className="font-medium lg:text-5xl text-lg text-[#996699]">23 results found for “Password reset”</span></Heading>
                            </div>

                            <div className="faq-sec space-y-2">
                                {faqData.slice(0, visibleFaqs).map((faq) => (
                                    <div key={faq.id} className="">
                                        <div
                                            className="flex justify-between items-center py-4 cursor-pointer transition-colors border-b"
                                            onClick={() => toggleFaq(faq.id)}
                                        >
                                            <Text size="base" customClass="font-semibold flex-1 text-[#5C5C5C]">
                                                {faq.question}
                                            </Text>
                                            <div className="ml-4">
                                                <div className={`transform transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180' : 'rotate-0'}`}>
                                                    <IoChevronDown size={18} className="text-gray-500" />
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
                                                    <Text size="sm" customClass="text-gray-700 leading-relaxed">
                                                        {showFullAnswer[faq.id] ? faq.answer : faq.shortAnswer}
                                                    </Text>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleReadMore(faq.id);
                                                        }}
                                                        className="text-primary text-sm font-medium mt-2 transition-colors"
                                                    >
                                                        {showFullAnswer[faq.id] ? 'Read less' : 'Read more'}
                                                    </button>
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
                                            <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="1" y="0.5" width="59" height="59" rx="29.5" fill="white" />
                                                <rect x="1" y="0.5" width="59" height="59" rx="29.5" stroke="#696969" />
                                                <path d="M30.4999 20.2502C30.6989 20.2502 30.8896 20.3292 31.0303 20.4698C31.1709 20.6105 31.2499 20.8012 31.2499 21.0002L31.2499 37.1897L37.4697 30.9699C37.6111 30.8333 37.8006 30.7577 37.9972 30.7594C38.1939 30.7611 38.382 30.84 38.5211 30.979C38.6601 31.1181 38.739 31.3062 38.7407 31.5029C38.7424 31.6995 38.6668 31.889 38.5302 32.0304L31.0302 39.5304C30.8895 39.671 30.6988 39.75 30.4999 39.75C30.3011 39.75 30.1103 39.671 29.9697 39.5304L22.4697 32.0304C22.3331 31.889 22.2575 31.6995 22.2592 31.5029C22.2609 31.3062 22.3398 31.1181 22.4788 30.979C22.6179 30.84 22.806 30.7611 23.0026 30.7594C23.1993 30.7577 23.3887 30.8333 23.5302 30.9699L29.7499 37.1897L29.7499 21.0002C29.7499 20.8012 29.829 20.6105 29.9696 20.4698C30.1103 20.3292 30.301 20.2502 30.4999 20.2502Z" fill="#696969" />
                                            </svg>

                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='col-span-4 hidden lg:block'>
                            <div className='w-[380px] ' >
                                <CustomImage src={ImgSerachResult} width={380} height={380} alt="Result" />
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

        </>
    );
}
export default SearchResult;