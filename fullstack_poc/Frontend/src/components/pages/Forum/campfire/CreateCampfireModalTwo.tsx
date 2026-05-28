import { useMutation, useQuery } from '@apollo/client/react';
import { trim } from 'lodash';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Checkbox from 'react-custom-checkbox';
import * as Icon from 'react-icons/fi';

import social from '/public/images/o-logo.svg';
import PrivateCampfire from '/public/images/privateCampfire.svg';
import PublicCampfire from '/public/images/publicCampfire.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  normalizeWhitespace,
} from '@/lib/helpers';
import {
  ADD_CAMPFIRE_GENERAL_SETTINGS,
  CREATE_CAMPFIRE_MUTATION,
  FETCH_CAMPFIRE_AVATARS,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';

interface CreateCampfireModalTwoProps {
  campfireName: string;
  description: string;
  category: string;
  coverImage: string;
  onClose: () => void;
}

interface CampfireAvatar {
  id: string;
  url: string;
  key: string;
}

const CreateCampfireModalTwo = ({
  campfireName,
  description,
  category,
  coverImage,
  onClose,
}: CreateCampfireModalTwoProps) => {
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [campfireAvatar, setCampfireAvatar] = useState<string>('');

  const handleCheckboxChange = () => {
    setIsPublic((prevIsPublic) => !prevIsPublic);
  };

  const token = useAppSelector(selectGetToken);
  const router = useRouter();
  const isMobile = useIsMobile();
  const isIpad = useIsipad();
  const isDesktop = useIsDesktop();
  const userId = useAppSelector(getUserId);

  const [addCampfireGeneralSettings] = useMutation(
    ADD_CAMPFIRE_GENERAL_SETTINGS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: () => {
        emitNotification('success', 'Campfire created successfully!');
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [createCampfire, { loading }] = useMutation(CREATE_CAMPFIRE_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response: any) => {
      onClose();
      const data = response.insert_campfires_one;
      router.push(`/campfire/${encodeURIComponent(data.title)}`);
      addCampfireGeneralSettings({
        variables: {
          send_welcome_message: true,
          welcome_message: 'Welcome to the campfire!',
          campfire_id: data.id,
          user_id: userId,
        },
      });
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const {
    data,
    loading: avatarLoading,
    error,
  } = useQuery(FETCH_CAMPFIRE_AVATARS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    skip: token === '',
  });

  const handleBuildCampfire = () => {
    if (token) {
      if (campfireAvatar !== '') {
        createCampfire({
          variables: {
            title: normalizeWhitespace(campfireName),
            description: normalizeWhitespace(description),
            categoryId: category,
            is_public: isPublic,
            avatarUrl: campfireAvatar,
            coverPicture: coverImage,
          },
        });
      } else {
        emitErrorNotification('Please select a campfire avatar');
      }
    } else {
      emitErrorNotification('Login to create a campfire');
    }
  };

  return (
    <div>
      <div className="relative z-20 pt-4">
        <div
          className={` ${isMobile ? 'mt-3' : ''
            } animated fadeIn faster campfire-modal`}
        >
          <Heading priority={3} variant="default" font="font-medium">
            Create a Campfire
          </Heading>

          <div className="pb-2">
            <Text size="base" font="font-light">
              Be unique and let the healthy times roll!
            </Text>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'mt-10 mb-20' : isIpad ? 'my-5' : ''}`}>
        <Text size="3xl" font="font-medium">
          Select your avatar for your campfire
        </Text>
        {error && (
          <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
            <Text size="base">
              Oops, something went wrong while fetching Avatars.
            </Text>
          </div>
        )}
        {avatarLoading && !error ? (
          <div className="scrollbar flex h-[12rem] flex-col items-center justify-center ">
            <div className="pulse">
              <div className="relative h-[101px] w-[158px] cursor-pointer ">
                <CustomImage src={social} />
              </div>
            </div>
            <p className="pt-4 text-sm text-gray-700">
              Please wait while we load campfire avatars
            </p>
          </div>
        ) : (
          <div className={`${isMobile || isIpad ? 'overflow-scroll' : ''}`}>
            <div
              className={`gap-8 py-4 px-3 ${isMobile || isIpad
                ? 'flex w-max flex-row overflow-hidden'
                : 'grid grid-cols-6'
                }`}
            >
              {(data as any)?.campfire_avatars?.map(
                (avatar: CampfireAvatar) => {
                  return (
                    <div
                      key={avatar.id}
                      className={`cursor-pointer rounded-full  ${avatar.url === campfireAvatar ? 'av-selcted' : ''
                        }`}
                      onClick={() => setCampfireAvatar(avatar.url)}
                    >
                      <CustomImage
                        key={avatar.id}
                        src={avatar.url}
                        height={100}
                        width={93}
                        alt={avatar.key}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`w-full ${isDesktop ? 'mt-8' : 'mt-1'}`}>
        <Text size="lg" font="font-regular">
          {/* Choose the campfire type */}
        </Text>
        <div>
          {/* 
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={isPublic}
                onChange={handleCheckboxChange}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />

              <div className="mx-2 h-4 w-4">
                <CustomImage src={PublicCampfire} />
              </div>
              <span className="mr-2 text-sm">Public</span>
              <Text size="xs" color="text-gray-500">
                Anyone can view, post, and comment to this community
              </Text>
            </label>
          </div> */}
          {/* 
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={!isPublic}
                onChange={handleCheckboxChange}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />
              <div className="mx-2 h-4 w-4">
                <CustomImage src={PrivateCampfire} />
              </div>
              <span className="mr-2 text-sm">Private</span>
              <Text size="xs" color="text-gray-500">
                Only approved users can view and submit to this community
              </Text>
            </label>
          </div> */}
        </div>
        <div className="my-2 flex pb-10">
          <Text size="sm" color="text-red-600">
            *
          </Text>
          <Text size="xs" color="text-gray-500">
            any interaction or conversation occurring within a Campfire group
            will not be accessible outside the given group, the link or
            crossposting of the link elsewhere will not be functional whatsoever
            other than the origin Campfire itself
          </Text>
        </div>
      </div>

      <div className="absolute bottom-0 flex w-full items-end">
        <Button
          type="primary"
          block
          isdisabled={
            campfireName.trim().length === 0 || !category || !campfireAvatar
          }
          onClick={handleBuildCampfire}
          isLoading={loading}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default CreateCampfireModalTwo;
