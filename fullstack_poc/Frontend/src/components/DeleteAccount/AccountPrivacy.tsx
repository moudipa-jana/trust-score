import { useMutation } from '@apollo/client/react';
import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { DEACTIVTE_PROFILE, DELETE_PROFILE } from '@/service/graphql/Profile';
import { selectGetToken } from '@/state/Slices/auth';

interface IProps {
  nextStep: () => void;
  password?: string;
  userSelection?: 'delete' | 'deactivate' | null;
  onClose?: () => void;
}

const AccountPrivacy = ({ nextStep, password, userSelection, onClose }: IProps) => {
  const [loader, setLoader] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const token = useAppSelector(selectGetToken);

  const [deleteProfile] = useMutation(DELETE_PROFILE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (res: any) => {
      setLoader(false);
      if (res.deleteAccount.success) {
        nextStep();
      } else {
        emitErrorNotification(res.deleteAccount.message);
      }
    },
    onError: (err) => {
      setLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [deactivateAccount] = useMutation(DEACTIVTE_PROFILE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (res: any) => {
      setLoader(false);
      if (res.deactivateUser.success) {
        nextStep();
      } else {
        emitErrorNotification(res.deactivateUser.message);
      }
    },
    onError: (err) => {
      setLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleDelete = () => {
    setLoader(true);
    if (userSelection === 'deactivate') {
      deactivateAccount({ variables: { password } });
    } else {
      deleteProfile({ variables: { password } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-black transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="currentColor" />
        </svg>
      </button>

      <div className="mb-6 mt-2">
        <Heading priority={3} variant font="font-semibold" color="text-black-900" customClass="text-xl">
          Account Privacy
        </Heading>
      </div>

      {!showFinalConfirmation ? (
        <>
          <div className="mb-8 text-center px-2">
            <Text size="sm" color="text-black-400" font="font-normal" customClass="leading-relaxed opacity-80">
              {userSelection === 'deactivate'
                ? 'The contents of your profile and all your activities will be hidden if you deactivate your account temporarily. Your account will be permanently deleted unless restored within 30 days of deactivation.'
                : 'Deleting your account will remove all your content and activities and you will not be able to retrieve them back'}
            </Text>
          </div>

          <div className="w-full">
            <Button
              type="primary"
              size="lg"
              block
              roundedlg
              onClick={() => setShowFinalConfirmation(true)}
            >
              {userSelection === 'deactivate' ? 'Deactivate my account' : 'Delete my account'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 text-center px-2">
            <Text size="sm" color="text-black-400" font="font-normal" customClass="leading-relaxed opacity-80">
              Sad to see you go
            </Text>
          </div>

          <div className="w-full flex flex-col gap-4">
            <Button
              type="bgRed"
              size="lg"
              block
              roundedlg
              onClick={onClose}
            >
              No thank you
            </Button>
            <Button
              type="borderRed"
              size="lg"
              block
              roundedlg
              isLoading={loader}
              onClick={handleDelete}
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountPrivacy;
