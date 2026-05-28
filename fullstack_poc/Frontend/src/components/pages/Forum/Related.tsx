import { useLazyQuery } from '@apollo/client/react';
import { useEffect, useMemo } from 'react';

import ForumCard from '@/components/Utility/ForumCard';
import Heading from '@/elements/Heading';
import { useAppSelector } from '@/Hooks/useRedux';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  FETCH_RELATED_POSTS_FOR_FEED_QUERY,
  FETCH_RELATED_POSTS_FOR_GUEST_CATEGORY_FEED_QUERY,
  FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY,
} from '@/service/graphql/Category';
import {
  getUserId,
  selectGetToken,
  selectGetUserProfile,
} from '@/state/Slices/auth';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { PostReaction, UserThreadType } from '@/types/forum';

interface RelatedProps {
  category?: string;
}

interface RelatedPost {
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

interface RelatedPostData {
  [PostTypeEnum.question]?: RelatedPost;
  [PostTypeEnum.poll]?: RelatedPost;
  [PostTypeEnum.quiz]?: RelatedPost;
  type: PostTypeEnum;
}

interface RelatedPostsResponse {
  related_threads: RelatedPostData[];
}

function headingJSX() {
  return (
    <div className="headingh3">
      <Heading priority={3} variant color="black" font="font-semibold">
        Recommended
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

function RelatedCardDetails(
  relatedPosts: RelatedPostData[],
  userId: string,
  iBlocked: Set<string>,
  blockedMe: Set<string>,
) {
  if (relatedPosts?.length < 0) errorJSX();
  return relatedPosts
    ?.filter((data: RelatedPostData) => {
      const post = (data as any)[data?.type];
      const authorId = post?.user?.id;
      return !iBlocked.has(authorId as string) && !blockedMe.has(authorId as string);
    })
    ?.slice(0, 2)
    .map((data: RelatedPostData) => {
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
                ? 'bg-green-300'
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
            postedBy
            hideUserImage
            hideActions
            isDisable={
              post?.is_disabled_by_admin || post?.user?.is_disabled_by_admin
            }
            reactionName={reactionName}
            sideCard
            tag={post?.categoryName}
            postReaction={post?.post_reactions}
            likesCount={post?.likes}
            footerClickDisable
            clickableCard
          />
        </div>
      );
    });
}

function Related({ category }: RelatedProps) {
  const token = useAppSelector(selectGetToken);
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
    if (!category) return FETCH_RELATED_POSTS_FOR_FEED_QUERY;
    return token
      ? FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY
      : FETCH_RELATED_POSTS_FOR_GUEST_CATEGORY_FEED_QUERY;
  }, [category, token]);

  const [fetchRelatedPosts, { data, loading, error }] =
    useLazyQuery<RelatedPostsResponse>(selectedQuery);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  useEffect(() => {
    if (!selectedQuery) return;
    if (
      selectedQuery === FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY &&
      (!category || !userId)
    )
      return;
    if (
      selectedQuery === FETCH_RELATED_POSTS_FOR_GUEST_CATEGORY_FEED_QUERY &&
      !category
    )
      return;

    const variables =
      selectedQuery === FETCH_RELATED_POSTS_FOR_FEED_QUERY
        ? {
            categoryId:
              interestIds.length > 0 ? { _in: interestIds } : {},
          }
        : selectedQuery === FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY
          ? { categoryId: category, userId }
          : { categoryId: category };

    fetchRelatedPosts({ variables });
  }, [fetchRelatedPosts, selectedQuery, category, userId, interestIds]);

  if (loading) return loadingJSX();

  return (
    <div>
      {headingJSX()}
      {error ? (
        <div>Oops! we couldn&apos;t find any related posts</div>
      ) : (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 lg:gap-4 xl:grid-cols-1 xl:gap-0 ">
          {RelatedCardDetails(
            data?.related_threads as RelatedPostData[],
            userId as string,
            iBlocked,
            blockedMe,
          )}
        </div>
      )}
    </div>
  );
}

export default Related;
