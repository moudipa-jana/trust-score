import React, { MouseEvent } from 'react';

import Button from '@/components/Utility/Button';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
interface IRemoveMember {
  title: string;
  subTitle?: string;
  onCancel: () => void;
  onSend: () => void;
  onSendText?: string;
  onCancelText?: string;
}

export default function RemoveMember({
  title,
  subTitle,
  onCancel,
  onSend,
  onSendText,
  onCancelText,
}: IRemoveMember) {
  return (
    <div className="">
      <div className=" py-6 text-center">
        <Heading priority={4} color="text-black-900" font="font-medium">
          {title}
        </Heading>
        {subTitle && (
          <Text size="base" font="font-light">
            {subTitle}
          </Text>
        )}
      </div>
      <div className="  grid grid-cols-2 items-center  gap-4">
        <Button
          type="secondary"
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          {onCancelText || 'Cancel'}
        </Button>
        <Button
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            onSend();
          }}
        >
          {' '}
          {onSendText || 'send'}
        </Button>
      </div>
    </div>
  );
}
