import { gql } from '@apollo/client';

import {
  COMMENT_FIELDS_FRAGMENT,
  FEED_COMMENTS_AND_REPLIES_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  RELATED_THREAD_FIELDS_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

const QUERY_GET_CATEGORIES = gql`
  query GetCategoriesQuery {
    categories(where: { is_enabled: { _eq: true } }) {
      id
      title
      about
    }
  }
`;
// eslint-disable-next-line import/prefer-default-export

const QUERY_GET_CATEGORY_ID = gql`
  query fetchCategoryIdByName($categoryName: String!) {
    categories(where: { title: { _ilike: $categoryName } }) {
      id
    }
  }
`;

const QUERY_TRENDING_CATEGORIES = gql`
  query categories_with_top_threads_view {
    categories_with_top_threads_view {
      gradientColor
      id
      picture 
      hover_picture
      slug
      threads
      title
    }
  }
`;

const FETCH_CATEGORIES_FEED_MUTATION = gql`
  mutation FetchCategoryFeed($title: String!, $limit: Int!, $offset: Int!) {
    getFeed(title: $title, limit: $limit, offset: $offset) {
      feed: data
    }
  }
`;

const FETCH_COMMENTS_AND_REPLIES_QUERY = gql`
  ${FEED_COMMENTS_AND_REPLIES_FRAGMENT}
  query fetchCommentsAndReplies($id: uuid!) {
    threads(where: { id: { _eq: $id } }) {
      ...threadFields
    }
  }
`;

const FETCH_RELATED_POSTS_FOR_FEED_QUERY = gql`
  query relatedPostsForFeed($categoryId: uuid_comparison_exp = {}) {
    related_threads(
      where: { isHidden: { _eq: false }, categoryId: $categoryId }
      limit: 3
    ) {
      ...relatedThreadFields
    }
  }
  ${RELATED_THREAD_FIELDS_FRAGMENT}
`;

const FETCH_RELATED_POSTS_FOR_GUEST_CATEGORY_FEED_QUERY = gql`
  query relatedPostsForGuestCategoryFeed($categoryId: uuid!) {
    related_threads(
      where: { categoryId: { _eq: $categoryId }, isHidden: { _eq: false } }
      limit: 3
    ) {
      ...relatedThreadFields
    }
  }
  ${RELATED_THREAD_FIELDS_FRAGMENT}
`;

const FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY = gql`
  query relatedPostsForUserCategoryFeed($categoryId: uuid!, $userId: uuid!) {
    related_threads(
      where: {
        categoryId: { _eq: $categoryId }
        userId: { _neq: $userId }
        isHidden: { _eq: false }
      }
      limit: 3
    ) {
      ...relatedThreadFields
    }
  }
  ${RELATED_THREAD_FIELDS_FRAGMENT}
`;

const FETCH_EXPLORE_BY_TOPIC_CATEGORY_MUTATION = gql`
  mutation FetchExlporeBy($categoryName: String!) {
    exploreTopics(title: $categoryName) {
      data
    }
  }
`;

const FETCH_EXPLORE_TOPICS_FOR_FEED_QUERY = gql`
  query exploreTopicsForFeed($categoryId: uuid_comparison_exp = {}) {
    threads(
      where: {
        type: { _in: ["question", "quiz", "poll"] }
        isArchived: { _eq: false }
        isHidden: { _eq: false }
        isCampfire: { _eq: false }
        is_disabled_by_admin: { _eq: false }
        to_be_shown: { _eq: true }
        categoryId: $categoryId
      }
      limit: 3
    ) {
      ...threadFields
      question {
        ...questionFields
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
      poll {
        ...pollFields
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
      quiz {
        ...quizFields
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
    }
  }

  ${FEED_COMMENTS_AND_REPLIES_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

const FETCH_EXPLORE_TOPICS_FOR_CATEGORY_FEED_QUERY = gql`
  query exploreTopicsForCategoryFeed($categoryId: uuid!) {
    threads(
      where: {
        categoryId: { _neq: $categoryId }
        isArchived: { _eq: false }
        isHidden: { _eq: false }
        isCampfire: { _eq: false }
        _or: [
          { question: { is_disabled_by_admin: { _eq: false } } }
          { poll: { is_disabled_by_admin: { _eq: false } } }
          { quiz: { is_disabled_by_admin: { _eq: false } } }
        ]
      }
      limit: 8
    ) {
      ...threadFields
    }
  }

  ${FEED_COMMENTS_AND_REPLIES_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

const SUGGEST_CATEGORY_MUTATION = gql`
  mutation suggestCategory($title: String!) {
    suggestCategory(title: $title) {
      message
      success
    }
  }
`;

export {
  FETCH_CATEGORIES_FEED_MUTATION,
  FETCH_COMMENTS_AND_REPLIES_QUERY,
  FETCH_EXPLORE_BY_TOPIC_CATEGORY_MUTATION,
  FETCH_EXPLORE_TOPICS_FOR_CATEGORY_FEED_QUERY,
  FETCH_EXPLORE_TOPICS_FOR_FEED_QUERY,
  FETCH_RELATED_POSTS_FOR_FEED_QUERY,
  FETCH_RELATED_POSTS_FOR_GUEST_CATEGORY_FEED_QUERY,
  FETCH_RELATED_POSTS_FOR_USER_CATEGORY_FEED_QUERY,
  QUERY_GET_CATEGORIES,
  QUERY_GET_CATEGORY_ID,
  QUERY_TRENDING_CATEGORIES,
  SUGGEST_CATEGORY_MUTATION,
};
