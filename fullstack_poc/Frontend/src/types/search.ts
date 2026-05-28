import { PostTypeEnum } from '@/types/enums';
import {
  PollOptionType,
  PollType,
  QuestionType,
  QuizOptionType,
  QuizType,
} from '@/types/forum';

export interface IPeopleSearch {
  about: string | null;
  email: string;
  followersCount: number;
  followingCount: number;
  id: string;
  isFollowing: boolean;
  name: string;
  postCount: number;
  profilePicture: string;
}

export interface ICampfireSearch {
  campfirePostsCount: { aggregate: { count: number } };
  category: { title: string };
  createdAt: string;
  description: string;
  id: string;
  isMember: boolean;
  isRequested: boolean;
  noParticipants: number;
  picture: string;
  title: string;
}

export interface User {
  id: string;
  isAllowFollow: boolean;
  isFollowing: boolean;
  name: string;
  profilePicture: string;
}

export interface ISearchQuiz {
  categoryName: string;
  createdAt: string;
  downVoted: boolean;
  id: string;
  isHidden: boolean;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  title: string;
  type: string;
  upVoted: boolean;
  isBookmarked: boolean;
  isAnalytics: boolean;
  quiz_options: QuizOptionType[];
  user: User;
}

export interface ISearchPoll {
  categoryName: string;
  createdAt: string;
  downVoted: boolean;
  id: string;
  isHidden: boolean;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  title: string;
  type: string;
  upVoted: boolean;
  isBookmarked: boolean;
  isAnalytics: boolean;
  poll_options: PollOptionType[];
  user: User;
}
export interface ISearchQuestion {
  categoryName: string;
  createdAt: string;
  downVoted: boolean;
  id: string;
  isEdited: boolean;
  isHidden: boolean;
  noDownValues: number;
  noParticipants: number;
  noUpValues: number;
  title: string;
  type: string;
  upVoted: boolean;
  isBookmarked: boolean;
  user: User;
}

export interface ISearchSharedPost {
  postShare: {
    archivedAt: string;
    categoryName: string;
    createdAt: string;
    downVoted: boolean;
    id: string;
    isArchived: boolean;
    isBookmarked: boolean;
    isHidden: boolean;
    noDownValues: number;
    noParticipants: number;
    noUpValues: number;
    poll: null | PollType;
    pollId: null | string;
    question: null | QuestionType;
    questionId: string;
    quiz: null | QuizType;
    quizId: null | string;
    title: string;
    type: string;
    upVoted: boolean;
    user: User;
  };
}

export interface IPostSearch {
  createdAt: string;
  id: string;
  poll: ISearchPoll | null;
  question: ISearchQuestion | null;
  quiz: ISearchQuiz | null;
  postShare: ISearchSharedPost | null;
  type: PostTypeEnum;
}
