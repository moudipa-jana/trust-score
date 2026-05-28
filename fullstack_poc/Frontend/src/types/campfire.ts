import { DefaultContext, FetchResult } from '@apollo/client';

import { PostTypeEnum } from '@/types/enums';
import {
  CommentType,
  PollType,
  PostReaction,
  QuestionType,
  QuizType,
  UserThreadType,
} from '@/types/forum';

export interface Category {
  title: string;
}

export type CampfireUser = {
  id: string;
  role: string;
  createdAt: string;
  is_blocked: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    isFollowing: boolean;
    isBlocked: boolean;
  };
};

export type CampfireDetails = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  noParticipants: number;
  is_disabled_by_admin: boolean;
  isMember: boolean;
  isAdmin: boolean;
  picture: string;
  coverPicture: string;
  createdAt: string;
  category: Category;
  isRequested: boolean;
  is_public: boolean;
  campfire_users: CampfireUser[];
};

export type InviteUser = {
  id: string;
  name: string;
  profilepicture: string;
};

export type List = {
  value: string;
  label: string;
};

export interface MainCategory {
  title: string;
}

export interface CampfireData {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  noParticipants: number;
  is_disabled_by_admin: boolean;
  isMember: boolean;
  isAdmin: boolean;
  picture: string;
  coverPicture: string;
  createdAt: string;
  category: Category;
  isRequested: boolean;
  is_public: boolean;
  campfire_users: CampfireUser[];
  noPosts: { aggregate: { count: number } };
}

export interface campfireShare {
  campfireData: CampfireData;
  createdAt: string;
  downVoted: boolean;
  id: string;
  isBookmarked: boolean;
  message: string;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  upVoted: boolean;
  user: UserThreadType;
  type: PostTypeEnum;
  comments: CommentType[];
  categoryName?: string;
  post_reactions?: PostReaction[];
  likes?: number;
  is_disabled_by_admin?: boolean;
  sharesCount?: {
    aggregate: {
      count: number;
    };
  };
}

export interface campfirePostShare {
  campfire: CampfireData;
  createdAt: string;
  id: string;
  message: string;
  poll?: PollType;
  question?: QuestionType;
  quiz?: QuizType;
  type: PostTypeEnum;
  user: UserThreadType;
  comments: CommentType[];
  post_reactions?: PostReaction[];
  likes?: number;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  noViews: number;
  downVoted: boolean;
  categoryName: string;
  isBookmarked: boolean;
  upVoted: boolean;
  is_disabled_by_admin?: boolean;
  sharesCount?: {
    aggregate: {
      count: number;
    };
  };
}

export interface campfirePost {
  campfirePostShare: campfirePostShare;
  id: string;
  type: PostTypeEnum;
}

export interface PostHashtag {
  id: string;
  is_pinned: boolean;
  comment?: {
    id: string;
  };
  question?: {
    id: string;
    is_disabled_by_admin?: boolean;
    user?: {
      is_disabled_by_admin?: boolean;
    };
    campfire_threads: {
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }[];
  };
  quiz?: {
    id: string;
    is_pinned: boolean;
    is_disabled_by_admin?: boolean;
    user?: {
      is_disabled_by_admin?: boolean;
    };
    campfire_threads: {
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }[];
  };
  poll?: {
    id: string;
    is_disabled_by_admin?: boolean;
    user?: {
      is_disabled_by_admin?: boolean;
    };
    campfire_threads: {
      id: string;
      campfire: {
        id: string;
        isRequested: boolean;
        is_public: boolean;
        picture: string;
        isMember: boolean;
        category: {
          title: string;
        };
      };
    }[];
  };
  campfire_share?: {
    id: string;
  };
  post_share?: {
    id: string;
  };
}

export interface CampfireActivity {
  id: string;
  poll?: PollType;
  quiz?: QuizType;
  question?: QuestionType;
  is_pinned?: boolean;
  pinned_at?: string;
  createdAt?: string;
  is_disabled_by_admin?: boolean;
  user?: {
    is_disabled_by_admin?: boolean;
  };
}

export interface LeaveCampfireResponse {
  leaveCampfire: {
    message: string;
    success: boolean;
  };
}
export interface LeaveCampfireVariables {
  campfireId: string; // assuming `uuid` maps to `string` in your TypeScript setup
  userId: string;
}

export interface AuthContext extends DefaultContext {
  headers: {
    Authorization: string;
  };
}

export type LeaveCampfireFunction = (mutationOptions: {
  variables?: LeaveCampfireVariables;
  context?: DefaultContext;
  onCompleted?: (data: LeaveCampfireResponse) => void;
  onError?: (error: any) => void;
}) => Promise<FetchResult<LeaveCampfireResponse>>;
