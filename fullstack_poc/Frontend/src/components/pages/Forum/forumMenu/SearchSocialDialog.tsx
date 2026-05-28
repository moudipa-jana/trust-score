import { useEffect, useState } from 'react';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import Modal from '@/components/Utility/Modal';
import SearchBar from '@/components/Utility/SearchBar';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FORUM_ANIMATED_PLACEHOLDER } from '@/lib/constants';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
} from '@/state/Slices/dialog';

export default function SearchSocialDialog({
  searchData,
}: {
  searchData: Blog[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();
  const dialogVisible = useAppSelector(
    (state) => state.dialog.searchSocialDialogOpen,
  );

  const campfireDialog = useAppSelector(
    (state) => state.dialog.searchCampfireDialog,
  );

  useEffect(() => {
    if (!dialogVisible) {
      document.body.classList.remove('overflow-y-hidden');
    } else {
      document.body.classList.add('overflow-y-hidden');
    }
  }, [dialogVisible]);

  const handleClose = () => {
    dispatch(toggleSearchSocialDialog(false));
    dispatch(toggleSearchCampfireDialog(false));
  };

  return (
    <Modal
      searchModal
      id="SearchSocial"
      isVisible={dialogVisible}
      onClose={handleClose}
      isOpen={isOpen}
    >
      <SearchBar
        isCustomOpen={isOpen}
        setIsCustomOpen={setIsOpen}
        modalInput
        isAnimatedText
        placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
        isCampfireSearch={campfireDialog}
        searchData={searchData}
      />
    </Modal>
  );
}
