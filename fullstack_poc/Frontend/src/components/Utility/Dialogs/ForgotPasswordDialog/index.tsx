import ForgetPassword from '@/components/Signin/ForgetPassword';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleForgotPasswordDialog } from '@/state/Slices/dialog';

function ForgotPasswordDialog() {
  const dialogVisible = useAppSelector(
    (state) => state.dialog.forgotPasswordDialogOpen,
  );
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(toggleForgotPasswordDialog(false));
  };

  return (
    <Modal
      id="ForgotPasswordDialog"
      isVisible={dialogVisible}
      onClose={handleClose}
    >
      <ForgetPassword />
    </Modal>
  );
}
export default ForgotPasswordDialog;
