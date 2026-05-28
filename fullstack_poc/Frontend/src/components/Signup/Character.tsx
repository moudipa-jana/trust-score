/**
 * Character component allows users to set up their alias name, gender, and avatar for their profile.
 * It includes a form for creating an alias name with validation, a dropdown for selecting gender,
 * and a selection of avatars fetched from a GraphQL query.
 */
'use client';
import { useLazyQuery } from '@apollo/client/react';
import React, { useEffect, useState } from 'react';
import social from '/public/images/o-logo.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import { ISignupState } from '@/components/Utility/Dialogs/SignupDialog';
import Label from '@/elements/Label';
import { FALLBACK_AVATARS } from '@/lib/constants';
import { GET_AVATARS } from '@/service/graphql/Auth';
import dynamic from 'next/dynamic';
import SignupHeader from './SignupHeader';
const Datepicker = dynamic(() => import('react-tailwindcss-datepicker'), {
  ssr: false,
});

interface CharacterProps {
  nextStep: () => void;
  setDetails: React.Dispatch<React.SetStateAction<ISignupState>>;
  back?: () => void;
  SignUpData?: ISignupState;
}

interface ValidProps {
  avatarUrl: string | undefined;
}

function isValid({ avatarUrl }: ValidProps): boolean {
  if (!avatarUrl) {
    return false;
  }
  return true;
}

type AvatarType = {
  id: string;
  url: string;
  slug: string;
};

function Character({ nextStep, setDetails, back, SignUpData }: CharacterProps) {
  const [avatarUrl, setAvatar] = useState<string>(
    SignUpData?.profilePicture || '',
  );
  const [fetchAvatars, { data, loading: avatarLoading }] =
    useLazyQuery(GET_AVATARS);

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const handleSubmit = () => {
    setDetails((prevState: ISignupState) => ({
      ...prevState,
      profilePicture: avatarUrl ?? '',
    }));
    nextStep();
  };

  return (
    <div className="h-full ">
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
      <SignupHeader type="signup" />
      <div className="">
        <Label
          title="Select your Avatar"
          color="text-black-200 text-md mb-1"
          variant
        />
        {avatarLoading ? (
          <div className="scrollbar scrollbarLoading">
            <div className="pulse">
              <div className="relative h-[101px] w-[158px] cursor-pointer">
                <CustomImage src={social} />
              </div>
            </div>
            <p className="pt-4 text-sm text-gray-700">
              Please wait while we load your avatars
            </p>
          </div>
        ) : (
          <div className="scrollbar scrollbarAvatars">
            {(
              ((data as any)?.avatars as AvatarType[]) ||
              (FALLBACK_AVATARS as AvatarType[])
            ).map((avatar) => (
              <div
                key={avatar.id}
                className={`relative mx-2 mr-2 h-[70px] w-[70px] cursor-pointer rounded-full ${
                  avatar.url === avatarUrl ? 'av-selcted' : ''
                }`}
                onClick={() => setAvatar(avatar.url)}
              >
                <CustomImage
                  src={avatar.url}
                  width={20}
                  height={20}
                  alt={avatar.slug}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          block
          onClick={handleSubmit}
          isdisabled={
            !isValid({
              avatarUrl,
            })
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Character;
