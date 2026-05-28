{
  /**
   * CampfireSearch fetches and displays a list of campfires matching the search query.
   * It includes support for mobile and desktop layouts, handles pagination, and integrates Join functionality.
   */
}
import { useMutation } from '@apollo/client/react';
import { capitalize, get, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import HighlightText from '@/components/Utility/HighlightText';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { SEARCH_QUERY_TEXT } from '@/service/graphql/Forum';
import { selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { ICampfireSearch } from '@/types/search';

interface CampfireSearchProps {
  query: string;
  postCampfire?: boolean;
}

const CampfireSearch = ({ query, postCampfire }: CampfireSearchProps) => {
  const [campfireData, setCampfireData] = useState<ICampfireSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadMore, setLoadMore] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const ismobile = useIsMobile();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const handleClick = (title: string) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    router.push(`/campfire/${encodeURIComponent(title)}`);
  };

  const [fetchPeople] = useMutation(SEARCH_QUERY_TEXT, {
    context: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    onCompleted: (response, clientOptions) => {
      setLoading(false);
      setFetchMoreLoading(false);
      const data = get(response, 'paginatedSearch.data.campfires', []);
      if (!data.length || data.length < 5) {
        setLoadMore(false);
      } else {
        setLoadMore(true);
      }
      if (clientOptions?.variables?.offset) {
        setCampfireData((prevData) => [...prevData, ...data]);
      } else {
        setCampfireData(data);
      }
    },
    onError: (err) => {
      setLoading(false);
      setLoadMore(false);
      setFetchMoreLoading(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleFetch = React.useCallback(
    (searchQuery: string, offset = 0, limit = 5) => {
      fetchPeople({
        variables: {
          searchQuery,
          searchCategory: 'campfires',
          limit,
          offset,
        },
      });
    },
    [fetchPeople],
  );

  useEffect(() => {
    if (query) {
      handleFetch(query, 0, postCampfire ? 3 : 5);
    } else {
      setLoading(false);
    }
  }, [query, handleFetch, postCampfire]);

  const handleLoadMore = () => {
    setFetchMoreLoading(true);
    handleFetch(query, campfireData.length);
  };

  return (
    <div className="mb-20 flex">
      <div className="w-[730px]">
        {loading ? (
          <div
            className="mt-20 mb-20 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <TabletLoader style={{ height: 150 }} />
          </div>
        ) : isEmpty(campfireData) ? (
          <div className="layout mb-20 flex flex-col items-center justify-center gap-3 text-center">
            <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
            <p className="text-sm font-bold text-gray-500">No result found</p>
            <p className="text-sm text-gray-500">
              We couldn’t find any results for your search
            </p>
          </div>
        ) : (
          <ul className="py-2">
            {campfireData.map((data) => {
              return (
                <li
                  key={data.id}
                  className="my-4 flex cursor-pointer items-center gap-3 rounded-lg bg-yellow-1000 py-3 px-2"
                  onClick={() => handleClick(data.title)}
                >
                  {ismobile ? (
                    <div className="w-full">
                      <div className="flex">
                        <div className="aspect-square w-14">
                          <CustomImage
                            src={getDefaultCampfireImage(data?.picture)}
                            fill
                          />
                        </div>
                        <div className="ml-2">
                          <Text size="sm" font="font-bold">
                            <HighlightText
                              title={data.title}
                              highlight={query}
                            />
                          </Text>
                          <div className="flex flex-wrap items-center gap-x-2">
                            <Text color="text-black" size="xxs">
                              {capitalize(data.category?.title)}
                            </Text>
                            <span className="campfire-dot-search"></span>
                            <Text color="text-black" size="xxs">
                              {data.noParticipants} Members
                            </Text>
                            <span className="campfire-dot-search"></span>
                            <Text color="text-black" size="xxs">
                              {data.campfirePostsCount.aggregate.count} Posts
                            </Text>
                          </div>
                        </div>
                        <div
                          className="ml-auto px-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <JoinModal data={data} buttonSize="sm" />
                        </div>
                      </div>
                      <div className="py-2">
                        <Text
                          color="text-gray-1050"
                          size="xs"
                          customClass="line-clamp-2 w-[340px]"
                        >
                          {data.description}
                        </Text>
                      </div>
                      <Text size="xxs" color="text-gray-1050">
                        Created on{' '}
                        {appDayjs(data.createdAt).format('DD-MMM-YYYY')}
                      </Text>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-square w-24 shrink-0">
                        <CustomImage
                          src={getDefaultCampfireImage(data?.picture)}
                          fill
                        />
                      </div>
                      <div className="flex w-full justify-between">
                        {postCampfire ? (
                          <div className="space-y-2">
                            <Text size="sm" font="font-bold">
                              <HighlightText
                                title={data.title}
                                highlight={query}
                              />
                            </Text>
                            <div className="flex items-center gap-x-2">
                              <Text color="text-black" size="sm">
                                {data.noParticipants} Members
                              </Text>
                              <span className="campfire-dot-search"></span>
                              <Text color="text-black" size="sm">
                                {capitalize(data.category?.title)}
                              </Text>
                            </div>
                            <Text size="xs" color="text-gray-1050">
                              Created on{' '}
                              {appDayjs(data.createdAt).format('DD-MMM-YYYY')}
                            </Text>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-wrap items-center gap-x-3">
                              <Text size="md" font="font-bold">
                                <HighlightText
                                  title={data.title}
                                  highlight={query}
                                />
                              </Text>
                              <span className="campfire-dot-search"></span>
                              <Text color="text-black">
                                {capitalize(data.category?.title)}
                              </Text>
                              <span className="campfire-dot-search"></span>
                              <Text color="text-black">
                                {data.noParticipants} Members
                              </Text>
                              <span className="campfire-dot-search"></span>
                              <Text color="text-black">
                                {data.campfirePostsCount.aggregate.count} Posts
                              </Text>
                            </div>
                            <Text
                              color="text-gray-1050"
                              size="base"
                              customClass="truncate w-full lg:max-w-[504px] xl:max-w-[764px]"
                            >
                              {data.description}
                            </Text>
                            <div className="mt-2">
                              <Text size="xs" color="text-gray-1050">
                                Created on{' '}
                                {appDayjs(data.createdAt).format('DD-MMM-YYYY')}
                              </Text>
                            </div>
                          </div>
                        )}

                        {!postCampfire && (
                          <div
                            className="px-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <JoinModal data={data} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
            {showLoadMore && !postCampfire && (
              <div className="flex justify-center">
                <Button
                  customClassName="w-44"
                  isLoading={fetchMoreLoading}
                  size="lg"
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CampfireSearch;
