/**
 * Displays a single "Good Read" blog post based on slug.
 * - Increases view count if not visited today.
 * - Shows breadcrumbs and related blogs.
 * - Data fetched server-side for freshness.
 */

import { get, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import PageBase from '@/components/layout/PageBase';
import SingleBlogBody, {
  BlogDetails,
} from '@/components/pages/Blog/SingleBlog/SingleBlogBody';
import { BLOG_VISIT_WAIT_TIME } from '@/lib/constants';
import { hasUserViewedBlogToday } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { BlogService, UpdateBlogCount } from '@/service';
import fetchAPI from '@/service/api';

interface SingleProps {
  blogDetails: BlogDetails;
  randomBlogs: Blog[];
}

interface ServerSideContext {
  params: {
    slug?: string;
    categoryName?: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function Single({ blogDetails, randomBlogs }: SingleProps) {
  const router = useRouter();

  useEffect(() => {
    // Moved the function inside useEffect
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
  }, [blogDetails, router]); // Dependencies are now simpler

  //**************** BreadCrumb **************//
  const crumbs = [
    { title: 'Sunrise Club', path: '/sunrise-club' },
    {
      title: 'Good Read',
      path: '/sunrise-club/good-read',
    },
    { title: blogDetails?.attributes?.Title, path: router.query.slug },
  ];

  return (
    <PageBase>
      <SingleBlogBody
        crumbs={crumbs}
        blogDetails={blogDetails}
        randomBlogs={randomBlogs}
      />
    </PageBase>
  );
}

export async function getServerSideProps(context: ServerSideContext) {
  const param = context.params;

  let blogDetails, blogsList, randomBlogs;
  const options = {
    folds:
      'populate=firstFold.coverImg.image&populate=secondFold.coverImg.image&populate=thirdFold.coverImg.image&populate=fourthFold.coverImg.image&populate=fifthFold.coverImg.image&populate=sixthFold.coverImg.image&populate=seventhFold.coverImg.image&populate=eighthFold.coverImg.image&populate=ninthFold.coverImg.image&populate=tenthFold.coverImg.image&populate=eleventhFold.coverImg.image&populate=twelfthFold.coverImg.image&populate=thirteenthFold.coverImg.image&populate=fourteenthFold.coverImg.image&populate=fifteenthFold.coverImg.image&populate=coverImg&populate=blog_authors.image',
    image: 'coverImg',
  };

  try {
    const { data } = await fetchAPI(
      'sunrise-blogs?filters[slug][$eq]',
      param.slug,
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
      param.categoryName,
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
    },
  };
}
