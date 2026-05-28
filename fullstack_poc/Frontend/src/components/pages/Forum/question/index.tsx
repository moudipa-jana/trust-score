import { useLazyQuery, useMutation } from '@apollo/client/react';
import { toLower } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createHashtags } from '@/actions/forum';
import Category from '@/components/pages/Forum/question/Category';
import Details from '@/components/pages/Forum/question/Details';
import Question from '@/components/pages/Forum/question/Question';
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
import { FETCH_BANNED_DOMAINS, FETCH_BANNED_WORDS, FETCH_CURRENT_CONTENT_CONTROL_SETTING, MUTATION_ADD_QUESTION_CAMPFIRE } from '@/service/graphql/Campfire';
import { MUTATION_ADD_QUESTION } from '@/service/graphql/Forum';
import { getUserId, increaseActivePostCount, selectGetToken } from '@/state/Slices/auth';
import { getCampfireId } from '@/state/Slices/campfire';
import { getCampfirePage } from '@/state/Slices/dialog';
import { forumPostSuccess } from '@/state/Slices/necessary';
import { questionSubmitDetailsType } from '@/types/question';

interface IAskQuestionProps {
  nextStep: () => void;
  index: number;
  handleClose: () => void;
  togglePollSection: (show: boolean) => void;
  toggleStatus: boolean;
}

export default function AskQuestion({ nextStep, index, handleClose, togglePollSection, toggleStatus }: IAskQuestionProps) {
  const userId = useAppSelector(getUserId);
  const token = useAppSelector(selectGetToken);
  const [currentContentControl, setCurrentContentControl] = useState('optional');
  const dispatch = useAppDispatch();
  const { query, push } = useRouter();
  const campfireId = useAppSelector(getCampfireId);
  const isCampfire = useAppSelector(getCampfirePage);
  const [fetchBannedTitle, { data: titleData }] = useLazyQuery(FETCH_BANNED_WORDS, { fetchPolicy: 'no-cache', },);
  const [fetchBannedBody, { data: bodyData }] = useLazyQuery(FETCH_BANNED_WORDS, { fetchPolicy: 'no-cache', },);
  const [fetchBannedDomains, { data: domainsData }] = useLazyQuery(FETCH_BANNED_DOMAINS, { fetchPolicy: 'no-cache', },);
  const [fetchCurrentContentControl, { data: contentControlData }] = useLazyQuery(FETCH_CURRENT_CONTENT_CONTROL_SETTING, { fetchPolicy: 'no-cache' });
  const [showPollSection, setShowPollSection] = useState(false);

  useEffect(() => {
    setShowPollSection(toggleStatus);
  }, [toggleStatus]);

  useEffect(() => {
    if ((contentControlData as any)?.campfires?.length) {
      if (isCampfire) {
        setCurrentContentControl(
          (contentControlData as any)?.campfires[0]?.content_controls,
        );
      }
    }
  }, [contentControlData, isCampfire]);

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
      fetchCurrentContentControl({
        variables: { id: campfireId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [
    campfireId,
    token,
    fetchBannedTitle,
    fetchBannedBody,
    fetchBannedDomains,
    fetchCurrentContentControl,
  ]);

  const [questionSubmitDetails, setQuestionSubmitDetails] = useState<questionSubmitDetailsType>({ userId: '', title: '', description: '', categoryId: '', media_link: null });

  const [submitNewQuestion, { loading: questionLoading }] = useMutation(MUTATION_ADD_QUESTION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response) => {
      let postData = (response as any).insert_questions_one;
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
        toLower(postData.question.categoryName)
      ) {
        toggleModalLoader(false);
        push(`/category/${postData.question.categoryName}`);
        handleClose();
      } else {
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        nextStep();
      }
    },
    onError: (err: any) => {
      toggleModalLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [submitNewCampfireQuestion, { loading: campfireQuestionLoading }] = useMutation(
    MUTATION_ADD_QUESTION_CAMPFIRE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        const updatedPost = (response as any).createCampfireQuestion.data[0];
        const postData = {
          ...updatedPost,
          threadId: updatedPost.id,
          id: updatedPost.question.id,
        };
        dispatch(increaseActivePostCount());
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        nextStep();
      },
      onError: (err: any) => {
        toggleModalLoader(false);
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleQuestionSubmit = async (title?: string) => {
    const submitQuestionValue = { ...questionSubmitDetails, userId };
    if (!token) { emitErrorNotification(SESSION_EXPIRED_MSG); return; };
    toggleModalLoader(true);
    if (isCampfire) {
      const campfireQuestionValue = {
        title: normalizeWhitespace(title || submitQuestionValue.title),
        description: normalizeWhitespace(submitQuestionValue.description),
        mediaLink: submitQuestionValue.media_link,
        campfireId,
      };
      const response = await submitNewCampfireQuestion({ variables: { ...campfireQuestionValue, }, });
      const postId = (response.data as any).createCampfireQuestion.data[0].question.id;
      await createHashtags(campfireQuestionValue.title + ' ' + campfireQuestionValue.description, postId, 'question',);
      title && (nextStep());
    } else {
      const submitQuestionValueNormalized = {
        ...submitQuestionValue,
        title: normalizeWhitespace(submitQuestionValue.title),
        description: normalizeWhitespace(submitQuestionValue.description),
      };
      const response = await submitNewQuestion({ variables: { ...submitQuestionValueNormalized, }, });
      const postId = (response?.data as any)?.insert_questions_one.id;
      await createHashtags(submitQuestionValueNormalized.title + ' ' + submitQuestionValueNormalized.description, postId, 'question',);
    }
  };



  return (
    <SwipeableViews index={index} disabled>
      <Question
        nextStep={nextStep}
        setQuestionSubmitDetails={setQuestionSubmitDetails}
        questionSubmitDetails={questionSubmitDetails}
        handleClose={handleClose}
        campfireId={campfireId}
        isCampfire={isCampfire}
        bannedTitleData={titleData as any}
        bannedDomainData={domainsData as any}
        togglePollSection={togglePollSection}
        handleSubmit={handleQuestionSubmit}
        toggleStatus={showPollSection}
        currentContentControl={currentContentControl}
      />
      {index == 1 && <Details
        nextStep={nextStep}
        setQuestionSubmitDetails={setQuestionSubmitDetails}
        questionSubmitDetails={questionSubmitDetails}
        handleSubmit={handleQuestionSubmit}
        isCampfire={isCampfire}
        campfireId={campfireId}
        bannedbodyData={bodyData as any}
        bannedDomainData={domainsData as any}
        currentContentControl={currentContentControl}
        loading={questionLoading || campfireQuestionLoading}
      />}
      {isCampfire ? (
        <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
          <Success
            title="New Question Added"
            isActive={index === 2}
            autoClose={handleClose}
          />
        </div>
      ) : (
        <Category
          handleSubmit={handleQuestionSubmit}
          setQuestionSubmitDetails={setQuestionSubmitDetails}
          load={!isCampfire}
        />
      )}
      {!isCampfire && (
        <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
          <Success
            title="New Question Added"
            isActive={index === 3}
            autoClose={handleClose}
          />
        </div>
      )}
    </SwipeableViews>
  );
}
