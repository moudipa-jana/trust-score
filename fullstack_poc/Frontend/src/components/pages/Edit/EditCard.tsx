import { get } from 'lodash';
import React, { Dispatch, SetStateAction } from 'react';

import Image from '/public/images/userImage.svg';
import Card from '@/components/Card';
import EditProfileName from '@/components/pages/Edit/EditProfile';
import UploadImage from '@/components/pages/Profile/UploadImage';
import { useAppSelector } from '@/Hooks/useRedux';
import { selectGetUserProfile } from '@/state/Slices/auth';
import { editProfileDetailsType } from '@/types/profile';

interface IEditCard {
  displayName: string;
  setEditProfileDetails: Dispatch<SetStateAction<editProfileDetailsType>>;
  setDisplayNameError: Dispatch<SetStateAction<string>>;
  displayNameError: string;
}
function EditCard({
  displayName,
  setEditProfileDetails,
  displayNameError,
  setDisplayNameError,
}: IEditCard) {
  const profile = useAppSelector(selectGetUserProfile);
  return (
    <div className="rounded-lg bg-skyBlue-100 p-4">
      <Card
        variant="lg"
        profileImg={get(profile, 'profilePicture') || Image}
        title=" "
        size="lg"
        uploadImg={<UploadImage />}
        headingChildren={
          <EditProfileName
            displayName={displayName}
            setEditProfileDetails={setEditProfileDetails}
            setDisplayNameError={setDisplayNameError}
            displayNameError={displayNameError}
          />
        }
        isBorder
      ></Card>
    </div>
  );
}

export default EditCard;
