import { useRouter } from 'next/router';
import { useState } from 'react';

import { logoutForum } from '@/actions/auth';
import PasswordConfirmation from '@/components/DeleteAccount/PasswordConfirmation';
import AccountPrivacy from '@/components/DeleteAccount/AccountPrivacy';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleDeleteAccountDialog } from '@/state/Slices/dialog';

function DeleteAccountDialog() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dialogVisible = useAppSelector(
    (state) => state.dialog.deleteAccountDialogOpen,
  );
  const userSelection = useAppSelector(
    (state) => state.dialog.accountActionType,
  );
  const [index, setIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const nextStep = (enteredPassword?: string) => {
    if (enteredPassword) {
      setPassword(enteredPassword);
      setShowPrivacyModal(true);
      return;
    }
    setIndex((prevIndex) => prevIndex + 1);
  };

  const handleClose = () => {
    dispatch(toggleDeleteAccountDialog(false));
    setIndex(0);
  };

  const handleDeleteComplete = () => {
    handleClose();
    router.push('/').then(() => {
      dispatch(logoutForum());
    });
  };

  return (
    <Modal
      id="DeleteAccountDialog"
      isVisible={dialogVisible}
      onClose={handleClose}
      backIcon={index > 0}
      onBack={() => setIndex((prev) => prev - 1)}
      isDeleteAccountModal={true}
    >
      <div className="relative w-full">
        <SwipeableViews
          index={index}
          disabled
          style={{
            width: '100%',
          }}
        >
          <div className=" w-full">
            <PasswordConfirmation
              nextStep={nextStep}
              onClose={handleClose}
              userSelection={userSelection}
            />
          </div>
          <div className=" w-full px-4 lg:px-8">
            <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
              <Success
                delay={2000}
                isActive={index === 1}
                autoClose={handleDeleteComplete}
                title={`Your account has been ${userSelection === 'deactivate' ? 'deactivated' : 'deleted'
                  } successfully!`}
              />
            </div>
          </div>
        </SwipeableViews>

        {showPrivacyModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-opacity-20 backdrop-blur-md">
            <div className="w-full max-w-sm px-4">
              <AccountPrivacy
                nextStep={() => {
                  setShowPrivacyModal(false);
                  setIndex(1);
                }}
                password={password}
                userSelection={userSelection}
                onClose={() => setShowPrivacyModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
export default DeleteAccountDialog;
