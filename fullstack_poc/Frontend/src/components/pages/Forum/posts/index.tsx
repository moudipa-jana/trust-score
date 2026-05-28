import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import { TrustScoreContext } from '@/context/TrustScoreContext';
import { fetchBookmarks } from '@/actions/auth';
import { fetchMoreCategoryFeed } from '@/actions/forum';
import ForumBingeWatch, { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ForumBlogTrending from '@/components/pages/Blog/ForumBlogTrending';
import ForumGoodReads from '@/components/pages/Blog/ForumGoodReads';
import CampfireCard from '@/components/pages/Forum/posts/CampfireCard';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { selectGetToken } from '@/state/Slices/auth';
import { campfirePostShare, campfireShare } from '@/types/campfire';
import {
  PollType,
  PostShare,
  QuestionType,
  QuizType,
  ThreadType,
} from '@/types/forum';

type PostContent = PollType | QuestionType | QuizType;

function isPostContent(value: unknown): value is PostContent {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    value !== null &&
    'is_disabled_by_admin' in value
  );
}

interface WrapperProps {
  isNearLast: boolean;
  fetchMore: () => void;
  post: ThreadType;
  index?: number;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Props {
  categoryName: string;
  randomBlogs: Blog[];
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
  bingeWatchList?: any;
}

function Wrapper({
  post,
  isNearLast,
  fetchMore,
  index,
  setRefetch,
}: WrapperProps) {
  const postType = post?.type;
  const postData = post?.[postType] as
    | PollType
    | QuestionType
    | QuizType
    | campfireShare
    | campfirePostShare
    | PostShare;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef?.current) return undefined;

    const currentRef = cardRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (fetchMore && entry?.isIntersecting && isNearLast) {
        fetchMore();
        observer.unobserve(entry.target);
      }
    });

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isNearLast, fetchMore]);

  const renderComponent = (incomingPostType: keyof ThreadType) => {
    if (!incomingPostType) return null;

    const isQuestionDisabled =
      !!post?.question?.is_disabled_by_admin ||
      !!post?.question?.user?.is_disabled_by_admin;
    const isQuizDisabled =
      !!post?.quiz?.is_disabled_by_admin ||
      !!post?.quiz?.user?.is_disabled_by_admin;
    const isPollDisabled =
      !!post?.poll?.is_disabled_by_admin ||
      !!post?.poll?.user?.is_disabled_by_admin;

    const postShareType = post?.postShare?.type as keyof PostShare | undefined;

    const isPostShareDisabled =
      post?.postShare?.is_disabled_by_admin ||
      post?.postShare?.user?.is_disabled_by_admin ||
      (() => {
        const content = post?.postShare?.[postShareType as keyof PostShare];
        return (
          isPostContent(content) &&
          (content?.is_disabled_by_admin || content?.user?.is_disabled_by_admin)
        );
      })();

    const campfirePostShareType = post?.campfirePostShare?.question
      ? 'question'
      : post?.campfirePostShare?.quiz
        ? 'quiz'
        : post?.campfirePostShare?.poll
          ? 'poll'
          : null;

    const isCampfirePostShareDisabled =
      post?.campfirePostShare?.user?.is_disabled_by_admin ||
      (() => {
        const content =
          post?.campfirePostShare?.[
            campfirePostShareType as keyof campfirePostShare
          ];
        return (
          isPostContent(content) &&
          (content?.is_disabled_by_admin || content?.user?.is_disabled_by_admin)
        );
      })();

    const isCampfirePostDisabled =
      isQuestionDisabled || isQuizDisabled || isPollDisabled;

    switch (incomingPostType) {
      case 'question':
        return (
          <div
            ref={cardRef}
            key={post?.id}
            className="pt-3 pb-3 lg:pt-0 lg:pb-0"
          >
            <ForumQuestionCard
              index={index}
              postData={postData as QuestionType}
              isDisable={isQuestionDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      case 'quiz':
        return (
          <div ref={cardRef} key={post?.id}>
            <ForumQuizCard
              index={index}
              postData={postData as QuizType}
              isDisable={isQuizDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      case 'poll':
        return (
          <div ref={cardRef} key={post?.id}>
            <ForumPollCard
              index={index}
              postData={postData as PollType}
              isDisable={isPollDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      case 'campfireShare':
        return (
          <div ref={cardRef} key={post?.id}>
            <CampfireCard
              index={index}
              postData={postData as campfireShare}
              isCampfireShare
              isDisable={isCampfirePostDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      case 'campfirePostShare':
        return (
          <div ref={cardRef} key={post?.id}>
            <CampfireCard
              index={index}
              postData={postData as campfirePostShare}
              isDisable={isPostShareDisabled || isCampfirePostShareDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      case 'postShare':
        return (
          <div ref={cardRef} key={post?.id}>
            <SharedPostCard
              index={index}
              postData={postData as PostShare}
              isDisable={isPostShareDisabled}
              setRefetch={setRefetch}
              clickableCard={
                !post?.question?.is_disabled_by_admin &&
                !post?.question?.user?.is_disabled_by_admin
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  return <div ref={cardRef}>{renderComponent(postType)}</div>;
}

export default function Posts({
  categoryName,
  randomBlogs,
  setRefetch,
  bingeWatchList,
}: Props) {
  const dispatch = useAppDispatch();
  const rawThreads = useAppSelector((state) => state.necessary.threads);
  const bookmarkedPost = useAppSelector((state) => state.profile.bookmarkPosts);
  const [index, setIndex] = useState(0);

  // --- TRUST SERVICE POC: REAL TRUST SCORE FEED SORTING ---
  // Since we can't touch the main dev-be backend, we fetch the real ML trust scores
  // from our local POC Hasura, and then join them with the dev-be threads in the frontend!
  const [trustScoresMap, setTrustScoresMap] = useState<Record<string, number>>({});
  const [postRelevancyMap, setPostRelevancyMap] = useState<Record<string, number>>({});

  const fetchTrustScores = () => {
    fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'myadminsecretkey' // For POC local only
      },
      body: JSON.stringify({
        query: `
          query GetTrustData {
            trust_scores {
              author_id
              trust_score
            }
            trust_ledger(where: {signal: {_eq: "POST_CREATED"}}) {
              voter_id
              relevancy
            }
          }
        `
      })
    })
    .then(res => res.json())
    .then(data => {
      const scores = data?.data?.trust_scores || [];
      
      // Calculate average score per user across all categories for the global badge
      const userTotals: Record<string, { sum: number, count: number }> = {};
      scores.forEach((s: any) => {
        if (!userTotals[s.author_id]) {
          userTotals[s.author_id] = { sum: 0, count: 0 };
        }
        userTotals[s.author_id].sum += Number(s.trust_score);
        userTotals[s.author_id].count += 1;
      });
      
      const userMap: Record<string, number> = {};
      Object.keys(userTotals).forEach(author_id => {
        userMap[author_id] = userTotals[author_id].sum / userTotals[author_id].count;
      });
      setTrustScoresMap(userMap);
      
      const ledger = data?.data?.trust_ledger || [];
      const relMap: Record<string, number> = {};
      ledger.forEach((l: any) => {
        relMap[l.voter_id] = l.relevancy;
      });
      setPostRelevancyMap(relMap);
    })
    .catch(err => console.error("Failed to fetch trust data", err));
  };

  const hasFetchedScores = useRef(false);

  useEffect(() => {
    fetchTrustScores();
  }, []);

  // --- Initialize un-scored posts with Baseline Relevancy! ---
  useEffect(() => {
    if (!rawThreads || rawThreads.length === 0) return;
    
    // We only want to process posts if the trustScoresMap is already populated
    // Wait for the first fetch to finish before deciding what's un-scored
    if (Object.keys(trustScoresMap).length === 0 && !hasFetchedScores.current) {
       hasFetchedScores.current = true; 
       // Just a simple hack to avoid processing immediately before the first DB fetch
       return; 
    }

    const unscoredPosts = rawThreads.filter(t => t?.id && postRelevancyMap[t.id] === undefined);

    if (unscoredPosts.length > 0) {
      const postsPayload = unscoredPosts.map(t => {
        const getPostData = (post: ThreadType) => post?.[post.type as keyof ThreadType] as any;
        const data = getPostData(t);
        let postTitle = data?.title || "I suspect emotional abuse in a care home";
        let postDesc = data?.description || "";
        let postCategory = data?.categoryName || categoryName || "Contagion";
        return {
          post_id: t.id,
          author_id: data?.user?.id || "",
          category: postCategory,
          post_text: postTitle,
          post_description: postDesc
        };
      });

      // Send to ML server to calculate baseline relevancy!
      fetch('http://localhost:8001/process-post-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: postsPayload })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          fetchTrustScores(); // Re-pull data to re-sort the feed!
        }
      })
      .catch(err => console.error("Batch processing failed", err));
    }
  }, [rawThreads, trustScoresMap, categoryName]);

  const threads = React.useMemo(() => {
    if (!rawThreads) return [];
    
    // Sort array descending to make bucketing easier
    const getUserId = (thread: ThreadType) => (thread?.[thread.type as keyof ThreadType] as any)?.user?.id;
    
    // Filter out completely irrelevant posts (gibberish/spam) where Relevancy is very low
    const filteredThreads = rawThreads.filter(t => {
      // If we have a relevancy score from the ML engine, enforce a strict threshold
      if (t?.id && postRelevancyMap[t.id] !== undefined) {
          return postRelevancyMap[t.id] >= 0.45; // ML Engine returns ~0.3 for gibberish, so 0.45 is a safe cutoff
      }
      return true; // If it hasn't been scored yet, let it through temporarily
    });

    // Bypass the 60/20/20 Trust Engine filtering on category-specific feeds!
    // The user wants to see all content chronologically, regardless of trust badge.
    if (categoryName && categoryName !== "All" && categoryName !== "") {
      return filteredThreads;
    }
    
    const sorted = [...filteredThreads].sort((a, b) => {
      const uIdA = getUserId(a);
      const uIdB = getUserId(b);
      const scoreA = uIdA && trustScoresMap[uIdA] !== undefined ? trustScoresMap[uIdA] : 50.0;
      const scoreB = uIdB && trustScoresMap[uIdB] !== undefined ? trustScoresMap[uIdB] : 50.0;
      return scoreB - scoreA;
    });
    
    // INSIGHT #5: Feed Composition: 60% Trust, 20% New, 20% Shared/Campfire
    const topTrusted = [];
    const newVoices = [];
    const campfireShares = [];
    
    sorted.forEach(t => {
      const uId = getUserId(t);
      const score = uId && trustScoresMap[uId] !== undefined ? trustScoresMap[uId] : 50.0;
      if (t.type === 'campfireShare') {
        campfireShares.push(t);
      } else if (score > 50.0) {
        topTrusted.push(t);
      } else if (score >= 35.0) {
        newVoices.push(t); // Users who have dropped slightly below 50.0 remain here
      }
      // If score < 35.0 (Warning / Toxic), they are completely excluded from the feed!
    });
    
    // Weave them together in a 3:1:1 ratio (60% / 20% / 20%)
    const result = [];
    let iTop = 0, iNew = 0, iCamp = 0;
    
    while (iTop < topTrusted.length || iNew < newVoices.length || iCamp < campfireShares.length) {
      // 3 Top Trusted
      for (let i = 0; i < 3; i++) {
        if (iTop < topTrusted.length) result.push(topTrusted[iTop++]);
      }
      // 1 New Voice
      if (iNew < newVoices.length) result.push(newVoices[iNew++]);
      // 1 Campfire Share
      if (iCamp < campfireShares.length) result.push(campfireShares[iCamp++]);
    }
    
    return result;
  }, [rawThreads, trustScoresMap]);
  // ------------------------------------------------

  const token = useAppSelector(selectGetToken);

  useEffect(() => {
    if (index >= threads?.length) {
      const newIndex = index % threads?.length;
      setIndex(newIndex);
    }
  }, [index, threads?.length]);

  const handleFetchMore = useCallback(() => {
    dispatch(fetchMoreCategoryFeed(categoryName, threads?.length || 0));
    if (token) {
      dispatch(fetchBookmarks(token, bookmarkedPost?.length || 0));
    }
  }, [dispatch, categoryName, threads?.length, token, bookmarkedPost?.length]);

  if (isEmpty(threads)) {
    return (
      <div className="layout mt-10 flex flex-col items-center justify-center text-center text-black">
        <RiAlarmWarningFill
          size={60}
          className="drop-shadow-glow animate-flicker text-red-500"
        />
        <h2 className="mt-8 text-2xl lg:text-3xl">
          Oops! Looks like we couldn&apos;t find any post
        </h2>
      </div>
    );
  }
  return (
    <TrustScoreContext.Provider value={trustScoresMap}>
      <div>
        {threads?.map((post, idx) => {
          if ((idx + 1) % 6 === 0 && idx !== threads?.length - 1) {
            const cycle = (idx + 1) / 6;
            const message =
              cycle % 2 === 1 ? (
                <ForumBingeWatch bingeWatch={bingeWatchList} />
              ) : (
                <ForumBlogTrending trendingBlogs={randomBlogs} />
              );
            return (
              <React.Fragment key={post?.id}>
                <Wrapper
                  fetchMore={handleFetchMore}
                  post={post}
                  isNearLast={idx === threads?.length - 3}
                  index={idx}
                  setRefetch={setRefetch}
                />
                <div className="my-4 text-center text-gray-500">{message}</div>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={post?.id}>
              <Wrapper
                fetchMore={handleFetchMore}
                key={post?.id}
                post={post}
                isNearLast={idx === threads?.length - 3}
                index={idx}
                setRefetch={setRefetch}
              />
            </React.Fragment>
          );
        })}
      </div>
    </TrustScoreContext.Provider>
  );
}
