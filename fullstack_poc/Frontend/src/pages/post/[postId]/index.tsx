{
  /**
   * `PostComponent` fetches and displays a forum post based on the provided `postId`.
   * - The component fetches post data on mount using `getPostById` and manages loading and error states.
   * - It renders different post types (e.g., Question, Poll, Quiz, Shared Post) based on the `postType`.
   * - Includes logic for scrolling to a specific comment when triggered by URL query parameters.
   * - Handles server-side data fetching for initial post data.
   **/
}

import { isEmpty } from 'lodash';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getPostById } from '@/actions/forum';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CampfireCard from '@/components/pages/Forum/posts/CampfireCard';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import NotAvailableCard from '@/components/pages/Forum/posts/NotAvailableCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
// import ProfileSearch from '@/components/pages/Profile/ProfileSearch';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import withCommonData from '@/lib/withCommonData';
import { getUserId } from '@/state/Slices/auth';
import { resetOpenComment } from '@/state/Slices/comments';
import {
  fetchPostPageSuccess,
  resetCategoryThreads,
} from '@/state/Slices/necessary';
import {
  resetOpenSubReplies,
  updateMultipleOpenSubReplies,
} from '@/state/Slices/subReply';
import { campfirePostShare } from '@/types/campfire';
import { PostTypeEnum } from '@/types/enums';
import {
  CommentType,
  PollType,
  PostShare,
  QuestionType,
  QuizType,
  ThreadType,
} from '@/types/forum';
import type { MenuItem } from '@/types/menu';

interface PostComponentProps {
  postId: string;
  initialMenus: MenuItem[];
  post: ThreadType;
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
}

export default function PostComponent({
  postId,
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
  post,
}: PostComponentProps) {
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dispatch = useAppDispatch();
  const postToUse = useAppSelector((state) => state.necessary.threads);
  const router = useRouter();
  const userId = useAppSelector(getUserId);
  const [refetch, setRefetch] = useState(false);
  const fetchPost = useCallback(
    async (incomingPostId: string) => {
      setLoading(true);
      setHasError(false);
      try {
        const newPost = await getPostById(incomingPostId);
        const replyArr: string[] = [];
        if (newPost && !isEmpty(newPost)) {
          newPost[newPost.type]?.comments.forEach((cmt: CommentType) => {
            cmt.replies.forEach((reply) => replyArr.push(reply.id));
          });
          dispatch(updateMultipleOpenSubReplies(replyArr));
          dispatch(fetchPostPageSuccess(newPost));
        } else {
          // Redirect to 404 page if post data is empty
          router.push('/404');
          return;
        }
      } catch (error) {
        setHasError(true);
        dispatch(fetchPostPageSuccess([]));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router],
  );
  const { query, asPath } = router;
  const fragmentId = useMemo(() => asPath.split('#')[1], [asPath]);
  const isCommentClick = useMemo(
    () => query.isCommentClick === 'true',
    [query.isCommentClick],
  );

  const handleScroll = useCallback(() => {
    setTimeout(() => {
      const targetElement = document.querySelector(`#comment-${fragmentId}`);
      if (targetElement) {
        const yPosition =
          targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: yPosition - 95, behavior: 'smooth' });
      }
    }, 2000);
  }, [fragmentId]);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
    if (isCommentClick) {
      handleScroll();
    }
    return () => {
      dispatch(resetCategoryThreads());
      dispatch(resetOpenComment());
      dispatch(resetOpenSubReplies());
    };
  }, [postId, fetchPost, handleScroll, isCommentClick, dispatch, refetch]);

  function renderPost(
    incomingPostType: PostTypeEnum,
    incomingPostData: PollType | QuestionType | QuizType | PostShare,
  ) {
    if (incomingPostType === PostTypeEnum.question)
      return (
        <ForumQuestionCard
          postData={incomingPostData as QuestionType}
          isShowComment
          notOverlay
          isHidden={incomingPostData.isHidden}
          isArchived={incomingPostData.isArchived}
          setRefetch={setRefetch}
        />
      );
    if (incomingPostType === PostTypeEnum.poll)
      return (
        <ForumPollCard
          postData={incomingPostData as PollType}
          isShowComment
          notOverlay
          isHidden={incomingPostData.isHidden}
          isArchived={incomingPostData.isArchived}
          setRefetch={setRefetch}
        />
      );
    if (incomingPostType === PostTypeEnum.quiz)
      return (
        <ForumQuizCard
          postData={incomingPostData as QuizType}
          isShowComment
          notOverlay
          isHidden={incomingPostData.isHidden}
          isArchived={incomingPostData.isArchived}
          setRefetch={setRefetch}
        />
      );
    if (
      [PostTypeEnum.campfirePostShare].some(
        (postType) => incomingPostType === postType,
      )
    )
      return (
        <CampfireCard
          postData={incomingPostData as unknown as campfirePostShare}
          isShowComment
          setRefetch={setRefetch}
        />
      );
    if (
      [PostTypeEnum.postShare, PostTypeEnum.campfirePostShare].some(
        (postType) => incomingPostType === postType,
      )
    )
      return (
        <SharedPostCard
          postData={incomingPostData as PostShare}
          isShowComment
          notOverlay
          isHidden={incomingPostData.isHidden}
          isArchived={incomingPostData.isArchived}
          setRefetch={setRefetch}
        />
      );

    return null;
  }

  const postType = postToUse[0]?.type; // Shows whether is question, poll or quiz
  const postData =
    postType && (postToUse[0][postType] as PollType | QuestionType | QuizType);

  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [hasConfirmedSensitive, setHasConfirmedSensitive] = useState(false);

  useEffect(() => {
    // Helper to check if a title is sensitive
    const checkSensitive = (title?: string) => {
      if (!title) return false;
      const lowerTitle = title.toLowerCase();
      return lowerTitle.includes('hush talk') || lowerTitle.includes('she read');
    };

    let isSensitive = false;

    if (postData) {
      // Check standard categoryName
      if (checkSensitive((postData as any).categoryName)) {
        isSensitive = true;
      }

      // Check post_categories array
      if (!isSensitive && (postData as any).post_categories?.length > 0) {
        isSensitive = (postData as any).post_categories.some((pc: any) =>
          checkSensitive(pc.category?.title),
        );
      }

      // Check nested content (for shares)
      if (!isSensitive) {
        const nestedContent =
          (postData as any).question ||
          (postData as any).poll ||
          (postData as any).quiz;
        if (nestedContent) {
          isSensitive =
            checkSensitive(nestedContent.categoryName) ||
            nestedContent.post_categories?.some((pc: any) =>
              checkSensitive(pc.category?.title),
            );
        }
      }
    }

    if (isSensitive && !hasConfirmedSensitive) {
      setShowSensitiveModal(true);
    }
  }, [postData, hasConfirmedSensitive]);

  return (
    <PageBase
      title={postData?.title || 'Post'}
      description={postData?.description || 'View post details'}
      sharingDescription="Hey, Checkout the post I found on Kofuku Social. Here is the link"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <SensitiveContentModal
        open={showSensitiveModal}
        onClose={() => setShowSensitiveModal(false)}
        onDeny={() => router.push('/')}
        onConfirm={() => {
          setShowSensitiveModal(false);
          setHasConfirmedSensitive(true);
        }}
      />
      <div className="sm-container pb-20">
        {loading ? (
          <div className="mt-20">
            <TabletLoader style={{ height: 180 }} />
          </div>
        ) : (!loading &&
            (hasError || isEmpty(postToUse) || isEmpty(postData)) &&
            isEmpty(post)) ||
          (postToUse?.[0]?.userId !== userId &&
            (postToUse?.[0]?.isArchived || postToUse?.[0]?.isBlocked)) ? (
          <div className="mt-10">
            <NotAvailableCard />
          </div>
        ) : (
          renderPost(postType, postData)
        )}
      </div>
    </PageBase>
  );
}

export const getServerSideProps: GetServerSideProps = withCommonData(
  async (context: GetServerSidePropsContext) => {
    const postId = context.params?.postId as string;

    // Redirect to 404 if postId is null or undefined
    if (postId === 'null' || postId === 'undefined') {
      return {
        notFound: true,
        props: {},
      };
    }

    try {
      const post = await getPostById(postId);
      return {
        props: {
          postId,
          post,
        },
      };
    } catch (error) {
      return {
        props: {
          postId,
          post: null,
        },
      };
    }
  },
);
