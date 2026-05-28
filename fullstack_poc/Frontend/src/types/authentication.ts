import { Category, CategoryId } from '@/types/category';
export type avatar = {
  id: number;
  avtar: string;
};
export type GenderOption = { value: string; label: string };
export type countType = {
  aggregate: {
    count: number;
  };
};
export type SignupData = {
  email?: string;
  password?: string;
  phoneNumber?: string;
  confirmPassword?: string;
  signupType?: string;
  gender?: GenderOption;
  profilepicture?: string | avatar;
  areaOfInterests?: CategoryId[];
  name?: string;
};

interface UserInterest {
  category: Category;
}

export type UserProfile = {
  createdAt: string;
  email: string;
  gender: string;
  id: string;
  name: string;
  profilePicture: string;
  noActivities: {
    totalCount: number;
  };
  noArchives: countType;
  noBookmarks: countType;
  noHidden: countType;
  noHiddenComments: countType;
  noHiddenPosts: number;
  isAllowFollow: boolean;
  isCampfireVisibility: boolean;
  about: string;
  areaOfInterests?: CategoryId[];
  user_interests: UserInterest[];
  country: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  isPasswordSet: boolean;
  loginType?: string;
};

export type GuestProfile = {
  id: string;
  about: string;
  profilePicture: string;
  createdAt: string;
  isFollowing: boolean;
  isCampfireVisibility: boolean;
  name: string;
  followersCount: countType;
  followingCount: countType;
  noComments: countType;
  noReplies: countType;
  noPosts: number;
  __typename: string;
  user_interests: UserInterest[];
  isBlocked: boolean;
};

export type SubscribedUser = {
  isSubscribedTo: boolean | null;
  email: string;
  subscriptions: string;
};

export type notificationPostData = {
  requestId?: string;
  campfireId?: string;
  postId?: string;
  description?: string;
  sentBy?: string;
  isCampfire?: boolean;
};

export type notificationAction = {
  rejectButton?: {
    text: string;
    isClicked: boolean;
  };
  approveButton?: {
    text: string;
    isClicked: boolean;
  };
};
export type notification = {
  id: string;
  data: {
    data?: notificationPostData;
    text: string;
    message?: string;
    type: string;
    actions?: notificationAction;
    redirect: string;
    isDisabled: boolean;
    profilePicture: string;
  };
  createdAt: string;
  isSeen: boolean;
  isMuted?: string;
  read?: boolean;
};

// User following structure
export interface UserFollowing {
  id: string;
  name: string;
  profilePicture: string;
  email: string;
}

// Newsletter subscription mutation response
export interface NewsletterSubscription {
  insert_subscriptions_one: {
    id: string;
    email: string;
    isSubscribedTo: boolean;
  };
}
