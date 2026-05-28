import { useQuery } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import ForumAnnouncementCard from '@/components/pages/Forum/posts/ForumAnnouncementCard';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import {
  emitErrorNotification,
  formatGraphqlError,
  getThreadIdObject,
  pinSort,
} from '@/lib/helpers';
import {
  GET_POSTS_WITH_SAME_HASHTAG_IN_CAMPFIRE,
  MUTATION_CAMPFIRE_ACTIVITIES,
} from '@/service/graphql/Campfire';
import { FEED_ANNOUNCEMENTS_IN_CAMPFIRE_QUERY } from '@/service/graphql/Forum';
import {
  getIsCampfirePostsSearch,
  resetAnnouncementsThread,
  setIsCampfirePostsSearch,
  updateAnnouncementsArray,
} from '@/state/Slices/campfire';
import { getCampfireSearch } from '@/state/Slices/campfire';
import {
  fetchForumFeedSuccess,
  getForumFeedthread,
  resetCategoryThreads,
  toggleForumFeedLoader,
} from '@/state/Slices/necessary';
import { PostHashtag } from '@/types/campfire';
import { CampfireActivity } from '@/types/campfire';
import { PollType, QuestionType, QuizType } from '@/types/forum';

interface IActivityLog {
  campfireId: string;
  isAdmin?: boolean;
  campfireHashtagData?: string;
}

interface activityVariableType {
  campfireId: string;
  limit: number;
  offset: number;
  postId?: string;
  search: string;
  needPostOnTop?: boolean;
}

export default function ActivityLog({
  campfireId,
  isAdmin,
  campfireHashtagData,
}: IActivityLog) {
  const dispatch = useAppDispatch();
  const blockerIds = useUsersWhoBlockedMe();
  const iBlockedIds = useUsersIBlocked();
  const { query } = useRouter();
  const [hashtagsPosts, setHashtagsPosts] = useState<PostHashtag[]>([]);
  const [refetch, setRefetch] = useState(false);
  const campfirePosts = useAppSelector(getForumFeedthread);
  const isFirstTime = useRef(true);
  const { token, announcementsData } = useAppSelector((state) => ({
    token: state.auth.token,
    announcementsData: state.campfire.campfireAnnouncements,
  }));
  const [searchedCampfirePosts, setSearchedCampfirePosts] = useState([]);
  const isMobile = useIsMobile();

  const campfireSearch = useAppSelector(getCampfireSearch);
  const isCampfirePostsSearch = useAppSelector(getIsCampfirePostsSearch);

  const { loading: hashtagPostsLoading, data: hashtagPostsData } = useQuery(
    GET_POSTS_WITH_SAME_HASHTAG_IN_CAMPFIRE,
    {
      context: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      variables: {
        text: campfireHashtagData,
        campfireId,
      },
      fetchPolicy: 'no-cache',
      skip: token === '',
    },
  );

  // Handle hashtag posts completion
  useEffect(() => {
    if ((hashtagPostsData as any)?.post_hashtag) {
      setHashtagsPosts((hashtagPostsData as any).post_hashtag);
    }
  }, [hashtagPostsData]);

  const campfirePostData = isCampfirePostsSearch
    ? searchedCampfirePosts
    : campfireHashtagData
      ? hashtagsPosts
      : pinSort(campfirePosts ?? []);

  const isUserHiddenByBlock = (userId?: string) => {
    if (!userId) return false;
    return blockerIds.has(userId) || iBlockedIds.has(userId);
  };

  const getAuthorId = (post: any): string | undefined => {
    return (
      post?.poll?.user?.id ||
      post?.quiz?.user?.id ||
      post?.question?.user?.id ||
      post?.campfire_share?.user?.id ||
      post?.post_share?.user?.id
    );
  };

  const visibleCampfirePostData = Array.isArray(campfirePostData)
    ? campfirePostData.filter((p: any) => !isUserHiddenByBlock(getAuthorId(p)))
    : campfirePostData;

  const [loadMore, setLoadMore] = useState(true);

  const { mutationFunction: fetchActivityList, loading } = useAuthMutation(
    MUTATION_CAMPFIRE_ACTIVITIES,
    (response) => {
      const activities = get(
        response,
        'getCampfireActivities.activities.threads',
        [],
      ) as CampfireActivity[];
      const activitiesCount = get(
        response,
        'getCampfireActivities.activities.noPosts.aggregate.count',
        0,
      );
      let postArray;
      if (isCampfirePostsSearch) {
        const formatedArray = activities.map((obj: CampfireActivity) => {
          return getThreadIdObject(obj);
        });
        postArray = activities;
        setSearchedCampfirePosts(formatedArray as unknown as never[]);
      } else {
        postArray = [...campfirePosts, ...activities];
        const formatedArray = postArray.map((obj) => {
          return getThreadIdObject(obj);
        });
        dispatch(fetchForumFeedSuccess({ forumFeed: formatedArray }));
      }
      if (activitiesCount > postArray.length) {
        setLoadMore(true);
      } else {
        setLoadMore(false);
      }
    },
    (err) => {
      fetchForumFeedSuccess({ forumFeed: null });
      emitErrorNotification(formatGraphqlError(err));
    },
  );

  const { mutationFunction: refetchActivityList } = useAuthMutation(
    MUTATION_CAMPFIRE_ACTIVITIES,
    (response) => {
      const activities = get(
        response,
        'getCampfireActivities.activities.threads',
        [],
      ) as CampfireActivity[];
      const activitiesCount = get(
        response,
        'getCampfireActivities.activities.noPosts.aggregate.count',
        0,
      );
      const postArray = activities;
      const formatedArray = postArray.map((obj) => {
        return getThreadIdObject(obj);
      });
      dispatch(fetchForumFeedSuccess({ forumFeed: formatedArray }));

      if (activitiesCount > postArray.length) {
        setLoadMore(true);
      } else {
        setLoadMore(false);
      }
    },
    (err) => {
      fetchForumFeedSuccess({ forumFeed: null });
      emitErrorNotification(formatGraphqlError(err));
    },
  );

  const fetchActivities = useCallback(
    (isFirst: boolean, offset = 0, limit = 5, refetchData = false) => {
      const variables: activityVariableType = {
        campfireId,
        limit,
        offset,
        search: campfireSearch ? `%${campfireSearch}%` : '%%',
      };

      if (query.postId && isFirst) {
        if (Array.isArray(query.postID)) {
          variables.postId = query.postId[0];
          variables.needPostOnTop = true;
        } else {
          variables.postId = query.postId as string;
          variables.needPostOnTop = true;
        }
      }
      if (refetchData) {
        refetchActivityList({
          variables,
        });
      } else {
        fetchActivityList({
          variables,
        });
      }
    },
    [
      campfireId,
      campfireSearch,
      query.postId,
      query.postID,
      fetchActivityList,
      refetchActivityList,
    ],
  );

  const handleLoadMore = () => {
    fetchActivities(false, campfirePosts.length);
  };

  useEffect(() => {
    if (isFirstTime.current) {
      isFirstTime.current = false; // Mark as done for next time
      return; //  skip first run
    }

    // Run only on refetch changes AFTER first render
    fetchActivities(false, 0, campfirePosts.length, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  const { loading: announcementsLoading, data: announcementsQueryData } =
    useQuery(FEED_ANNOUNCEMENTS_IN_CAMPFIRE_QUERY, {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      variables: {
        campfireId,
      },
      skip: !token,
    });

  // Handle announcements completion
  useEffect(() => {
    if ((announcementsQueryData as any)?.announcements) {
      dispatch(
        updateAnnouncementsArray((announcementsQueryData as any).announcements),
      );
    }
  }, [announcementsQueryData, dispatch]);

  useEffect(() => {
    if (isCampfirePostsSearch && campfireSearch) {
      fetchActivities(true, 0, 5);
    }
    if (!campfireSearch && isCampfirePostsSearch)
      dispatch(setIsCampfirePostsSearch(false));
  }, [isCampfirePostsSearch, campfireSearch, dispatch, fetchActivities]);

  // Scroll to activity-posts when postId is in query
  useEffect(() => {
    if (query.postId && !loading) {
      // Add a small delay to ensure content is rendered
      const scrollToActivityPosts = () => {
        const activityPostsElement = document.getElementById('activity-posts');
        if (activityPostsElement) {
          const headerOffset = 100; // Adjust this value based on your header height
          const elementPosition =
            activityPostsElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          // Check if the element is actually visible and positioned
          if (elementPosition > 0 || activityPostsElement.children.length > 0) {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          } else {
            // If element is not ready, try again after a short delay
            setTimeout(scrollToActivityPosts, 100);
          }
        } else {
          // If element doesn't exist yet, try again after a short delay
          setTimeout(scrollToActivityPosts, 100);
        }
      };

      // Initial attempt with a small delay
      setTimeout(scrollToActivityPosts, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(resetCategoryThreads());
    dispatch(resetAnnouncementsThread());
    fetchActivities(true, 0, 5);
    return () => {
      dispatch(resetAnnouncementsThread());
      dispatch(resetCategoryThreads());
      dispatch(toggleForumFeedLoader(true));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  if (
    isEmpty(campfirePosts) &&
    isEmpty(hashtagsPosts) &&
    isEmpty(announcementsData) &&
    !loading &&
    !announcementsLoading
  ) {
    return (
      <div className="layout flex flex-col items-center justify-center gap-3 text-center">
        {/* <ProfileActivityHeader title="Activity Log" /> */}
        <ProfileActivityErrorComponent errorMessage="Oops, no post in the campfire." />
        <p className='text-sm font-bold text-gray-500'>
          To see updates, have to <br /> create post
        </p>
      </div>
    );
  }

  return (
    <div>
      {(isEmpty(campfirePostData) && loading) ||
      hashtagPostsLoading ||
      announcementsLoading ? (
        <div className="mt-10">
          <TabletLoader style={{ height: isMobile ? '100' : '120' }} />
        </div>
      ) : (
        <div className="-mt-5">
          <div className="">
            {!campfireHashtagData && (
              <ForumAnnouncementCard
                announcementsData={announcementsData}
                isActivityLog
              />
            )}
            <div id="activity-posts">
              {Array.isArray(visibleCampfirePostData) &&
                visibleCampfirePostData.map((post) => {
                  if (post.poll) {
                    return (
                      <div key={post.id}>
                        <ForumPollCard
                          postData={post.poll as PollType}
                          threadId={post.poll.campfire_threads?.[0]?.id}
                          pin={isAdmin ? true : false}
                          campfirePost
                          isPinned={(post as PostHashtag).is_pinned}
                          isDisable={
                            (post as PostHashtag)?.poll?.is_disabled_by_admin ||
                            (post as PostHashtag)?.poll?.user
                              ?.is_disabled_by_admin
                          }
                          setRefetch={setRefetch}
                        />
                      </div>
                    );
                  }
                  if (post.quiz) {
                    return (
                      <div key={post.quiz.id}>
                        <ForumQuizCard
                          postData={post.quiz as QuizType}
                          threadId={post.quiz.campfire_threads?.[0]?.id}
                          pin={isAdmin ? true : false}
                          campfirePost
                          isPinned={(post as PostHashtag).is_pinned}
                          isDisable={
                            post?.quiz?.is_disabled_by_admin ||
                            post?.quiz?.user?.is_disabled_by_admin
                          }
                          setRefetch={setRefetch}
                        />
                      </div>
                    );
                  }
                  if (post.question) {
                    return (
                      <div key={post.question.id}>
                        <ForumQuestionCard
                          postData={post.question as QuestionType}
                          threadId={post.question.campfire_threads?.[0]?.id}
                          pin={isAdmin ? true : false}
                          campfirePost
                          isPinned={(post as PostHashtag).is_pinned}
                          isDisable={
                            post?.question?.is_disabled_by_admin ||
                            post?.question?.user?.is_disabled_by_admin
                          }
                          setRefetch={setRefetch}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        </div>
      )}
      {!campfireHashtagData &&
        !isEmpty(campfirePosts) &&
        !hashtagPostsLoading &&
        loadMore && (
          <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
            <LoadMore onClick={handleLoadMore}>
              {loading ? 'Loading activities...' : 'Load More Activities'}
            </LoadMore>
          </div>
        )}
    </div>
  );
}
