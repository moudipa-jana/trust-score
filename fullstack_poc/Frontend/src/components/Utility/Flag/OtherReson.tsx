import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import { MAX_WORD_LIMIT } from '@/lib/constants';
import validations from '@/lib/validations';

interface OtherResonProps {
  handleSumbit: (message?: string) => void;
}

export default function OtherReson({ handleSumbit }: OtherResonProps) {
  const [message, setMessage] = useState('');
  const [remainingCharCount, setRemainingCharCount] = useState(MAX_WORD_LIMIT);
  function handleChange(value: string) {
    const charCount = validations.getRemainingCharOrWordCount(
      value,
      MAX_WORD_LIMIT,
    );
    if (charCount >= 0) {
      setRemainingCharCount(charCount);
      if (value.length <= MAX_WORD_LIMIT) {
        const trimmedNameVal = value.replace(/^\s+/, '');
        setMessage(trimmedNameVal);
      } else {
        const trimmedNameVal = value
          .slice(0, MAX_WORD_LIMIT)
          .replace(/\s+(\S+)?$/, '');
        setMessage(trimmedNameVal);
      }
    }
  }
  return (
    <div onClick={(e) => e.stopPropagation()} className="py-2">
      <div className="py-2">
        <Text size="base" color="text-black-900">
          Help us understand the problem
        </Text>
      </div>
      <Input
        onClick={(e) => e.stopPropagation()}
        type="text"
        value={message}
        placeholder="Reason of your report"
        onChange={(event) => {
          event.stopPropagation();
          handleChange(event.target.value);
        }}
      />
      <div className="pt-2 text-right">
        <Text size="xs" color="text-gray-700">
          {remainingCharCount} characters remaining
        </Text>
      </div>
      <div className="pt-20">
        <Button
          block
          isdisabled={!validations.isValid(message)}
          onClick={(e) => {
            e.stopPropagation();
            handleSumbit(message.trim());
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
