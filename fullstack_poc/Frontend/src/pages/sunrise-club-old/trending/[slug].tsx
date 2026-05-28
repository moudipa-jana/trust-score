/**
 * Displays a single blog post based on slug.
 * - Increases view count if not visited today.
 * - Shows breadcrumbs and related blogs.
 * - Data fetched server-side for freshness.
 */

import { get, isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import SingleBlogBody, {
  BlogDetails,
} from '@/components/pages/Blog/SingleBlog/SingleBlogBody';
import { BLOG_VISIT_WAIT_TIME } from '@/lib/constants';
import { hasUserViewedBlogToday } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { BlogService, UpdateBlogCount } from '@/service';
import fetchAPI from '@/service/api';
import type { MenuItem } from '@/types/menu';

interface SingleProps {
  blogDetails: BlogDetails;
  randomBlogs: Blog[];
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: ForumBingeWatchBlog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Single({
  blogDetails,
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: SingleProps) {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkAndUpdateBlogViews = async (blogData: BlogDetails) => {
      const isVisitedToday = hasUserViewedBlogToday(
        get(blogData, 'attributes.slug') ?? '',
      );
      if (!isVisitedToday) {
        const newViewCount =
          (parseInt(
            get(blogData as unknown as string, 'attributes.views', '0'),
          ) || 0) + 1;
        try {
          await UpdateBlogCount(blogData.id, newViewCount);
        } catch (error) {
          return;
        }
      }
    };

    if (!isEmpty(blogDetails)) {
      timer = setTimeout(() => {
        checkAndUpdateBlogViews(blogDetails);
      }, BLOG_VISIT_WAIT_TIME);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [router, blogDetails]);

  //**************** BreadCrumb **************//
  const crumbs = [
    { title: 'Sunrise Club', path: '/sunrise-club' },
    {
      title: 'Trending',
      path: '/sunrise-club/trending',
    },
    { title: blogDetails?.attributes?.Title, path: router.query.slug },
  ];
  //**************** BreadCrumb **************//

  return (
    <PageBase
      title={blogDetails?.attributes?.Title || 'Blog Post'}
      description={blogDetails?.attributes?.shortDes || 'Read this blog post'}
      sharingDescription="Hey, Checkout the post I found on Kofuku Social. Here is the link"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <SingleBlogBody
        crumbs={crumbs}
        blogDetails={blogDetails}
        randomBlogs={randomBlogs}
      />
    </PageBase>
  );
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const param = context.params || {};
    let blogDetails;
    let randomBlogs;
    const options = {
      folds:
        'populate=firstFold.coverImg.image&populate=secondFold.coverImg.image&populate=thirdFold.coverImg.image&populate=fourthFold.coverImg.image&populate=fifthFold.coverImg.image&populate=sixthFold.coverImg.image&populate=seventhFold.coverImg.image&populate=eighthFold.coverImg.image&populate=ninthFold.coverImg.image&populate=tenthFold.coverImg.image&populate=eleventhFold.coverImg.image&populate=twelfthFold.coverImg.image&populate=thirteenthFold.coverImg.image&populate=fourteenthFold.coverImg.image&populate=fifteenthFold.coverImg.image&populate=coverImg&populate=blog_authors.image',
      image: 'coverImg',
    };

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[slug][$eq]',
        param.slug as string,
        options,
      );
      blogDetails = data[0] ?? {};
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BlogService();
      randomBlogs = (data as any).sunriseBlogs?.data ?? [];
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        blogDetails: blogDetails || {},
        randomBlogs: randomBlogs || [],
      },
    };
  },
);
