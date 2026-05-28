import React, { useState } from 'react';

import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';
import ProfileHiddenComments from '@/components/pages/Profile/ProfileHidden/ProfileHiddenComments';
import ProfileHiddenPost from '@/components/pages/Profile/ProfileHidden/ProfileHiddenPost';
import ProfileHiddenReply from '@/components/pages/Profile/ProfileHidden/ProfileHiddenReply';
import Dropdown from '@/components/Utility/Dropdown';
import { useAppSelector } from '@/Hooks/useRedux';
import { selectGetToken, selectGetUserProfile } from '@/state/Slices/auth';
import { profileOption } from '@/types/profile';
const profilHiddenOptions: profileOption[] = [
  { value: 'asc_nulls_last', label: 'All' },
  { value: 'desc_nulls_last', label: 'Recent' },
];
function ProfileHidden() {
  const [selectedOption, setSelectedOption] = useState(profilHiddenOptions[0]);
  const profile = useAppSelector(selectGetUserProfile);
  const token = useAppSelector(selectGetToken);
  if (
    (profile?.noHidden?.aggregate?.count ?? 0) +
      (profile?.noHiddenComments?.aggregate?.count ?? 0) ===
      0 ||
    !token
  ) {
    return (
      <div className="layout flex flex-col items-center justify-center gap-3 text-center">
        <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
        <p className='text-sm font-bold text-gray-500'>
          No hidden post
        </p>
      </div>
    );
  }
  return (
    <div className="md:sm-container">
      <div className="max-w-[230px] cursor-pointer">
        <Dropdown
          options={profilHiddenOptions}
          isLabel
          onChange={(value) => setSelectedOption(value as profileOption)}
          color="border-primary"
          rounded
          defaultOption={profilHiddenOptions[0]}
        />
      </div>
      <ProfileHiddenPost selectedOption={selectedOption} />
      <ProfileHiddenComments selectedOption={selectedOption} />
      <ProfileHiddenReply selectedOption={selectedOption} />
    </div>
  );
}

export default ProfileHidden;
