import { IncomingMessage } from 'http';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import { BlogSearch, FOOTER_DISCLAIMER } from '@/service';
import cmsClient from '@/service/cmsClient';

import { MenuItem } from '../types/menu';
import getStaticMenus from './getStaticMenus';

interface CommonData {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    link: string;
    icon: string;
  }>;
  searchData: Blog[];
  disclaimer: {
    data?: {
      attributes?: {
        title: string;
        description: string;
      };
    };
  };
}

type ContextType = GetStaticPropsContext | GetServerSidePropsContext;

export default function withCommonData(
  getPropsFunc?: GetStaticProps | GetServerSideProps,
) {
  return async (
    context: ContextType,
  ): Promise<
    GetStaticPropsResult<CommonData> | GetServerSidePropsResult<CommonData>
  > => {
    const { initialMenus, initialBottomMenus, initialSocials } =
      await getStaticMenus();

    const response = (await BlogSearch('', 8)) as any;
    const searchData = response?.data?.sunriseBlogs?.data || [];

    // Fetch disclaimer data
    const { data: disclaimerData } = await cmsClient.query({
      query: FOOTER_DISCLAIMER,
    });

    const commonProps = {
      initialMenus,
      initialBottomMenus,
      initialSocials,
      searchData,
      disclaimer: (disclaimerData as any)?.footerDisclaimer || {
        data: {
          attributes: {
            title: '',
            description: '',
          },
        },
      },
    };

    if (getPropsFunc) {
      const props = await getPropsFunc(
        context as GetStaticPropsContext &
          GetServerSidePropsContext & {
            req: IncomingMessage & {
              cookies: Partial<{ [key: string]: string }>;
            };
          },
      );

      if ('props' in props) {
        return {
          ...props,
          props: {
            ...props.props,
            ...commonProps,
          },
        };
      }
      return {
        props: commonProps,
      };
    }

    return {
      props: commonProps,
    };
  };
}
