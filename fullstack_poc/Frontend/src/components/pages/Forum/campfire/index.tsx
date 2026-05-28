import { useEffect } from 'react';

import CreateCampfire from '@/components/pages/Forum/campfire/CreateCampfire';
import JoinCampfire from '@/components/pages/Forum/campfire/JoinCampfire';
import Welcome from '@/components/pages/Forum/campfire/Welcome';

interface CampfireModalsProps {
  setBackIcon?: (isVisible: boolean) => void;
  formSteps: number;
  setFormSteps?: (newStep: number) => void;
  swipeableIndex?: number;
  nextStep?: () => void;
  onClose?: () => void;
}

function CampfireModals({
  setBackIcon,
  formSteps,
  setFormSteps,
  swipeableIndex,
  nextStep,
  onClose,
}: CampfireModalsProps) {
  useEffect(() => {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      const hasCampfireModal = wrapper.querySelector('.campfire-modal');
      if (hasCampfireModal) {
        wrapper.classList.add('campfire');
      }
    }
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById('campmodal');
    if (wrapper) {
      const hasCampfireModal = wrapper.querySelector('.campfire-modal');
      if (hasCampfireModal) {
        wrapper.classList.add('campfire');
      }
    }
  }, [formSteps]);

  if (formSteps === 0 && setFormSteps) {
    return <Welcome setFormSteps={setFormSteps} />;
  }
  if (formSteps === 1) {
    setBackIcon?.(true);
    return (
      <CreateCampfire
        swipeableIndex={swipeableIndex as number}
        nextStep={nextStep as () => void}
        onClose={onClose as () => void}
      />
    );
  }
  if (formSteps === 2) {
    setBackIcon?.(true);
    return <JoinCampfire onClose={onClose as () => void} />;
  }
  return <h1>Not Found</h1>;
}

export default CampfireModals;
