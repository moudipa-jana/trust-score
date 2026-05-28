import { useMutation } from '@apollo/client/react';
import { get } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CategorySignup from '@/components/Signup/CategorySignup';
import Character from '@/components/Signup/Character';
import Loading from '@/components/Signup/Loading';
import Button from '@/components/Utility/Button';
import { ISignupState } from '@/components/Utility/Dialogs/SignupDialog';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import { UPDATE_USER_PROFILE } from '@/service/graphql/Auth';
import { RootState } from '@/state/reducers';
import { selectGetToken, setUserProfile } from '@/state/Slices/auth';
import { toggleUpdateProfileDialog } from '@/state/Slices/dialog';

function UpdateProfileDialog() {
  const dialogVisible = useAppSelector(
    (state) => state.dialog.updateDialogOpen,
  );
  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState({
    name: '',
    gender: '',
    profilePicture: '',
  });
  const userId = useAppSelector((state: RootState) => state.auth.profile?.id);
  const maxIndex = 3; // Number of steps - 1
  const nextStep = () =>
    setIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
  const goBack = () => setIndex((prevIndex) => prevIndex - 1);
  const [areaOfInterests, setInterest] = useState<number[]>([]);

  const resetState = () => {
    setIndex(0);
    setDetails({
      name: '',
      gender: '',
      profilePicture: '',
    });
    setInterest([]);
  };
  useEffect(() => {
    if (!dialogVisible) {
      setTimeout(() => {
        resetState();
      }, 300);
    }
  }, [dialogVisible]);
  const handleClose = () => {
    dispatch(toggleUpdateProfileDialog(false));
  };
  const [updateUserProfile, { error: updateError, loading, data: updateData }] =
    useMutation(UPDATE_USER_PROFILE, {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

  // Handle update completion
  useEffect(() => {
    if (updateData) {
      const profile = get(updateData, 'update_users_by_pk');
      if (profile) {
        dispatch(setUserProfile(profile));
        nextStep();
      } else {
        emitErrorNotification();
      }
    }
  }, [updateData, dispatch]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      emitErrorNotification(formatGraphqlError(updateError));
    }
  }, [updateError]);

  const handleSubmit = (skip = false) => {
    const valuesToSubmit = {
      ...details,
      userId,
      areaOfInterests: skip
        ? []
        : areaOfInterests.map((ele) => ({ categoryId: ele })),
    };
    try {
      if (valuesToSubmit?.name?.toLocaleLowerCase().trim() !== 'everyone')
        updateUserProfile({ variables: valuesToSubmit });
      else {
        emitErrorNotification("Everyone can't be an alias name");
      }
    } catch (err) {
      captureSentryException(err);
      emitErrorNotification();
    }
  };

  return (
    <Modal
      id="Update Profile"
      isVisible={dialogVisible}
      backIcon={index === 1}
      onBack={goBack}
    >
      <div className={index === 3 ? 'limit-swipeable' : ''}>
        <SwipeableViews index={index} disabled>
          <Character
            nextStep={nextStep}
            setDetails={
              setDetails as unknown as Dispatch<SetStateAction<ISignupState>>
            }
          />
          <CategorySignup
            handleSubmit={handleSubmit}
            submitLoading={loading}
            interest={areaOfInterests as unknown as string[]}
            setInterest={
              setInterest as unknown as Dispatch<SetStateAction<string[]>>
            }
            updateError={
              (updateError as any)?.graphQLErrors?.[0]?.message || ''
            }
          />
          <Loading nextStep={nextStep} isVisible={index === 2} />
          <div className="-mt-8 flex h-full flex-col items-center justify-center p-3">
            <Success
              isActive={index === 3}
              title="Account created successfully"
              buttonComponent={
                <div className="pt-6">
                  <Button type="secondary" block onClick={handleClose}>
                    Close
                  </Button>
                </div>
              }
            />
          </div>
        </SwipeableViews>
      </div>
    </Modal>
  );
}
export default UpdateProfileDialog;
