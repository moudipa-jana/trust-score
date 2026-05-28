import { useLazyQuery, useMutation } from '@apollo/client/react';
import React, { useEffect, useState } from 'react';

import { followUser, unFollowUser } from '@/actions/auth';
import List from '@/components/Utility/List';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import SearchComponent from '@/components/Utility/SearchComponent';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  QUERY_GET_FOLLOWERS,
  QUERY_GET_FOLLOWING,
  REMOVE_FOLLOWERS_MUTATION,
} from '@/service/graphql/Profile';
import {
  decreaseFollowersCount,
  followersCount,
  followingCount,
  getUserId,
} from '@/state/Slices/auth';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface FollowersListProps {
  tabName: string;
  index: number;
  token: string;
  userId: string;
  isGuest?: boolean;
}

interface FollowerUser {
  id: string;
  name: string;
  profilePicture: string;
  isFollowing: boolean;
}

interface FollowerData {
  [key: string]: FollowerUser;
}

function errorComponent(tabName: string, isGuest?: boolean) {
  const isFollower = tabName === 'follower';
  return (
    <div className="layout flex flex-col items-center justify-center gap-3 text-center">
      <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
      <p className="text-sm font-bold text-gray-500">
        {!isGuest && (isFollower ? 'No followers yet!' : 'No people found!')}
        {isGuest && (isFollower ? 'No followers found!' : 'No people found!')}
      </p>
      <p className="text-sm text-gray-500">
        {!isGuest && (isFollower
          ? 'Your followers will appear here. Invite friends to follow you!'
          : 'People you follow will appear here. Explore and follow your favorite users!')}
      </p>
    </div>
  );
}

const FollowersList = ({
  tabName,
  index,
  token,
  userId,
  isGuest,
}: FollowersListProps) => {
  const [selectId, setSelectId] = useState<string[]>([]);
  const [search, setNewSearch] = useState('');
  const [fetchedData, setFetchedData] = useState<FollowerData[]>([]);
  const dispatch = useAppDispatch();
  const userProfileId = useAppSelector(getUserId);

  const [
    getFollowers,
    { loading: followerLoading, data: followersData, error: followersError },
  ] = useLazyQuery(QUERY_GET_FOLLOWERS, {
    fetchPolicy: 'no-cache',
  });
  const [
    getFollowing,
    { loading: followingLoading, data: followingData, error: followingError },
  ] = useLazyQuery(QUERY_GET_FOLLOWING, {
    fetchPolicy: 'no-cache',
  });

  const [removeFollowers] = useMutation(REMOVE_FOLLOWERS_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response, clientOptions) => {
      dispatch(decreaseFollowersCount());
      setSelectId([...selectId, clientOptions?.variables?.userId]);
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  // Handle followers data and errors
  useEffect(() => {
    if (followersData) {
      setFetchedData((followersData as any).user_followers);
      dispatch(followersCount((followersData as any).user_followers.length));
    }
  }, [followersData, dispatch]);

  useEffect(() => {
    if (followersError) {
      emitErrorNotification(formatGraphqlError(followersError));
    }
  }, [followersError]);

  // Handle following data and errors
  useEffect(() => {
    if (followingData) {
      setFetchedData((followingData as any).user_followings);
      dispatch(followingCount((followingData as any).user_followings.length));
    }
  }, [followingData, dispatch]);

  useEffect(() => {
    if (followingError) {
      emitErrorNotification(formatGraphqlError(followingError));
    }
  }, [followingError]);

  useEffect(() => {
    setNewSearch('');
    setSelectId([]);
    if (tabName === 'follower') {
      getFollowers({
        variables: { userId: userId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } else {
      getFollowing({
        variables: { userId: userId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }
  }, [getFollowers, getFollowing, index, tabName, userId, token]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSearch(e.target.value);
  };

  const handleIsActive = (id: string, isFollowing: boolean): boolean => {
    if (isGuest) {
      if (isFollowing) {
        return false;
      } else {
        return true;
      }
    } else {
      return selectId.includes(id);
    }
  };

  const handleIsDisabled = (id: string): boolean => {
    if (tabName === 'follower') {
      return selectId.includes(id);
    }
    return false;
  };

  const handleButtonText = (
    id: string,
    isFollowing: boolean,
  ): string | null => {
    if (isGuest) {
      if (id === userProfileId) {
        return null;
      } else {
        return isFollowing ? 'Following' : 'Follow';
      }
    } else {
      if (tabName === 'follower') {
        return selectId.includes(id) ? 'Removed' : 'Remove';
      } else {
        return selectId.includes(id) ? 'Follow' : 'Following';
      }
    }
  };

  const handleOnClick = (id: string, isFollowing: boolean): void => {
    if (isGuest && userProfileId) {
      if (isFollowing) {
        dispatch(unFollowUser(id, userProfileId, token));
      } else {
        dispatch(followUser(id, userProfileId, token));
      }
      setFetchedData((prevData) => {
        return prevData.map((item) => {
          if (item[tabName].id === id) {
            return {
              ...item,
              [tabName]: {
                ...item[tabName],
                isFollowing: !isFollowing,
              },
            };
          }
          return item;
        });
      });
    } else {
      if (handleIsDisabled(id)) return;
      if (selectId.includes(id)) {
        if (tabName !== 'follower') dispatch(followUser(id, userId, token));
        const myArr = selectId.filter((item: string) => item !== id);
        setSelectId(myArr);
      } else {
        if (tabName !== 'follower') {
          dispatch(unFollowUser(id, userId, token));
        } else {
          removeFollowers({ variables: { userId: id } });
        }

        setSelectId([...selectId, id]);
      }
    }
  };

  function filterBySearch() {
    const filteredFetchData = fetchedData.filter(
      (ele: FollowerData) =>
        ele[tabName] &&
        ele[tabName].name.toLowerCase().includes(search.toLowerCase()),
    );
    if (Array.isArray(filteredFetchData) && filteredFetchData.length)
      return filteredFetchData;

    return null;
  }
  const isMobile = useIsMobile();

  function renderLogic() {
    if (
      followingLoading ||
      followerLoading ||
      (Array.isArray(fetchedData) &&
        fetchedData.length &&
        Object.keys(fetchedData[0])[0] !== tabName)
    ) {
      return (
        <div style={{ minHeight: 100 }}>
          <TabletLoader
            style={{
              marginTop: isMobile ? 30 : 120,
              height: isMobile ? 90 : 160,
            }}
          />
        </div>
      );
    }
    if (Array.isArray(fetchedData) && fetchedData.length) {
      return filterBySearch()
        ? filterBySearch()?.map((ele: FollowerData) => {
            return (
              <li className="list-none py-1" key={ele[tabName].id}>
                <List
                  src={ele[tabName].profilePicture}
                  key={ele[tabName].id}
                  user
                  type="textWithButton"
                  tag={
                    handleButtonText(
                      ele[tabName].id,
                      ele[tabName].isFollowing,
                    ) ?? ''
                  }
                  name={ele[tabName].name}
                  isActive={handleIsActive(
                    ele[tabName].id,
                    ele[tabName].isFollowing,
                  )}
                  isDisabled={handleIsDisabled(ele[tabName].id)}
                  onClick={() =>
                    handleOnClick(ele[tabName].id, ele[tabName].isFollowing)
                  }
                />
              </li>
            );
          })
        : errorComponent(tabName, isGuest);
    }
    return errorComponent(tabName, isGuest);
  }

  return (
    <div>
      <div className="w-full lg:w-1/2">
        <SearchComponent
          type="outline"
          variant="sm"
          placeholder="Search name"
          size="sm"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div className="word-wrap scrollCustom h-45 overflow-y-auto p-2 py-5 pr-4 lg:h-125">
        {renderLogic()}
      </div>
    </div>
  );
};

export default FollowersList;
