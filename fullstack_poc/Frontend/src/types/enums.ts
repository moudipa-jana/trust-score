/* eslint-disable no-unused-vars */

// Action types for different post categories
export enum ActionTypeEnum {
  question = 'question',
  poll = 'poll',
  quiz = 'quiz',
  campfire = 'campfire',
  search = 'search',
}

// Post types for different content categories
export enum PostTypeEnum {
  question = 'question',
  poll = 'poll',
  quiz = 'quiz',
  campfire = 'campfireShare',
  campfirePostShare = 'campfirePostShare',
  postShare = 'postShare',
}

// Card types for UI components
export enum CardTypeEnum {
  question = 'question',
  poll = 'poll',
  quiz = 'quiz',
  comment = 'comment',
  campfire = 'campfireShare',
  campfirePostShare = 'campfirePostShare',
  campfireShare = 'campfireShare',
  postShare = 'postShare',
  user = 'user',
}

// Variable types for API requests
export const variableType = {
  quiz: 'quizId',
  poll: 'pollId',
  question: 'questionId',
  comment: 'commentId',
} as const;

// Location options
export enum Location {
  KOLKATA = 'KOLKATA',
  BANGALORE = 'BENGALURU',
  HYDERABAD = 'HYDERABAD',
}

// Employment type options
export enum EmploymentType {
  FULL_TIME_ONSITE = 'FULL_TIME_ON_SITE',
  FULL_TIME_REMOTE = 'FULL_TIME_REMOTE',
  FULL_TIME_HYBRID = 'FULL_TIME_HYBRID',
  EMPLOYMENT_CONTRACT = 'EMPLOYMENT_CONTRACT',
  CASUAL_EMPLOYMENT = 'CASUAL_EMPLOYMENT',
  APPRENTICESHIP = 'APPRENTICESHIP',
  INTERNSHIP = 'INTERNSHIP',
}

// Department options
export enum Department {
  PRODUCT = 'PRODUCT',
  CREATIVE = 'CREATIVE',
  IT = 'IT',
  CONTENT = 'CONTENT',
}

// Export ActionTypeEnum as default for backward compatibility
export default ActionTypeEnum;
