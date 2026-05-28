import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { FALLBACK_PROFILE_PIC } from '@/lib/constants';
import { UserProfile } from '@/types/authentication';

const ReactedInfo = ({ reactionText }: { reactionText: string }) => {
  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;
  const reactedText = (text: string) => {
    switch (text) {
      case 'Like':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            liked this post
          </Text>
        );
      case 'Hearty':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            loved this post
          </Text>
        );
      case 'Curious':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            found this post curious
          </Text>
        );
      case 'Mindful':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            found this post mindful
          </Text>
        );
      case 'Confusion':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            found this post confusing
          </Text>
        );
      case 'Disappoint':
        return (
          <Text color="text-black" size="3xl">
            <span className="font-bold">{'You '}</span>
            found this post disappointing
          </Text>
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex space-x-2">
      <div className="h-6 w-6">
        <CustomImage
          src={
            !profile?.profilePicture
              ? FALLBACK_PROFILE_PIC
              : profile?.profilePicture.includes('uno-jobs')
                ? FALLBACK_PROFILE_PIC
                : profile?.profilePicture
          }
          fill
        />
      </div>
      <div className="flex flex-wrap space-x-1.5">
        {reactedText(reactionText)}
      </div>
    </div>
  );
};

export default ReactedInfo;
