import { useLazyQuery, useMutation } from '@apollo/client/react';
import { capitalize } from 'lodash';
import router from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
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
import InviteModal from '@/components/pages/Campfire/InviteFlow';
import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import RemoveMember from '@/components/pages/Campfire/RemoveMember';
import Alert from '@/components/Utility/Alert';
import BlockModal from '@/components/Utility/BlockModal';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import { useIsMobile } from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  ASSIGN_ADMIN_AS_MEMBER,
  ASSIGN_CAMPFIRE_ADMIN_MUTATION,
  CHECK_IF_OTHER_ADMIN_IN_CAMPFIRE,
  LEAVE_CAMPFIRE,
  QUERY_FETCH_CAMPFIRE_DETAILS,
  REMOVE_CAMPFIRE_USER,
} from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';
import {
  campfireFetchSuccess,
  removeUser,
  updateCampfire,
} from '@/state/Slices/campfire';
import { CampfireDetails } from '@/types/campfire';

import add from '../../../../public/images/add.png';
import adminn from '../../../../public/images/adminn.png';
import leave from '../../../../public/images/leave.png';

interface CampfireMember {
  id: string;
  role: 'admin' | 'member' | string;
  user: {
    id: string;
    name: string;
    profilePicture: string;
    isFollowing: boolean;
  };
}

interface SelectOption {
  value: 'Admin' | 'Member' | 'Block' | 'Remove' | string;
  label: string;
}

export interface InviteBoard {
  data: CampfireDetails;
  showModal?: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InviteBoard({
  data,
  showModal,
  setShowModal,
}: InviteBoard) {
  const [adminState, setAdminState] = useState(false);
  const [adminState1, setAdminState1] = useState(false);
  const campfireName = Array.isArray(router?.query?.name)
    ? decodeURIComponent(router?.query?.name[0])
    : decodeURIComponent(router?.query?.name as string);

  const dispatch = useAppDispatch();

  const [toggelInvite, setToggelInvite] = useState(false);
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();
  const userId = useAppSelector(getUserId);
  const [blockModal, setBlockModal] = useState(false);
  const [isBlockTheUser, setBlockTheUser] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [removeModal, setRemoveModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const onCancel = () => {
    setAdminState(false);
  };

  const { token, campfireMembers } = useAppSelector((state) => ({
    token: state.auth.token,
    campfireDetails: state.campfire.campfireDetails,
    campfireMembers: state.campfire.campfireMembers,
  }));

  const [
    fetchCampfireDetails,
    { data: campfireDetailsData, error: campfireDetailsError },
  ] = useLazyQuery(QUERY_FETCH_CAMPFIRE_DETAILS, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if ((campfireDetailsData as any)?.campfires?.[0]) {
      const campfireDetailsData_response = (campfireDetailsData as any)
        .campfires[0];
      dispatch(campfireFetchSuccess(campfireDetailsData_response));
    }
  }, [campfireDetailsData, dispatch]);

  useEffect(() => {
    if (campfireDetailsError) {
      emitErrorNotification(formatGraphqlError(campfireDetailsError));
    }
  }, [campfireDetailsError]);

  const [leaveCampfire] = useMutation(LEAVE_CAMPFIRE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [assignAdmin] = useMutation(ASSIGN_CAMPFIRE_ADMIN_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (data) => {
      const campfireUserIdToUpdate = (data as any)?.update_campfire_users
        ?.returning?.[0]?.id;
      const newRole = (data as any)?.update_campfire_users?.returning?.[0]
        ?.role;

      const updatedMembers = campfireMembers.map(
        (campfireMember: CampfireMember) => {
          if (campfireMember.user.id === campfireUserIdToUpdate) {
            return {
              ...campfireMember,
              role: newRole,
            };
          }
          return campfireMember;
        },
      );

      dispatch(updateCampfire({ campfireMembers: updatedMembers }));

      emitNotification(
        'success',
        'User has been assigned as admin successfully!',
      );
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [removeCampfireUser] = useMutation(REMOVE_CAMPFIRE_USER, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (data) => {
      const campfireUserIdToRemove = (data as any)?.update_campfire_users
        ?.returning?.[0]?.userId;
      dispatch(removeUser(campfireUserIdToRemove));
      emitNotification('success', 'User has been removed successfully!');
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
    onCompleted: (data) => {
      const campfireUserIdToUpdate = (data as any)?.update_campfire_users
        ?.returning?.[0]?.id;
      const newRole = (data as any)?.update_campfire_users?.returning?.[0]
        ?.role;

      const updatedMembers = campfireMembers.map(
        (campfireMember: CampfireMember) => {
          if (campfireMember.user.id === campfireUserIdToUpdate) {
            return {
              ...campfireMember,
              role: newRole, // 👈 update the role
            };
          }
          return campfireMember;
        },
      );

      dispatch(updateCampfire({ campfireMembers: updatedMembers }));
      emitNotification(
        'success',
        'User has been added as a member successfully!',
      );
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const handleRoleChange = (
    selectedOption: SelectOption,
    member: CampfireMember,
    index: number,
  ) => {
    const { value } = selectedOption;
    setSelectedIndex(index);
    switch (value) {
      case 'Admin':
        if (data?.isAdmin) {
          assignAdmin({
            variables: {
              campfireId: data?.id,
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
        if (data?.isAdmin) {
          checkIfOtherAdminExists({
            variables: { campfireId: data?.id, userId },
            context: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          })
            .then((result) => {
              const hasOtherAdmin =
                (result.data as any)?.campfire_users?.length > 0;

              if (hasOtherAdmin) {
                assignMember({
                  variables: {
                    campfireId: data?.id,
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

  const handleLeaveCampfire = () => {
    const otherAdmins = campfireMembers.filter(
      (campfireMember: CampfireMember) =>
        campfireMember.role === 'admin' && campfireMember.user.id !== userId,
    );

    if (otherAdmins.length === 0) {
      emitNotification(
        'error',
        'You cannot leave the campfire. Please assign another admin before leaving.',
      );
      setAdminState1(false);
      return;
    }
    leaveCampfire({
      variables: {
        campfireId: data.id,
        userId: userId,
      },
      onCompleted: () => {
        fetchCampfireDetails({
          variables: {
            campfireName,
            userId,
          },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
        const updatedMembers = campfireMembers.filter(
          (campfireMember: CampfireMember) => campfireMember.user.id !== userId,
        );
        dispatch(updateCampfire({ campfireMembers: updatedMembers }));
        emitNotification('success', 'Campfire left successfully');
        dispatch(removeUser(userId));
        setAdminState(false);
      },
    });
  };

  const adminListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        adminListRef.current &&
        !adminListRef.current.contains(event.target as Node) &&
        adminState
      ) {
        setAdminState(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [adminState]);

  const handleRemove = (member: CampfireMember) => {
    removeCampfireUser({
      variables: {
        campfireId: data?.id,
        userId: member.user.id,
        deletedBy: userId,
      },
    });
    setRemoveModal(false);
  };

  const handleBlockTheUser = (member: CampfireMember) => {
    dispatch(blockUser(member.user.id, router.pathname, data?.id));
  };

  const CustomDropdownIndicator = (
    props: JSX.IntrinsicAttributes &
      DropdownIndicatorProps<unknown, boolean, GroupBase<unknown>>,
  ) => {
    const { selectProps } = props;
    return (
      <components.DropdownIndicator {...props} className="pointer-events-none">
        {selectProps.menuIsOpen ? <FaChevronUp /> : <FaChevronDown />}
      </components.DropdownIndicator>
    );
  };

  return (
    <>
      <InviteModal
        dialogVisible={toggelInvite}
        setDialogVisible={setToggelInvite}
        campfireId={data.id}
      />

      <Modal
        id="modal1"
        isVisible={showModal}
        onClose={() => setShowModal(!showModal)}
      >
        <div className="space-y-4 p-2">
          {campfireMembers &&
            campfireMembers.map((member: CampfireMember, index: number) => (
              <div key={member?.id}>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <div className="h-15 w-15">
                      <CustomImage
                        height={20}
                        width={20}
                        src={member?.user?.profilePicture}
                      />
                    </div>
                    <div className="ml-2 break-all">
                      <Text>{member?.user?.name}</Text>
                      <Text size="sm">{capitalize(member?.role)}</Text>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center lg:flex-row lg:items-center">
                    <FollowButton
                      postUserId={member?.user?.id}
                      isFollowing={member?.user?.isFollowing}
                    />
                    <div className="pl-4 pt-2 lg:pl-2 lg:pt-0">
                      {member?.role === 'admin' &&
                      member?.user?.id === userId ? (
                        <div className="member-list">Admin</div>
                      ) : data?.isAdmin ? (
                        <div className=" pt-4 lg:pt-0">
                          <Select
                            className="select-member w-28 lg:w-30"
                            placeholder={capitalize(member?.role)}
                            options={
                              member?.role === 'admin'
                                ? actionAdminList
                                : actionsList
                            }
                            onChange={(val) =>
                              handleRoleChange(
                                val as SelectOption,
                                member,
                                index,
                              )
                            }
                            components={{
                              DropdownIndicator: CustomDropdownIndicator,
                            }}
                            isSearchable={false}
                            onMenuOpen={() => setOpenDropdownId(member?.id)}
                            onMenuClose={() => setOpenDropdownId(null)}
                            menuIsOpen={openDropdownId === member?.id}
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
        id="BlockModal"
        isVisible={blockModal}
        onClose={() => {
          setBlockModal(false);
          setBlockTheUser(false);
        }}
      >
        {campfireMembers && campfireMembers?.length && (
          <BlockModal
            blockModal={blockModal}
            setBlockModal={setBlockModal}
            postUserId={campfireMembers[selectedIndex]?.user?.id}
            handleBlock={() =>
              handleBlockTheUser(campfireMembers[selectedIndex])
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
          onSend={() => handleRemove(campfireMembers[selectedIndex])}
          onSendText="Remove"
          onCancelText="Cancel"
        />
      </Modal>

      <div className="">
        <div
          className={` relative mx-4 grid lg:mx-0 ${
            data.isAdmin ? 'grid-cols-2' : 'grid-cols-1'
          }  gap-4 pt-2 lg:flex lg:items-center lg:gap-4  lg:py-0`}
        >
          <div className="" ref={adminListRef}>
            {data.isAdmin && (
              <Button
                block={!isDesktop ? true : false}
                type="secondary"
                textColor="text-gray-700"
                onClick={() => setAdminState(!adminState)}
                size={isMobile ? 'sm' : ''}
              >
                <div className="flex items-center  justify-center text-primary">
                  <div className="mr-2 h-4 w-4">
                    <CustomImage src={adminn} alt="AdminIcon" />
                  </div>
                  Admin
                  <IoIosArrowDown />
                </div>
              </Button>
            )}

            {adminState && (
              <div className="absolute top-14 right-4 z-10 w-[226px] bg-gray-1650 p-2">
                <div className="space-y-3">
                  <div
                    className="flex cursor-pointer items-center space-x-4"
                    onClick={() => setShowModal(!showModal)}
                  >
                    <div className="h-6 w-6">
                      <CustomImage src={add} alt="add" />
                    </div>
                    <Text size="md" color="text-primary">
                      Add admin
                    </Text>
                  </div>
                  <div className="line"></div>
                  <div
                    className="flex cursor-pointer items-center space-x-4"
                    onClick={handleLeaveCampfire}
                  >
                    <div className="h-6 w-6">
                      <CustomImage src={leave} alt="leave" />
                    </div>

                    <Text size="md" color="text-primary">
                      Leave campfire
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {adminState1 && (
              <div
                className=" arrow-top alertBox z-10 cursor-pointer"
                onClick={() => (
                  setAdminState1(!adminState1),
                  setAdminState(false)
                )}
              >
                <Alert
                  cancel={() => onCancel}
                  title="You can not leave. Before leaving please assign an admin."
                  isIcon
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21509 0.913451 7.4078C0.00519948 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6935 24 14.3734 24 12C23.9966 8.81846 22.7312 5.76821 20.4815 3.51852C18.2318 1.26883 15.1815 0.00344108 12 0ZM12.25 5C12.5467 5 12.8367 5.08797 13.0834 5.25279C13.33 5.41762 13.5223 5.65189 13.6358 5.92597C13.7494 6.20006 13.7791 6.50166 13.7212 6.79263C13.6633 7.08361 13.5204 7.35088 13.3107 7.56066C13.1009 7.77044 12.8336 7.9133 12.5426 7.97118C12.2517 8.02905 11.9501 7.99935 11.676 7.88582C11.4019 7.77229 11.1676 7.58003 11.0028 7.33335C10.838 7.08668 10.75 6.79667 10.75 6.5C10.75 6.10217 10.908 5.72064 11.1893 5.43934C11.4706 5.15803 11.8522 5 12.25 5ZM14.5 18.5H10.5C10.2348 18.5 9.98043 18.3946 9.7929 18.2071C9.60536 18.0196 9.5 17.7652 9.5 17.5C9.5 17.2348 9.60536 16.9804 9.7929 16.7929C9.98043 16.6054 10.2348 16.5 10.5 16.5H11.25C11.3163 16.5 11.3799 16.4737 11.4268 16.4268C11.4737 16.3799 11.5 16.3163 11.5 16.25V11.75C11.5 11.6837 11.4737 11.6201 11.4268 11.5732C11.3799 11.5263 11.3163 11.5 11.25 11.5H10.5C10.2348 11.5 9.98043 11.3946 9.7929 11.2071C9.60536 11.0196 9.5 10.7652 9.5 10.5C9.5 10.2348 9.60536 9.98043 9.7929 9.79289C9.98043 9.60536 10.2348 9.5 10.5 9.5H11.5C12.0304 9.5 12.5391 9.71071 12.9142 10.0858C13.2893 10.4609 13.5 10.9696 13.5 11.5V16.25C13.5 16.3163 13.5263 16.3799 13.5732 16.4268C13.6201 16.4737 13.6837 16.5 13.75 16.5H14.5C14.7652 16.5 15.0196 16.6054 15.2071 16.7929C15.3946 16.9804 15.5 17.2348 15.5 17.5C15.5 17.7652 15.3946 18.0196 15.2071 18.2071C15.0196 18.3946 14.7652 18.5 14.5 18.5Z"
                      fill="#FF0000"
                    />
                  </svg>
                </Alert>
              </div>
            )}
          </div>

          {data.isAdmin ? (
            <Button
              onClick={() => setToggelInvite(!toggelInvite)}
              block={!isDesktop ? true : false}
              size={isMobile ? 'sm' : ''}
            >
              <div className="flex items-center  justify-center">
                <AiOutlinePlus className="mr-2" />
                Invite
              </div>
            </Button>
          ) : (
            <JoinModal data={data} />
          )}
        </div>
      </div>
    </>
  );
}
