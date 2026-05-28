import SigninModal from '@/components/Signin';
import Modal from '@/components/Utility/Modal';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleLoginDialog } from '@/state/Slices/dialog';

function LoginDialog() {
  const dialogVisible = useAppSelector((state) => state.dialog.loginDialogOpen);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(toggleLoginDialog(false));
  };

  return (
    <Modal
      id="LoginDialog"
      isVisible={dialogVisible}
      onClose={handleClose}
      modalClassName="signup-dialog"
    >
      <SigninModal />
    </Modal>
  );
}
export default LoginDialog;
