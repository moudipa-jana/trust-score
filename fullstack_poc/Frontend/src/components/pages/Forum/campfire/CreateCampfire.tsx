import { useState } from 'react';

import CreateCampfireModalOne from '@/components/pages/Forum/campfire/CreateCampfireModalOne';
import CreateCampfireModalTwo from '@/components/pages/Forum/campfire/CreateCampfireModalTwo';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import CamfireCoverImageModal from '@/components/pages/Campfire/OtherCampfire/CamfireCoverImageModal';

interface CreateCampfireProps {
  swipeableIndex: number;
  nextStep: () => void;
  onClose: () => void;
}

function CreateCampfire({
  swipeableIndex,
  nextStep,
  onClose,
}: CreateCampfireProps) {
  const [category, setCategory] = useState('');
  const [campfireName, setCampfireName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  return (
    <SwipeableViews index={swipeableIndex} disabled>
      <div>
        <CreateCampfireModalOne
          nextStep={nextStep}
          category={category}
          setCategory={setCategory}
          campfireName={campfireName}
          setCampfireName={setCampfireName}
          description={description}
          setDescription={setDescription}
        />
      </div>
      {swipeableIndex == 1 && (
        <div>
          <CamfireCoverImageModal
            nextStep={nextStep}
            onSelectCoverImage={setCoverImage}
          />
        </div>
      )}
      <div>
        <CreateCampfireModalTwo
          campfireName={campfireName}
          description={description}
          category={category}
          coverImage={coverImage}
          onClose={onClose}
        />
      </div>
    </SwipeableViews>
  );
}

export default CreateCampfire;
