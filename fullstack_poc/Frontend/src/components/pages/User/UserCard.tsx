import { get } from 'lodash';
import React from 'react';
import { useDispatch } from 'react-redux';

import Card from '@/components/Card';
import ProfileAbout from '@/components/pages/Profile/ProfileAbout';
import ProfileEdit from '@/components/pages/Profile/ProfileEdit';
import ProfileInterestedIn from '@/components/pages/Profile/ProfileInterestedIn';
import Button from '@/components/Utility/Button';
import FollowButton from '@/components/Utility/FollowButton';
import Text from '@/elements/Text';

import appDayjs from '@/lib/appDayjs';
import useAuthMutation from '@/Hooks/useAuthMutation';
import { useEffect, useState } from 'react';
import useIsipad from '@/Hooks/useIsIpad';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  getGuestUserBlockedStatus,
  setGuestUserBlockedStatus,
} from '@/state/Slices/profile';
import { UNBLOCK_USER_MUTATION } from '@/service/graphql/Profile';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';

import { GuestProfile, UserProfile } from '@/types/authentication';

import Image from '/public/images/userImage.svg';

interface IUserCardProps {
  user: UserProfile | GuestProfile;
}
function UserCard({ user }: IUserCardProps) {
  const isUserBlocked = useAppSelector(getGuestUserBlockedStatus);
  const dispatch = useDispatch();
  const { mutationFunction: UnblockUser } = useAuthMutation(
    UNBLOCK_USER_MUTATION,
    () => {
      dispatch(setGuestUserBlockedStatus(false));
    },
  );
  const blockerIds = useUsersWhoBlockedMe();

  const handleUnblock = () => {
    UnblockUser({
      variables: {
        blockedUserId: get(user, 'id'),
      },
    });
  };

  const isipad = useIsipad();
  const isDisabled = get(user, 'is_disabled_by_admin');

  // --- TRUST SCORE POC LOGIC ---
  const [trustScore, setTrustScore] = useState<number | null>(null);

  useEffect(() => {
    const userId = get(user, 'id');
    if (!userId) return;

    const fetchTrustScore = async () => {
      try {
        const response = await fetch('http://localhost:8080/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': 'myadminsecretkey' // For POC local only
          },
          body: JSON.stringify({
            query: `
            query GetUserTrustScores($userId: uuid!) {
              trust_scores(where: {author_id: {_eq: $userId}}) {
                trust_score
              }
            }
          `,
            variables: { userId }
          })
        });
        const data = await response.json();
        const scores = data?.data?.trust_scores;
        if (scores && scores.length > 0) {
          // Average the score across all active categories for the user's global profile badge
          const total = scores.reduce((sum: number, item: any) => sum + Number(item.trust_score), 0);
          setTrustScore(total / scores.length);
        } else {
          setTrustScore(50.0);
        }
      } catch (err) {
        console.error("Failed to fetch trust score:", err);
      }
    };

    fetchTrustScore();
  }, [user]);

  const getTrustBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    
    // Base styles for the badge
    const baseStyle = "inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full shadow-sm whitespace-nowrap transition-all duration-300";
    
    if (score >= 85.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 text-yellow-900 border border-yellow-400/50 shadow-[0_0_8px_rgba(251,191,36,0.4)]`}>
          <span className="mr-1">🌟</span> Legendary Voice
        </span>
      );
    }
    if (score >= 65.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300`}>
          <span className="mr-1">✓</span> Trusted
        </span>
      );
    }
    if (score >= 55.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-blue-50 to-sky-100 text-blue-700 border border-blue-200`}>
          Positive
        </span>
      );
    }
    if (score >= 35.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300`}>
          New Voice
        </span>
      );
    }
    if (score >= 20.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200`}>
          ⚠️ Warning
        </span>
      );
    }
    return (
      <span className={`${baseStyle} bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 opacity-80`}>
        🚫 Toxic
      </span>
    );
  };
  // -----------------------------

  return (
    <div className="rounded-lg bg-skyBlue-100 p-4">
      <Card
        variant="lg"
        profileImg={get(user, 'profilePicture') || Image}
        title={
          <div className="flex items-center gap-2">
            <span>{get(user, 'name')}</span>
            {getTrustBadge(trustScore)}
          </div>
        }
        showButton={isDisabled ? false : true}
        size="lg"
        userId={get(user, 'id')}
        isFollowing={get(user, 'isFollowing')}
        isDisabled={isDisabled}
        headingChildren={
          <ProfileEdit
            duration={appDayjs(get(user, 'createdAt', new Date())).format(
              'D MMM YYYY',
            )}
            followers={
              isUserBlocked ? 0 : (get(user, 'followersCount') as number) ?? 0
            }
            following={
              isUserBlocked ? 0 : (get(user, 'followingCount') as number) ?? 0
            }
            isEdit={false}
            userId={get(user, 'id')}
            isGuest
            isDisabled={isDisabled}
          />
        }
        isBorder
      >
        {get(user, 'about', undefined) && (
          <ProfileAbout
            title={`About ${get(user, 'name')}`}
            description={`${get(user, 'about')}`}
            isDisabled={isDisabled}
          />
        )}

        {get(user, 'user_interests', undefined) && (
          <ProfileInterestedIn
            isGuestUser
            userInterestedData={get(user, 'user_interests', undefined)}
            isDisabled={isDisabled}
          />
        )}

        {!isDisabled && (
          <div
            className={`mb-2 sm:block sm:flex-1 ${isipad ? '' : 'lg:hidden'}`}
          >
            {isUserBlocked ? (
              <div className="followBtnStyle">
                <Button
                  type="secondary"
                  size="xs"
                  onClick={handleUnblock}
                  textColor="text-black-500"
                  customClassName="w-full"
                >
                  <Text size="base" color="text-sky-500">
                    Unblock
                  </Text>
                </Button>
              </div>
            ) : blockerIds.has(get(user, 'id')) ? null : (
              <FollowButton
                postUserId={user?.id}
                isFollowing={get(user, 'isFollowing')}
                showFullButton
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default UserCard;