import { get } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import Image from '/public/images/userImage.svg';
import Card from '@/components/Card';
import ProfileAbout from '@/components/pages/Profile/ProfileAbout';
import ProfileEdit from '@/components/pages/Profile/ProfileEdit';
import ProfileInterestedIn from '@/components/pages/Profile/ProfileInterestedIn';
import Button from '@/components/Utility/Button';
import { useAppSelector } from '@/Hooks/useRedux';
import appDayjs from '@/lib/appDayjs';
import { selectGetUserProfile } from '@/state/Slices/auth';

export const getTrustBadge = (score: number | null | undefined) => {
  if (score === null || score === undefined) return null;
  
  const baseStyle = "ml-2 inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full shadow-sm whitespace-nowrap transition-all duration-300";
  
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

function ProfileCard() {
  const profile = useAppSelector(selectGetUserProfile);
  const [trustScore, setTrustScore] = useState<number | null>(null);

  useEffect(() => {
    const userId = get(profile, 'id');
    if (!userId) return;

    // Fetch user's overall trust score across categories
    fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'myadminsecretkey'
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
    })
    .then(res => res.json())
    .then(data => {
      const scores = data?.data?.trust_scores || [];
      if (scores.length > 0) {
        // Average the score across all active categories for the user's global profile badge
        const total = scores.reduce((sum: number, item: any) => sum + Number(item.trust_score), 0);
        setTrustScore(total / scores.length);
      } else {
        setTrustScore(50.0); // New Voice Baseline
      }
    })
    .catch(err => console.error("Failed to fetch trust scores", err));
  }, [profile]);

  if (!profile) {
    return (
      <div className="rounded-lg bg-skyBlue-100 p-4">
        <Card
          variant="lg"
          profileImg={Image}
          title="Loading..."
          size="lg"
          isBorder
        >
          <div className="pt-6 pb-2">Loading profile...</div>
        </Card>
      </div>
    );
  }
  console.log('profile', profile);

  return (
    <div className="rounded-lg bg-skyBlue-100 p-4">
      <Card
        variant="lg"
        profileImg={get(profile, 'profilePicture') || Image}
        title={
          <div className="flex items-center flex-wrap">
            <span>Hi! {get(profile, 'name')}</span>
            {getTrustBadge(trustScore)}
          </div>
        }
        size="lg"
        userId={get(profile, 'id')}
        headingChildren={
          <ProfileEdit
            duration={appDayjs(get(profile, 'createdAt', new Date())).format(
              'D MMM YYYY',
            )}
            followers={get(profile, 'followers') || 0}
            following={get(profile, 'following') || 0}
            isEdit
            userId={get(profile, 'id') || ''}
            isGuest={false}
          />
        }
        isBorder
      >
        <div className="pt-6 pb-2 lg:pt-0.5">
          {get(profile, 'about', undefined) && (
            <ProfileAbout
              title={`About ${get(profile, 'name')}`}
              description={`${get(profile, 'about') || ''}`}
            />
          )}
          {get(profile, 'user_interests', undefined) && (
            <ProfileInterestedIn
              userInterestedData={get(profile, 'user_interests', undefined)}
            />
          )}
          <div className="pt-4 lg:hidden">
            <Link href="/profile/edit">
              <Button
                block
                size="lg"
                textColor="text-black-800"
                type="secondary"
              >
                Edit profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfileCard;
