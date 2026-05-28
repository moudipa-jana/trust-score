import { useLazyQuery } from '@apollo/client/react';
import router from 'next/router';
import { Dispatch, SetStateAction, useEffect } from 'react';

import RemoveMember from '@/components/pages/Campfire/RemoveMember';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { QUERY_FETCH_CAMPFIRE_DETAILS } from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';
import {
  campfireFetchSuccess,
  removeUser,
  updateCampfire,
} from '@/state/Slices/campfire';
import { CampfireDetails, LeaveCampfireFunction } from '@/types/campfire';

interface ILeaveModal {
  data: CampfireDetails;
  dialogVisible: boolean;
  leaveCampfire: LeaveCampfireFunction;
  setDialogVisible: Dispatch<SetStateAction<boolean>>;
  setCampfireMembers?: Dispatch<SetStateAction<number>>;
  setjoinButtonText?: Dispatch<SetStateAction<string>>;
}

function LeaveModal({
  data,
  dialogVisible,
  setDialogVisible,
  setCampfireMembers,
  leaveCampfire,
  setjoinButtonText,
}: ILeaveModal) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const campfireName = Array.isArray(router?.query?.name)
    ? decodeURIComponent(router?.query?.name[0])
    : decodeURIComponent(router?.query?.name as string);

  const userId = useAppSelector(getUserId);

  const [fetchCampfireDetails, { data: campfireData, error }] = useLazyQuery(
    QUERY_FETCH_CAMPFIRE_DETAILS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if ((campfireData as any)?.campfires?.[0]) {
      const campfireDetailsData = (campfireData as any).campfires[0];
      dispatch(campfireFetchSuccess(campfireDetailsData));
    }
  }, [campfireData, dispatch]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const handleLeaveCampfire = () => {
    setDialogVisible(false);
    leaveCampfire({
      variables: {
        campfireId: data?.id,
        userId: userId ?? '',
      },
      onCompleted: (response: any) => {
        const { success, message } = (response as any).leaveCampfire;

        if (!success) {
          emitErrorNotification(message || 'An error occurred');
          return;
        }
        fetchCampfireDetails({
          variables: {
            campfireName,
            userId,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
        emitNotification('success', 'Campfire left successfully');

        if (setCampfireMembers) {
          setCampfireMembers((prev) => prev - 1);
        }
        if (setjoinButtonText) {
          setjoinButtonText('Join');
        }
        dispatch(updateCampfire({ isMember: false }));
        dispatch(removeUser(userId));
      },
    });
  };
  return (
    <Modal
      id="LeaveCampfire"
      isVisible={dialogVisible}
      onClose={() => setDialogVisible(false)}
    >
      <RemoveMember
        title="Leave Campfire"
        subTitle="Are you sure you want to leave this campfire?"
        onCancel={() => setDialogVisible(false)}
        onSend={handleLeaveCampfire}
        onSendText="Leave"
        onCancelText="Cancel"
      />
    </Modal>
  );
}
export default LeaveModal;
