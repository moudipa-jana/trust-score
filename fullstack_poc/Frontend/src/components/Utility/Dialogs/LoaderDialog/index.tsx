import { useEffect, useState } from 'react';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import EventEmitter from '@/lib/eventEmitter';

export default function LoaderDialog() {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const handleToggleLoader = ({ isVisible }: { isVisible: boolean }) => {
      setShowLoader(isVisible);
    };
    EventEmitter.on('toggleLoader', handleToggleLoader);
    return () => {
      EventEmitter.removeListener('toggleLoader', handleToggleLoader);
    };
  }, []);
  return (
    <Modal id="LoaderDialog" isVisible={showLoader} bgTransparent>
      <div className=" relative inset-1/4 h-1/2 w-1/2 ">
        <TabletLoader />
      </div>
    </Modal>
  );
}
