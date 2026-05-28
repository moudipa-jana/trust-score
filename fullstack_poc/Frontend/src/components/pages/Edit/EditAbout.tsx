import React, { Dispatch, SetStateAction, useState } from 'react';

import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import validations from '@/lib/validations';
import { editProfileDetailsType } from '@/types/profile';

interface IEditAbout {
  about: string;
  setEditProfileDetails: Dispatch<SetStateAction<editProfileDetailsType>>;
}
function EditAbout({ about, setEditProfileDetails }: IEditAbout) {
  const [remainingCharCount, setRemainingCharCount] = useState(
    validations.getRemainingCharOrWordCount(about, 500),
  );
  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const descriptionVal = e.target.value;
    const charCount = validations.getRemainingCharOrWordCount(
      descriptionVal,
      500,
    );
    if (charCount >= 0) {
      setRemainingCharCount(charCount);
      if (descriptionVal.length <= 500) {
        const trimmedNameVal = descriptionVal.replace(/^\s+/, '');
        setEditProfileDetails((prevState) => {
          return {
            ...prevState,
            about: trimmedNameVal,
          };
        });
      } else {
        const trimmedNameVal = descriptionVal
          .slice(0, 500)
          .replace(/\s+(\S+)?$/, '');
        setEditProfileDetails((prevState) => {
          return {
            ...prevState,
            about: trimmedNameVal,
          };
        });
      }
    }
  };

  return (
    <div className="py-10">
      <Heading priority={2} variant>
        About
      </Heading>
      <div className="py-2">
        <Text size="sm" color="text-black-200">
          A brief description of yourself shown on your profile.
        </Text>
      </div>
      <TextArea
        placeholder="Description"
        value={about}
        onChange={handleAboutChange}
        style={{ resize: 'none', height: 120 }}
      />
      <div className="pt-2 text-right">
        <Text size="xs" color="text-gray-700">
          Max {500 - remainingCharCount}/500 characters
        </Text>
      </div>
    </div>
  );
}

export default EditAbout;
