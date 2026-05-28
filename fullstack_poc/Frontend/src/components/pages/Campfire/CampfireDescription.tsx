import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { MdDeleteOutline, MdOutlineCameraAlt } from 'react-icons/md';
import { SlSettings } from 'react-icons/sl';
import { VscMute } from 'react-icons/vsc';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import InviteBoard from '@/components/pages/Campfire/InviteBoard';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import SearchBar from '@/components/Utility/SearchBar';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { CAMPFIRE_FALLBACK_PROFILE_PIC } from '@/lib/constants';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  formatShortCount,
} from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import {
  DELETE_CAMPFIRE,
  FETCH_CAMPFIRE_AVATARS,
  GET_MUTE_UNMUTE_STATUS,
  MUTE_UNMUTE_CAMPFIRE_MUTATION,
  UPDATE_CAMPFIRE_AVATAR,
} from '@/service/graphql/Campfire';
import { selectGetToken, selectGetUserProfile } from '@/state/Slices/auth';
import {
  getCampfireData,
  getCampfireSearch,
  getIsCampfirePeopleSearch,
  getIsCampfirePostsSearch,
  setPicture,
} from '@/state/Slices/campfire';
import { CampfireDetails } from '@/types/campfire';

interface ICampfireDetails {
  data: CampfireDetails;
  setisCustomize: Dispatch<SetStateAction<boolean>>;
  setIsPostsSelected: Dispatch<SetStateAction<boolean>>;
  setIsToolsSelected: Dispatch<SetStateAction<boolean>>;
  setIsOverviewSelected: Dispatch<SetStateAction<boolean>>;
  setShowToolsModal: Dispatch<SetStateAction<boolean>>;
}

const CampfireDescription = ({
  data,
  setisCustomize,
  setIsPostsSelected,
  setIsToolsSelected,
  setIsOverviewSelected,
  setShowToolsModal,
}: ICampfireDetails) => {
  const [showSettingsList, setShowSettingsList] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMuteModal, setShowMuteModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showPictureModal, setShowPictureModal] = useState<boolean>(false);
  const [muteDuration, setMuteDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loader, setLoader] = useState(false);
  const [campfireAvatar, setCampfireAvatar] = useState<string>('');
  const router = useRouter();

  const isMobile = useIsMobile();
  const isIpad = useIsipad();
  const isDesktop = useIsDesktop();
  const token = useAppSelector(selectGetToken);
  const profile = useAppSelector(selectGetUserProfile);
  const campfireDetails = useAppSelector(getCampfireData);
  const campfireSearch = useAppSelector(getCampfireSearch);
  const isCampfirePostsSearch = useAppSelector(getIsCampfirePostsSearch);
  const isCampfirePeopleSearch = useAppSelector(getIsCampfirePeopleSearch);

  const settingsListRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const [muteUnmuteCampfire] = useMutation(MUTE_UNMUTE_CAMPFIRE_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (res) => {
      if ((res as any).update_campfire_users.affected_rows > 0) {
        emitNotification(
          'success',
          isMuted
            ? 'Campfire unmuted successfully!'
            : 'Campfire muted successfully!',
        );
        setIsMuted(!isMuted);
      }
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [deleteCampfire] = useMutation(DELETE_CAMPFIRE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (res) => {
      if ((res as any)?.update_campfires_by_pk?.id) {
        setLoader(false);
        emitNotification('success', 'Campfire deleted successfully!');
        router.push('/');
      }
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
      setLoader(false);
    },
  });

  const handleDeleteCampfire = () => {
    setLoader(true);
    deleteCampfire({
      variables: { campfireId: data.id },
    });
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const handleMuteUnmuteCampfire = () => {
    const today = new Date();
    const mutedOn = formatDate(today);

    const mutedUpto = new Date();
    mutedUpto.setDate(mutedUpto.getDate() + muteDuration);
    const mutedUptoFormatted = formatDate(mutedUpto);
    muteUnmuteCampfire({
      variables: {
        campfireId: data.id,
        userId: profile?.id,
        mute: !isMuted,
        mutedOn: isMuted ? null : mutedOn,
        mutedUpto: isMuted ? null : mutedUptoFormatted,
      },
    }).finally(() => {
      setShowMuteModal(false);
      setMuteDuration(0);
    });
  };

  const {
    loading,
    error,
    data: muteData,
  } = useQuery(GET_MUTE_UNMUTE_STATUS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    variables: {
      campfireId: data.id,
      userId: profile?.id,
    },
    fetchPolicy: 'no-cache',
    skip: token === '',
  });

  const {
    data: campfireAvatarData,
    loading: avatarLoading,
    error: avatarError,
  } = useQuery(FETCH_CAMPFIRE_AVATARS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    skip: !token,
  });

  const {
    mutationFunction: updateCampfireAvatar,
    loading: campfireAvatarUpdateLoading,
  } = useAuthMutation(UPDATE_CAMPFIRE_AVATAR, () => {
    dispatch(setPicture(campfireAvatar));
  });

  const handleAvatarUpdate = () => {
    try {
      updateCampfireAvatar({
        variables: {
          campfireId: data.id,
          picture: campfireAvatar,
        },
      });
      setShowPictureModal(false);
      emitNotification('success', 'Campfire avatar updated successfully');
    } catch (err) {
      captureSentryException(err);
      emitErrorNotification();
    }
  };

  useEffect(() => {
    if (
      !loading &&
      !error &&
      muteData &&
      (muteData as any).campfire_users.length > 0
    ) {
      setIsMuted((muteData as any).campfire_users[0].mute);
    }
  }, [loading, error, muteData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsListRef.current &&
        !settingsListRef.current.contains(event.target as Node)
      ) {
        setShowSettingsList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsList]);

  return (
    <div>
      <Modal
        id="modal2"
        isVisible={showMuteModal}
        onClose={() => setShowMuteModal(!showMuteModal)}
      >
        {isMuted ? (
          <div className="text-center">
            <Text color="text-black-900" size="2xl" variant font="font-medium">
              Are you sure you want to unmute this campfire
            </Text>
            <div className="mt-8 grid grid-cols-2 items-center gap-4">
              <Button type="borderRed" onClick={() => setShowMuteModal(false)}>
                Cancel
              </Button>
              <Button type="bgRed" onClick={handleMuteUnmuteCampfire}>
                Unmute
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Text color="text-black-900" size="2xl" variant font="font-medium">
              Are you sure you want to mute this campfire
            </Text>
            <div className="flex flex-col items-center">
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="mt-2">
                    <Input
                      type="radio"
                      checked={muteDuration === 1}
                      onChange={() => setMuteDuration(1)}
                      className="h-5 w-5 checked:bg-primary "
                    />
                  </div>
                  <div className="ml-5">
                    <Text size="md" color="text-black-200">
                      Mute this campfire for 1 day
                    </Text>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mt-2">
                    <Input
                      type="radio"
                      checked={muteDuration === 7}
                      onChange={() => setMuteDuration(7)}
                      className="h-5 w-5 checked:bg-primary "
                    />
                  </div>
                  <div className="ml-5">
                    <Text size="md" color="text-black-200">
                      Mute this campfire for 7 days
                    </Text>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mt-2">
                    <Input
                      type="radio"
                      checked={muteDuration === 30}
                      onChange={() => setMuteDuration(30)}
                      className="h-5 w-5 checked:bg-primary "
                    />
                  </div>
                  <div className="ml-5">
                    <Text size="md" color="text-black-200">
                      Mute this campfire for 30 days
                    </Text>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 items-center gap-4">
              <Button type="borderRed" onClick={() => setShowMuteModal(false)}>
                Cancel
              </Button>
              <Button
                type="bgRed"
                onClick={handleMuteUnmuteCampfire}
                isdisabled={muteDuration === 0}
              >
                Mute
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        id="modal3"
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(!showDeleteModal)}
      >
        <div className="text-center">
          <Text color="text-black-900" size="2xl" variant font="font-medium">
            Are you sure you want to delete this campfire
          </Text>
          <div className="mt-8 grid grid-cols-2 items-center gap-4">
            <Button type="borderRed" onClick={() => setShowDeleteModal(false)}>
              No
            </Button>
            <Button
              type="bgRed"
              onClick={() => handleDeleteCampfire()}
              isdisabled={loader}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        id="pictureModal"
        isVisible={showPictureModal}
        onClose={() => setShowPictureModal(!showPictureModal)}
      >
        <div className="mb-10">
          <Text size="md" color="text-black-200" font="font-bold">
            Select your avatar for your campfire
          </Text>
        </div>
        {avatarError && (
          <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
            <Text size="base">
              Oops, something went wrong while fetching Avatars.
            </Text>
          </div>
        )}
        {avatarLoading && !avatarError ? (
          <TabletLoader />
        ) : (
          <div className={`${isMobile || isIpad ? 'overflow-scroll' : ''}`}>
            <div
              className={`gap-8 py-4 px-3 ${
                isMobile || isIpad
                  ? 'flex w-max flex-row overflow-hidden'
                  : 'grid grid-cols-6'
              }`}
            >
              {(campfireAvatarData as any)?.campfire_avatars.map(
                (avatar: {
                  id: string;
                  key: string;
                  url: string;
                  createdAt: string;
                }) => {
                  return (
                    <div
                      key={avatar.id}
                      className={`cursor-pointer rounded-full  ${
                        avatar.url === campfireAvatar ? 'av-selcted' : ''
                      }`}
                      onClick={() => setCampfireAvatar(avatar.url)}
                    >
                      <CustomImage
                        key={avatar.id}
                        src={avatar.url}
                        height={100}
                        width={93}
                        alt={avatar.key}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
        <div className="py-12 text-center">
          <Button
            size="md"
            type="primary"
            block
            isLoading={campfireAvatarUpdateLoading}
            onClick={handleAvatarUpdate}
            isdisabled={!campfireAvatar}
          >
            Continue
          </Button>
        </div>
      </Modal>
      {isMobile ? (
        <div className="bg-purple-200">
          <div className="ml-2 flex min-h-[48px] items-center justify-between">
            <div className="flex">
              <div className="member-profile-small">
                <div className="h-10 w-10">
                  <CustomImage
                    src={
                      getDefaultCampfireImage(data?.picture)
                        ? getDefaultCampfireImage(data?.picture)
                        : CAMPFIRE_FALLBACK_PROFILE_PIC
                    }
                    fill
                    alt="campfire avatar"
                    onError={(e) => {
                      e.currentTarget.src = CAMPFIRE_FALLBACK_PROFILE_PIC;
                    }}
                  ></CustomImage>
                </div>
                {data.isAdmin && (
                  <div
                    className="absolute left-6 top-7 z-10 cursor-pointer rounded-full border border-primary bg-white p-0.5 text-primary"
                    onClick={() => setShowPictureModal(true)}
                  >
                    <MdOutlineCameraAlt size={10} />
                  </div>
                )}
              </div>
              <div className="mt-2 -ml-5">
                <div>
                  <Text
                    customClass="break-all"
                    size="3xl"
                    variant
                    color="text-gray-1500"
                  >
                    {data.title}
                  </Text>
                </div>
                <div className="flex flex-wrap items-center gap-x-2">
                  <Text color="text-gray-1550" size="xxs">
                    {data?.is_public === true
                      ? 'Public campfire'
                      : 'Private campfire'}
                  </Text>
                  <span className="campfire-dot-search"></span>
                  <Text color="text-gray-1550" size="xxs">
                    {formatShortCount(data.noParticipants)} members
                  </Text>
                  <span className="campfire-dot-search"></span>
                  <Text color="text-gray-1550" size="xxs">
                    {data.category?.title}
                  </Text>
                </div>
              </div>
            </div>
            <div className="relative" ref={settingsListRef}>
              <div className="mr-3 py-3">
                <SlSettings
                  size={18}
                  className="cursor-pointer text-primary"
                  onClick={() => setShowSettingsList(!showSettingsList)}
                />
              </div>
              <div>
                {showSettingsList && (
                  <div className="absolute top-10 right-0 z-10 w-[226px] bg-blue-1050 p-2">
                    <div className="space-y-3">
                      <div
                        className="flex cursor-pointer items-center space-x-4"
                        onClick={() => {
                          setisCustomize(true);
                          setIsToolsSelected(true);
                          setIsPostsSelected(false);
                          setIsOverviewSelected(false);
                          setShowSettingsList(false);
                          if (isMobile) {
                            setShowToolsModal(true);
                          }
                        }}
                      >
                        <FiEdit2 className="text-primary" size={16} />
                        <Text size="md" color="text-primary">
                          Customize
                        </Text>
                      </div>
                      <div className="line"></div>
                      <div
                        className="flex cursor-pointer items-center space-x-4"
                        onClick={() => setShowMuteModal(true)}
                      >
                        <VscMute className="text-primary" size={20} />
                        <Text size="md" color="text-primary">
                          {isMuted ? 'Unmute' : 'Mute'}
                        </Text>
                      </div>
                      <div className="line"></div>

                      <div
                        className="flex cursor-pointer items-center space-x-4"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <MdDeleteOutline className="text-pink-700" size={20} />
                        <Text size="md" color="text-pink-700">
                          Delete Campfire
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <InviteBoard
              data={data}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </div>
          {isDesktop && <div className="line light"></div>}
          <div className="mt-4">
            <SearchBar
              placeholder={
                campfireSearch &&
                (isCampfirePostsSearch || isCampfirePeopleSearch)
                  ? campfireSearch
                  : `Search ${campfireDetails?.title}`
              }
              campfirePage
              isCampfireSearch
              campfireId={data?.id}
            />
          </div>
        </div>
      ) : (
        <div className="sm-container">
          <div>
            <div className="ml-2 flex h-20">
              <div
                className={` ${
                  isDesktop
                    ? 'member-profile absolute -top-10'
                    : 'member-profile-small'
                }`}
              >
                <div className={`${isDesktop ? 'h-28 w-28' : 'h-16 w-16'}`}>
                  <CustomImage
                    src={
                      getDefaultCampfireImage(data?.picture)
                        ? getDefaultCampfireImage(data?.picture)
                        : CAMPFIRE_FALLBACK_PROFILE_PIC
                    }
                    fill
                    alt="campfire avatar"
                    onError={(e) => {
                      e.currentTarget.src = CAMPFIRE_FALLBACK_PROFILE_PIC;
                    }}
                  ></CustomImage>
                </div>
                {data.isAdmin && (
                  <div
                    className={`absolute z-10 cursor-pointer rounded-full border border-primary bg-white p-1.5 text-primary ${
                      isDesktop ? 'left-18 top-20' : 'left-8 top-10'
                    }`}
                    onClick={() => setShowPictureModal(true)}
                  >
                    <MdOutlineCameraAlt />
                  </div>
                )}
              </div>
              <div className="mt-2 flex w-full justify-between">
                <div className="ml-1">
                  <div>
                    <Text
                      customClass="break-all"
                      size="2xl"
                      variant
                      color="text-gray-1500"
                    >
                      {data.title}
                    </Text>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <Text color="text-gray-1550" size="sm">
                        {data?.is_public === true
                          ? 'Public campfire'
                          : 'Private campfire'}
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-gray-1550" size="sm">
                        {formatShortCount(data.noParticipants)} members
                      </Text>
                      <span className="campfire-dot-search"></span>
                      <Text color="text-gray-1550" size="sm">
                        {data.category?.title}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 pt-1">
                  <div className="relative" ref={settingsListRef}>
                    <div className="py-3">
                      <SlSettings
                        size={20}
                        className="cursor-pointer text-primary"
                        onClick={() => setShowSettingsList(!showSettingsList)}
                      />
                    </div>
                    <div>
                      {showSettingsList && (
                        <div className="absolute right-0 top-10 z-10 w-[226px] bg-blue-1050 p-2">
                          <div className="space-y-3">
                            {data.isAdmin && (
                              <>
                                <div
                                  className="flex cursor-pointer items-center space-x-4"
                                  onClick={() => {
                                    setisCustomize(true);
                                    setIsToolsSelected(true);
                                    setIsPostsSelected(false);
                                    setIsOverviewSelected(false);
                                    setShowSettingsList(false);
                                  }}
                                >
                                  <FiEdit2 className="text-primary" size={16} />
                                  <Text size="md" color="text-primary">
                                    Customize
                                  </Text>
                                </div>
                                <div className="line"></div>
                              </>
                            )}
                            <div
                              className="flex cursor-pointer items-center space-x-4"
                              onClick={() => setShowMuteModal(true)}
                            >
                              <VscMute className="text-primary" size={20} />
                              <Text size="md" color="text-primary">
                                {isMuted ? 'Unmute' : 'Mute'}
                              </Text>
                            </div>
                            {data.isAdmin && (
                              <>
                                <div className="line"></div>
                                <div
                                  className="flex cursor-pointer items-center space-x-4"
                                  onClick={() => setShowDeleteModal(true)}
                                >
                                  <MdDeleteOutline
                                    className="text-pink-700"
                                    size={20}
                                  />
                                  <Text size="md" color="text-pink-700">
                                    Delete Campfire
                                  </Text>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <InviteBoard
                    data={data}
                    showModal={showModal}
                    setShowModal={setShowModal}
                  />
                </div>
              </div>
            </div>
            {isDesktop && <div className="line light mt-2"></div>}
            <div
              className={
                campfireDetails?.title && campfireDetails?.title?.length > 29
                  ? 'mt-4'
                  : ''
              }
            >
              <SearchBar
                placeholder={
                  campfireSearch &&
                  (isCampfirePostsSearch || isCampfirePeopleSearch)
                    ? campfireSearch
                    : `Search ${campfireDetails?.title}`
                }
                campfirePage
                isCampfireSearch
                campfireId={data?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampfireDescription;
