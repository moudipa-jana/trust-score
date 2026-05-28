{
  /**
   * PeopleSearch queries and displays a list of users based on a search query.
   * Supports paginated loading, profile navigation, post/follow stats, and responsive UI for both desktop and mobile.
   */
}
import { useMutation } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import HighlightText from '@/components/Utility/HighlightText';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  formatGraphqlError,
  getDefaultProfileImage,
} from '@/lib/helpers';
import { SEARCH_QUERY_TEXT } from '@/service/graphql/Forum';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { IPeopleSearch } from '@/types/search';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface PeopleSearchProps {
  query: string;
  postPeople?: boolean;
}

interface PeopleSearchResponse {
  paginatedSearch: {
    data: {
      people: IPeopleSearch[];
    };
  };
}

const PeopleSearch = ({ query, postPeople }: PeopleSearchProps) => {
  const [peopleData, setPeopleData] = useState<IPeopleSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadMore, setLoadMore] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const profileId = useAppSelector(getUserId);
  const ismobile = useIsMobile();
  const blockerIds = useUsersWhoBlockedMe();

  const handleClick = (data: IPeopleSearch) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (profileId === data.id) {
      router.push('/profile#activities');
      return;
    }
    router.push(`/user/${encodeURIComponent(data.name)}`);
  };

  const [fetchPeople] = useMutation<PeopleSearchResponse>(SEARCH_QUERY_TEXT, {
    context: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    onCompleted: (response, clientOptions) => {
      setLoading(false);
      setFetchMoreLoading(false);
      let data = get(response, 'paginatedSearch.data.people', []);
      if (data?.length > 0) {
        data = data.filter((person: any) => !blockerIds.has(person.id));
      }
      if (!data.length || data.length < 5) {
        setLoadMore(false);
      } else {
        setLoadMore(true);
      }
      if (clientOptions?.variables?.offset) {
        setPeopleData((prevData) => [...prevData, ...data]);
      } else {
        setPeopleData(data);
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
          searchCategory: 'people',
          limit,
          offset,
        },
      });
    },
    [fetchPeople],
  );

  useEffect(() => {
    if (query) {
      handleFetch(query, 0, postPeople ? 4 : 5);
    } else {
      setLoading(false);
    }
  }, [query, handleFetch, postPeople]);

  const handleLoadMore = () => {
    setFetchMoreLoading(true);
    handleFetch(query, peopleData.length);
  };

  return (
    <div>
      {!postPeople && (
        <Text size="md" color="text-black">
          Users
        </Text>
      )}
      {loading ? (
        <div
          className="mt-20 mb-20 flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <TabletLoader style={{ height: 150 }} />
        </div>
      ) : isEmpty(peopleData) ? (
        <div className="layout mb-20 flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            No result found
          </p>
          <p className='text-sm text-gray-500'>
            We couldn’t find any results for your search
          </p>
        </div>
      ) : (
        <ul className="py-2" style={{ minHeight: 300 }}>
          {peopleData.map((data) => {
            if (isEmpty(data)) {
              return null;
            }
            return (
              <li
                key={data.id}
                className={`${postPeople
                  ? 'my-2 flex cursor-pointer rounded-lg bg-skyBlue-100 px-3 py-1'
                  : 'my-4 flex cursor-pointer items-center gap-x-3 rounded-lg bg-skyBlue-100 py-5 px-3 lg:py-6 lg:px-10'
                  }`}
                onClick={() => handleClick(data)}
              >
                {postPeople ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="h-12 w-12">
                      <CustomImage
                        src={getDefaultProfileImage(data.profilePicture)}
                        fill
                      />
                    </div>
                    <div>
                      <Text font="font-bold">
                        <HighlightText title={data.name} highlight={query} />
                      </Text>
                      <div className="flex flex-wrap items-center space-x-2">
                        <Text color="text-offwhite-1000" size="sm">
                          {get(data, 'postCount', 0)} Posts
                        </Text>
                        <span className="campfire-dot-search"></span>
                        <Text color="text-offwhite-1000" size="sm">
                          {get(data, 'followersCount', 0)} Followers
                        </Text>
                        <span className="campfire-dot-search"></span>
                        <Text color="text-offwhite-1000" size="sm">
                          {get(data, 'followingCount', 0)} Followings
                        </Text>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-x-2 lg:gap-x-3">
                    <div className="h-10 w-10 lg:h-20 lg:w-20">
                      <CustomImage
                        src={getDefaultProfileImage(data.profilePicture)}
                        fill
                      />
                    </div>
                    <div>
                      {ismobile ? (
                        <Text size="md" font="font-bold">
                          <HighlightText title={data.name} highlight={query} />
                        </Text>
                      ) : (
                        <div className="flex flex-wrap items-center gap-x-3">
                          <Text size="md" font="font-bold">
                            <HighlightText
                              title={data.name}
                              highlight={query}
                            />
                          </Text>
                          <span className="campfire-dot-search"></span>
                          <Text color="text-offwhite-1000" size="base">
                            {get(data, 'postCount', 0)} Posts
                          </Text>
                          <span className="campfire-dot-search"></span>
                          <Text color="text-offwhite-1000" size="base">
                            {get(data, 'followersCount', 0)} Followers
                          </Text>
                          <span className="campfire-dot-search"></span>
                          <Text color="text-offwhite-1000" size="base">
                            {get(data, 'followingCount', 0)} Followings
                          </Text>
                        </div>
                      )}
                      <div>
                        <Text
                          color="text-gray-1050"
                          size="base"
                          customClass="truncate w-[190px] lg:w-[432px] xl:w-[723px]"
                        >
                          {data.about}
                        </Text>
                      </div>
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 lg:ml-10 xl:ml-16"
                    >
                      <FollowButton
                        postUserId={data.id}
                        isFollowing={data.isFollowing}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {showLoadMore && !postPeople && (
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
  );
};

export default PeopleSearch;
