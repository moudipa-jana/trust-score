import React from 'react';
import { useDispatch } from 'react-redux';

import SharePost from '@/components/Utility/Dialogs/SharePostDialog/SharePost';
import Modal from '@/components/Utility/Modal';
import { useAppSelector } from '@/Hooks/useRedux';
import { toggleShareDialog } from '@/state/Slices/dialog';

export default function ShareDialog() {
  const dispatch = useDispatch();
  const dialogVisible = useAppSelector(
    (state) => state.dialog.sharePostDialogOpen,
  );
  const handleClose = () => {
    dispatch(
      toggleShareDialog({
        open: false,
        postId: undefined,
        campfireName: undefined,
        threadId: undefined,
        postShareData: {
          categoryId: undefined,
          postId: undefined,
          type: undefined,
        },
      }),
    );
  };

  return (
    <Modal id="ShareDialog" isVisible={dialogVisible} onClose={handleClose}>
      <SharePost />
    </Modal>
  );
}
