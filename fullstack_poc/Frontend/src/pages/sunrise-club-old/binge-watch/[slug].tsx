/**
 * Displays the details of a single blog post from the "Binge Watch" category.
 * - Checks if the blog was viewed today and increments the view count if not.
 * - Includes breadcrumbs for navigation.
 * - Loads related random blogs for user engagement.
 * - Data fetched server-side for freshness.
 */

import { get, isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import PageBase from '@/components/layout/PageBase';
import SingleBlogBody, {
  BlogDetails,
} from '@/components/pages/Blog/SingleBlog/SingleBlogBody';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Blog as ForumBingeWatchBlog } from '@/components/pages/Blog/ForumBingeWatch';
import { BLOG_VISIT_WAIT_TIME } from '@/lib/constants';
import { hasUserViewedBlogToday } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import withCommonData from '@/lib/withCommonData';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { UpdateBlogCount } from '@/service';
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

    let timer: NodeJS.Timeout;
    if (!isEmpty(blogDetails)) {
      timer = setTimeout(() => {
        checkAndUpdateBlogViews(blogDetails);
      }, BLOG_VISIT_WAIT_TIME);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [blogDetails, router]);

  //**************** BreadCrumb **************//
  const crumbs = [
    { title: 'Sunrise Club', path: '/sunrise-club' },
    {
      title: 'Binge Watch',
      path: '/sunrise-club/binge-watch',
    },
    { title: blogDetails?.attributes?.Title, path: router.query.slug },
  ];

  return (
    <PageBase
      title="Binge Watch"
      description="Binge Watch"
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
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        'binge-watch',
        options,
      );
      randomBlogs = data ?? [];
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
