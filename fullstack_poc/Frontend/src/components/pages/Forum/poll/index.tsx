import { useLazyQuery, useMutation } from '@apollo/client/react';
import { startCase, toLower } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { createHashtags } from '@/actions/forum';
import CreatePoll from '@/components/pages/Forum/poll/CreatePoll';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { SESSION_EXPIRED_MSG } from '@/lib/constants';
import {
  emitErrorNotification,
  formatGraphqlError,
  normalizeWhitespace,
  toggleModalLoader,
} from '@/lib/helpers';
import {
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
  MUTATION_ADD_POLL_CAMPFIRE,
} from '@/service/graphql/Campfire';
import { MUTATION_ADD_POLL } from '@/service/graphql/Forum';
import { increaseActivePostCount, selectGetToken } from '@/state/Slices/auth';
import { getCampfireId } from '@/state/Slices/campfire';
import { getCampfirePage } from '@/state/Slices/dialog';
import { forumPostSuccess } from '@/state/Slices/necessary';

export interface PollSubmitDetailsType {
  title: string;
  pollOptions: Array<{ title: string }>;
  categoryId: string;
}

interface IPollProps {
  nextStep: () => void;
  index: number;
  handleClose: () => void;
}

export default function Poll({ nextStep, index, handleClose }: IPollProps) {
  const token = useAppSelector(selectGetToken);
  const { query, push } = useRouter();
  const dispatch = useAppDispatch();

  const campfireId = useAppSelector(getCampfireId);
  const isCampfire = useAppSelector(getCampfirePage);

  const [fetchBannedTitle, { data: titleData }] = useLazyQuery(
    FETCH_BANNED_WORDS,
    {
      fetchPolicy: 'no-cache',
    },
  );
  const [fetchBannedBody, { data: bodyData }] = useLazyQuery(
    FETCH_BANNED_WORDS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const [fetchBannedDomains, { data: domainsData }] = useLazyQuery(
    FETCH_BANNED_DOMAINS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if (campfireId && token !== '') {
      fetchBannedTitle({
        variables: { campfireId, postPart: 'title' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      fetchBannedBody({
        variables: { campfireId, postPart: 'body' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      fetchBannedDomains({
        variables: { campfireId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [
    campfireId,
    fetchBannedBody,
    fetchBannedDomains,
    fetchBannedTitle,
    token,
  ]);

  const [submitNewPoll, { loading }] = useMutation(MUTATION_ADD_POLL, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: async (response) => {
      let postData = (response as any).insert_polls_one;
      const { id, createdAt, type } = postData;
      const dataToStore = {
        id,
        createdAt,
        [type]: { ...postData, comments: [] },
        type,
      };
      postData = dataToStore;
      dispatch(increaseActivePostCount());
      if (
        toLower(query.categoryName as string) !==
        toLower(postData.poll.categoryName)
      ) {
        toggleModalLoader(false);
        push(`/category/${startCase(postData.poll.categoryName)}`);
        handleClose();
      } else {
        await createHashtags(postData.poll.title, postData.id, postData.type);
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        nextStep();
      }
    },
    onError: (err: any) => {
      emitErrorNotification(formatGraphqlError(err));
      toggleModalLoader(false);
    },
  });

  const [submitNewPollCampfire, { loading: campfirePollLoading }] = useMutation(
    MUTATION_ADD_POLL_CAMPFIRE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: async (response) => {
        const updatedPost = (response as any).createCampfirePoll.data[0];
        const postData = {
          ...updatedPost,
          threadId: updatedPost.id,
          id: updatedPost.poll.id,
        };
        dispatch(increaseActivePostCount());
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        await createHashtags(
          updatedPost.poll.title,
          updatedPost.poll.id,
          'poll',
        );
        nextStep();
      },
      onError: (err: any) => {
        if (formatGraphqlError(err)?.includes('Options cannot be repeated.')) {
          emitErrorNotification('Options cannot be repeated.');
        } else {
          emitErrorNotification(formatGraphqlError(err));
        }
        toggleModalLoader(false);
      },
    },
  );

  const handleSubmit = (values: PollSubmitDetailsType) => {
    if (!token) {
      return emitErrorNotification(SESSION_EXPIRED_MSG);
    }
    toggleModalLoader(true);
    if (isCampfire) {
      const campfirePollValue = {
        title: normalizeWhitespace(values.title),
        options: values.pollOptions,
        campfireId,
      };
      return submitNewPollCampfire({
        variables: { ...campfirePollValue },
      });
    } else {
      return submitNewPoll({
        variables: {
          ...values,
          title: normalizeWhitespace(values.title),
        },
      });
    }
  };

  return (
    <SwipeableViews index={index} disabled>
      <CreatePoll
        handleSubmit={handleSubmit}
        loading={loading || campfirePollLoading}
        isCampfire={isCampfire}
        bannedTitleData={titleData as any}
        bannedBodyData={bodyData as any}
        bannedDomainData={domainsData as any}
      />
      <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
        <Success
          title="New Poll Added"
          isActive={index == 1}
          autoClose={handleClose}
        />
      </div>
    </SwipeableViews>
  );
}
