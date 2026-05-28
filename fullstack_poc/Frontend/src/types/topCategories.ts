export interface QuizOption {
  id: string;
  title: string;
}

export interface user {
  email: string;
  id: string;
  isFollowing: boolean;
  name: string;
  profilePicture: string;
}
export interface Quiz {
  createdAt: string;
  id: string;
  noComments: number;
  noParticipants: number;
  noUpValues: number;
  quiz_options: QuizOption[];
  title: string;
  user?: user;
}

export interface Question {
  createdAt: string;
  id: string;
  noComments: number;
  noParticipants: number;
  noUpValues: number;
  title: string;
  user?: user;
}
export interface PollOption {
  id: string;
  title: string;
}

export interface Poll {
  createdAt: string;
  id: string;
  noComments: number;
  noParticipants: number;
  noUpValues: number;
  poll_options: PollOption[];
  title: string;
  user?: user;
}

export interface Thread {
  poll?: Poll;
  question?: Question;
  quiz?: Quiz;
  type: string;
}

export interface TopCategories {
  gradientColor: string;
  id: string;
  picture: string;
  hover_picture: string;
  slug: string;
  threads: Thread[];
  title: string;
}
