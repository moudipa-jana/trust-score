import React, { useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import BlockedIcon from '/public/images/Blocked.svg';
import ProfileActivitiesReacted from '@/components/pages/Profile/ProfileActivitesReactedPosts';
import ProfileActivitiesComments from '@/components/pages/Profile/ProfileActivitiesComments';
import ProfileActivitiesPost from '@/components/pages/Profile/ProfileActivitiesPost';
import ProfileActivitiesReply from '@/components/pages/Profile/ProfileActivitiesReply';
import CustomImage from '@/components/Utility/CustomImage';
import Dropdown from '@/components/Utility/Dropdown';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { QUERY_USER_REACTED_POSTS } from '@/service/graphql/Kofukons';
import {
  QUERY_USER_ACTIVITIES_COMMENT,
  QUERY_USER_ACTIVITIES_POST,
  QUERY_USER_ACTIVITIES_REPLY,
} from '@/service/graphql/Profile';
import { selectGetToken, selectGetUserProfile } from '@/state/Slices/auth';
import { activitiesProfileOption } from '@/types/profile';
import null_point from '/public/images/null_point.svg';

export type variableActiviesObjType = {
  offset: number;
  limit: number;
  sort: {
    createdAt: string;
  };
};

interface IActivityHeaderProps {
  title: string | JSX.Element;
}
interface IActivityErrorProps {
  errorMessage: string;
}
interface BlockedUserTextProps {
  header?: React.ReactNode;
}

export const sortValues = [
  { sort: { createdAt: 'asc_nulls_last' } },
  { sort: { createdAt: 'desc_nulls_last' } },
];
export const profileOptions: activitiesProfileOption[] = [
  { value: sortValues[1], label: 'All' },
  { value: sortValues[1], label: 'Recent' },
  { value: sortValues[1], label: 'Comments' },
  { value: sortValues[1], label: 'Reacted posts' },
  { value: sortValues[1], label: 'Replies' },
];

export const ProfileActivityHeader = ({ title }: IActivityHeaderProps) => {
  return (
    <div className="my-2 pt-4">
      <Heading priority="3">{title}</Heading>
    </div>
  );
};

export const ProfileActivityErrorComponent = ({
  errorMessage,
}: IActivityErrorProps) => {
  return (
    <div className="layout mt-6 flex flex-col items-center justify-center text-center text-black">
      <CustomImage src={null_point} alt="No activities found" />
    </div>
  );
};

export const BlockedUserText = ({ header }: BlockedUserTextProps) => {
  const ismobile = useIsMobile();
  return (
    <>
      <div>{header}</div>
      <div className="my-10 flex flex-row items-center justify-center gap-2">
        <div style={{ height: '60px', width: '60px' }}>
          <CustomImage src={BlockedIcon} />
        </div>
        <Text size={ismobile ? 'md' : 'lg'}>You have blocked this person</Text>
      </div>
    </>
  );
};

const renderActivitiesPost = (
  selectedOption: activitiesProfileOption,
  userId: string,
) => {
  if (selectedOption.label === 'Recent') {
    return (
      <ProfileActivitiesPost
        selectedOption={selectedOption}
        query={QUERY_USER_ACTIVITIES_POST}
        header={<ProfileActivityHeader title="Your Recent Posts" />}
        userId={userId}
      />
    );
  }
  if (selectedOption.label === 'Comments')
    return (
      <ProfileActivitiesComments
        selectedOption={selectedOption}
        query={QUERY_USER_ACTIVITIES_COMMENT}
        header={<ProfileActivityHeader title="Your Comments" />}
        userId={userId}
      />
    );
  if (selectedOption.label === 'Replies')
    return (
      <ProfileActivitiesReply
        selectedOption={selectedOption}
        query={QUERY_USER_ACTIVITIES_REPLY}
        header={<ProfileActivityHeader title="Your Replies" />}
      />
    );
  if (selectedOption.label === 'Reacted posts') {
    return (
      <ProfileActivitiesReacted
        selectedOption={selectedOption}
        query={QUERY_USER_REACTED_POSTS}
        headerTitle={<ProfileActivityHeader title="Your Reacted Posts" />}
      />
    );
  } else {
    return (
      <>
        <ProfileActivitiesPost
          selectedOption={selectedOption}
          query={QUERY_USER_ACTIVITIES_POST}
          header={<ProfileActivityHeader title="Your Posts" />}
          userId={userId}
        />
        <ProfileActivitiesComments
          selectedOption={selectedOption}
          query={QUERY_USER_ACTIVITIES_COMMENT}
          header={<ProfileActivityHeader title="Your Comments" />}
          userId={userId}
        />
        <ProfileActivitiesReply
          selectedOption={selectedOption}
          query={QUERY_USER_ACTIVITIES_REPLY}
          header={<ProfileActivityHeader title="Your Replies" />}
        />
        <ProfileActivitiesReacted
          selectedOption={selectedOption}
          query={QUERY_USER_REACTED_POSTS}
          headerTitle={<ProfileActivityHeader title="Your Reacted Posts" />}
        />
      </>
    );
  }
};

function ProfileActivities() {
  const [selectedOption, setSelectedOption] = useState(profileOptions[0]);
  const profile = useAppSelector(selectGetUserProfile);
  const token = useAppSelector(selectGetToken);
  if (profile?.noActivities?.totalCount === 0 || !token) {
    return (
      <div className="layout flex flex-col items-center justify-center gap-3 text-center">
        <ProfileActivityErrorComponent errorMessage="No post Found." />
        <p className='text-sm font-bold text-gray-500'>
          To see updates, have to create post
        </p>
      </div>
    );
  }
  return (
    <div className="lg:sm-container activity">
      <div className="relative z-[99] max-w-[230px] cursor-pointer">
        <Dropdown
          options={profileOptions}
          isLabel
          onChange={(value) =>
            setSelectedOption(value as activitiesProfileOption)
          }
          color="border-primary"
          rounded
          defaultOption={profileOptions[0] as activitiesProfileOption}
        />
      </div>
      {renderActivitiesPost(selectedOption, profile?.id as string)}
    </div>
  );
}

export default ProfileActivities;
