import { useLazyQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect } from 'react';

import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import ForumCard from '@/components/Utility/ForumCard';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import ShrinkComments from '@/components/Utility/ShrinkComment';
import Heading from '@/elements/Heading';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { QUERY_FETCH_HIDE_REPLIES } from '@/service/graphql/Profile';
import { selectGetToken } from '@/state/Slices/auth';
import {
  fetchHiddenReplyCount,
  fetchHiddenReplyFeedSuccess,
  getHiddenReplyCount,
  getHiddenReplyFeed,
} from '@/state/Slices/profile';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { CommentType } from '@/types/forum';
import { profileOption } from '@/types/profile';
interface IProfileActivitiesReply {
  selectedOption: profileOption;
}
const ProfileHiddenReply = ({ selectedOption }: IProfileActivitiesReply) => {
  const dispatch = useAppDispatch();
  const hiddenReplies = useAppSelector(getHiddenReplyFeed);
  const hiddenReplyCount = useAppSelector(getHiddenReplyCount);
  const token = useAppSelector(selectGetToken);
  const [fetchActivityList, { loading, error, data }] = useLazyQuery(
    QUERY_FETCH_HIDE_REPLIES,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      const hiddenCount = (data as any)?.totalHiddenReplies?.aggregate?.count;
      const appendRepliesData = [
        ...hiddenReplies,
        ...((data as any)?.comments || []),
      ];
      dispatch(fetchHiddenReplyFeedSuccess(appendRepliesData));
      dispatch(fetchHiddenReplyCount(hiddenCount));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const fetchHiddenActivities = useCallback(
    (offset = 0, limit = 3) => {
      fetchActivityList({
        variables: {
          limit,
          offset,
          sort: {
            createdAt: selectedOption?.value,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    },
    [fetchActivityList, selectedOption?.value, token],
  );

  const handleLoadMore = () => {
    fetchHiddenActivities(hiddenReplies?.length);
  };

  useEffect(() => {
    dispatch(fetchHiddenReplyFeedSuccess([]));
    fetchHiddenActivities(0);
  }, [selectedOption, dispatch, fetchHiddenActivities]);

  useEffect(() => {
    if (hiddenReplies?.length === 2 && hiddenReplyCount > 2) {
      fetchHiddenActivities(hiddenReplies?.length, 1);
    }
  }, [hiddenReplies?.length, hiddenReplyCount, fetchHiddenActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Hidden Replies" />
        <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
      </div>
    );
  return (
    <div>
      {isEmpty(hiddenReplies) ? (
        !(data as any)?.comments ? (
          <TabletLoader />
        ) : (
          <div>
            <ProfileActivityHeader title="Hidden Replies" />
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
              <p className='text-sm font-bold text-gray-500'>
                No data found
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="m-2">
          <Heading priority="3">Hidden Replies</Heading>
          <div className="second-child relative  mt-2 rounded-md p-2 xl:p-4 ">
            {hiddenReplies?.map((reply: CommentType) => {
              return (
                <div className="p-4" key={reply?.id}>
                  <ForumCard
                    parentCommentId={reply?.parentId} // Parent Comment ID
                    postId={
                      reply?.parent
                        ? reply?.parent?.questionId ||
                        reply?.parent?.quizId ||
                        reply?.parent?.pollId ||
                        reply?.parent?.campfireShareId ||
                        reply?.parent?.campfire_post_share_id ||
                        (reply?.parent?.postShareId as string) ||
                        reply?.parent?.parent?.questionId ||
                        reply?.parent?.parent?.quizId ||
                        reply?.parent?.parent?.pollId ||
                        reply?.parent?.parent?.campfireShareId ||
                        reply?.parent?.parent?.campfire_post_share_id ||
                        (reply?.parent?.parent?.postShareId as string)
                        : ''
                    }
                    id={reply?.id} // Comment ID
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.comment}
                    user={reply?.user}
                    title={<ShrinkComments message={reply?.message} />}
                    createdAt={reply?.createdAt}
                    color="bg-white"
                    canFollow
                    showBookmark
                    isLastChild
                    isDisable={
                      reply?.is_disabled_by_admin ||
                      reply?.user?.is_disabled_by_admin
                    }
                    clickableCard={
                      !reply?.is_disabled_by_admin &&
                      !reply?.user?.is_disabled_by_admin
                    }
                    isHidden
                    footerDisable
                    postReaction={reply?.post_reactions}
                    likesCount={reply?.likes}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {hiddenReplyCount > hiddenReplies?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>
            {loading ? 'Loading Post...' : 'Load More Post'}
          </LoadMore>
        </div>
      )}
    </div>
  );
};

export default ProfileHiddenReply;
