import { useQuery } from '@apollo/client/react';
import { capitalize } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import Select from 'react-select';

import ToolsWarning from '/public/images/tools/ToolsWarning.svg';
import ActivityLog from '@/components/pages/Campfire/ActivityLog';
import CampfireDescription from '@/components/pages/Campfire/CampfireDescription';
import CampfireOverview from '@/components/pages/Campfire/CampfireOverview';
import CampfireTools from '@/components/pages/Campfire/CampfireTools';
import { actionsList } from '@/components/pages/Campfire/Constant';
import MakeAnnouncement from '@/components/pages/Forum/forumMenu/MakeAnnouncement';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import { CAMPFIRE_FALLBACK_COVER_PIC } from '@/lib/constants';
import { emitErrorNotification, emitNotification } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import {
  FETCH_CAMPFIRE_COVER_PICTURES,
  UPDATE_CAMPFIRE_COVER_PICTURE,
} from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import {
  getIsCampfirePeopleSearch,
  updateCampfireCover,
} from '@/state/Slices/campfire';
import { CampfireDetails, CampfireUser } from '@/types/campfire';

import announcement from '../../../../public/images/announcements.png';
import coverSelection from '../../../../public/images/coverSelection.png';
import overview from '../../../../public/images/overview.png';
import overviewNormal from '../../../../public/images/overviewNormal.png';
import postsColored from '../../../../public/images/postsColored.png';
import postss from '../../../../public/images/postss.png';
import tools from '../../../../public/images/tools.png';
import toolsNormal from '../../../../public/images/toolsNormal.png';

interface ICampfireDetail {
  data: CampfireDetails;
  membersList: CampfireUser[] | string;
  refetchMembersList: () => void;
}

const CampfireDetail = ({
  data,
  membersList,
  refetchMembersList,
}: ICampfireDetail) => {
  const blockerIds = useUsersWhoBlockedMe();
  const iBlockedIds = useUsersIBlocked();
  const visibleMembers =
    membersList && Array.isArray(membersList)
      ? (membersList as CampfireUser[]).filter(
        (m) => !blockerIds.has(m.user.id) && !iBlockedIds.has(m.user.id),
      )
      : membersList;
  const [isPostsSelected, setIsPostsSelected] = useState<boolean>(true);
  const [isToolsSelected, setIsToolsSelected] = useState<boolean>(false);
  const [isOverviewSelected, setIsOverviewSelected] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToolsModal, setShowToolsModal] = useState<boolean>(false);
  const [campfireHashtagData, setCampfireHashtagData] = useState('');
  const [announcementModal, setAnnouncementModal] = useState<boolean>(false);
  const [coverPictureModal, setCoverPictureModal] = useState<boolean>(false);
  const [isCustomize, setisCustomize] = useState<boolean>(false);
  const [campfireCoverPicture, setCampfireCoverPicture] = useState<string>('');

  const token = useAppSelector(selectGetToken);

  const dispatch = useAppDispatch();
  const isCampfirePeopleSearch = useAppSelector(getIsCampfirePeopleSearch);

  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if (isCampfirePeopleSearch && !isDesktop) {
      setIsOverviewSelected(true);
      setIsPostsSelected(false);
      setIsToolsSelected(false);
    }
  }, [isCampfirePeopleSearch, isDesktop]);

  const {
    data: campfireCoverPictureData,
    loading: campfireCoverPictureLoading,
    error,
  } = useQuery(FETCH_CAMPFIRE_COVER_PICTURES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    skip: token === '',
    fetchPolicy: 'no-cache',
  });

  const {
    mutationFunction: updateCampfireCoverPicture,
    loading: campfireCoverPictureUpdateLoading,
  } = useAuthMutation(UPDATE_CAMPFIRE_COVER_PICTURE, () => {
    dispatch(updateCampfireCover(campfireCoverPicture));
  });

  const handleCoverPictureUpdate = () => {
    try {
      updateCampfireCoverPicture({
        variables: {
          campfireId: data.id,
          coverPicture: campfireCoverPicture,
        },
      });
      setCoverPictureModal(false);
      emitNotification(
        'success',
        'Campfire cover picture updated successfully',
      );
    } catch (err) {
      captureSentryException(err);
      emitErrorNotification();
    }
  };

  return (
    <div
      className={`${data?.is_disabled_by_admin ? 'pointer-events-none' : ''}`}
    >
      <Modal id="modal1" isVisible={showModal} onClose={toggleModal}>
        <div className="space-y-4 p-2">
          {visibleMembers &&
            Array.isArray(visibleMembers) &&
            (visibleMembers as CampfireUser[]).map((member: CampfireUser) => (
              <div key={member.id}>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <div className="h-15 w-15">
                      <CustomImage
                        height={20}
                        width={20}
                        src={member?.user?.profilePicture}
                      />
                    </div>
                    <div className="ml-2">
                      <Text>{member?.user?.name}</Text>
                      <Text size="sm">{capitalize(member?.role)}</Text>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FollowButton
                      postUserId={member?.user?.id}
                      isFollowing={member?.user?.isFollowing}
                    />
                    <div className="pl-4 pt-2 lg:pl-2 lg:pt-0">
                      {member?.role === 'admin' ? (
                        <div className="member-list">Admin</div>
                      ) : data?.isAdmin ? (
                        <div className=" pt-4 lg:pt-0">
                          <Select
                            className="select-member w-28 lg:w-30"
                            placeholder={capitalize(member?.role)}
                            options={actionsList}
                          />
                        </div>
                      ) : (
                        <div className="member-list">Member</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Modal>
      <Modal
        id="announcementModal"
        isVisible={announcementModal}
        onClose={() => {
          setAnnouncementModal(!announcementModal);
          if (isMobile) {
            setIsPostsSelected(true);
          }
        }}
      >
        <MakeAnnouncement
          campfireId={data.id}
          setAnnouncementModal={setAnnouncementModal}
        />
      </Modal>
      <Modal
        id="pictureModal"
        isVisible={coverPictureModal}
        onClose={() => {
          setCoverPictureModal(!coverPictureModal);
          setCampfireCoverPicture('');
        }}
      >
        <div className="mb-2 ml-4">
          <Text size="md" color="text-black-200" font="font-bold">
            Select your cover image for your campfire
          </Text>
        </div>
        {error && (
          <div className="flex h-36 flex-wrap gap-4 py-8 text-error">
            <Text size="base">
              Oops, something went wrong while fetching Avatars.
            </Text>
          </div>
        )}
        {campfireCoverPictureLoading && !error ? (
          <TabletLoader />
        ) : (
          <div className="h-[506px] overflow-y-auto">
            {(campfireCoverPictureData as any)?.campfire_cover_pictures.map(
              (avatar: {
                id: string;
                key: string;
                url: string;
                createdAt: string;
              }) => {
                return (
                  <div
                    key={avatar.id}
                    className="relative mx-4 my-4 cursor-pointer "
                    onClick={() => setCampfireCoverPicture(avatar.url)}
                  >
                    <CustomImage
                      key={avatar?.id}
                      src={avatar?.url}
                      height={100}
                      width={93}
                      alt={avatar?.key}
                    />
                    {campfireCoverPicture === avatar?.url && (
                      <div className="absolute top-0 right-0 mt-2 mr-2 h-5 w-5">
                        <CustomImage
                          key={avatar?.id}
                          src={coverSelection}
                          fill
                          alt={avatar?.key}
                        />
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        )}
        <div className="mx-4 mt-4 text-center">
          <Button
            size="md"
            type="primary"
            block
            isLoading={campfireCoverPictureUpdateLoading}
            onClick={handleCoverPictureUpdate}
            isdisabled={!campfireCoverPicture}
          >
            Continue
          </Button>
        </div>
      </Modal>
      <div className={isDesktop ? 'sm-container' : ''}>
        <div className="relative">
          <CustomImage
            src={
              data.coverPicture
                ? data.coverPicture
                : CAMPFIRE_FALLBACK_COVER_PIC
            }
            fill
            alt="campfire cover picture"
            onError={(e) => {
              e.currentTarget.src = CAMPFIRE_FALLBACK_COVER_PIC;
            }}
          ></CustomImage>
          {data.isAdmin && (
            <div
              className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-gray-200 p-1.5 lg:p-3"
              onClick={() => setCoverPictureModal(true)}
            >
              <FiEdit2 className=" text-white" size={isMobile ? 10 : 16} />
            </div>
          )}
        </div>
      </div>
      <CampfireDescription
        data={data}
        setisCustomize={setisCustomize}
        setIsPostsSelected={setIsPostsSelected}
        setIsToolsSelected={setIsToolsSelected}
        setIsOverviewSelected={setIsOverviewSelected}
        setShowToolsModal={setShowToolsModal}
      />
      <div className="sm-container mb-10">
        <div className="my-10 flex justify-between">
          <div className={`flex ${isMobile ? 'space-x-3' : 'space-x-10'} `}>
            <div
              className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${isPostsSelected
                  ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
                  : ''
                }`}
              onClick={() => {
                setIsPostsSelected(true);
                setIsToolsSelected(false);
                setIsOverviewSelected(false);
                setisCustomize(false);
              }}
            >
              <div className="h-6 w-6">
                {isPostsSelected ? (
                  <CustomImage src={postss}></CustomImage>
                ) : (
                  <CustomImage src={postsColored}></CustomImage>
                )}
              </div>
              <Text
                color={`${isPostsSelected ? 'text-gray-1600' : 'text-primary'}`}
                size="base"
              >
                Posts
              </Text>
            </div>
            {!isDesktop && (
              <div
                className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${isOverviewSelected
                    ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
                    : ''
                  }`}
                onClick={() => {
                  setIsOverviewSelected(true);
                  setIsPostsSelected(false);
                  setIsToolsSelected(false);
                  setisCustomize(false);
                }}
              >
                <div className="h-5 w-5">
                  {isOverviewSelected ? (
                    <CustomImage src={overviewNormal}></CustomImage>
                  ) : (
                    <CustomImage src={overview}></CustomImage>
                  )}
                </div>
                <Text
                  color={`${isOverviewSelected ? 'text-gray-1600' : 'text-primary'
                    }`}
                  size="base"
                >
                  Overview
                </Text>
              </div>
            )}
            {!isMobile && data.isAdmin && (
              <div
                className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${isToolsSelected
                    ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
                    : ''
                  }`}
                onClick={() => {
                  if (isMobile) {
                    setShowToolsModal(true);
                  } else {
                    setIsToolsSelected(true);
                    setIsPostsSelected(false);
                    setIsOverviewSelected(false);
                  }
                }}
              >
                <div className="h-5 w-5">
                  {isToolsSelected ? (
                    <CustomImage src={toolsNormal}></CustomImage>
                  ) : (
                    <CustomImage src={tools}></CustomImage>
                  )}
                </div>
                <Text
                  color={`${isToolsSelected ? 'text-gray-1600' : 'text-primary'
                    }`}
                  size="base"
                >
                  Tools
                </Text>
              </div>
            )}
            {isMobile && data.isAdmin && (
              <div
                className={`flex cursor-pointer items-center space-x-1 lg:space-x-2 ${isToolsSelected
                    ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
                    : ''
                  }`}
                onClick={() => {
                  setIsToolsSelected(false);
                  setIsPostsSelected(false);
                  setIsOverviewSelected(false);
                  setAnnouncementModal(true);
                }}
              >
                <div className="h-5 w-5">
                  <CustomImage src={announcement}></CustomImage>
                </div>
                <Text
                  color={`${isToolsSelected ? 'text-gray-1600' : 'text-primary'
                    }`}
                  size="base"
                >
                  Announcement
                </Text>
              </div>
            )}
          </div>
          {!isMobile && data.isAdmin && (
            <div className="flex items-center gap-5">
              <div
                className="flex cursor-pointer items-center space-x-2 rounded-full border border-primary py-1.5 px-3"
                onClick={() => setAnnouncementModal(true)}
              >
                <div className="h-5 w-5">
                  <CustomImage src={announcement}></CustomImage>
                </div>
                <Text size="3xl" color="text-primary">
                  Make an announcement
                </Text>
              </div>
              {data?.is_disabled_by_admin && !isMobile && (
                <div className="rounded-full border border-primary py-1.5 px-5">
                  <Text size="3xl" color="text-primary">
                    Disabled
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 ml-1">
          {isMobile && (
            <div
              className={`mb-9 flex cursor-pointer items-center space-x-1 lg:space-x-2 ${isToolsSelected
                  ? 'rounded-full bg-blue-1100 py-1 px-3 lg:py-2 lg:px-4'
                  : ''
                }`}
              onClick={() => {
                if (isMobile) {
                  setShowToolsModal(true);
                } else {
                  setIsToolsSelected(true);
                  setIsPostsSelected(false);
                  setIsOverviewSelected(false);
                }
              }}
            >
              <div className="h-5 w-5">
                {isToolsSelected ? (
                  <CustomImage src={toolsNormal}></CustomImage>
                ) : (
                  <CustomImage src={tools}></CustomImage>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Text
                  color={`${isToolsSelected ? 'text-gray-1600' : 'text-primary'
                    }`}
                  size="base"
                >
                  Tools
                </Text>
                {data?.is_disabled_by_admin && isMobile && (
                  <div className="rounded-full border border-primary px-3">
                    <Text size="base" color="text-primary">
                      Disabled
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          {isPostsSelected && (
            <div className="flex">
              <div className="w-[741px]">
                {data?.isMember || data?.isAdmin ? (
                  <ActivityLog
                    campfireId={data?.id}
                    isAdmin={data.isAdmin}
                    campfireHashtagData={campfireHashtagData}
                  />
                ) : (
                  <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
                    <Text size="lg" font="font-bold" color="text-gray-500">

                    </Text>
                  </div>
                )}
              </div>
              {isDesktop && (
                <CampfireOverview
                  campfireData={data}
                  membersList={membersList as CampfireUser[]}
                  setCampfireHashtagData={setCampfireHashtagData}
                  refetchMembersList={refetchMembersList}
                />
              )}
            </div>
          )}
          {isOverviewSelected && (
            <CampfireOverview
              campfireData={data}
              membersList={membersList as CampfireUser[]}
              setCampfireHashtagData={setCampfireHashtagData}
              setIsOverviewSelected={setIsOverviewSelected}
              setIsPostsSelected={setIsPostsSelected}
              refetchMembersList={refetchMembersList}
            />
          )}
        </div>
        <div>
          {(isToolsSelected || isCustomize) && !isMobile ? (
            <div className="flex mb-12">
              <div className="w-full">
                <CampfireTools
                  campfireId={data?.id}
                  isCustomize={isCustomize}
                  setIsCustomize={setisCustomize}
                  refetchMembersList={refetchMembersList}
                />
              </div>
            </div>
          ) : (
            <Modal
              id="ToolsModal"
              isVisible={showToolsModal}
              onClose={() => setShowToolsModal(!showToolsModal)}
            >
              <div className="flex flex-row gap-2">
                <div className="h-8 w-8">
                  <CustomImage src={ToolsWarning} />
                </div>
                <Text>
                  To access admin tools you need to log in through desktop &
                  tablet
                </Text>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampfireDetail;
