import React, { useState } from 'react';
import { AiOutlineSend } from 'react-icons/ai';

import userImage from '/public/images/userImage.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Input from '@/elements/Input';

function CommentBox() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex items-center justify-between py-2">
      <div className="relative mr-2 h-10 w-10 rounded-full">
        <CustomImage src={userImage} />
      </div>
      <Input
        placeholder="Add comment"
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => setInputValue(e.target.value)}
        rounded
        type="text"
        name="name"
        dark
      />
      <div className="flex px-2">
        <Button type={inputValue.length > 0 ? '' : 'light'}>
          <AiOutlineSend className="text-xl text-white" />
        </Button>
      </div>
    </div>
  );
}

export default CommentBox;
