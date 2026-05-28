import { useLazyQuery } from '@apollo/client/react';
import { debounce, isEmpty } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import JoinCapmfireCard from '@/components/pages/Forum/campfire/JoinCapmfireCard';
import Carousel from '@/components/Utility/Carousel';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import SearchComponent from '@/components/Utility/SearchComponent';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { CAMPFIRE_FALLBACK_PROFILE_PIC } from '@/lib/constants';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  GET_USER_INTERESTS,
  JOIN_CAMPFIRE_QUERY,
  SEARCH_CAMPFIRE_QUERY,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { CampfireDetails } from '@/types/campfire';

function JoinCampfire({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState(false);
  const token = useAppSelector(selectGetToken);
  const isMobile = useIsMobile();
  const userId = useAppSelector(getUserId);
  const [key, setKey] = useState(0);
  const router = useRouter();

  const [
    joinCampfireQuery,
    {
      data: joinCampfireData,
      loading: joinCampfireLoading,
      error: joinCampfireError,
    },
  ] = useLazyQuery(JOIN_CAMPFIRE_QUERY, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (joinCampfireError) {
      emitErrorNotification(formatGraphqlError(joinCampfireError));
    }
  }, [joinCampfireError]);

  const [
    getUserInterestsList,
    { data: userInterestsData, error: userInterestsError },
  ] = useLazyQuery(GET_USER_INTERESTS, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if ((userInterestsData as any)?.user_interests) {
      const response = userInterestsData as any;
      const CategoryIdsList = response?.user_interests?.length
        ? response.user_interests.map(
            (item: { categoryId: string }) => item.categoryId,
          )
        : [];
      joinCampfireQuery({
        variables: { categoryIds: CategoryIdsList },
        context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      });
    }
  }, [userInterestsData, joinCampfireQuery, token]);

  useEffect(() => {
    if (userInterestsError) {
      emitErrorNotification(formatGraphqlError(userInterestsError));
    }
  }, [userInterestsError]);

  useEffect(() => {
    getUserInterestsList({
      variables: { userId },
      context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    });
  }, [getUserInterestsList, userId, token]);

  const [searchCampfire, { data, loading }] = useLazyQuery(
    SEARCH_CAMPFIRE_QUERY,
  );

  const searchCampfireName = useCallback(
    async (name: string) => {
      try {
        await searchCampfire({
          variables: { text: name?.length > 0 ? `%${name}%` : '%%' },
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      } catch (err) {
        emitErrorNotification('Oops,something went wrong!');
      }
    },
    [searchCampfire, token],
  );

  const debounceCampfireName = useMemo(() => {
    return debounce(searchCampfireName, 400);
  }, [searchCampfireName]);

  useEffect(() => {
    setKey((prev) => {
      if (prev) return 0;
      return 1;
    });
  }, [search, data]);

  const campfireSlides = useMemo(() => {
    return search
      ? (data as any)?.campfires
      : (joinCampfireData as any)?.campfires?.slice(0, 10);
  }, [search, data, joinCampfireData]);

  const handleChange = (name: string) => {
    setSearch(true);
    debounceCampfireName(name);
  };

  const handleClick = (campfireData: CampfireDetails) => {
    if (campfireData) {
      const handleRouteChange = () => {
        onClose();
        router.events.off('routeChangeComplete', handleRouteChange);
      };

      router.events.on('routeChangeComplete', handleRouteChange);
      router.push(`/campfire/${encodeURIComponent(campfireData.title)}`);
    }
  };

  return (
    <div className="animated fadeIn faster campfire-modal pt-10 lg:pt-4 ">
      <div className="flex flex-col items-start justify-center lg:flex-row lg:items-center lg:justify-between">
        <Text size="lg" color="text-black-900">
          Campfires you might like
        </Text>
        <SearchComponent
          type="outline"
          placeholder="Search Page"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(e.target.value)
          }
        />
      </div>
      <style jsx>{`
        :global(.campfire-modal .slick-track) {
          display: flex !important;
        }
        :global(.campfire-modal .slick-slide) {
          height: auto !important;
          display: flex !important;
        }
        :global(.campfire-modal .slick-slide > div) {
          height: 100%;
          width: 100%;
        }
      `}</style>
      <div className=" py-4">
        <Carousel
          key={key}
          slidesToShow={3}
          mdSlidesToShow={3}
          smSlidesToShow={1}
          slidesToScroll={1}
          arrow
          fade
          joinCampfire
        >
          {loading ||
          joinCampfireLoading ||
          campfireSlides === undefined ||
          campfireSlides === null ? (
            <div>
              <TabletLoader style={{ height: isMobile ? 140 : 200 }} />
            </div>
          ) : isEmpty(campfireSlides) ? (
            <div className="py-10 text-error">
              <Text size="md">Oops, Cannot find any campfire. </Text>
            </div>
          ) : (
            campfireSlides.map((searchCampfireData: CampfireDetails) => (
              <div
                onClick={() => {
                  if (searchCampfireData) {
                    handleClick(searchCampfireData);
                  }
                }}
                key={searchCampfireData.id}
                className="cursor-pointer h-full"
              >
                <div className="card-container h-full flex flex-col relative rounded-xl border-[1px] border-primary bg-white p-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="userPhoto mr-2 h-7 w-7 rounded-full lg:h-20 lg:w-20">
                        <div className="image-container">
                          <Image
                            alt="user avatar"
                            unoptimized
                            src={
                              getDefaultCampfireImage(
                                searchCampfireData?.picture,
                              )
                                ? getDefaultCampfireImage(
                                    searchCampfireData?.picture,
                                  )
                                : CAMPFIRE_FALLBACK_PROFILE_PIC
                            }
                            width={72}
                            height={72}
                            onError={(e) => {
                              e.currentTarget.src =
                                CAMPFIRE_FALLBACK_PROFILE_PIC;
                            }}
                            className="image rounded-full"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <JoinCapmfireCard
                    title={searchCampfireData.title}
                    details={searchCampfireData.description}
                    Participants={searchCampfireData.noParticipants}
                    data={searchCampfireData}
                  />
                </div>
                {/* </Card> */}
              </div>
            ))
          )}
        </Carousel>
      </div>
    </div>
  );
}

export default JoinCampfire;
