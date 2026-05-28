import { CategoryId } from '@/types/category';

export type profileOption = {
  value: string;
  label: string;
};
export type activitiesProfileOption = {
  value: {
    sort: {
      createdAt: string;
    };
    username?: string;
    upVoted?: boolean[];
    downVoted?: boolean[];
  };
  label: string;
};

export type editProfileDetailsType = {
  name: string;
  about: string;
  areaOfInterests: CategoryId[];
  isAllowFollow: boolean;
  isCampfireVisibility: boolean;
};
