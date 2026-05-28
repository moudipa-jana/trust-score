import { useMutation } from '@apollo/client/react';
import { trim } from 'lodash';
import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  getWordCount,
  normalizeWhitespace,
} from '@/lib/helpers';
import { TITLE_WORD_LIMIT } from '@/lib/constants';
import validations from '@/lib/validations';
import { CREATE_ANNOUNCEMENT } from '@/service/graphql/Forum';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { updateAnnouncements } from '@/state/Slices/campfire';

import announce from '../../../../../public/images/announcee.png';

interface IAnnouncement {
  campfireId: string;
  setAnnouncementModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MakeAnnouncement = ({
  campfireId,
  setAnnouncementModal,
}: IAnnouncement) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [index, setIndex] = useState(0);
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const [hasInvalidHashtagTitle, setHasInvalidHashtagTitle] = useState(false);
  const [hasInvalidHashtagDescription, setHasInvalidHashtagDescription] =
    useState(false);

  const dispatch = useAppDispatch();

  const [submitNewAnnouncement] = useMutation(CREATE_ANNOUNCEMENT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response) => {
      dispatch(updateAnnouncements((response as any).insert_announcements_one));
      setIndex(index + 1);
    },
    onError: (err: any) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleTitleChange = (name: string) => {
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length >= TITLE_WORD_LIMIT + 1) {
      return;
    } else {
      setTitle(name);
    }
  };

  const handleDescriptionChange = (name: string) => {
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length > 500) {
      // input = words.slice(0, 500).join(' ');
      // setDescription(input);
      return;
    } else if (name.trim() === '') {
      setDescription('');
    } else {
      setDescription(name);
    }
  };

  const handleSubmit = () => {
    if (title && description && userId) {
      submitNewAnnouncement({
        variables: {
          title: normalizeWhitespace(title),
          description: normalizeWhitespace(description),
          userId,
          campfireId,
        },
      });
    } else {
      emitErrorNotification('Title and description are required.');
    }
  };

  return (
    <div>
      <Modal id="announcement" isVisible={index === 1}>
        <Success
          isActive={index === 1}
          title="Announcement added successfully"
          autoClose={() => {
            if (setAnnouncementModal) setAnnouncementModal(false);
            setIndex(0);
          }}
        />
      </Modal>
      <div>
        <div className="mb-2 flex cursor-pointer items-center space-x-2">
          <Text size="2xl" variant color="text-black">
            Make an announcement
          </Text>
          <div className="h-6 w-6">
            <CustomImage alt="announce" src={announce} />
          </div>
        </div>
        <div className="mt-6">
          <div className="flex">
            <Label title="Title" />
            <span className="relative -top-1 left-0.5 text-red-500">*</span>
          </div>
          <div className="mt-2 mb-6">
            <TagInput
              placeholder="Title"
              required="required"
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              singleLine
              setHasInvalidHashtag={setHasInvalidHashtagTitle}
            />
            <div className="mt-2 flex items-center justify-between flex-wrap">
              {/* Left */}
              <Text size="xs" color="text-gray-950">
                *Minimum three words
              </Text>

              {/* Error (will wrap if needed) */}
              {hasInvalidHashtagTitle && (
                <div className="w-full mt-1">
                  <Text size="xs" color="text-error">
                    This hashtag is disabled.
                  </Text>
                </div>
              )}

              {/* Right */}
              <Text size="xs" color="text-gray-700 ml-auto">
                {getWordCount(title)}/{TITLE_WORD_LIMIT} words max
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <div className="flex">
            <Label title="Description" />
            <span className="relative -top-1 left-0.5 text-red-500">*</span>
          </div>
        </div>
        <div className="mt-2">
          <TagInput
            placeholder="Description"
            required="required"
            value={description}
            onChange={handleDescriptionChange}
            multiLine
            fixHt
            setHasInvalidHashtag={setHasInvalidHashtagDescription}
          />
          <div className="flex w-full items-center justify-between">
            {hasInvalidHashtagDescription && (
              <Text size="xs" color="text-error">
                This hashtag is disabled.
              </Text>
            )}
            <div className="ml-auto">
              <Text size="xs" color="text-gray-700">
                {getWordCount(description)}/500 words max
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button
          type="secondary"
          block
          isdisabled={
            !validations.minWordsOrChars(title, true) ||
            hasInvalidHashtagTitle ||
            hasInvalidHashtagDescription
          }
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default MakeAnnouncement;
