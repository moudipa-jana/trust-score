import { useEffect, useState } from 'react';
import AskQuestion from '@/components/pages/Forum/question';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleAskQuestionDialog, toggleAskQuestionPollDialog, toggleSearchCampfireDialog, toggleSearchSocialDialog } from '@/state/Slices/dialog';

const TOTAL_STEPS = 4;

function AskQuestionDialog() {
  const dispatch = useAppDispatch();
  const dialogVisible = useAppSelector((state) => state.dialog.askQuestionDialogOpen);
  const pollDialogVisible = useAppSelector((state) => state.dialog.askQuestionPollDialogOpen);
  const [index, setIndex] = useState(0);
  const [isQuestion, setIsQuestion] = useState(true);

  useEffect(() => {
    if (!dialogVisible || !pollDialogVisible) {
      setIndex(0);
    }
    if (pollDialogVisible || dialogVisible) {
      setIsQuestion(dialogVisible ? true : false);
    }
  }, [dialogVisible, pollDialogVisible]);
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const goBack = () => setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));

  const handleClose = () => {
    dispatch(toggleAskQuestionDialog(false));
    dispatch(toggleAskQuestionPollDialog(false));
    dispatch(toggleSearchSocialDialog(false));
    dispatch(toggleSearchCampfireDialog(false));
  };

  return (
    <Modal
      id="AskQuestion"
      isVisible={dialogVisible || pollDialogVisible}
      backIcon={index > 0 && index !== TOTAL_STEPS - 1}
      onBack={goBack}
      onClose={handleClose}
      modalTitle={isQuestion ? 'Ask a question' : 'Create a poll'}
      modalClassName='ask-question-modal'
    >
      <AskQuestion
        nextStep={nextStep}
        index={index}
        handleClose={handleClose}
        toggleStatus={!isQuestion}
        togglePollSection={(e: boolean) => { setIsQuestion(!e); }}
      />
    </Modal>
  );
}
export default AskQuestionDialog;
