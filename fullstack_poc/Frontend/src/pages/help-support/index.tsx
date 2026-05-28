import PageBase from "@/components/layout/PageBase";
import HeroSection from "./HeroSection";
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import type { MenuItem } from '@/types/menu';
import Heading from "@/elements/Heading";
import AccountHelp from "./Account/AccountHelp";
import PostYourQuery from "./postYourQuery";
import ImgFindAns from "@/../public/images/img-find-answer.png"
import captureSentryException from "@/lib/sentryException";
import withCommonData from "@/lib/withCommonData";
import { FaqsService, faqTypesService, helpSupportService } from "@/service";
import { FaqType } from "@/types/helpCenter";
import Router from 'next/router';
import { TrimTitleforSlug, emitNotification } from "@/lib/helpers";

interface HelpSupportProps {
  faqTypes: FaqType[];
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
  pageData: any;
}

const HelpSupportNew = ({ faqTypes, initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials, pageData }: HelpSupportProps) => {


  function handleQuerySubmit(text: string): void {
    // For now, just show an alert or log the query.
    // In a real app, you would send this to your backend or support system.
    if (text.trim()) {
      emitNotification('success', 'Your query has been submitted: ' + text);
    } else {
      emitNotification('error', 'Please enter your query before submitting.');
    }
  }

  const handleSetTopic = (e: any) => {
    const questionSlug = TrimTitleforSlug(e?.question);
    Router.push(`/help-support/all-faqs/${e?.faq_types?.data?.[0]?.attributes?.slug.toLowerCase()}?question=${questionSlug}`);
  }

  return (
    <>
      <PageBase
        title="Help & Support"
        description="Get help and support for your questions"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <div className="container">
          <HeroSection heroData={pageData} setTopic={(e) => handleSetTopic(e)} />
          <Heading priority={2} variant="mb-10">
            <span className="text-[#939393] font-medium lg:text-5xl text-xl mb-12 block">Get a clarity on</span>
          </Heading>
          <AccountHelp faqTypes={faqTypes} />
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
};


export default HelpSupportNew;

export const getServerSideProps = withCommonData(async () => {
  let faqTypes, pageData, faqs;
  try {
    const { data: helpPageData }: any = await helpSupportService();
    pageData = helpPageData?.helpCenter?.data?.attributes ?? {};

    const { data }: any = await faqTypesService();
    faqTypes = data?.faqTypes?.data ?? {};

    const { data: faqsData }: any = await FaqsService();
    faqs = faqsData?.faqs?.data ?? [];
  } catch (error) {
    captureSentryException(error);
  }
  return {
    props: {
      pageData: pageData || {},
      faqTypes: faqTypes || [],
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
      searchData: [],
    },
  };
});
