import { useMutation } from '@apollo/client/react';
import { trim } from 'lodash';
import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  getWordCount,
} from '@/lib/helpers';
import validations from '@/lib/validations';
import { SHARE_CAMPFIRE_MUTATION } from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';

interface ShareCampfireFlowProps {
  setShareSteps: (step: number) => void;
  campfireId: string;
  onCancel: () => void;
}

export default function ShareCampfire({
  setShareSteps,
  campfireId,
  onCancel,
}: ShareCampfireFlowProps) {
  const { token } = useAppSelector((state) => ({
    token: state.auth.token,
  }));
  const userId = useAppSelector(getUserId);
  const [message, setMessage] = useState(
    'I have created a new Campfire just now! Would you like to hop in?',
  );
  const [shareCampfire] = useMutation(SHARE_CAMPFIRE_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      setShareSteps(1);
    },
    onError: (err) => {
      if (formatGraphqlError(err)?.includes('Uniqueness violation.')) {
        emitErrorNotification('You have already shared this campfire.');
      } else {
        emitErrorNotification(formatGraphqlError(err));
      }
    },
  });

  const handleShareCampfire = () => {
    shareCampfire({
      variables: {
        userId: userId,
        campfireId: campfireId,
        message: message,
      },
    });
  };

  const handleDescriptionChange = (e: { target: { value: string } }) => {
    setMessage(e.target.value);
    const name = e.target.value;
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length > 500) {
      // input = words.slice(0, 500).join(' ');
      // setMessage(input);
      return;
    } else {
      setMessage(name);
    }
  };

  return (
    <div>
      <Heading priority="4" color="text-black-900" font="font-medium">
        Share Your Campfire
      </Heading>
      <div className="py-8">
        <div className=" flex items-center pb-2">
          <Text size="sm" color="text-black-200" font="font-normal">
            Description
          </Text>
          <div className="ml-1">
            <Text size="sm" font="font-normal" color="text-gray-950">
              {' '}
              (Optional)
            </Text>
          </div>
        </div>
        <TextArea
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleDescriptionChange(e)
          }
        />
        <div className=" pt-2 text-right">
          <Text size="sm" color="text-offwhite-900" font="font-normal">
            {getWordCount(message)}/500 words max
          </Text>
        </div>
      </div>
      <div className=" flex items-center justify-between gap-4">
        <Button block type="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          isdisabled={!validations.minWordsOrChars(message, true)}
          block
          onClick={handleShareCampfire}
        >
          Share
        </Button>
      </div>
    </div>
  );
}
