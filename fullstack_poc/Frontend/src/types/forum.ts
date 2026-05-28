import { CommentParent } from '@/components/pages/Profile/ProfileActivitiesReply';
import { campfirePostShare, campfireShare } from '@/types/campfire';
import { PostTypeEnum } from '@/types/enums';

interface Kofukon {
  id: string;
  name: string;
}

export interface PostReaction {
  kofukon: Kofukon;
  id: string;
  userId?: string;
  user_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    isFollowing: boolean;
    isBlocked: boolean;
  };
}

export interface Aggregate {
  count: number;
}

export interface IsSelected {
  aggregate: Aggregate;
}

export interface PollOptionType {
  analyticsCount: number;
  id: string;
  isSelected: IsSelected;
  title: string;
  isAnswer?: boolean;
  answerPercentage?: number;
}

export interface UserThreadType {
  email: string;
  id: string;
  isFollowing: boolean;
  name: string;
  profilePicture: string;
  is_disabled_by_admin: boolean;
  userTag?: string;
}

export interface SubReplyType {
  createdAt: string;
  id: string;
  message: string;
  noDownValues: number;
  noUpValues: number;
  upVoted: boolean;
  downVoted: boolean;
  isBookmarked?: boolean;
  isEdited?: boolean;
  user: UserThreadType;
  isHidden: boolean;
  hasPostCommentorRequestedForDeactivation: boolean;
  post_reactions?: PostReaction[];
  likes?: number;
  is_disabled_by_admin?: boolean;
  is_deleted_by_admin_of_campfire?: boolean;
}

export interface ReplyType {
  createdAt: string;
  id: string;
  message: string;
  noDownValues: number;
  noUpValues: number;
  upVoted: boolean;
  downVoted: boolean;
  isBookmarked?: boolean;
  isEdited?: boolean;
  repliesToReplies: SubReplyType[];
  repliestoRepliesCount: number;
  user: UserThreadType;
  isHidden: boolean;
  hasPostCommentorRequestedForDeactivation: boolean;
  post_reactions: PostReaction[];
  likes?: number;
  is_disabled_by_admin?: boolean;
  is_deleted_by_admin_of_campfire?: boolean;
}

export interface CommentType {
  createdAt: string;
  postId?: string;
  id: string;
  message: string;
  noDownValues: number;
  noUpValues: number;
  noParticipants: number;
  upVoted: boolean;
  downVoted: boolean;
  isBookmarked: boolean;
  isEdited: boolean;
  replies: ReplyType[];
  repliesCount: number;
  user: UserThreadType;
  questionId?: string;
  quizId?: string;
  pollId?: string;
  parentId?: string;
  parent?: CommentParent;
  postShareId?: string;
  campfireShareId?: string;
  campfire_post_share_id?: string;
  isHidden: boolean;
  hasPostCommentorRequestedForDeactivation: boolean;
  ispinned: boolean;
  post_reactions: PostReaction[];
  likes?: number;
  is_disabled_by_admin?: boolean;
  is_deleted_by_admin_of_campfire?: boolean;
}

interface CampfireCategory {
  title: string;
  is_enabled?: boolean;
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

export interface Campfire {
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
  category: CampfireCategory;
  isRequested: boolean;
  is_public: boolean;
  campfire_users: CampfireUser[];
}

export interface CampfireThreadWithUsers {
  id: string;
  campfire: Campfire;
}

export interface PostCategory {
  category: {
    id: string;
    is_enabled: boolean;
    title: string;
  };
}

export interface PollType {
  createdAt: string;
  id: string;
  isAnalytics: boolean;
  isBlocked?: boolean;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  noViews: number;
  categoryName: string;
  type: PostTypeEnum;
  upVoted: boolean;
  downVoted: boolean;
  isBookmarked: boolean;
  poll_options: PollOptionType[];
  title: string;
  user: UserThreadType;
  description?: string;
  comments: CommentType[];
  isHidden: boolean;
  isArchived: boolean;
  is_disabled_by_admin: boolean;
  isCampfire?: boolean;
  campfireName?: string;
  hasPostCreatorRequestedForDeactivation: boolean;
  post_reactions?: PostReaction[];
  likes?: number;
  campfire_threads?: CampfireThreadWithUsers[];
  post_categories?: PostCategory[];
  sharesCount: {
    aggregate: Aggregate;
  };
}

export interface QuestionType {
  comments: CommentType[];
  createdAt: string;
  id: string;
  downVoted: boolean;
  categoryName: string;
  isBookmarked: boolean;
  isBlocked?: boolean;
  type: PostTypeEnum;
  upVoted: boolean;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  noViews: number;
  title: string;
  user: UserThreadType;
  description?: string;
  isEdited: boolean;
  isHidden: boolean;
  isArchived: boolean;
  is_disabled_by_admin: boolean;
  isCampfire?: boolean;
  campfireName?: string;
  hasPostCreatorRequestedForDeactivation: boolean;
  post_reactions?: PostReaction[];
  likes?: number;
  ispinned: boolean;
  campfire_threads?: CampfireThreadWithUsers[];
  post_categories?: PostCategory[];
  media_link?: string;
  sharesCount: {
    aggregate: Aggregate;
  };
}

export interface QuizOptionType {
  analyticsCount: number;
  isAnswer: boolean;
  id: string;
  title: string;
  isSelected?: boolean;
  answerPercentage?: number;
}

export interface QuizType {
  createdAt: string;
  id: string;
  isAnalytics: boolean;
  isBlocked?: boolean;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  noViews: number;
  downVoted: boolean;
  categoryName: string;
  isBookmarked: boolean;
  type: PostTypeEnum;
  upVoted: boolean;
  quiz_options: QuizOptionType[];
  title: string;
  user: UserThreadType;
  comments: CommentType[];
  description?: string;
  isHidden?: boolean;
  isArchived: boolean;
  is_disabled_by_admin: boolean;
  isCampfire?: boolean;
  campfireName?: string;
  hasPostCreatorRequestedForDeactivation: boolean;
  post_reactions?: PostReaction[];
  likes?: number;
  ispinned: boolean;
  campfire_threads?: CampfireThreadWithUsers[];
  post_categories?: PostCategory[];
  sharesCount: {
    aggregate: Aggregate;
  };
}

export interface CampfirePostShare {
  id: string;
  campfireId: string;
  campfireThreadId: string;
  likes: number;
  message: string;
  noComments: number;
  noParticipants: number;
  createdAt: string;
  deletedAt?: string;
  archived_by_admin_id?: string;
  disabled_by_admin_id?: string;
  archived_by_admin_at?: string;
  archived_by_admin_remark?: string;
  disabled_by_admin_at?: string;
  disabled_by_admin_remark?: string;
  disabled_by_admin_until?: string;
  isBookmarked: boolean;
  is_archived_by_admin: boolean;
  is_disabled_by_admin: boolean;
  campfire: Campfire;
  user: UserThreadType;
  comments: Comment[];
  question?: QuestionType;
  quiz?: QuizType;
  poll?: PollType;
  post_shares: {
    createdAt: string;
    id: string;
    noComments: number;
    noDownValues: number;
    noParticipants: number;
    noUpValues: number;
    noViews: number;
    downVoted: boolean;
    categoryName: string;
    isBookmarked: boolean;
    title: string;
    comments: CommentType[];
    isHidden?: boolean;
    isArchived: boolean;
    is_disabled_by_admin: boolean;
    poll?: PollType;
    question?: QuestionType;
    quiz?: QuizType;
    type: PostTypeEnum;
    user: UserThreadType;
    hasPostCreatorRequestedForDeactivation: boolean;
    post_reactions?: PostReaction[];
    likes?: number;
    upVoted: boolean;
    ispinned: boolean;
    campfireId?: string;
    sharesCount: {
      aggregate: Aggregate;
    };
  }[];
}

export interface PostShare {
  createdAt: string;
  id: string;
  noComments: number;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  noViews: number;
  downVoted: boolean;
  categoryName: string;
  isBookmarked: boolean;
  title: string;
  comments: CommentType[];
  isHidden?: boolean;
  isArchived: boolean;
  is_disabled_by_admin: boolean;
  poll?: PollType;
  question?: QuestionType;
  quiz?: QuizType;
  type: PostTypeEnum;
  user: UserThreadType;
  hasPostCreatorRequestedForDeactivation: boolean;
  post_reactions?: PostReaction[];
  likes?: number;
  upVoted: boolean;
  ispinned: boolean;
  campfire_thread_share?: CampfirePostShare;
  campfireId?: string;
}

export interface ThreadType {
  createdAt: string;
  id: string;
  userId?: string;
  isArchived?: boolean;
  isBlocked?: boolean;
  poll?: PollType;
  question?: QuestionType;
  quiz?: QuizType;
  campfireShare?: campfireShare;
  campfirePostShare?: campfirePostShare;
  postShare?: PostShare;
  type: PostTypeEnum;
  threadId?: string;
}

export interface CategoryFeedType {
  about: string;
  id: string;
  threads: ThreadType[];
  title: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  user: {
    name: string;
    id: string;
  };
  scheduled_at?: string;
  createdAt: string;
  noComments: number;
  noParticipants: number;
  campfire?: {
    id: string;
  };
  campfireName?: string;
  post_reactions?: PostReaction[];
  likes?: number;
  comments?: CommentType[];
}

export interface QuizOption {
  question: string;
  options: string[];
}

export interface CampfireThreadDetails {
  id: string;
  category?: {
    is_enabled?: boolean;
    title: string;
  };
  campfireThreadId?: string;
  is_public?: boolean;
  isMember?: boolean;
  picture?: string;
}

export interface RelatedCardType {
  id: string;
  title: string;
  description?: string;
}

export interface TotalStats {
  comments?: number;
  participants?: number;
  interactions?: number;
}
