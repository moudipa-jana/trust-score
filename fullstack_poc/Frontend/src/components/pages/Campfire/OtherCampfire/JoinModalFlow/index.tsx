import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CapmfireModalOther from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow/CapmfireModalOther';
import LeaveModal from '@/components/pages/Campfire/OtherCampfire/LeaveModalFlow';
import Loading from '@/components/Signup/Loading';
import Button from '@/components/Utility/Button';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  LEAVE_CAMPFIRE,
  MUTATION_CANCEL_JOIN_CAMPFIRE,
  MUTATION_JOIN_USER_CAMPFIRE,
} from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { updateCampfire } from '@/state/Slices/campfire';
import {
  getForumFeedthread,
  updateForumFeedByPost,
} from '@/state/Slices/necessary';
import {
  CampfireDetails,
  LeaveCampfireFunction,
  LeaveCampfireResponse,
  LeaveCampfireVariables,
} from '@/types/campfire';
import { QuestionType } from '@/types/forum';

const TOTAL_STEPS = 2;

interface IJoinModal {
  data:
    | CampfireDetails
    | {
        title: string | undefined;
        id: string;
        isRequested?: boolean;
        category?: {
          title: string;
        };
        campfireThreadId?: string;
        is_public?: boolean;
        isMember?: boolean;
        picture?: string;
      }
    | null;
  isHide?: boolean;
  buttonSize?: string;
  toggleJoin?: boolean;
  setToggleJoin?: Dispatch<SetStateAction<boolean>>;
  setCampfireMembers?: Dispatch<SetStateAction<number>>;
  postId?: string;
}

function JoinModal({
  data,
  isHide,
  buttonSize,
  setToggleJoin,
  toggleJoin,
  setCampfireMembers,
  postId,
}: IJoinModal) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [index, setIndex] = useState(0);
  const [joinButtonText, setjoinButtonText] = useState('Join');
  const [isDialogVisible, setisDialogVisible] = useState(false);
  const [toggleLeave, setToggleLeave] = useState(false);
  const token = useAppSelector(selectGetToken);
  const threads = useAppSelector(getForumFeedthread);
  const isCampfirePage = router.pathname.includes('/campfire/');
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const goBack = () =>
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));

  const handleClose = () => {
    setisDialogVisible(false);
    if (setToggleJoin) {
      setToggleJoin(false);
    }
    setIndex(0);
  };

  const { mutationFunction: joinCampfire, loading: joinLoading } =
    useAuthMutation(
      MUTATION_JOIN_USER_CAMPFIRE,
      () => {
        nextStep();
        if (isCampfirePage) {
          dispatch(updateCampfire({ isRequested: true }));
        }
        const threadIndex = threads.findIndex((post) => post.id === postId);
        if (threadIndex !== -1) {
          const currentPost = { ...threads[threadIndex] };
          const questionData = {
            ...currentPost[currentPost?.type],
          } as QuestionType;
          if (questionData?.campfire_threads?.[0]) {
            questionData.campfire_threads = [
              {
                ...questionData.campfire_threads[0],
                campfire: {
                  ...questionData.campfire_threads[0].campfire,
                  isRequested: true,
                },
              },
            ];
          }
          (currentPost[currentPost?.type] as QuestionType) = questionData;
          dispatch(updateForumFeedByPost(currentPost));
        }
        setjoinButtonText('Requested');
      },
      (err) => {
        goBack();
        emitErrorNotification(formatGraphqlError(err));
      },
    );

  const [leaveCampfire, { loading: leavelLoading }] = useMutation<
    LeaveCampfireResponse,
    LeaveCampfireVariables
  >(LEAVE_CAMPFIRE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const { mutationFunction: cancelJoinRequest, loading: cancelLoading } =
    useAuthMutation(
      MUTATION_CANCEL_JOIN_CAMPFIRE,
      () => {
        setjoinButtonText('Join');
        if (isCampfirePage) {
          dispatch(updateCampfire({ isRequested: false }));
        }
        const threadIndex = threads.findIndex((post) => post.id === postId);
        if (threadIndex !== -1) {
          const currentPost = { ...threads[threadIndex] };
          const questionData = {
            ...currentPost[currentPost?.type],
          } as QuestionType;
          if (questionData?.campfire_threads?.[0]) {
            questionData.campfire_threads = [
              {
                ...questionData.campfire_threads[0],
                campfire: {
                  ...questionData.campfire_threads[0].campfire,
                  isRequested: false,
                },
              },
            ];
          }
          (currentPost[currentPost?.type] as QuestionType) = questionData;
          dispatch(updateForumFeedByPost(currentPost));
        }
        emitNotification('success', 'Request cancelled successfully');
      },
      (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    );

  const handleJoin = async () => {
    joinCampfire({
      variables: {
        campfireId: data?.id,
      },
    });
  };

  function handleJoinClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    if (joinButtonText === 'Join') {
      setisDialogVisible(true);
      return;
    }
    if (joinButtonText === 'Requested') {
      cancelJoinRequest({
        variables: {
          campfireId: data?.id,
        },
      });

      return;
    }
    if (joinButtonText === 'Leave') {
      setToggleLeave(true);
      return;
    }
  }

  function updateJoinButtonText(isMember: boolean, isRequested: boolean) {
    if (isMember) {
      setjoinButtonText('Leave');
      return;
    }
    if (isRequested) {
      setjoinButtonText('Requested');
      return;
    }

    setjoinButtonText('Join');
  }

  useEffect(() => {
    updateJoinButtonText(Boolean(data?.isMember), Boolean(data?.isRequested));
  }, [data]);

  return (
    <>
      <div className={` ${isHide && 'fixed hidden opacity-0'}`}>
        <Button
          block
          type={joinButtonText !== 'Join' ? 'secondary' : 'primary'}
          size={buttonSize ? buttonSize : 'md'}
          isLoading={cancelLoading || joinLoading || leavelLoading}
          onClick={handleJoinClick}
        >
          {joinButtonText}
        </Button>
      </div>
      <LeaveModal
        dialogVisible={toggleLeave}
        data={data as CampfireDetails}
        setDialogVisible={setToggleLeave}
        setCampfireMembers={setCampfireMembers}
        leaveCampfire={leaveCampfire as LeaveCampfireFunction}
        setjoinButtonText={setjoinButtonText}
      />
      <Modal
        id="JoinModal"
        isVisible={toggleJoin || isDialogVisible}
        backIcon={index > 0 && index !== TOTAL_STEPS - 1}
        onBack={goBack}
        onClose={handleClose}
      >
        <SwipeableViews index={index}>
          <CapmfireModalOther
            handleJoin={handleJoin}
            data={data as CampfireDetails}
            handleJoinClick={handleJoinClick}
            joinButtonText={joinButtonText}
          />
          <Loading
            nextStep={nextStep}
            isVisible={index === 1}
            message="Please wait while join request is being sent"
          />
          <Success
            isActive={index === 2}
            autoClose={() => handleClose()}
            title="Request sent"
          />
        </SwipeableViews>
      </Modal>
    </>
  );
}
export default JoinModal;
