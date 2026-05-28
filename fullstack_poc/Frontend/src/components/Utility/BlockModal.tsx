{
  /**
   * BlockModal displays a confirmation dialog for blocking a user.
   * It supports both guest and registered user flows, triggers Redux actions, and offers customizable callbacks.
   */
}
import React from 'react';

import { blockUser } from '@/actions/forum';
import Button from '@/components/Utility/Button';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import { useAppDispatch } from '@/Hooks/useRedux';
import { setGuestUserBlockedStatus } from '@/state/Slices/profile';

type BlockedModalProps = {
  blockModal: boolean;
  setBlockModal: (blockModal: boolean) => void;
  postUserId: string;
  handleBlock: () => void;
  isBlockTheUser?: boolean;
  setBlockTheUser: React.Dispatch<React.SetStateAction<boolean>>;
  setRefetch?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BlockModal({
  blockModal,
  setBlockModal,
  postUserId,
  handleBlock,
  isBlockTheUser,
  setBlockTheUser,
  setRefetch,
}: BlockedModalProps) {
  const dispatch = useAppDispatch();

  const handleNo = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setBlockModal(false);
    setBlockTheUser(false);
  };

  const handleYes = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (isBlockTheUser) {
      handleBlock();
    } else {
      dispatch(blockUser(postUserId));
      dispatch(setGuestUserBlockedStatus(true));
    }
    setBlockModal(false);
    if (setRefetch) {
      setRefetch((prev) => !prev);
    }
  };

  return (
    <Modal
      id="BlockModal"
      isVisible={blockModal}
      onClose={() => {
        setBlockModal(false);
        setBlockTheUser(false);
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'semibold',
          marginBottom: '20px',
        }}
      >
        <Text size="lg">Do you want to block this user?</Text>
      </div>

      <div className="flex items-center justify-center gap-2 lg:gap-3">
        <Button
          color="border-red-400"
          textColor="text-red-400"
          width="w-full"
          type="borderRed"
          size="lg"
          onClick={handleYes}
          block
        >
          Yes
        </Button>
        <Button width="w-full" type="bgRed" size="lg" onClick={handleNo} block>
          <div>No</div>
        </Button>
      </div>
    </Modal>
  );
}
