import { NetworkStatus } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { get, lowerCase } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import CampfireCard from '@/components/pages/Forum/posts/CampfireCard';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import Dropdown, { DropdownOptionType } from '@/components/Utility/Dropdown';
import ForumCard from '@/components/Utility/ForumCard';
import LoadMore from '@/components/Utility/LoadMore';
import OverlayUndo from '@/components/Utility/OverlayUndo';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import Heading from '@/elements/Heading';
import Input from '@/elements/Input';

import { UnhidePost } from '@/actions/forum';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId } from '@/state/Slices/auth';
import { getBlogs, getVideoBlogs } from '@/service';
import cmsClient from '@/service/cmsClient';

import { campfireShare } from '@/types/campfire';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import {
  CommentType,
  PollType,
  PostShare,
  QuestionType,
  QuizType,
} from '@/types/forum';

import BlogsBookmark, { Blog } from './BlogsBookmark';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface ProfileBookmarkProps {
  footerDisable?: boolean;
  error: Error | null;
  refetch: (params: {
    sort: {
      createdAt: string;
    };
    limit: number;
    offset: number;
  }) => void;
  networkStatus: NetworkStatus;
  loadMoreStatus: boolean;
  setIsSortApplied: React.Dispatch<React.SetStateAction<boolean>>;
  notOverlay?: boolean;
}

export interface BookmarkPost {
  id: string;
  type: 'question' | 'poll' | 'quiz' | 'postShare' | 'campfireShare' | 'comment';
  question?: QuestionType;
  poll?: PollType;
  quiz?: QuizType;
  postShare?: PostShare;
  campfireShare?: campfireShare;
  comment?: CommentType;
  campfirePostShare?: {
    is_disabled_by_admin: boolean;
    user: { is_disabled_by_admin: boolean };
  };
  campfire_thread_share?: {
    is_disabled_by_admin: boolean;
    user: { is_disabled_by_admin: boolean };
  };
}

interface FilterOption {
  name: string;
}

interface BlogData {
  data: Array<{
    id: string;
    attributes: {
      title: string;
      // Add other blog attributes as needed
    };
  }>;
}

function headerJSX() {
  return (
    <Heading priority="2" font="font-normal">
      Bookmarked <span className="font-semibold">&gt; Post</span>
    </Heading>
  );
}

const filterOptions: FilterOption[] = [
  { name: 'Posts' },
  { name: 'Comments' },
  { name: 'Blogs' },
  { name: 'Videos' },
];

function ProfileBookmark({
  footerDisable,
  error,
  refetch,
  networkStatus,
  loadMoreStatus,
  setIsSortApplied,
  notOverlay,
}: ProfileBookmarkProps) {
  const options: DropdownOptionType[] = [
    { value: '1', label: 'All' },
    { value: '2', label: 'Recent' },
  ];
  const [selectVal, setSelectVal] = useState<DropdownOptionType>(options[0]);
  const [sort, setSort] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);

  const [selectedOption, setSelectedOption] = useState<string>(() => {
    try {
      return (typeof window !== 'undefined' && window.sessionStorage.getItem('profile:bookmark:selectedOption')) || 'Posts';
    } catch (err) {
      return 'Posts';
    }
  });
  const [bookmarkBlogsList, setBookmarkBlogsList] = useState<any[] | null>(null);
  const [bookmarkVideosList, setBookmarkVideosList] = useState<any[] | null>(null);

  const [getBookmarkVideoBlogs, { data: videoBlogData, error: videoBlogError, loading: videoBlogLoading }] = useLazyQuery(getVideoBlogs, {
    fetchPolicy: 'network-only',
    client: cmsClient,
  });

  const [getBookmarkBlogs, { data: blogData, error: blogError, loading: blogLoading }] = useLazyQuery(getBlogs, {
    fetchPolicy: 'network-only',
    client: cmsClient,
  });

  // Prefetch both blog & video bookmark lists so switching tabs always has data
  useEffect(() => {
    if (!userId) return;
    try {
      getBookmarkVideoBlogs({ variables: { userId: userId, page: 0, pageSize: 10, state: true } });
      getBookmarkBlogs({ variables: { userId: userId, page: 0, pageSize: 10 } });
    } catch (err) {
      console.error('Error fetching CMS bookmarks', err);
    }
  }, [userId, getBookmarkVideoBlogs, getBookmarkBlogs]);

  // Refresh blogs/videos when CMS bookmarks change elsewhere in the app
  useEffect(() => {
    const handler = (ev: any) => {
      const detail = ev?.detail || {};
      // If user is viewing Videos tab, refresh video bookmarks
      if (lowerCase(selectedOption) === 'videos') {
        getBookmarkVideoBlogs({
          variables: { userId: userId, page: 0, pageSize: 10, state: true },
        });
      }
      // If viewing Blogs tab, refresh blog bookmarks
      if (lowerCase(selectedOption) === 'blogs') {
        getBookmarkBlogs({
          variables: { userId: userId, page: 0, pageSize: 10 },
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cms:bookmark:changed', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cms:bookmark:changed', handler as EventListener);
      }
    };
  }, [selectedOption, userId, getBookmarkVideoBlogs, getBookmarkBlogs]);

  // Handle video blog data and errors
  useEffect(() => {
    if (videoBlogData) {
      const newData = (videoBlogData as any)?.bookMarks?.data ?? [];
      console.debug('ProfileBookmark.videoBlogData effect', { newDataLength: newData.length, newData });
      setBookmarkVideosList(newData);
    }
  }, [videoBlogData]);

  useEffect(() => {
    if (videoBlogError) {
      emitErrorNotification(formatGraphqlError(videoBlogError));
    }
  }, [videoBlogError]);

  // Handle blog data and errors
  useEffect(() => {
    if (blogData) {
      const newData = (blogData as any)?.bookMarks?.data ?? [];
      console.debug('ProfileBookmark.blogData effect', { newDataLength: newData.length, newData });
      setBookmarkBlogsList(newData);
    }
  }, [blogData]);

  // Restore selected option on mount: if it's Videos, ensure we fetch video bookmarks immediately
  useEffect(() => {
    if (lowerCase(selectedOption) === 'videos' && (!bookmarkVideosList || !bookmarkVideosList.length)) {
      getBookmarkVideoBlogs({ variables: { userId: userId, page: 0, pageSize: 10, state: true } });
    }
    if (lowerCase(selectedOption) === 'blogs' && (!bookmarkBlogsList || !bookmarkBlogsList.length)) {
      getBookmarkBlogs({ variables: { userId: userId, page: 0, pageSize: 10 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (blogError) {
      emitErrorNotification(formatGraphqlError(blogError));
    }
  }, [blogError]);

  const handleRadioChange = (optionName: string) => {
    console.debug('ProfileBookmark.handleRadioChange()', { optionName, selectedOption });
    setSelectedOption(optionName);
    try {
      if (typeof window !== 'undefined')
        window.sessionStorage.setItem('profile:bookmark:selectedOption', optionName);
    } catch (err) {
      /* no-op */
    }

    if (lowerCase(optionName) === 'videos') {
      console.debug('ProfileBookmark: fetching video bookmarks', { userId });
      getBookmarkVideoBlogs({
        variables: {
          userId: userId,
          page: 0,
          pageSize: 10,
          state: true,
        },
      });
    }

    if (lowerCase(optionName) === 'blogs') {
      console.debug('ProfileBookmark: fetching blog bookmarks', { userId });
      getBookmarkBlogs({
        variables: {
          userId: userId,
          page: 0,
          pageSize: 10,
        },
      });
    }
  };

  const bookmarkData = useAppSelector((state) => state.profile.bookmarkPosts);
  const bookmarkPostsCount = useAppSelector((state) => state.profile.bookmarkPostsCount);

  const handleChange = (val: DropdownOptionType | DropdownOptionType[]) => {
    setSelectVal(val as DropdownOptionType);
    if ((val as DropdownOptionType)?.value === '6') {
      setSort(!sort);
    }
    setIsSortApplied(true);
    refetch({
      sort: {
        createdAt: `${(val as DropdownOptionType)?.value === '2' ? 'desc' : 'asc'
          }_nulls_last`,
      },
      limit: 3,
      offset: 0,
    });
  };

  const handleLoadMore = useCallback(
    (limit = 3) => {
      refetch({
        sort: {
          createdAt: selectVal
            ? `${selectVal?.value === '2' ? 'desc' : 'asc'}_nulls_last`
            : 'desc_nulls_last',
        },
        limit,
        offset: bookmarkData?.length,
      });
    },
    [refetch, selectVal, bookmarkData?.length],
  );

  if (networkStatus === NetworkStatus.loading)
    return (
      <>
        {headerJSX()}
        <div>Loading...</div>
      </>
    );
  if (error)
    return (
      <>
        {headerJSX()}
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            {`To see updates, have to bookmark ${selectedOption.toLowerCase()}`}
          </p>
        </div>
      </>
    );

  const handleOverlayClick = async (
    postId: string,
    commentId: string,
    parentId: string,
  ) => {
    dispatch(
      UnhidePost(userId, postId, CardTypeEnum.comment, commentId, parentId),
    );
  };

  return (
    <div className="md:sm-container">
      <div className="justify-between xl:flex">
        {!sort && (
          <div className="relative  w-[230px] max-w-[230px] cursor-pointer">
            <Dropdown
              options={options}
              isLabel
              onChange={(val) => handleChange(val)}
              color="border-primary"
              rounded
              defaultOption={selectVal}
            />
          </div>
        )}
        <div className="flex gap-5 pt-4 text-black-300 xl:pt-0">
          {filterOptions.map((option) => (
            <div
              className="flex cursor-default items-center"
              key={option.name}
              onClick={() => handleRadioChange(option.name)}
            >
              <div className="mt-1">
                <Input
                  type="radio"
                  checked={option.name === selectedOption}
                  className="h-5 w-5 checked:bg-primary"
                />
              </div>
              <div className="ml-3">{option.name}</div>
            </div>
          ))}
        </div>
      </div>
      {(selectedOption == 'Posts' || selectedOption === 'Comments') && (
        <>
          <div className="my-2 pt-4">
            <Heading priority={selectVal ? '4' : '3'}>
              {selectVal
                ? `${(selectVal as DropdownOptionType).label} Bookmarked ${selectedOption}`
                : `Bookmarked > ${selectedOption}`}
            </Heading>
          </div>
          <div className="mt-2 gap-4 rounded-md">
            <div className="relative flex flex-col gap-4">
              <div className="relative">
                {Array.isArray(bookmarkData) &&
                  bookmarkData.filter((post: BookmarkPost) => {
                    const postType = post?.type;
                    if (selectedOption === 'Posts') {
                      return postType !== 'comment';
                    }
                    if (selectedOption === 'Comments') {
                      return postType === 'comment';
                    }
                    return true;
                  }).length ? (
                  bookmarkData
                    .filter((post: BookmarkPost) => {
                      const postType = post?.type;
                      if (selectedOption === 'Posts') {
                        return postType !== 'comment';
                      }
                      if (selectedOption === 'Comments') {
                        return postType === 'comment';
                      }
                      return true;
                    })
                    .map((post: BookmarkPost) => {
                      const postType = post?.type;
                      const postData = post?.[postType] as
                        | PollType
                        | QuestionType
                        | QuizType
                        | CommentType
                        | campfireShare
                        | PostShare;
                      if (post?.question) {
                        return (
                          <ForumQuestionCard
                            key={post?.id}
                            postData={postData as QuestionType}
                            footerDisable={footerDisable}
                            clickableCard={
                              !post?.question?.is_disabled_by_admin &&
                              !post?.question?.user?.is_disabled_by_admin
                            }
                            isDisable={
                              post?.question?.is_disabled_by_admin ||
                              post?.question?.user?.is_disabled_by_admin
                            }
                          />
                        );
                      }
                      if (post?.poll) {
                        return (
                          <ForumPollCard
                            key={post?.id}
                            postData={postData as PollType}
                            footerDisable={footerDisable}
                            clickableCard={
                              !post?.poll?.is_disabled_by_admin &&
                              !post?.poll?.user?.is_disabled_by_admin
                            }
                            isDisable={
                              post?.poll?.is_disabled_by_admin ||
                              post?.poll?.user?.is_disabled_by_admin
                            }
                          />
                        );
                      }
                      if (post?.quiz) {
                        return (
                          <ForumQuizCard
                            key={post?.id}
                            postData={postData as QuizType}
                            footerDisable={footerDisable}
                            clickableCard={
                              !post?.quiz?.is_disabled_by_admin &&
                              !post?.quiz?.user?.is_disabled_by_admin
                            }
                            isDisable={
                              post?.quiz?.is_disabled_by_admin ||
                              post?.quiz?.user?.is_disabled_by_admin
                            }
                          />
                        );
                      }
                      if (post?.campfireShare) {
                        return (
                          <CampfireCard
                            key={post?.id}
                            postData={postData as campfireShare}
                            footerDisable={footerDisable}
                            isCampfireShare={
                              !!(
                                post?.campfirePostShare ||
                                post?.campfire_thread_share
                              )
                            }
                            isDisable={
                              post?.campfirePostShare?.is_disabled_by_admin ||
                              post?.campfirePostShare?.user
                                ?.is_disabled_by_admin ||
                              post?.campfire_thread_share?.is_disabled_by_admin ||
                              post?.campfire_thread_share?.user
                                ?.is_disabled_by_admin
                            }
                          />
                        );
                      }
                      if (post?.postShare) {
                        const postShareInnerType = post?.postShare?.type;
                        return (
                          <SharedPostCard
                            noPadd
                            key={post?.id}
                            postData={postData as PostShare}
                            footerDisable={footerDisable}
                            clickableCard={
                              !post?.postShare?.is_disabled_by_admin &&
                              !post?.postShare?.user?.is_disabled_by_admin &&
                              !post?.postShare?.[
                                postShareInnerType as
                                | PostTypeEnum.question
                                | PostTypeEnum.poll
                                | PostTypeEnum.quiz
                              ]?.is_disabled_by_admin &&
                              !post?.postShare?.[
                                postShareInnerType as
                                | PostTypeEnum.question
                                | PostTypeEnum.poll
                                | PostTypeEnum.quiz
                              ]?.user?.is_disabled_by_admin
                            }
                            isDisable={
                              post?.postShare?.is_disabled_by_admin ||
                              post?.postShare?.user?.is_disabled_by_admin ||
                              post?.postShare?.[
                                postShareInnerType as
                                | PostTypeEnum.question
                                | PostTypeEnum.poll
                                | PostTypeEnum.quiz
                              ]?.is_disabled_by_admin ||
                              post?.postShare?.[
                                postShareInnerType as
                                | PostTypeEnum.question
                                | PostTypeEnum.poll
                                | PostTypeEnum.quiz
                              ]?.user?.is_disabled_by_admin
                            }
                          />
                        );
                      }

                      if (post?.comment !== null) {
                        const postCommentData = post?.comment;
                        const postId =
                          postCommentData?.questionId ||
                          postCommentData?.quizId ||
                          postCommentData?.pollId ||
                          postCommentData?.postShareId ||
                          postCommentData?.campfireShareId ||
                          postCommentData?.campfire_post_share_id ||
                          (postCommentData?.parent
                            ? postCommentData?.parent?.questionId ||
                            postCommentData?.parent?.quizId ||
                            postCommentData?.parent?.pollId ||
                            postCommentData?.parent?.campfireShareId ||
                            postCommentData?.parent?.campfire_post_share_id ||
                            (postCommentData?.parent?.postShareId as string) ||
                            postCommentData?.parent?.parent?.questionId ||
                            postCommentData?.parent?.parent?.quizId ||
                            postCommentData?.parent?.parent?.pollId ||
                            postCommentData?.parent?.parent?.campfireShareId ||
                            postCommentData?.parent?.parent
                              ?.campfire_post_share_id ||
                            (postCommentData?.parent?.parent
                              ?.postShareId as string)
                            : postCommentData?.postId
                              ? postCommentData?.postId
                              : '');
                        return (
                          <div className=" relative" key={postCommentData?.id}>
                            {postCommentData?.isHidden && !notOverlay && (
                              <OverlayUndo
                                onClick={() =>
                                  handleOverlayClick(
                                    postId as string,
                                    postCommentData?.id,
                                    postCommentData?.parentId ||
                                    postCommentData?.id,
                                  )
                                }
                                message="This Comment has been hidden, You will not see this  Comment further"
                              />
                            )}
                            <div
                              className="child-thread relative mt-4 ml-12"
                              key={postCommentData?.id}
                            >
                              <div
                                className={`overlay-conatiner ${postCommentData?.isHidden && !notOverlay
                                  ? 'blur-sm'
                                  : ''
                                  }`}
                              >
                                <ForumCard
                                  color="bg-skyBlue-300"
                                  postId={postId as string}
                                  id={postCommentData?.id as string}
                                  parentCommentId={
                                    postCommentData?.parentId ||
                                    postCommentData?.id
                                  }
                                  user={postCommentData?.user}
                                  postType={PostTypeEnum.question}
                                  cardType={CardTypeEnum.comment}
                                  title={
                                    <ShrinkComments
                                      message={postCommentData?.message as string}
                                    />
                                  }
                                  createdAt={postCommentData?.createdAt as string}
                                  commentsCount={get(
                                    postCommentData,
                                    'repliesCount.aggregate.count',
                                    0,
                                  )}
                                  participantsCount={
                                    postCommentData?.noParticipants
                                  }
                                  showBookmark
                                  isBookmarked={postCommentData?.isBookmarked}
                                  isDisable={
                                    postCommentData?.is_disabled_by_admin ||
                                    postCommentData?.user?.is_disabled_by_admin
                                  }
                                  clickableCard={
                                    !postCommentData?.is_disabled_by_admin &&
                                    !postCommentData?.user?.is_disabled_by_admin
                                  }
                                  postReaction={postCommentData?.post_reactions}
                                  likesCount={postCommentData?.likes}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return <>
                          <div className="layout flex flex-col items-center justify-center gap-3 text-center">
                            <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                            <p className='text-sm font-bold text-gray-500'>
                              {`To see updates, have to bookmark ${selectedOption.toLowerCase()}`}
                            </p>
                          </div>
                        </>;
                    })
                ) : (
                  <div className="layout flex flex-col items-center justify-center gap-3 text-center">
                    <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                    <p className='text-sm font-bold text-gray-500'>
                      {`To see updates, have to bookmark ${selectedOption.toLowerCase()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {bookmarkPostsCount > bookmarkData?.length && loadMoreStatus && (
            <div className="ml-auto mr-auto mt-4 mb-4 flex items-center justify-center">
              <LoadMore
                onClick={() => {
                  handleLoadMore();
                }}
              >
                Load More Post
              </LoadMore>
            </div>
          )}
        </>
      )}
      <BlogsBookmark
        bookmarkLoading={
          (selectedOption === 'Blogs' && blogLoading) ||
          (selectedOption === 'Videos' && videoBlogLoading)
        }
        bookmarkBlogsList={(selectedOption === 'Videos' ? (bookmarkVideosList || []) : (bookmarkBlogsList || [])) as unknown as Blog[]}
        selectedOption={selectedOption}
      ></BlogsBookmark>
    </div>
  );
}

export default ProfileBookmark;