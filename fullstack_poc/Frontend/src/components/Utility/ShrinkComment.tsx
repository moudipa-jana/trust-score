{
  /**
   * Component that displays a truncated message with an option to "Show More" or "Show Less."
   * It also includes an "edited" label if the message has been edited.
   */
}

import { useState } from 'react';

import LinkifyText from '@/components/Utility/LinkifyText';
import Text from '@/elements/Text';
import validations from '@/lib/validations';

export default function ShrinkComments({
  message,
  isEdited,
}: {
  message: string;
  isEdited?: boolean;
}) {
  const [showMore, setShowMore] = useState(true);

  if (!message) return <div />;
  if (message.split(' ').length < 50) {
    return (
      <Text customClass="whitespace-pre-line" size="md" color="text-black-200">
        <LinkifyText text={message} />
        <div>
          {isEdited && validations.checkWordLimit(message, 25) && (
            <div
              className={`mr-2 inline ${'text-sm text-gray-200 lg:text-base'} `}
            >
              (edited)
            </div>
          )}
        </div>
      </Text>
    );
  }

  return (
    <Text size="md" color="text-black-200">
      {showMore ? (
        <LinkifyText text={message.split(' ').slice(0, 25).join(' ')} />
      ) : (
        <LinkifyText text={message} />
      )}
      <span
        className=" cursor-pointer text-gray-700"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? ' ...Show More' : '    Show Less'}
      </span>
      <div>
        {isEdited && (
          <div
            className={`mr-2 inline ${'text-sm text-gray-200 lg:text-base'} `}
          >
            (edited)
          </div>
        )}
      </div>
    </Text>
  );
}
