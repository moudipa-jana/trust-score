import { useLazyQuery, useMutation } from '@apollo/client/react';
import { startCase, toLower } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { createHashtags } from '@/actions/forum';
import CreateQuiz, {
  QuizSubmitDetailsType,
} from '@/components/pages/Forum/quiz/CreateQuiz';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  normalizeWhitespace,
  toggleModalLoader,
} from '@/lib/helpers';
import {
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
  MUTATION_ADD_QUIZ_CAMPFIRE,
} from '@/service/graphql/Campfire';
import { MUTATION_ADD_QUIZ } from '@/service/graphql/Forum';
import { increaseActivePostCount, selectGetToken } from '@/state/Slices/auth';
import { getCampfireId } from '@/state/Slices/campfire';
import { getCampfirePage } from '@/state/Slices/dialog';
import { forumPostSuccess } from '@/state/Slices/necessary';

interface IAskQuestionProps {
  nextStep: () => void;
  index: number;
  handleClose: () => void;
}
export const SESSION_EXPIRED_MSG =
  'Looks like your session expired. Login and try again!';
export default function AskQuestion({
  nextStep,
  index,
  handleClose,
}: IAskQuestionProps) {
  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();
  const { query, push } = useRouter();
  const [submitNewQuiz, { loading }] = useMutation(MUTATION_ADD_QUIZ, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: async (response) => {
      const responseData = (response as any).insert_quiz_one;
      const { id, createdAt, type } = responseData;
      const postData = {
        id,
        createdAt,
        [type]: { ...responseData, comments: [] },
        type,
      };
      dispatch(increaseActivePostCount());
      if (
        toLower(query.categoryName as string) !==
        toLower(postData[type].categoryName)
      ) {
        toggleModalLoader(false);
        push(`/category/${startCase(postData[type].categoryName)}`);
        handleClose();
      } else {
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        nextStep();
      }
      await createHashtags(responseData.title, id, type);
    },
    onError: (err: any) => {
      toggleModalLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

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
    token,
    fetchBannedBody,
    fetchBannedDomains,
    fetchBannedTitle,
  ]);

  const [submitNewCampfireQuiz, { loading: campfireQuizLoading }] = useMutation(
    MUTATION_ADD_QUIZ_CAMPFIRE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: async (response) => {
        const updatedPost = (response as any).createCampfireQuiz.data[0];
        const postData = {
          ...updatedPost,
          threadId: updatedPost.id,
          id: updatedPost.quiz.id,
        };
        await createHashtags(
          updatedPost.quiz.title,
          updatedPost.quiz.id,
          'quiz',
        );
        dispatch(increaseActivePostCount());
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        nextStep();
      },
      onError: (err: any) => {
        toggleModalLoader(false);
        if (formatGraphqlError(err)?.includes('Options cannot be repeated.')) {
          emitErrorNotification('Options cannot be repeated.');
        } else {
          emitErrorNotification(formatGraphqlError(err));
        }
      },
    },
  );

  const handleSubmit = async (values: QuizSubmitDetailsType) => {
    if (!token) {
      return emitErrorNotification(SESSION_EXPIRED_MSG);
    }
    toggleModalLoader(true);
    if (isCampfire) {
      const campfirequizValue = {
        title: normalizeWhitespace(values.title),
        options: values.quizOptions,
        campfireId,
      };
      return submitNewCampfireQuiz({
        variables: { ...campfirequizValue },
      });
    } else {
      return submitNewQuiz({
        variables: {
          ...values,
          title: normalizeWhitespace(values.title),
        },
      });
    }
  };
  return (
    <div className="create-quiz-modal">
      <SwipeableViews index={index} disabled>
        <CreateQuiz
          loading={loading || campfireQuizLoading}
          handleSubmit={handleSubmit}
          isCampfire={isCampfire}
          bannedTitleData={titleData as any}
          bannedBodyData={bodyData as any}
          bannedDomainData={domainsData as any}
        />
        <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
          <Success
            title="New Quiz Added"
            isActive={index === 1}
            autoClose={handleClose}
          />
        </div>
      </SwipeableViews>
    </div>
  );
}
