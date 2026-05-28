import { DocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import JoinedCard from '@/components/pages/User/JoinedCard';
import Button from '@/components/Utility/Button';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  QUERY_GUEST_CREATED_CAMPFIRES,
  QUERY_JOINED_CAMPFIRES,
} from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import CustomImage from '@/components/Utility/CustomImage';
import null_point from '/public/images/null_point.svg';

interface Campfire {
  id: string;
  title: string;
  picture?: string;
  noParticipants: number;
  campfire_users: {
    length: number;
    mute?: boolean;
  }[];
}

interface CampfireUser {
  mute: boolean;
  campfire: Campfire;
}

interface IUserCampfire {
  userId?: string;
  setCampfireModal?: (show: boolean) => void;
}

function UserCampfire({ userId, setCampfireModal }: IUserCampfire) {
  const token = useAppSelector(selectGetToken);
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const router = useRouter();

  const useCampfiresQuery = (query: DocumentNode) => {
    const { data, loading, error } = useQuery(query, {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      variables: {
        userId,
      },
    });

    useEffect(() => {
      if (error) {
        emitErrorNotification(formatGraphqlError(error));
      }
    }, [error]);

    return { data, loading, error };
  };

  const { data, loading } = useCampfiresQuery(QUERY_JOINED_CAMPFIRES);
  const { data: createdData, loading: createdLoading } = useCampfiresQuery(
    QUERY_GUEST_CREATED_CAMPFIRES,
  );

  const handlecampfireNavigation = (campfireTitle: string) => {
    router.push(`/campfire/${encodeURIComponent(campfireTitle)}`);
  };

  return (
    <div
      className={`${
        isDesktop && 'rounded-lg border border-white-800'
      } relative z-1 mt-4 mb-10 bg-white py-4 px-2 lg:mt-0 lg:mb-4 w-max`}
    >
      {isMobile ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-primary py-2 pl-3 pr-1">
            <Text size="base">Created</Text>
            {createdLoading ? (
              <div className="m-5 flex items-center justify-center" style={{ minHeight: 250 }}>
                <TabletLoader />
              </div>
            ) : (
              <div className="mt-2">
                <div
                  className={`scrollCustom space-y-3 overflow-x-hidden ${
                    (createdData as any)?.campfires?.length
                      ? "h-[134px] overflow-y-auto"
                      : ""
                  }`}
                >
                  {(createdData as any)?.campfires?.length ? (
                    (createdData as any).campfires.map((campfire: Campfire) => {
                      const isMuted =
                        campfire.campfire_users.length > 0 &&
                        campfire.campfire_users[0].mute;
                      return (
                        <div
                          key={campfire.id}
                          onClick={() => handlecampfireNavigation(campfire.title)}
                          className="cursor-pointer break-all"
                        >
                          <JoinedCard
                            picture={getDefaultCampfireImage(
                              campfire?.picture as string,
                            )}
                            name={campfire.title}
                            data={campfire}
                            members={campfire.noParticipants}
                            isMute={isMuted}
                            userId={userId}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center py-6">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <CustomImage
                          src={null_point}
                          alt="No campfire created"
                          className="w-28 h-auto"
                        />
                        <p className="text-sm font-bold text-gray-500">
                          No campfire created
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-md border border-primary py-2 pl-3 pr-1">
            <Text size="base">Joined</Text>
            {loading ? (
              <div className="m-5 flex items-center justify-center" style={{ minHeight: 250 }}>
                <TabletLoader />
              </div>
            ) : (
              <div className="mt-2">
                <div
                  className={`scrollCustom space-y-3 overflow-x-hidden ${
                    (data as any)?.campfire_users?.length
                      ? "h-[134px] overflow-y-auto"
                      : ""
                  }`}
                >
                  {(data as any)?.campfire_users?.length ? (
                    (data as any).campfire_users.map((campfire: CampfireUser) => (
                      <div
                        key={campfire.campfire.id}
                        onClick={() =>
                          handlecampfireNavigation(campfire.campfire.title)
                        }
                        className="cursor-pointer break-all"
                      >
                        <JoinedCard
                          picture={getDefaultCampfireImage(
                            campfire.campfire?.picture as string,
                          )}
                          name={campfire.campfire.title}
                          data={campfire.campfire}
                          members={campfire.campfire.noParticipants}
                          isMute={campfire.mute}
                          userId={userId}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-6">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <CustomImage
                          src={null_point}
                          alt="No campfire joined"
                          className="w-28 h-auto"
                        />
                        <p className="text-sm font-bold text-gray-500">
                          No campfire joined
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="ml-2">
            <Text size="base">Created</Text>
            {createdLoading ? (
              <div
                className="m-5 flex items-center justify-center"
                style={{ minHeight: 250 }}
              >
                <TabletLoader />
              </div>
            ) : (
              <div className="mt-2">
                <div
                  className={`scrollCustom space-y-3 overflow-x-hidden ${
                    (createdData as any)?.campfires?.length
                      ? "max-h-36 overflow-y-auto"
                      : ""
                  }`}
                >
                  {(createdData as any)?.campfires[0] ? (
                    (createdData as any)?.campfires.map(
                      (campfire: Campfire) => {
                        const isMuted =
                          campfire.campfire_users.length > 0 &&
                          campfire.campfire_users[0].mute;
                        return (
                          <div
                            key={campfire.id}
                            onClick={() =>
                              handlecampfireNavigation(campfire.title)
                            }
                            className="cursor-pointer"
                          >
                            <JoinedCard
                              picture={getDefaultCampfireImage(
                                campfire?.picture as string,
                              )}
                              name={campfire.title}
                              data={campfire}
                              members={campfire.noParticipants}
                              isMute={isMuted}
                              userId={userId}
                            />
                          </div>
                        );
                      },
                    )
                  ) : (
                    <div>
                      {router.pathname.includes('/user') ? (
                        <div className="text-center">
                          <div className="layout mx-18 flex flex-col items-center justify-center gap-3 text-center">
                            <CustomImage src={null_point} alt="No campfire created" className="w-32 h-auto"/>
                            <p className='text-sm font-bold text-gray-500'>
                              No result found
                            </p>
                          </div>
                          <div
                            className="mt-4"
                            onClick={() => {
                              if (setCampfireModal) setCampfireModal(true);
                            }}
                          ></div>
                        </div>
                      ) : (
                        <>
                          <div className="layout mx-18 flex flex-col items-center justify-center gap-3 text-center">
                            <CustomImage src={null_point} alt="No campfire created" className="w-32 h-auto"/>
                            <p className='text-sm font-bold text-gray-500'>
                              No result found
                            </p>
                          </div>
                          <div
                            className="mt-4"
                            onClick={() => {
                              if (setCampfireModal) setCampfireModal(true);
                            }}
                          >
                            <Button block>Build</Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="line my-6"></div>
          <div className="ml-2">
            <Text size="base">Joined</Text>
            {loading ? (
              <div
                className="m-5 flex items-center justify-center"
                style={{ minHeight: 250 }}
              >
                <TabletLoader />
              </div>
            ) : (
              <div className="mt-2">
                <div className={`scrollCustom space-y-3 overflow-x-hidden ${
                    (data as any)?.campfire_users?.length
                      ? "max-h-36 overflow-y-auto"
                      : ""
                  }`}
                >
                  {(data as any)?.campfire_users[0] ? (
                    (data as any)?.campfire_users.map(
                      (campfire: CampfireUser) => (
                        <div
                          key={campfire.campfire.id}
                          onClick={() =>
                            handlecampfireNavigation(campfire.campfire.title)
                          }
                          className="cursor-pointer"
                        >
                          <JoinedCard
                            picture={getDefaultCampfireImage(
                              campfire.campfire?.picture as string,
                            )}
                            name={campfire.campfire.title}
                            data={campfire.campfire}
                            members={campfire.campfire.noParticipants}
                            isMute={campfire.mute}
                            userId={userId}
                          />
                        </div>
                      ),
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="layout mx-18 flex flex-col items-center justify-center gap-3 text-center">
                        <CustomImage src={null_point} alt="No campfire created" className="w-32 h-auto"/>
                        <p className='text-sm font-bold text-gray-500'>
                          No result found
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserCampfire;
