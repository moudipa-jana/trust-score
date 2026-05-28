import { useEffect, useState } from 'react';

import Quiz from '@/components/pages/Forum/quiz';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  toggleCreateQuizDialog,
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
} from '@/state/Slices/dialog';

export default function CreateQuizDialog() {
  const [index, setIndex] = useState(0);
  const dispatch = useAppDispatch();
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const dialogVisible = useAppSelector(
    (state) => state.dialog.createQuizDialogOpen,
  );

  useEffect(() => {
    if (!dialogVisible) {
      setIndex(0);
    }
  }, [dialogVisible]);

  const handleClose = () => {
    dispatch(toggleCreateQuizDialog(false));
    dispatch(toggleSearchSocialDialog(false));
    dispatch(toggleSearchCampfireDialog(false));
  };
  return (
    <Modal
      id="CreatQuiz"
      isVisible={dialogVisible}
      onClose={handleClose}
      modalTitle="Create Quiz"
    >
      <Quiz nextStep={nextStep} index={index} handleClose={handleClose} />
    </Modal>
  );
}
