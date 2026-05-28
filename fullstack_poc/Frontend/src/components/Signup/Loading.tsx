import { useEffect } from 'react';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';

export default function Loading({
  nextStep,
  isVisible,
  message = 'Please wait while we set up your account!',
}: {
  nextStep: () => void;
  isVisible?: boolean;
  message?: string;
}) {
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        nextStep();
      }, 2500);
    }
  }, [isVisible, nextStep]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-3 mt-4">
      {isVisible && <TabletLoader />}
      <p className="mt-8">{message}</p>
    </div>
  );
}
