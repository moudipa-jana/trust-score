import { useQuery } from '@apollo/client/react';
import React, { useState } from 'react';

import social from '/public/images/o-logo.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useAppDispatch } from '@/Hooks/useRedux';
import { FALLBACK_AVATARS } from '@/lib/constants';
import { emitErrorNotification } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import { GET_AVATARS, UPDATE_USER_AVATAR } from '@/service/graphql/Auth';
import { updateUserProfilePicture } from '@/state/Slices/auth';

type AvatarType = {
  id: string;
  url: string;
  slug: string;
};

interface IProps {
  nextStep: () => void;
  defaultAvatar: string;
}

function UpdateAvatar({ nextStep, defaultAvatar }: IProps) {
  const [avatarUrl, setAvatar] = useState<string>(defaultAvatar);
  const dispatch = useAppDispatch();
  const {
    data,
    loading: avatarLoading,
    error: avatarError,
  } = useQuery(GET_AVATARS);
  const {
    mutationFunction: updateUserAvatar,
    loading,
    userId,
  } = useAuthMutation(
    UPDATE_USER_AVATAR,
    (res: { update_users_by_pk: { profilePicture: string } }) => {
      dispatch(
        updateUserProfilePicture({
          profilePicture: res.update_users_by_pk.profilePicture,
        }),
      );
      nextStep();
    },
  );
  const handleSubmit = () => {
    try {
      updateUserAvatar({
        variables: {
          userId,
          profilePicture: avatarUrl,
        },
      });
    } catch (err) {
      captureSentryException(err);
      emitErrorNotification();
    }
  };

  return (
    <div className="h-full p-3">
      <div className=" pt-6 ">
        <Label
          title="Select your Profile Picture"
          color="text-black-200"
          variant
        />
        {avatarError && (
          <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
            <Text size="base">
              Oops, something went wrong while fetching Avatars.
            </Text>
          </div>
        )}
        {avatarLoading && !avatarError ? (
          <div className="scrollbar flex h-[12rem] flex-col items-center justify-center ">
            <div className="pulse">
              <div className="relative h-[101px] w-[158px] cursor-pointer ">
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
            ).map((avatar) => {
              return (
                <div
                  key={avatar.id}
                  className={`relative mx-2 mr-2 h-[70px] w-[70px] cursor-pointer  rounded-full ${
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
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-6">
        <Button
          type="secondary"
          block
          onClick={handleSubmit}
          isLoading={loading}
        >
          Update Profile Picture
        </Button>
      </div>
    </div>
  );
}

export default UpdateAvatar;
