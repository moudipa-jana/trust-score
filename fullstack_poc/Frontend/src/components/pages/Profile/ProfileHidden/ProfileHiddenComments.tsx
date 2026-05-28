import { useLazyQuery } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
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
import { QUERY_FETCH_HIDE_COMMENT } from '@/service/graphql/Profile';
import { selectGetToken } from '@/state/Slices/auth';
import {
  fetchHiddenCommentCount,
  fetchHiddenCommentFeedSuccess,
  getHiddenCommentCount,
  getHiddenCommentFeed,
} from '@/state/Slices/profile';
import { CardTypeEnum, PostTypeEnum } from '@/types/enums';
import { CommentType } from '@/types/forum';

interface ProfileOption {
  value: string;
  label: string;
}

interface IProfileActivitiesComments {
  selectedOption: ProfileOption;
}

const ProfileActivitiesComments = ({
  selectedOption,
}: IProfileActivitiesComments) => {
  const dispatch = useAppDispatch();
  const hiddenComments = useAppSelector(getHiddenCommentFeed);
  const hiddenCommentCount = useAppSelector(getHiddenCommentCount);
  const token = useAppSelector(selectGetToken);
  const [fetchActivityList, { loading, error, data }] = useLazyQuery(
    QUERY_FETCH_HIDE_COMMENT,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle data and errors with useEffect
  useEffect(() => {
    if (data) {
      const appendCommentData = [
        ...hiddenComments,
        ...((data as any)?.comments || []),
      ];
      const hiddenCount = (data as any)?.totalHiddenComments?.aggregate?.count;
      dispatch(fetchHiddenCommentFeedSuccess(appendCommentData));
      dispatch(fetchHiddenCommentCount(hiddenCount));
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
    fetchHiddenActivities(hiddenComments?.length);
  };

  useEffect(() => {
    dispatch(fetchHiddenCommentFeedSuccess([]));
    fetchHiddenActivities(0);
  }, [selectedOption, dispatch, fetchHiddenActivities]);

  useEffect(() => {
    if (hiddenComments?.length === 2 && hiddenCommentCount > 2) {
      fetchHiddenActivities(hiddenComments?.length, 1);
    }
  }, [hiddenComments?.length, hiddenCommentCount, fetchHiddenActivities]);

  if (error)
    return (
      <div>
        <ProfileActivityHeader title="Hidden Comments" />
        <ProfileActivityErrorComponent errorMessage="Oops something went wrong." />
      </div>
    );
  return (
    <div>
      {isEmpty(hiddenComments) ? (
        !(data as any)?.comments ? (
          <TabletLoader />
        ) : (
          <div>
            <ProfileActivityHeader title="Hidden Comments" />
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
              <p className='text-sm font-bold text-gray-500'>
                No data found
              </p>
            </div>
          </div>
        )
      ) : (
        <div>
          <Heading priority="3">Hidden Comments</Heading>
          <div className="second-child relative  mt-2 rounded-md p-2 xl:p-4">
            {hiddenComments?.map((comment: CommentType) => {
              const participanCount =
                typeof comment?.noParticipants === 'object'
                  ? get(comment, 'noParticipants.aggregate.count', 0)
                  : comment?.noParticipants || 0;

              return (
                <div className=" p-4 " key={comment?.id}>
                  <ForumCard
                    color="bg-white"
                    isDisable={
                      comment?.is_disabled_by_admin ||
                      comment?.user?.is_disabled_by_admin
                    }
                    postId={
                      comment?.questionId ||
                      comment?.quizId ||
                      comment?.pollId ||
                      (comment?.postShareId as string)
                    }
                    id={comment?.id}
                    parentCommentId={comment?.id}
                    user={comment?.user}
                    postType={PostTypeEnum.question}
                    cardType={CardTypeEnum.comment}
                    title={<ShrinkComments message={comment?.message} />}
                    createdAt={comment?.createdAt}
                    commentsCount={get(
                      comment,
                      'repliesCount.aggregate.count',
                      0,
                    )}
                    participantsCount={participanCount}
                    showBookmark
                    clickableCard={
                      !comment?.is_disabled_by_admin &&
                      !comment?.user?.is_disabled_by_admin
                    }
                    isHidden
                    footerDisable
                    postReaction={comment?.post_reactions}
                    likesCount={comment?.likes}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {hiddenCommentCount > hiddenComments?.length && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex justify-center">
          <LoadMore onClick={handleLoadMore}>
            {loading ? 'Loading Post...' : 'Load More Post'}
          </LoadMore>
        </div>
      )}
    </div>
  );
};

export default ProfileActivitiesComments;
