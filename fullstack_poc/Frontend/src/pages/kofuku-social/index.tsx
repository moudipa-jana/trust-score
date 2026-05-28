{
  /**
   * `KofukuSocial` component renders the homepage with trending categories and random blogs.
   * - Fetches trending categories and random blogs data from the API.
   * - Uses `getServerSideProps` to prefetch data before rendering the page.
   **/
}

import { get } from 'lodash';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { BlogService } from '@/service';
import ApiClient from '@/service/graphql/apiClient';
import { QUERY_TRENDING_CATEGORIES } from '@/service/graphql/Category';
import type { MenuItem } from '@/types/menu';
import { TopCategories } from '@/types/topCategories';
import Home from '@/pages';

interface IHome {
  topCategories: TopCategories[];
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
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

export default function KofukuSocial({
  topCategories,
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: IHome) {
  return (
    <Home
      topCategories={topCategories}
      randomBlogs={randomBlogs}
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
      disclaimer={disclaimer}
    />
  );
}

export const getServerSideProps = withCommonData(async () => {
  try {
    const response = await ApiClient.getClient().query({
      query: QUERY_TRENDING_CATEGORIES,
    });
    const categories = get(
      response,
      'data.categories_with_top_threads_view',
      [],
    );

    let randomBlogs;
    try {
      const { data }: any = await BlogService();
      const content = data.sunriseBlogs?.data;
      randomBlogs = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        topCategories: categories,
        randomBlogs: randomBlogs || [],
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
        disclaimer: {
          data: {
            attributes: {
              title: '',
              description: '',
            },
          },
        },
      },
    };
  } catch (error) {
    return {
      props: {
        topCategories: [],
        randomBlogs: [],
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
        disclaimer: {
          data: {
            attributes: {
              title: '',
              description: '',
            },
          },
        },
      },
    };
  }
});
