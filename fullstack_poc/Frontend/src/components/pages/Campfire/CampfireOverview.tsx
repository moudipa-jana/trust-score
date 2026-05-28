import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { capitalize, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { IoShareSocialOutline } from 'react-icons/io5';
import null_hashtag from '/public/images/campfire/null_hashtag.svg';
import null_about from '/public/images/campfire/null_about.svg';
import null_rule from '/public/images/campfire/null_rule.svg';
import Select, {
  components,
  DropdownIndicatorProps,
  GroupBase,
} from 'react-select';

import { blockUser } from '@/actions/forum';
import {
  actionAdminList,
  actionsList,
} from '@/components/pages/Campfire/Constant';
import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import RemoveMember from '@/components/pages/Campfire/RemoveMember';
import ShareCampfireFlow from '@/components/pages/Campfire/ShareCampfireFlow';
import BlockModal from '@/components/Utility/BlockModal';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import useIsDesktop from '@/Hooks/useIsDesktop';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import validations from '@/lib/validations';
import {
  ASSIGN_ADMIN_AS_MEMBER,
  ASSIGN_CAMPFIRE_ADMIN_MUTATION,
  CHECK_IF_OTHER_ADMIN_IN_CAMPFIRE,
  EDIT_CAMPFIRE_ABOUT,
  GET_CAMPFIRE_RULES,
  REMOVE_CAMPFIRE_USER,
} from '@/service/graphql/Campfire';
import {
  GET_DISABLED_HASHTAGS,
  GET_POPULAR_HASHTAGS,
} from '@/service/graphql/Forum';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import {
  getIsMemberModalOpen,
  setIsMemberModalOpen,
} from '@/state/Slices/campfire';
import { CampfireDetails, CampfireUser } from '@/types/campfire';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';

interface ICampfirePosts {
  campfireData: CampfireDetails;
  membersList: CampfireUser[];
  setCampfireHashtagData: React.Dispatch<React.SetStateAction<string>>;
  setIsOverviewSelected?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPostsSelected?: React.Dispatch<React.SetStateAction<boolean>>;
  refetchMembersList: () => void;
}

interface Rule {
  id: string;
  rule: string;
  description: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface Hashtag {
  id: string;
  hashtag_name: string;
}

const CampfireOverview = ({
  campfireData,
  membersList,
  setCampfireHashtagData,
  setIsOverviewSelected,
  setIsPostsSelected,
  refetchMembersList,
}: ICampfirePosts) => {
  const blockerIds = useUsersWhoBlockedMe();
  const iBlockedIds = useUsersIBlocked();
  const visibleMembers = (membersList || []).filter(
    (m) => !blockerIds.has(m.user.id) && !iBlockedIds.has(m.user.id),
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareSteps, setShareSteps] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(campfireData.description);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [rulesData, setRulesData] = useState<Rule[]>([]);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [blockModal, setBlockModal] = useState(false);
  const [isBlockTheUser, setBlockTheUser] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [removeModal, setRemoveModal] = useState(false);
  const [camfireJoin, setCampfireJoin] = useState(false);

  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const isMemberModalOpen = useAppSelector(getIsMemberModalOpen);

  const isDesktop = useIsDesktop();
  const { pathname } = router;
  const isCampfirePage = pathname.includes('/campfire/');
  const isNonMemberCampfire = !campfireData?.isMember && isCampfirePage;
  const { data: disabledHashtags } = useQuery(GET_DISABLED_HASHTAGS);

  useEffect(() => {
    if (isMemberModalOpen) {
      setShowModal(true);
    }
  }, [isMemberModalOpen]);

  const [getPopularHashtags, { loading, error, data }] = useLazyQuery(
    GET_POPULAR_HASHTAGS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const [assignAdmin] = useMutation(ASSIGN_CAMPFIRE_ADMIN_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      emitNotification(
        'success',
        'User has been assigned as admin successfully!',
      );
      refetchMembersList();
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [removeUser] = useMutation(REMOVE_CAMPFIRE_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      emitNotification('success', 'User has been removed successfully!');
      refetchMembersList();
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [checkIfOtherAdminExists] = useLazyQuery(
    CHECK_IF_OTHER_ADMIN_IN_CAMPFIRE,
  );

  const [assignMember] = useMutation(ASSIGN_ADMIN_AS_MEMBER, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      emitNotification(
        'success',
        'User has been added as a member successfully!',
      );
      refetchMembersList();
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const {
    loading: rulesQueryLoading,
    error: rulesQueryError,
    data: rulesQueryData,
  } = useQuery(GET_CAMPFIRE_RULES, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireId: campfireData?.id,
    },
    skip: token === '',
  });

  // Handle rules query completion
  useEffect(() => {
    if ((rulesQueryData as any)?.campfire_rules) {
      setRulesData((rulesQueryData as any).campfire_rules);
    }
  }, [rulesQueryData]);

  const [editDescription] = useMutation(EDIT_CAMPFIRE_ABOUT, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      setIsEditing(false);
      emitNotification('success', 'About edited successfully!');
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const handleChange = (
    selectedOption: SelectOption,
    member: CampfireUser,
    index: number,
  ) => {
    const { value } = selectedOption;
    setSelectedIndex(index);
    switch (value) {
      case 'Admin':
        if (campfireData?.isAdmin) {
          assignAdmin({
            variables: {
              campfireId: campfireData?.id,
              assigneeId: member.user.id,
              updatedBy: userId,
            },
          });
        }
        break;
      case 'Block':
        setBlockTheUser(true);
        setBlockModal(true);
        break;
      case 'Remove':
        setRemoveModal(true);
        break;
      case 'Member':
        if (campfireData?.isAdmin) {
          checkIfOtherAdminExists({
            variables: { campfireId: campfireData?.id, userId },
            context: {
              headers: { Authorization: `Bearer ${token}` },
            },
          })
            .then((result) => {
              const hasOtherAdmin =
                (result.data as any)?.campfire_users?.length > 0;

              if (hasOtherAdmin) {
                assignMember({
                  variables: {
                    campfireId: campfireData?.id,
                    userId: member.user.id,
                    updatedBy: userId,
                  },
                });
              } else {
                emitErrorNotification('No other admin found in this campfire.');
              }
            })
            .catch((err) => {
              emitErrorNotification(formatGraphqlError(err));
            });
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const CustomDropdownIndicator = (
    props: DropdownIndicatorProps<unknown, boolean, GroupBase<unknown>>,
  ) => {
    const { selectProps } = props;
    return (
      <components.DropdownIndicator {...props}>
        {selectProps.menuIsOpen ? <FaChevronUp /> : <FaChevronDown />}
      </components.DropdownIndicator>
    );
  };

  const handleMakePostClick = () => {
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSaveClick = () => {
    editDescription({
      variables: { campfireId: campfireData?.id, description },
    });
  };

  useEffect(() => {
    if (token !== '') {
      getPopularHashtags({
        variables: { campfireId: campfireData.id, search: '%%' },
        context: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });
    }
  }, [getPopularHashtags, campfireData.id, token]);

  const handleBlockTheUser = (member: CampfireUser) => {
    Promise.resolve(
      dispatch(blockUser(member.user.id, router.pathname, campfireData?.id)) as any,
    ).finally(() => {
      // Ensure member list + count update immediately after blocking
      refetchMembersList();
      setBlockModal(false);
      setBlockTheUser(false);
    });
  };

  const handleRemove = (member: CampfireUser) => {
    removeUser({
      variables: {
        campfireId: campfireData?.id,
        userId: member.user.id,
        deletedBy: userId,
      },
    });
    setRemoveModal(false);
  };

  const handleDescriptionChange = (name: string) => {
    const trimmedInput = name.trim();
    const inputLength = trimmedInput.length;
    const charCount = validations.getRemainingCharOrWordCount(
      trimmedInput,
      500,
    );
    if (charCount >= 0) {
      if (inputLength === 0) {
        setDescription('');
      } else if (inputLength > 500) {
        setDescription(trimmedInput.slice(0, 500));
      } else {
        setDescription(name);
      }
    }
  };

  useEffect(() => {
    setDescription(campfireData.description || '');
  }, [campfireData]);

  return (
    <div
      className={`${
        isDesktop
          ? 'ml-6 mt-4 h-fit w-[363px] bg-skyBlue-300'
          : 'mt-4 h-fit bg-skyBlue-300'
      }`}
    >
      <div className="space-y-4 p-4">
        <div className="rounded-lg bg-white p-4">
            <div className="flex justify-between">
              <Text color="text-black" font="font-medium">
                About
              </Text>
              {campfireData.isAdmin &&
                (isEditing ? (
                  <div className="cursor-pointer " onClick={handleSaveClick}>
                    <Text size="3xl" color="text-primary">
                      SAVE
                    </Text>
                  </div>
                ) : (
                  <FiEdit2
                    className="cursor-pointer text-primary"
                    size={18}
                    onClick={() => setIsEditing(true)}
                  />
                ))}
            </div>

            <div className="mt-2">
              {isEditing ? (
                <TextArea
                  className="w-full rounded border p-2"
                  value={description}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleDescriptionChange(event.target.value)
                  }
                />
              ) : (
                description ? (
                  <Text customClass="break-all" size="sm">
                    {description}
                  </Text>
                ) : (
                  <div className='px-18'>
                    <CustomImage src={null_about} alt="No description available" />
                  </div>
                )
              )}
            </div>
          </div>

        <div className="rounded-lg bg-white p-4">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Text color="text-black" font="font-medium">
                Members
              </Text>
              <div className="mt-1">
                <Text size="xs" color="text-white-1000">
                  ({visibleMembers?.length})
                </Text>
              </div>
            </div>
          </div>
          <div className={`mt-2 ${isNonMemberCampfire ? '' : ''}`}>
            {visibleMembers &&
              visibleMembers
                .slice(0, 3)
                .map((member: CampfireUser, index: number) => (
                  <div
                    key={member.id || index}
                    className="mt-2 flex items-center"
                  >
                    <div className="h-12 w-12">
                      <CustomImage
                        height={20}
                        width={20}
                        src={member.user?.profilePicture}
                        fallbackSrc="/images/userImage.svg"
                      />
                    </div>
                    <div
                      className={`ml-2 ${
                        isNonMemberCampfire && !campfireData?.is_public
                          ? 'blur-sm'
                          : ''
                      }`}
                    >
                      <Text>{member.user?.name}</Text>
                      <Text size="sm">{capitalize(member.role)}</Text>
                    </div>
                  </div>
                ))}
          </div>
          <div
            className="mt-4 cursor-pointer text-center"
            onClick={() => setShowModal(!showModal)}
          >
            <Text size="3xl" color="text-primary">
              View all members
            </Text>
          </div>

          <Modal
            id="modal1"
            isVisible={showModal}
            onClose={() => {
              setShowModal(!showModal);
              dispatch(setIsMemberModalOpen(false));
            }}
            closeIconClass="!z-0"
          >
            <div className="space-y-4 p-0 lg:p-2">
              {visibleMembers &&
                visibleMembers.map((member: CampfireUser, index: number) => (
                  <div key={member.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        <div className="h-15 w-15 min-w-[60px]">
                          <CustomImage
                            height={20}
                            width={20}
                            src={member.user.profilePicture}
                            fallbackSrc="/images/userImage.svg"
                          />
                        </div>
                        <div
                          className={`ml-2 break-all ${
                            isNonMemberCampfire && !campfireData?.is_public
                              ? 'blur-sm'
                              : ''
                          }`}
                        >
                          <Text>{member.user.name}</Text>
                          <Text size="sm">{capitalize(member.role)}</Text>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!campfireData?.isMember) {
                            setCampfireJoin(true);
                          }
                        }}
                        className="flex flex-col items-end justify-center lg:flex-row lg:items-center"
                      >
                        {!member.user.isBlocked && (
                          <div
                            className={
                              !campfireData?.isMember
                                ? 'pointer-events-none'
                                : ''
                            }
                          >
                            <FollowButton
                              postUserId={member.user.id}
                              isFollowing={member.user.isFollowing}
                            />
                          </div>
                        )}
                        <div className="pl-4 pt-2 lg:pl-2 lg:pt-0">
                          {member.role === 'admin' &&
                          member.user.id === userId ? (
                            <div className="member-list">Admin</div>
                          ) : campfireData?.isAdmin ? (
                            <div>
                              <Select
                                className="select-member w-28 lg:w-30"
                                placeholder={capitalize(member.role)}
                                options={
                                  member.role === 'admin'
                                    ? actionAdminList
                                    : actionsList
                                }
                                onChange={(val) =>
                                  handleChange(
                                    val as SelectOption,
                                    member,
                                    index,
                                  )
                                }
                                components={{
                                  DropdownIndicator: CustomDropdownIndicator,
                                }}
                                isSearchable={false}
                                onMenuOpen={() => setOpenDropdownId(member.id)}
                                onMenuClose={() => setOpenDropdownId(null)}
                                menuIsOpen={openDropdownId === member.id}
                                menuPlacement={
                                  index === membersList.length - 1
                                    ? 'top'
                                    : 'bottom'
                                }
                              />
                            </div>
                          ) : (
                            <div className="member-list">
                              {capitalize(member.role)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Modal>

          <Modal
            id="BlockModal"
            isVisible={blockModal}
            onClose={() => {
              setBlockModal(false);
              setBlockTheUser(false);
            }}
          >
            {membersList && membersList?.length && (
              <BlockModal
                blockModal={blockModal}
                setBlockModal={setBlockModal}
                postUserId={visibleMembers[selectedIndex]?.user.id}
                handleBlock={() =>
                  handleBlockTheUser(visibleMembers[selectedIndex])
                }
                isBlockTheUser={isBlockTheUser}
                setBlockTheUser={setBlockTheUser}
              />
            )}
          </Modal>

          <Modal
            id="RemoveMember"
            isVisible={removeModal}
            onClose={() => setRemoveModal(false)}
          >
            <RemoveMember
              title="Remove Member"
              subTitle="Are you sure you want remove this member?"
              onCancel={() => setRemoveModal(false)}
              onSend={() => handleRemove(visibleMembers[selectedIndex])}
              onSendText="Remove"
              onCancelText="Cancel"
            />
          </Modal>
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="flex justify-between">
            <Text color="text-black" font="font-medium">
              General
            </Text>
          </div>
          <div
            className="mt-2 flex cursor-pointer items-center space-x-8"
            onClick={handleMakePostClick}
          >
            <FiEdit2 className="cursor-pointer text-primary" size={18} />
            <Text color="text-primary" size="3xl">
              Make a post
            </Text>
          </div>

          <Modal
            id="CampfireDash"
            isVisible={showShareModal}
            onClose={() => setShowShareModal(false)}
          >
            <ShareCampfireFlow
              setShareSteps={setShareSteps}
              shareSteps={shareSteps}
              campfireId={campfireData.id}
              onModalClose={() => (setShowShareModal(false), setShareSteps(0))}
            />
          </Modal>
          <div
            className="mt-2 flex cursor-pointer items-center space-x-7"
            onClick={(e) => {
              e.stopPropagation();
              if (!campfireData?.isMember) {
                setCampfireJoin(true);
              } else {
                setShowShareModal(true);
              }
            }}
          >
            <IoShareSocialOutline className="text-primary" size={22} />
            <Text color="text-primary" size="3xl">
              Spread the campfire
            </Text>
          </div>
          <JoinModal
            data={campfireData}
            toggleJoin={camfireJoin}
            setToggleJoin={setCampfireJoin}
            isHide
          />
        </div>

        <div className="rounded-lg bg-white p-4">
          <div className="">
            <Text color="text-black" font="font-medium">
              Popular hashtags
            </Text>
            <div>
              {loading ? (
                <TabletLoader />
              ) : isEmpty((data as any)?.campfire_hashtag_counts) || error ? (
                <div className="mt-2 text-center">
                  <CustomImage src={null_hashtag} alt="no hashtags" />
                </div>
              ) : (
                <div className="flex flex-wrap">
                  {data &&
                    (data as any).campfire_hashtag_counts
                      .slice(0, 10)
                      .map((hashtag: Hashtag) => (
                        <span
                          key={hashtag.id}
                          className={`mr-4 mt-3 ${
                            (disabledHashtags as any)?.hashtags?.some(
                              (item: { hashtag_name: string }) =>
                                item.hashtag_name === hashtag.hashtag_name,
                            )
                              ? 'cursor-not-allowed blur'
                              : 'cursor-pointer text-primary'
                          }`}
                          onClick={() => {
                            // Don't allow click if hashtag is disabled
                            if (
                              (disabledHashtags as any)?.hashtags?.some(
                                (item: { hashtag_name: string }) =>
                                  item.hashtag_name === hashtag.hashtag_name,
                              )
                            ) {
                              return;
                            }

                            setCampfireHashtagData(hashtag.hashtag_name);
                            if (
                              !isDesktop &&
                              setIsPostsSelected &&
                              setIsOverviewSelected
                            ) {
                              setIsPostsSelected(true);
                              setIsOverviewSelected(false);
                            }
                          }}
                        >
                          #{hashtag.hashtag_name}
                        </span>
                      ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <Text color="text-black" font="font-medium">
            Campfire&apos;s Rule
          </Text>
          {rulesQueryLoading ? (
            <TabletLoader />
          ) : isEmpty(rulesData) || rulesQueryError ? (
            <div className="mt-2 text-center">
              <CustomImage src={null_rule} alt="No rules available" />
            </div>
          ) : (
            <div className="mt-2 space-y-4">
              {rulesData.slice(0, 3).map((rule: Rule, index: number) => (
                <Text key={rule.id} size="sm" color="text-black">
                  {index + 1}. {rule.rule}
                </Text>
              ))}
              {rulesData && (
                <div
                  className="mt-4 cursor-pointer text-center"
                  onClick={() => setShowRulesModal(true)}
                >
                  <Text size="3xl" color="text-primary">
                    See All
                  </Text>
                </div>
              )}
              <Modal
                id="modal1"
                isVisible={showRulesModal}
                onClose={() => setShowRulesModal(!showRulesModal)}
              >
                <div className="p-2">
                  <div>
                    <Text size="2xl" variant color="text-black-1200">
                      Rules of this campfire
                    </Text>
                    <Text font="font-light">
                      There are some rules that you need to follow while posting
                      anything to this campfire
                    </Text>
                  </div>
                  <div className="mt-6">
                    <div className="space-y-6">
                      {rulesData &&
                        rulesData.map((rule: Rule) => (
                          <div key={rule.id}>
                            <Text
                              size="3xl"
                              color="text-black-1200"
                              font="font-medium"
                            >
                              {rule.rule}
                            </Text>
                            <Text size="sm" color="text-black-1200">
                              {rule.description}
                            </Text>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampfireOverview;
