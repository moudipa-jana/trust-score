'use client';
import { useLazyQuery } from '@apollo/client/react';
import { capitalize, debounce, toLower } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import Button from '@/components/Utility/Button';
import { ISignupState } from '@/components/Utility/Dialogs/SignupDialog';
import Dropdown, { DropdownOptionType } from '@/components/Utility/Dropdown';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import { GENDER_OPTIONS } from '@/lib/constants';
import { calculateAge, formatGraphqlError } from '@/lib/helpers';
import validations from '@/lib/validations';
import { VERIFY_ALIAS_NAME_QUERY } from '@/service/graphql/Auth';
import TextArea from '@/elements/TextArea';
import dynamic from 'next/dynamic';
import SignupHeader from './SignupHeader';

import SignupDatePicker from './SignupDatePicker';

interface CharacterProps {
  nextStep: () => void;
  setDetails: React.Dispatch<React.SetStateAction<ISignupState>>;
  back: () => void;
  SignUpData?: ISignupState;
}

interface ValidProps {
  aliasName: boolean;
  gender: DropdownOptionType | undefined;
  dob: any;
  aboutMedata: string;
  aliasError: string | undefined;
}

function isValid({
  aliasName,
  gender,
  dob,
  aboutMedata,
  aliasError,
}: ValidProps): boolean {
  if (!aliasName || !gender || !dob || aliasError) {
    return false;
  }
  return true;
}

type AvatarType = {
  id: string;
  url: string;
  slug: string;
};

function AliasDetail({
  nextStep,
  setDetails,
  back,
  SignUpData,
}: CharacterProps) {
  const [aliasName, setAliasName] = useState(SignUpData?.name || '');
  const [gender, setGender] = useState<DropdownOptionType>();
  const [characterError, setCharacterErrors] = useState<string | undefined>();
  const [remainingCharCount, setRemainingCharCount] = useState(30);
  const [dob, setDob] = useState<any>(
    SignUpData?.dateOfBirth
      ? {
        startDate: new Date(SignUpData.dateOfBirth),
        endDate: new Date(SignUpData.dateOfBirth),
      }
      : null,
  );
  const [verifyName] = useLazyQuery(VERIFY_ALIAS_NAME_QUERY);
  const [aboutMedata, setAboutME] = useState(SignUpData?.about || '');
  const [remainingDescriptionCharCount, setRemainingDescriptionCharCount] =
    useState(500);

  useEffect(() => {
    if (SignUpData?.gender) {
      const selected = GENDER_OPTIONS.find(
        (g) => g.value.toLowerCase() === SignUpData.gender.toLowerCase(),
      );
      setGender(selected);
    }
  }, [SignUpData]);

  const VerifyAliasName = useCallback(
    async (name: string) => {
      ``;
      if (name.toLowerCase().trim() != 'everyone') {
        try {
          const response = await verifyName({ variables: { name } });

          const count = (response?.data as any)?.users_aggregate?.aggregate
            ?.count;
          if (count === 0) {
            setCharacterErrors(undefined);
          } else {
            setCharacterErrors('Name already exists.');
          }
        } catch (err) {
          setCharacterErrors(capitalize(formatGraphqlError(err)));
        }
      } else {
        setCharacterErrors('Name cannot be everyone.');
      }
    },
    [verifyName],
  );

  const debounceVerifyName = useMemo(() => {
    return debounce(VerifyAliasName, 400);
  }, [VerifyAliasName]);

  const handleAliasName = (name: string) => {
    const filteredName = name.replace(/[^a-zA-Z0-9\s_-]/g, '');
    const charCount = validations.getRemainingCharOrWordCount(filteredName, 30);
    if (charCount >= 0) {
      setRemainingCharCount(charCount);
      if (name !== filteredName) {
        setCharacterErrors(
          'Only letters, numbers, spaces, underscores (_), and hyphens (-) are allowed.',
        );
      } else {
        if (
          characterError ===
          'Only letters, numbers, spaces, underscores (_), and hyphens (-) are allowed.'
        ) {
          setCharacterErrors(undefined);
        }
      }
      if (filteredName.length <= 30) {
        setAliasName(filteredName);
        if (name === filteredName) {
          debounceVerifyName(filteredName.trim());
        }
      } else {
        const truncatedName = filteredName.slice(0, 30);
        setAliasName(truncatedName);
        if (name === filteredName) {
          debounceVerifyName(truncatedName.trim());
        }
      }
    }
  };

  const handleSubmit = () => {
    setDetails((prevState: ISignupState) => ({
      ...prevState,
      gender: toLower(gender?.value as unknown as string),
      dateOfBirth: dob?.startDate,
      name: aliasName,
      about: aboutMedata,
    }));
    nextStep();
  };

  const handleDescriptionChange = (name: string) => {
    if (name.length > 500) {
      return;
    }
    setAboutME(name);
    const remainingChars = 500 - name.length;
    setRemainingDescriptionCharCount(remainingChars);
  };

  return (
    <div className="h-full p-3 alias-details-slide">
      {/* <button className="modal-back-close absolute left-3 top-0" onClick={back}>
        <svg
          width="18"
          height="17"
          viewBox="0 0 18 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.29546 0.783953C7.68887 0.396332 8.32202 0.40102 8.70964 0.794426C9.09726 1.18783 9.09257 1.82098 8.69917 2.2086L3.32881 7.5H17C17.5523 7.5 18 7.94772 18 8.5C18 9.05229 17.5523 9.5 17 9.5H3.33542L8.69917 14.7849C9.09257 15.1725 9.09726 15.8057 8.70964 16.1991C8.32202 16.5925 7.68887 16.5972 7.29546 16.2095L0.371273 9.38715C-0.125641 8.89754 -0.125641 8.09595 0.371273 7.60634L7.29546 0.783953Z"
            fill="#737373"
          />
        </svg>
      </button> */}
      <div className="">
        <SignupHeader type="signup" />

        <div className="flex items-center space-x-4 mb-1">
          <Label title="Your Alias" variant color="text-black-200 text-sm" />
          <Text size="sm" color="text-gray-700 ">
            (Avoid using your own name as alias name)
          </Text>
        </div>

        <div className=" ">
          <Input
            placeholder="Create alias name"
            required
            type="text"
            name="name"
            value={aliasName}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => handleAliasName(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          {characterError && (
            <div className="flex items-center py-2">
              <div className="mr-1 text-error">
                <FaExclamationCircle />
              </div>
              <Text color="text-error" size="sm">
                {characterError}
              </Text>
            </div>
          )}
        </div>
        <div className="justify-end pt-1 text-right">
          <Text size="xs" color="text-gray-700">
            Max {30 - remainingCharCount}/30 characters
          </Text>
        </div>
      </div>

      <div className="relative z-22 pt-3 w-full">
        <Label
          title="Date of Birth *"
          color="text-black-200 mb-1 text-sm"
          variant
        />
        <SignupDatePicker
          maxDate={new Date()}
          inputClassName="w-full border border-gray-600 rounded-sm p-2.5 h-11 text-sm text-black-200 placeholder-gray-700 focus:outline-none datepicker-icon-dark"
          value={dob}
          onChange={(newValue: any) => setDob(newValue)}
        />
        {dob !== null && (
          <div className="mt-2 text-end">
            <Text size="sm" color="text-gray-700">
              Age: {calculateAge(dob?.startDate)} years
            </Text>
          </div>
        )}
      </div>

      <div className="relative z-20 pt-4 w-full mb-3">
        <Label title="Gender *" color="text-black-200 text-sm mb-1" variant />
        <div className=" cursor-pointer">
          <Dropdown
            placeHolder="Select gender"
            options={GENDER_OPTIONS}
            defaultOption={gender}
            onChange={(val) => setGender(val as DropdownOptionType)}
          />
        </div>
      </div>

      <div className="mb-4">
        <Label title="About" color="text-black-200 text-sm mb-1" variant />
        <TextArea
          placeholder="Tell us about yourself"
          value={aboutMedata}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleDescriptionChange(e.target.value)
          }
          style={{
            height: 80,
            borderColor: 'skyBlue',
            borderRadius: 10,
          }}
        />
        <div className="text-right">
          <Text size="xs" color="text-gray-700">
            Max {500 - remainingDescriptionCharCount}/500 characters
          </Text>
        </div>
      </div>

      <div className="mt-6">
        <Button
          block
          onClick={handleSubmit}
          isdisabled={
            !isValid({
              gender: gender as DropdownOptionType,
              dob,
              aliasName:
                validations.minWordsOrChars(aliasName, false, 3) &&
                validations.isValidAliasName(aliasName),
              aboutMedata,
              aliasError: characterError,
            })
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default AliasDetail;
