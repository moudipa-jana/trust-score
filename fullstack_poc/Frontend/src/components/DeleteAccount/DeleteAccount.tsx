/**
 * DeleteAccount component allows users to select between deactivating or deleting their account.
 * It provides two radio options with descriptions for each action and a "Continue" button to proceed.
 * The user's selection is stored in the `userSelection` state, and `nextStep` is called when the button is clicked.
 */

import React, { Dispatch, SetStateAction, useState } from 'react';

import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Input from '@/elements/Input';
import Text from '@/elements/Text';

interface IProps {
  nextStep: () => void;
  setUserSelection: Dispatch<SetStateAction<string>>;
}

const DeleteAccount = ({ nextStep, setUserSelection }: IProps) => {
  const [deactivateChecked, setDeactivateChecked] = useState(false);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const handleDeactivateRadioChange = () => {
    setDeactivateChecked(true);
    setDeleteChecked(false);
    setUserSelection('deactivate');
  };

  const handleDeleteRadioChange = () => {
    setDeleteChecked(true);
    setDeactivateChecked(false);
    setUserSelection('delete');
  };
  return (
    <div>
      <div className="text-center">
        <Heading priority={2} variant font="font-bold" color="text-black-500">
          Deactivate/ Delete account
        </Heading>
      </div>
      <div
        className="mt-8 cursor-pointer rounded-lg border border-primary py-2 px-4"
        onClick={handleDeactivateRadioChange}
      >
        <div className="flex items-center">
          <div className="mt-2">
            <Input
              type="radio"
              checked={deactivateChecked}
              className="h-5 w-5 checked:bg-primary"
            />
          </div>
          <div className="ml-5">
            <Text size="md" color="text-black-200" font="font-semibold">
              Deactivate my account
            </Text>
          </div>
        </div>
        <div className="mt-2">
          <Text size="md" font="font-normal" color="text-black-1050">
            The contents of your profile and all your activities will be hidden
            if you deactivate your account temporarily. Your account will be
            permanently deleted unless restored within 30 days of deactivation.
          </Text>
        </div>
      </div>
      <div
        className="mt-8 cursor-pointer rounded-lg border border-primary py-2 px-4"
        onClick={handleDeleteRadioChange}
      >
        <div className="flex items-center">
          <div className="mt-2">
            <Input
              type="radio"
              checked={deleteChecked}
              className="h-5 w-5 checked:bg-primary "
            />
          </div>
          <div className="ml-5">
            <Text size="md" color="text-black-200" font="font-semibold">
              Delete my account
            </Text>
          </div>
        </div>
        <div className="mt-2">
          <Text size="md" font="font-normal" color="text-black-1050">
            You will permanently lose all of your profile information, comments,
            likes, and followers when your account is deleted.
          </Text>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button
          size="lg"
          type={deactivateChecked && deleteChecked ? 'light' : ''}
          isdisabled={!deactivateChecked && !deleteChecked}
          onClick={() => nextStep()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default DeleteAccount;
