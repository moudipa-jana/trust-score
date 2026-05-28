{
  /**
   * `EditProfile` allows users to edit their profile details including name, about, and areas of interest.
   * - Displays form with fields for editing user information and settings.
   * - Validates changes and updates the profile via a GraphQL mutation.
   * - Includes a cancel button to return to the profile and a save button that triggers the update.
   * - Shows sticky footer on desktop and supports responsive layout for mobile.
   **/
}

import { get } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { updateEditProfileSuccess } from '@/actions/profile';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import EditAbout from '@/components/pages/Edit/EditAbout';
import EditAreaOfInterset from '@/components/pages/Edit/EditAreaOfInterset';
import EditCard from '@/components/pages/Edit/EditCard';
import StickyFooter from '@/components/pages/Forum/StickyFooter';
import ProfileSetting from '@/components/pages/Profile/ProfileSetting';
import UserCampfire from '@/components/pages/User/UserCampfire';
import BackToTop from '@/components/Utility/BackToTop';
import Button from '@/components/Utility/Button';
import NotAuthenticated from '@/components/Utility/NotAuthenticated';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsDesktop from '@/Hooks/useIsDesktop';
import { useIsMobile } from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitNotification } from '@/lib/helpers';
import validations from '@/lib/validations';
import withCommonData from '@/lib/withCommonData';
import { EDIT_USER_PROFILE_MUTATION } from '@/service/graphql/Profile';
import { selectGetToken, selectGetUserProfile } from '@/state/Slices/auth';
import { userCategoty } from '@/types/category';
import type { MenuItem } from '@/types/menu';
import Modal from '@/components/Utility/Modal';
import CreateCampfire from '@/components/pages/Forum/campfire/CreateCampfire';



interface EditProfileResponse {
  updateUserProfile: {
    success: boolean;
  };
}

interface EditProfileProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: Blog[];
  disclaimer: {
    data?: {
      attributes?: {
        title: string;
        description: string;
      };
    };
  };
}

export default function EditProfile({
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
  disclaimer,
}: EditProfileProps) {
  const [displayNameError, setDisplayNameError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector(selectGetUserProfile);
  const token = useAppSelector(selectGetToken);
  const [isValid, setIsValid] = useState(false);
  const isdesktop = useIsDesktop();
  const [backIcon, setBackIcon] = useState(false);
  const [campfireModalVisible, setCampfireModalVisible] = useState(false);
  const [swipeableIndex, setSwipeableIndex] = useState(0);

  const { mutationFunction: updateUserProfile } =
    useAuthMutation<EditProfileResponse>(
      EDIT_USER_PROFILE_MUTATION,
      useCallback(async () => {
        if (profile) {
          dispatch(updateEditProfileSuccess(profile.id, token));
        }
        setIsValid(false);
        emitNotification('success', 'Your profile has been updated!!');
        router.push('/');
      }, [dispatch, profile, token, router]),
    );
  const formatedAreaofIntrest = useMemo(
    () =>
      get(profile, 'user_interests', []).map((ctg: userCategoty) => {
        return { categoryId: ctg?.category?.id };
      }),
    [profile],
  );

  const currentUserData = useMemo(
    () => ({
      isAllowFollow: profile?.isAllowFollow || false,
      isCampfireVisibility: profile?.isCampfireVisibility || false,
      name: profile?.name || '',
      about: profile?.about || '',
      areaOfInterests: formatedAreaofIntrest || [],
    }),
    [
      profile?.isAllowFollow,
      profile?.isCampfireVisibility,
      profile?.name,
      profile?.about,
      formatedAreaofIntrest,
    ],
  );

  const [editProfileDetails, setEditProfileDetails] = useState(currentUserData);

  const updateProfileDetails = () => {
    // Filter out any interests with undefined categoryId
    const validInterests = editProfileDetails.areaOfInterests.filter(
      (interest) => interest.categoryId,
    );

    updateUserProfile({
      variables: {
        userId: profile?.id,
        ...editProfileDetails,
        areaOfInterests: validInterests,
        name: editProfileDetails.name.trim(),
      },
    });
  };

  useEffect(() => {
    setIsValid(validations.isValidChange(editProfileDetails, currentUserData));
  }, [editProfileDetails, currentUserData]);

  const nextStep = () => {
    setSwipeableIndex((prevIndex) => prevIndex + 1);
    setBackIcon(true);
  };

  const onBack = () => {
    setSwipeableIndex(0);
    setBackIcon(false);
  };

  const openCampfireModal = () => {
    setCampfireModalVisible(true);
  };

  const onClose = () => {
    setCampfireModalVisible(false);
    setSwipeableIndex(0);
    setBackIcon(false);
  };
  const ismobile = useIsMobile();

  if (!token) {
    return (
      <PageBase
        title="Edit Profile"
        initialMenus={initialMenus}
        initialBottomMenus={initialBottomMenus}
        searchData={searchData}
        initialSocials={initialSocials}
      >
        <NotAuthenticated />
      </PageBase>
    );
  }
  return (
    <PageBase
      title="Edit Profile"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <Modal
        key="modal"
        id="CampfireCreateModal"
        backIcon={backIcon}
        isVisible={campfireModalVisible}
        onBack={onBack}
        onClose={onClose}
        isOverlayWhite
      >
        <CreateCampfire
          swipeableIndex={swipeableIndex}
          nextStep={nextStep}
          onClose={onClose} />
      </Modal>

      <div id="profileEdit"></div>
      <div className="sm-container py-4">
        <div className="grid lg:grid-cols-9 lg:gap-4">
          <div className="lg:col-span-6">
            <EditCard
              displayName={editProfileDetails.name}
              setEditProfileDetails={setEditProfileDetails}
              setDisplayNameError={setDisplayNameError}
              displayNameError={displayNameError}
            />
            {!ismobile && (
              <>
                <EditAbout
                  about={editProfileDetails.about}
                  setEditProfileDetails={setEditProfileDetails}
                />
                <EditAreaOfInterset
                  isCampfireVisibility={editProfileDetails.isCampfireVisibility}
                  areaOfInterests={editProfileDetails.areaOfInterests}
                  setEditProfileDetails={setEditProfileDetails}
                />
                <div className="twoBtnsXs flex items-center justify-end pt-4">
                  <Button type="outline" link="/profile" customClassName="mr-3">
                    Cancel
                  </Button>
                  <Button
                    isdisabled={
                      !!displayNameError || !editProfileDetails.name || !isValid
                    }
                    onClick={updateProfileDetails}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="py-6 lg:col-span-3 lg:py-0">
            <ProfileSetting />
            <UserCampfire userId={profile?.id}
              setCampfireModal={openCampfireModal}
            />
            {isdesktop && (
              <div className="sticky top-[88px]">
                <StickyFooter
                  bottomMenus={initialBottomMenus}
                  initialSocials={initialSocials}
                  disclaimer={disclaimer}
                />{' '}
              </div>
            )}
            {ismobile && (
              <>
                <EditAbout
                  about={editProfileDetails.about}
                  setEditProfileDetails={setEditProfileDetails}
                />
                <EditAreaOfInterset
                  isCampfireVisibility={editProfileDetails.isCampfireVisibility}
                  areaOfInterests={editProfileDetails.areaOfInterests}
                  setEditProfileDetails={setEditProfileDetails}
                />
                <div className="twoBtnsXs flex items-center justify-end pt-4">
                  <Button type="outline" link="/profile" customClassName="mr-3">
                    Cancel
                  </Button>
                  <Button
                    isdisabled={
                      !!displayNameError || !editProfileDetails.name || !isValid
                    }
                    onClick={updateProfileDetails}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>



        </div>

        <BackToTop to="profileEdit" />
      </div>
    </PageBase>
  );
}

export const getServerSideProps = withCommonData(async () => {
  return {
    props: {
      disclaimer: {
        data: {
          attributes: {
            title: '',
            description: '',
          },
        },
      },
    },
  };
});
