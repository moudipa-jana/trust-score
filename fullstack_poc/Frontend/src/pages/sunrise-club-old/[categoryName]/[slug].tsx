/**
 * Displays the details of a single blog post for a specific category.
 * - Increments view count if the blog was not viewed today.
 * - Handles breadcrumbs for navigation, including the category and post title.
 */

import { get, isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog as BlogData } from '@/components/pages/Blog/ForumBingeWatch';
import SingleBlogBody, {
  BlogDetails,
} from '@/components/pages/Blog/SingleBlog/SingleBlogBody';
import { BLOG_VISIT_WAIT_TIME } from '@/lib/constants';
import { hasUserViewedBlogToday, removeDshFromString } from '@/lib/helpers';
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
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: BlogData[];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function Single({
  blogDetails,
  randomBlogs,
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
}: SingleProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAndUpdateBlogViews = async (blogData: BlogDetails) => {
      const isVisitedToday = hasUserViewedBlogToday(
        get(blogData, 'attributes.slug') ?? '',
      );
      if (!isVisitedToday) {
        const newViewCount =
          (parseInt(get(blogData, 'attributes.views', '0')) || 0) + 1;
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
    ...(router.query.categoryName && router.query.categoryName !== 'undefined'
      ? [
        {
          title: removeDshFromString(
            router.query.categoryName as string | undefined,
          ),
          path: `/sunrise-club/${router.query.categoryName}`,
        },
      ]
      : []),
    { title: blogDetails?.attributes?.Title, path: router.query.slug },
  ];
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.scrollY) {
        window.scrollTo(0, event.state.scrollY);
      } else {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      history.replaceState({ scrollY: window.scrollY }, '');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
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
    const param = context.params;

    let blogDetails, blogsList, randomBlogs;
    const options = {
      folds:
        'populate=firstFold.coverImg.image&populate=secondFold.coverImg.image&populate=thirdFold.coverImg.image&populate=fourthFold.coverImg.image&populate=fifthFold.coverImg.image&populate=sixthFold.coverImg.image&populate=seventhFold.coverImg.image&populate=eighthFold.coverImg.image&populate=ninthFold.coverImg.image&populate=tenthFold.coverImg.image&populate=eleventhFold.coverImg.image&populate=twelfthFold.coverImg.image&populate=thirteenthFold.coverImg.image&populate=fourteenthFold.coverImg.image&populate=fifteenthFold.coverImg.image&populate=coverImg&populate=sunrise_club_author.Image&populate=sunrise_doctor.Image',
      image: 'coverImg',
    };

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[slug][$eq]',
        param?.slug as string,
        options,
      );
      const content = data[0] ?? {};
      blogDetails = content;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data } = await fetchAPI(
        'sunrise-blogs?filters[blog_categories][slug][$eq]',
        param?.categoryName as string,
      );
      const content = data ?? [];

      blogsList = content;
    } catch (error) {
      captureSentryException(error);
    }

    try {
      const { data }: any = await BlogService();
      const content = data.sunriseBlogs?.data;
      randomBlogs = content;
    } catch (error) {
      captureSentryException(error);
    }

    return {
      props: {
        blogDetails: blogDetails || {},
        blogsList: blogsList || [],
        randomBlogs: randomBlogs || [],
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
