import { useQuery } from '@apollo/client/react';
import { capitalize, get, isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { AiFillStar, AiOutlineUser } from 'react-icons/ai';
import Select from 'react-select';

import userImage from '/public/images/userImage.svg';
import { actionsList } from '@/components/pages/Campfire/Constant';
import CustomImage from '@/components/Utility/CustomImage';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import NotFoundComponent from '@/components/Utility/NotFoundComponent';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { QUERY_GET_CAMPFIRE_MEMBER } from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { campfireMemberFetchSuccess } from '@/state/Slices/campfire';
import { CampfireDetails } from '@/types/campfire';

interface MembersProps {
  handleChange?: (
    value: { value: string; label: string },
    userId: string,
  ) => void;
  campfireId?: string;
}

interface CampfireMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

interface CampfireState {
  campfireMembers: CampfireMember[];
  campfireDetails: {
    isAdmin: boolean;
  };
}

function Members({ handleChange, campfireId }: MembersProps) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const { campfireMembers, campfireDetails } = useAppSelector<CampfireState>(
    (state) => ({
      campfireMembers: state.campfire.campfireMembers,
      campfireDetails: state.campfire.campfireDetails as CampfireDetails,
    }),
  );

  const { loading, error, data } = useQuery(QUERY_GET_CAMPFIRE_MEMBER, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      campfireId,
      search: '%%',
    },
    skip: token === '',
  });

  useEffect(() => {
    if ((data as any)?.campfire_users) {
      dispatch(campfireMemberFetchSuccess((data as any).campfire_users));
    }
  }, [data, dispatch]);

  return (
    <div className="scrollbar scrollbarCampfire">
      <ul className="">
        {loading ? (
          <div className="w-71 lg:w-110">
            <TabletLoader style={{ height: 100 }} />
          </div>
        ) : isEmpty(campfireMembers) || error ? (
          <div className="w-71 lg:min-w-110">
            <NotFoundComponent
              showRedirect
              errorMessage="Oops! We couldn't find the campfire Members"
            />
          </div>
        ) : (
          campfireMembers?.map((data: CampfireMember) => (
            <li key={data.id} className="member-li border-gray-1000">
              <div className="member-main">
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center rounded-full">
                    <CustomImage
                      width={50}
                      height={50}
                      src={data.user?.profilePicture || userImage}
                    />
                  </div>
                  <div className="campfire-name lg:truncate">
                    <Text size="base">{get(data, 'user.name', '')}</Text>
                  </div>
                  {get(data, 'role') === 'admin' ? (
                    <AiFillStar className="text-lg text-yellow-500" />
                  ) : (
                    <AiOutlineUser className="text-lg text-gray-700" />
                  )}
                </div>

                <div className="pl-4 pt-2 lg:pl-8 lg:pt-0">
                  {get(data, 'role') === 'admin' ? (
                    <div className="member-list">Admin</div>
                  ) : campfireDetails?.isAdmin ? (
                    <div className="pt-4 lg:pt-0">
                      <Select
                        className="select-member w-28 lg:w-30"
                        placeholder={capitalize(get(data, 'role'))}
                        options={actionsList}
                        onChange={(val) => {
                          if (handleChange)
                            handleChange(
                              val as unknown as {
                                value: string;
                                label: string;
                              },
                              get(data, 'user.id'),
                            );
                        }}
                      />
                    </div>
                  ) : (
                    <div className="member-list">Member</div>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Members;
