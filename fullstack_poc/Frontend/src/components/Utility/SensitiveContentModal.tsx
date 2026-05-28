{
  /**
   * Modal that asks for user consent to view age-restricted content.
   * Displays a warning about NSFW and age-sensitive content.
   */
}

import { CiWarning } from 'react-icons/ci';

import Button from '@/components/Utility/Button';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';

type SensitiveContentModalProps = {
  open: boolean;
  onClose: () => void;
  onDeny: () => void;
  onConfirm: () => void;
};

export default function SensitiveContentModal({
  open,
  onClose,
  onDeny,
  onConfirm,
}: SensitiveContentModalProps) {
  return (
    <Modal id="consent-modal" isVisible={open} onClose={onClose}>
      <div className="">
        <div className="mx-14 text-center lg:mx-0">
          <Text color="text-black" size="2xl" variant font="font-medium">
            You need to be above 18 years of age
          </Text>
        </div>
        <div className="mx-4 mt-6 flex justify-center space-x-2 lg:mx-0">
          <CiWarning color="red" size={26} />
          <Text color="text-black-600" size="3xl">
            NSFW & age-sensitive content ahead, tread cautiously
          </Text>
        </div>
        <div className="mt-8 grid items-center gap-4 lg:grid-cols-2">
          <Button type="secondary" onClick={onDeny}>
            No, I&apos;m not
          </Button>
          <Button onClick={onConfirm}>Yes, I am above 18</Button>
        </div>
      </div>
    </Modal>
  );
}
