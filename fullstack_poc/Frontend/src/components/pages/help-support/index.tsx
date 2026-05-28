import { useMutation, useQuery } from '@apollo/client/react';
import { isEmpty, toLower } from 'lodash';
import React, { useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import HeroSection from '@/components/pages/help-support/heroSection';
import PostYourQuery from '@/components/pages/help-support/postYourQuery';
import Accordion from '@/components/Utility/Accordion';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitNotification } from '@/lib/helpers';
import { CREATE_USER_QUERY, FaqData } from '@/service';
import cmsClient from '@/service/cmsClient';
import { DataFaq, FAQ, FaqType, PageData } from '@/types/helpCenter';
import type { MenuItem } from '@/types/menu';

type Help = {
  faqTypes: FaqType[];
  pageData: PageData;
  faqs: FAQ[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
};

const Help = ({
  faqTypes,
  pageData,
  faqs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: Help) => {
  const { email } = useAppSelector((state) => state.auth.profile) ?? {};
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const isMobile = useIsMobile();

  const [postQuery] = useMutation(CREATE_USER_QUERY, {
    client: cmsClient,
    onCompleted: () => {
      emitNotification('success', 'Query sent successfully!');
    },
    onError: () => {
      emitNotification('error', 'Failed to send query. Please try again.');
    },
  });

  const { loading, error, data } = useQuery(FaqData, {
    variables: {
      page: 1,
      type: topic ? topic : 'common',
    },
    client: cmsClient,
  });

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleQuerySubmit = (query: string) => {
    postQuery({
      variables: {
        query,
        email,
        publishedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <PageBase
      title="Help & Support"
      description="Get help and support for your questions"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div>
        <HeroSection
          setTopic={setTopic}
          title={pageData?.attributes?.Title}
          description={pageData?.attributes?.SubTitle}
          bgImage={pageData?.attributes?.Banner?.data?.attributes?.url}
        />
        {topic ? (
          <div className="sm-container topicScroll">
            <div className="mt-10">
              <div className="cursor-pointer" onClick={() => setTopic('')}>
                <Text
                  size="xl"
                  color="text-gray-1900"
                  font="semibold"
                >{`${topic} > FAQ`}</Text>
              </div>

              {loading ? (
                <div
                  className="m-5 flex items-center justify-center"
                  style={{ minHeight: 250 }}
                >
                  <TabletLoader
                    style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
                  />
                </div>
              ) : isEmpty((data as any)?.allFaqs.data) || error ? (
                <div className="py-10">
                  <NotFoundComponent errorMessage="Oops! We couldn't find any FAQ" />
                </div>
              ) : (
                <div>
                  {data &&
                    (data as any)?.allFaqs.data.map(
                      (faq: DataFaq, index: number) => {
                        return (
                          <div
                            className="mb-5 mt-4 rounded-md bg-skyBlue-300 p-4"
                            key={faq.id}
                          >
                            <div className=" rounded-md border-[1px] bg-white">
                              <Accordion
                                key={faq.id}
                                faq={faq}
                                answer={faq.attributes.answer}
                                question={faq.attributes.question}
                                index={index}
                                open={openFAQ === faq.id}
                                toggle={toggleFAQ}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sm-container topicScroll">
            <div className="mt-10">
              <Text size="sm" variant color="text-gray-1900">
                Get a clarity on
              </Text>
              <div className="mb-16 mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 xl:grid-cols-3">
                {faqTypes.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="relative h-[110px] w-[327px] cursor-pointer rounded-lg border border-primary"
                      onClick={() => setTopic(toLower(item?.attributes?.title))}
                    >
                      <div className="flex justify-between">
                        <div className="ml-4 w-[190px] flex-wrap py-4">
                          <Text size="md" color="text-blue-1150">
                            {item?.attributes?.title}
                          </Text>
                          <Text color="text-gray-1850" size="sm">
                            {item?.attributes?.Descrption}
                          </Text>
                        </div>
                        <div className="absolute bottom-2 right-0 h-[115px] w-[106px]">
                          <CustomImage
                            src={
                              item?.attributes?.Icon?.data?.attributes?.url ||
                              '/images/blg-fallback.png'
                            }
                            fill
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/blg-fallback.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {loading ? (
              <div
                className="m-5 flex items-center justify-center"
                style={{ minHeight: 250 }}
              >
                <TabletLoader
                  style={{ marginTop: 40, height: isMobile ? 140 : 200 }}
                />
              </div>
            ) : isEmpty(faqs) || error ? (
              <NotFoundComponent errorMessage="Oops! We couldn't find any FAQ" />
            ) : (
              <div>
                <Text size="sm" variant color="text-gray-1900">
                  FAQ
                </Text>
                {faqs?.map((faq: FAQ, index: number) => {
                  return (
                    <div
                      className="mb-5 mt-4 rounded-md bg-skyBlue-300 p-4"
                      key={faq.id}
                    >
                      <div className=" rounded-md border-[1px] bg-white">
                        <Accordion
                          key={faq?.id}
                          faq={faq}
                          answer={faq.attributes.answer}
                          question={faq.attributes.question}
                          index={index}
                          open={openFAQ === faq.id}
                          toggle={toggleFAQ}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <PostYourQuery
              title={pageData?.attributes?.ForumTitle}
              description={pageData?.attributes?.ForumDescription}
              onSubmit={handleQuerySubmit}
              image={pageData?.attributes?.ForumBg?.data?.attributes?.url}
            />
          </div>
        )}
      </div>
    </PageBase>
  );
};

export default Help;
