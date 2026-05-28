import { ErrorLike } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import React, { useState } from 'react';

import Flag from '@/components/Utility/Flag/Flag';
import FlagWarning from '@/components/Utility/Flag/FlagWarning';
import OtherReson from '@/components/Utility/Flag/OtherReson';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  toggleModalLoader,
} from '@/lib/helpers';
import { ADD_REPORT_MUTATION } from '@/service/graphql/Flag';
import { selectGetToken } from '@/state/Slices/auth';
import { CardTypeEnum } from '@/types/enums';

interface FlagModalsProps {
  setFlagSteps: (flagSteps: number) => void;
  flagSteps: number;
  cardType: CardTypeEnum;
  postId: string;
  commentId?: string;
  campfirePost?: boolean;
  campfireId?: string;
  reportedUserId?: string;
}

type ReportVariable = {
  [key: string]: string;
  reportTypeId: string;
  message: string;
};

export default function FlagModals({
  setFlagSteps,
  flagSteps,
  cardType,
  postId,
  commentId,
  campfirePost,
  campfireId,
  reportedUserId,
}: FlagModalsProps) {
  const token = useAppSelector(selectGetToken);
  const [reportId, setReportId] = useState('');

  const userId = useAppSelector((state) => state.auth.user?.id);

  const [addReport] = useMutation(ADD_REPORT_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      toggleModalLoader(false);
      setReportId('');
      setFlagSteps(2);
    },
    onError: (err: ErrorLike) => {
      toggleModalLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  function handleSumbit(message = '') {
    toggleModalLoader(true);
    const variables: ReportVariable = {
      reportTypeId: reportId,
      message,
    };

    switch (cardType) {
      case CardTypeEnum.question:
        variables.questionId = postId;
        break;
      case CardTypeEnum.quiz:
        variables.quizId = postId;
        break;
      case CardTypeEnum.poll:
        variables.pollId = postId;
        break;
      case CardTypeEnum.postShare:
        variables.postShareId = postId;
        break;
      case CardTypeEnum.comment:
        variables.commentId = commentId as string;
        break;
      case CardTypeEnum.user:
        variables.reportedUserId = reportedUserId as string;
        break;
      default:
        break;
    }

    if (campfirePost && campfireId) {
      variables.campfireid = campfireId;
    }

    // --- TRUST SERVICE POC INTEGRATION ---
    // We send a hardcoded REPORTED signal to the ML engine to drop their score!
    fetch('http://localhost:8001/process-reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: "report-" + Date.now(),
        author_id: reportedUserId || "eaa7e5d9-5333-4362-8fc3-56e81f8d3f04", // Fallback to the target you mentioned!
        voter_id: userId || "e78e171a-6391-4bba-9067-f30e611fbfb3", // The current logged in user (testscore)
        voter_tier: "Established Voice",
        category: "Fitness", // Assuming Fitness from your screenshot
        entity_type: "post",
        post_text: "Flagged Post",
        reaction_text: "REPORTED", // This exact string maps to -10.0 in Python!
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log("Trust service offline for report."));
    // -------------------------------------

    addReport({
      variables,
    });
  }
  if (flagSteps === 0) {
    return (
      <Flag
        reportId={reportId}
        setFlagSteps={setFlagSteps}
        handleSumbit={handleSumbit}
        setReportId={setReportId}
      />
    );
  }
  if (flagSteps === 1) {
    return <OtherReson handleSumbit={handleSumbit} />;
  }
  if (flagSteps === 2) {
    return <FlagWarning />;
  } else {
    return null;
  }
}
