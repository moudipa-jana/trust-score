import { useLazyQuery } from '@apollo/client/react';
import { useEffect, useMemo } from 'react';

import ForumCard from '@/components/Utility/ForumCard';
import Heading from '@/elements/Heading';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  FETCH_EXPLORE_TOPICS_FOR_CATEGORY_FEED_QUERY,
  FETCH_EXPLORE_TOPICS_FOR_FEED_QUERY,
} from '@/service/graphql/Category';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PostReaction, UserThreadType } from '@/types/forum';
import { useAppSelector } from '@/Hooks/useRedux';
import { getUserId, selectGetUserProfile } from '@/state/Slices/auth';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';

interface TopicProps {
  category?: string;
}

interface TopicPost {
  id: string | number;
  type: PostTypeEnum;
  title: string;
  createdAt: string;
  noParticipants: number;
  noComment: number;
  noComments?: number;
  user: UserThreadType;
  is_disabled_by_admin?: boolean;
  categoryName: string;
  post_reactions?: PostReaction[];
  likes?: number;
}

interface TopicPostData {
  [PostTypeEnum.question]?: TopicPost;
  [PostTypeEnum.poll]?: TopicPost;
  [PostTypeEnum.quiz]?: TopicPost;
  type: PostTypeEnum;
}

interface TopicsResponse {
  threads: TopicPostData[];
}

function headingJSX() {
  return (
    <div className="headingh3">
      <Heading priority={3} variant color="black" font="font-semibold">
        Explore by topics
      </Heading>
    </div>
  );
}

function loadingJSX() {
  return (
    <>
      {headingJSX()}
      <div>Loading...</div>
    </>
  );
}

function errorJSX() {
  return (
    <>
      {headingJSX()}
      <div>Oops! we couldn&apos;t find any related posts</div>
    </>
  );
}

function topicCardDetails(
  incomingTopics: TopicPostData[],
  userId: string,
  iBlocked: Set<string>,
  blockedMe: Set<string>,
) {
  if (incomingTopics?.length < 0) errorJSX();
  return incomingTopics
    ?.filter((data: TopicPostData) => {
      const post = (data as any)[data?.type];
      const authorId = post?.user?.id;
      return !iBlocked.has(authorId as string) && !blockedMe.has(authorId as string);
    })
    ?.slice(0, 2)
    .map((data: TopicPostData) => {
      const post = (data as any)[data?.type];
      const reactionName =
        post?.post_reactions && post?.post_reactions.length > 0
          ? post?.post_reactions.find((reaction: PostReaction) => reaction.user_id == userId)
            ?.kofukon.name
          : undefined;
      return (
        <div className="mb-2" key={post?.id}>
          <ForumCard
            relatedCard
            postType={data.type}
            cardType={data.type as unknown as CardTypeEnum}
            postId={post?.id as string}
            id={post?.id as string}
            color={
              data.type === PostTypeEnum.question
                ? 'bg-green-400'
                : data.type === PostTypeEnum.poll
                  ? 'bg-[#BFFFB7]'
                  : 'bg-[#F1CAFF]'
            }
            variant="sm"
            title={post?.title}
            createdAt={post?.createdAt as string}
            participantsCount={post?.noParticipants}
            commentsCount={post?.noComment ?? post?.noComments}
            user={post?.user}
            tag={post?.categoryName}
            postedBy
            hideUserImage
            hideActions
            isDisable={
              post?.is_disabled_by_admin || post?.user?.is_disabled_by_admin
            }
            reactionName={reactionName}
            isArchived={false}
            sideCard
            postReaction={post?.post_reactions}
            likesCount={post?.likes}
            clickableCard
            footerClickDisable
          />
        </div>
      );
    });
}

function Topic({ category }: TopicProps) {
  const userId = useAppSelector(getUserId);
  const profileData = useAppSelector(selectGetUserProfile);
  const iBlocked = useUsersIBlocked();
  const blockedMe = useUsersWhoBlockedMe();

  const interestIds = useMemo(() => {
    return (
      profileData?.user_interests?.map(
        (interest: any) => interest.category.id,
      ) || []
    );
  }, [profileData]);
  const selectedQuery = useMemo(() => {
    if (!category) return FETCH_EXPLORE_TOPICS_FOR_FEED_QUERY;
    return FETCH_EXPLORE_TOPICS_FOR_CATEGORY_FEED_QUERY;
  }, [category]);
  const [exploreByTopicsData, { data, loading, error }] =
    useLazyQuery<TopicsResponse>(selectedQuery);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  useEffect(() => {
    if (!selectedQuery) return;
    if (
      selectedQuery === FETCH_EXPLORE_TOPICS_FOR_CATEGORY_FEED_QUERY &&
      !category
    )
      return;

    const variables =
      selectedQuery === FETCH_EXPLORE_TOPICS_FOR_FEED_QUERY
        ? {
            categoryId:
              interestIds.length > 0 ? { _in: interestIds } : {},
          }
        : { categoryId: category };
    exploreByTopicsData({ variables });
  }, [category, exploreByTopicsData, selectedQuery, interestIds]);

  if (loading) return loadingJSX();

  return (
    <div className="py-8">
      {headingJSX()}
      {error ? (
        <div>Oops! we couldn&apos;t find any related posts</div>
      ) : (
        <div className=" grid md:grid-cols-1 lg:grid-cols-2 lg:gap-4 xl:grid-cols-1 xl:gap-0">
          {topicCardDetails(
            data?.threads as TopicPostData[],
            userId as string,
            iBlocked,
            blockedMe,
          )}
        </div>
      )}
    </div>
  );
}

export default Topic;
