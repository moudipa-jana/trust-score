import { useEffect, useState } from 'react';

import Poll from '@/components/pages/Forum/poll';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleStartPollDialog,
} from '@/state/Slices/dialog';

export default function StartPollDialog() {
  const [index, setIndex] = useState(0);
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const dispatch = useAppDispatch();
  const dialogVisible = useAppSelector(
    (state) => state.dialog.startPollDialogOpen,
  );

  useEffect(() => {
    if (!dialogVisible) {
      setIndex(0);
    }
  }, [dialogVisible]);

  const handleClose = () => {
    dispatch(toggleStartPollDialog(false));
    dispatch(toggleSearchSocialDialog(false));
    dispatch(toggleSearchCampfireDialog(false));
  };

  return (
    <Modal id="StartPoll" isVisible={dialogVisible} onClose={handleClose}>
      <Poll nextStep={nextStep} index={index} handleClose={handleClose} />
    </Modal>
  );
}
