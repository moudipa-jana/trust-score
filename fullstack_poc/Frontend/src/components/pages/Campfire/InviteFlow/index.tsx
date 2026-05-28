import { useState } from 'react';

import Invite from '@/components/pages/Campfire/InviteFlow/Invite';
import Loading from '@/components/Signup/Loading';
import Modal from '@/components/Utility/Modal';
import Preview from '@/components/Utility/Preview';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { INVITE_CAMPFIRE_MUTATION } from '@/service/graphql/Campfire';

const TOTAL_STEPS = 4;

interface SelectedUsers {
  id: string;
  name: string;
}

function InviteModal({
  dialogVisible,
  setDialogVisible,
  campfireId,
}: {
  dialogVisible: boolean;
  setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  campfireId: string;
}) {
  const [index, setIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState<SelectedUsers[]>([]);
  const [message, setMessage] = useState(
    'Hi, I am inviting you to join the campfire',
  );

  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const goBack = () =>
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  const handleClose = () => {
    setDialogVisible(false);
    setSelectedUser([]);
    setIndex(0);
  };

  const { mutationFunction: inviteCampfire } = useAuthMutation(
    INVITE_CAMPFIRE_MUTATION,
    () => {
      nextStep();
    },
    (err) => {
      goBack();
      emitErrorNotification(formatGraphqlError(err));
    },
  );

  const handleInvite = () => {
    const campfireRequestsInsertInput = selectedUser?.map(({ id: userId }) => ({
      userId: userId,
      campfireId,
      message,
      isInvited: true,
    }));
    inviteCampfire({
      variables: {
        objs: campfireRequestsInsertInput,
      },
    });
  };
  return (
    <Modal
      id="InviteModal"
      isVisible={dialogVisible}
      backIcon={index > 0 && index !== TOTAL_STEPS - 1}
      onBack={goBack}
      onClose={handleClose}
    >
      <SwipeableViews index={index} disabled>
        <Invite
          nextStep={nextStep}
          campfireId={campfireId}
          setSelectedUser={setSelectedUser}
          selectedUser={selectedUser}
        />
        <div className="pt-36">
          <Preview
            btnTitle="Send Invite"
            title="Preview invite"
            subTitle="We will send a notification to the user(s)"
            message={message}
            setMessage={setMessage}
            onSend={handleInvite}
            onCancel={handleClose}
          />
        </div>
        <Loading
          nextStep={nextStep}
          isVisible={index === 2}
          message="Please wait while invitation(s) are being sent"
        />
        <div className="pt-36">
          <Success
            isActive={index === 3}
            autoClose={() => handleClose()}
            title="Invitation(s) sent successfully "
          />
        </div>
      </SwipeableViews>
    </Modal>
  );
}
export default InviteModal;
