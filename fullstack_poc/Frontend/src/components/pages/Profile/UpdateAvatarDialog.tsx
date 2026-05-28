import { get } from 'lodash';
import { useEffect, useState } from 'react';

import UpdateAvatar from '@/components/pages/Profile/UpdateAvtar';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { selectGetUserProfile } from '@/state/Slices/auth';
import { toggleUpdateAvatarDialog } from '@/state/Slices/dialog';
import { UserProfile } from '@/types/authentication';

function UpdateAvatarDialog() {
  const dialogVisible = useAppSelector(
    (state) => state.dialog.updateAvatarDialog,
  );
  const profile = useAppSelector(selectGetUserProfile) as UserProfile;
  const dispatch = useAppDispatch();
  const [index, setIndex] = useState(0);
  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  useEffect(() => {
    if (!dialogVisible) {
      setTimeout(() => {
        setIndex(0);
      }, 300);
    }
  }, [dialogVisible]);
  const handleClose = () => {
    dispatch(toggleUpdateAvatarDialog(false));
  };

  return (
    <Modal id="UpdateAvatar" isVisible={dialogVisible} onClose={handleClose}>
      <SwipeableViews index={index} disabled>
        <UpdateAvatar
          nextStep={nextStep}
          defaultAvatar={get(profile, 'profilePicture', '')}
        />
        <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
          <Success
            title="Profile Updated Successfully"
            isActive={index === 1}
            autoClose={handleClose}
          />
        </div>
      </SwipeableViews>
    </Modal>
  );
}
export default UpdateAvatarDialog;
