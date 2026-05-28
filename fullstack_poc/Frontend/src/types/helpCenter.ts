import { StrapiImage } from '@/types/strapi';

export type FaqType = {
  id: string;
  attributes: {
    title: string;
    slug: string;
    Descrption: string;
    Icon: StrapiImage;
    all_faqs: {
      data: DataFaq[];
    };
  };
};

export type PageData = {
  attributes: {
    Title: string;
    Banner: StrapiImage;
    SubTitle: string;
    ForumTitle: string;
    ForumDescription: string;
    ForumBg: StrapiImage;
  };
};

export type FAQ = {
  id: string;
  attributes: {
    question: string;
    answer: string;
  };
};

export interface DataFaq {
  id: string;
  attributes: {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    question: string;
    answer: string;
    faq_types: {
      data: {
        attributes: {
          slug: string;
        };
      }[];
    };
  };
}
