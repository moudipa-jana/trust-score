{
  /**
   * Preview component displays a message input with configurable title, subtitle, and actions.
   * It handles validation and submission, with variations in layout based on the `type` prop.
   */
}
import { Dispatch, SetStateAction } from 'react';

import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import validations from '@/lib/validations';

interface IPreview {
  onCancel: () => void;
  onSend: () => void;
  btnTitle: string;
  type?: string;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  subTitle: string;
  title: string;
}

function Preview({
  onCancel,
  onSend,
  title,
  btnTitle,
  type,
  message,
  setMessage,
  subTitle,
}: IPreview) {
  const handleSubmit = () => {
    onSend();
  };
  return (
    <div className={`${type == 'user' ? 'container' : ''}`}>
      {type == 'user' ? (
        <p>Error in Preview</p>
      ) : (
        <>
          <div className="py-2 ">
            <Text size="lg" color="text-black-900">
              {title}
            </Text>
          </div>
          <Text size="base" color="text-black-900">
            {subTitle}
          </Text>
        </>
      )}
      <div className={`${type != 'user' ? 'py-4' : 'p-4'}`}>
        <TextArea
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
          style={{ resize: 'none', height: 120 }}
        />
      </div>
      {type == 'user' ? (
        <div className="flex justify-end ">
          <Button type="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <div className="ml-2">
            <Button size="md" onClick={onSend}>
              {btnTitle}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          block
          onClick={handleSubmit}
          isdisabled={!validations.isValid(message)}
        >
          {btnTitle}
        </Button>
      )}
    </div>
  );
}

export default Preview;
