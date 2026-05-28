import React, { useEffect } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

import Text from '@/elements/Text';

export default function FlagWarning() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg bg-warning py-5 px-6"
    >
      <div className=" flex  items-center gap-4">
        <div className="mr-4 text-error lg:mr-2">
          <FaExclamationCircle className="text-2xl" />
        </div>
        <Text>
          The flag has been reported and they would be intimated that their flag
          would be reviewed by the Kofuku moderators and they would be informed
          about the decision.
        </Text>
      </div>
    </div>
  );
}
