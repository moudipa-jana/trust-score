import React, { useState } from 'react';
import Heading from '@/elements/Heading';
import Account_img from '@/../public/images/account.png';
import Text from '@/elements/Text';
import CustomImage from '@/components/Utility/CustomImage';
import Link from 'next/link';
import { IoChevronDown } from 'react-icons/io5';

import { shortWords } from '@/lib/helpers';

const AccountHelp = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showFullAnswer, setShowFullAnswer] = useState<{
    [key: number]: boolean;
  }>({});

  const faqData = [
    {
      id: 1,
      question: 'How to delete my account?',
      answer:
        "To delete your account, go to your account settings and scroll down to the 'Account Management' section. Click on 'Delete Account' and follow the confirmation steps. Please note that this action is irreversible and all your data will be permanently removed from our servers. Before deleting, make sure to download any important data you wish to keep. The deletion process may take up to 7 business days to complete.",
      shortAnswer:
        "To delete your account, go to your account settings and scroll down to the 'Account Management' section. Click on 'Delete Account' and follow the confirmation steps...",
    },
    {
      id: 2,
      question: 'How to add badges in my account?',
      answer:
        "Badges are earned through various activities on the platform. You can earn badges by completing your profile, making your first post, engaging with the community, reaching certain milestones, and participating in special events. Some badges are automatically awarded when you meet specific criteria, while others may require manual verification. To view your current badges and see available ones to earn, visit the 'Achievements' section in your profile settings.",
      shortAnswer:
        'Badges are earned through various activities on the platform. You can earn badges by completing your profile, making your first post, engaging with the community...',
    },
    {
      id: 3,
      question: 'How do I change my account to a creator account?',
      answer:
        "To upgrade to a creator account, navigate to your account settings and look for the 'Account Type' section. Click on 'Upgrade to Creator' and complete the verification process. You'll need to provide additional information such as your content creation experience, social media links, and agree to creator terms and conditions. Creator accounts unlock additional features like advanced analytics, monetization options, exclusive creator tools, and priority support. The approval process typically takes 2-3 business days.",
      shortAnswer:
        "To upgrade to a creator account, navigate to your account settings and look for the 'Account Type' section. Click on 'Upgrade to Creator' and complete the verification process...",
    },
  ];

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const toggleReadMore = (id: number) => {
    setShowFullAnswer((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <div className="container lg:mb-20 mb-10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-full lg:col-span-6 lg:pe-15">
            <div className="help-cat cat-account relative min-h-[260px] px-6 py-4">
              <div className="flex justify-between items-start relative z-1 lg:mt-5 mt-8">
                <div className="lg:w-[240px] w-full lg:min-h-[222px] min-h-[170px] flex flex-col gap-4 justify-between">
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
                      <span className="font-bold text-[#309EC1] lg:text-4xl text-xl">
                        Account
                      </span>
                    </Heading>
                  </div>
                  <Text size="md" customClass="text-[#4D4D4D]">
                    Resolve issues regarding your account
                  </Text>
                </div>
                <div className="w-[120px] mt-[-23px] mr-3">
                  <CustomImage
                    src={Account_img}
                    width={120}
                    height={150}
                    alt="Account"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-full lg:col-span-6 ">
            <div className="flex justify-between items-center mb-5">
              <Heading priority={3}>
                <span className="font-bold lg:text-2xl text-lg text-gray-1000">
                  Most asked questions
                </span>
              </Heading>
              <Link
                href="/help-support-new/all-faqs"
                className="text-gray-50 lg:text-lg text-md flex gap-4 items-center"
              >
                View all
                <svg
                  width="60"
                  height="60"
                  className="w-10 lg:w-15"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="59"
                    height="59"
                    rx="29.5"
                    fill="white"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width="59"
                    height="59"
                    rx="29.5"
                    stroke="#696969"
                  />
                  <path
                    d="M20.25 29.9996C20.25 29.8007 20.3291 29.6099 20.4697 29.4692C20.6104 29.3286 20.8011 29.2496 21 29.2496L37.1895 29.2496L30.9698 23.0298C30.8332 22.8884 30.7576 22.6989 30.7593 22.5023C30.761 22.3056 30.8399 22.1175 30.9789 21.9785C31.118 21.8394 31.3061 21.7605 31.5027 21.7588C31.6994 21.7571 31.8888 21.8327 32.0303 21.9693L39.5303 29.4693C39.6709 29.61 39.7499 29.8007 39.7499 29.9996C39.7499 30.1984 39.6709 30.3892 39.5303 30.5298L32.0303 38.0298C31.8888 38.1664 31.6994 38.242 31.5027 38.2403C31.3061 38.2386 31.118 38.1597 30.9789 38.0207C30.8399 37.8816 30.761 37.6935 30.7593 37.4969C30.7576 37.3002 30.8332 37.1108 30.9698 36.9693L37.1895 30.7496L21 30.7496C20.8011 30.7496 20.6104 30.6706 20.4697 30.5299C20.3291 30.3893 20.25 30.1985 20.25 29.9996Z"
                    fill="#696969"
                  />
                </svg>
              </Link>
            </div>

            <div className="faq-sec space-y-2">
              {faqData.map((faq) => (
                <div key={faq.id} className="">
                  <div
                    className="flex justify-between items-center py-4 cursor-pointer transition-colors border-b"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <Text
                      size="base"
                      customClass="font-semibold flex-1 text-[#5C5C5C]"
                    >
                      {faq.question}
                    </Text>
                    <div className="ml-4">
                      <div
                        className={`transform transition-transform duration-300 ${expandedFaq === faq.id ? 'rotate-180' : 'rotate-0'}`}
                      >
                        <IoChevronDown size={18} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedFaq === faq.id
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
                            ? faq.answer
                            : shortWords(faq.answer, 150)}
                          {faq.answer.length > 150 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReadMore(faq.id);
                              }}
                              className="text-primary text-sm font-medium transition-colors ml-1 inline hover:text-primary-600"
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default AccountHelp;
