import React from 'react';

import ShareCampfire from '@/components/pages/Campfire/ShareCampfireFlow/ShareCampfire';
import Success from '@/components/Utility/Success';

interface ShareCampfireFlowProps {
  setShareSteps: (newStep: number) => void;
  shareSteps: number;
  campfireId: string;
  onModalClose: () => void;
}

export default function ShareCampfireFlow({
  setShareSteps,
  shareSteps,
  campfireId,
  onModalClose,
}: ShareCampfireFlowProps) {
  if (shareSteps == 0) {
    return (
      <ShareCampfire
        setShareSteps={setShareSteps}
        campfireId={campfireId}
        onCancel={onModalClose}
      />
    );
  }
  if (shareSteps == 1) {
    return (
      <Success
        title="Your Campfire has been shared successfully"
        isActive
        autoClose={onModalClose}
      />
    );
  }
  return <div>index</div>;
}
