import { gql } from '@apollo/client';

import { USER_FIELDS_FRAGMENT } from '@/service/graphql/Fragments';

// eslint-disable-next-line import/prefer-default-export
export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment(
    $userId: uuid!
    $message: String!
    $questionId: uuid
    $pollId: uuid
    $quizId: uuid
    $parentId: uuid
    $campfireShareId: uuid
    $postShareId: uuid
    $campfire_post_share_id: uuid
    $announcementId: uuid
  ) {
    insert_comments_one(
      object: {
        userId: $userId
        message: $message
        questionId: $questionId
        pollId: $pollId
        quizId: $quizId
        parentId: $parentId
        campfireShareId: $campfireShareId
        postShareId: $postShareId
        campfire_post_share_id: $campfire_post_share_id
        announcement_id: $announcementId
      }
    ) {
      id
      message
      parent {
        campfireShareId
        parent {
          campfireShareId
        }
      }

      noDownValues
      noUpValues
      createdAt
      replies: comments {
        id
        message
        noDownValues
        noUpValues
        user {
          ...userFields
          __typename
        }
        __typename
      }
      user {
        ...userFields
        __typename
      }
      __typename
    }
  }
  ${USER_FIELDS_FRAGMENT}
`;

export const PIN_UNPIN_COMMENT_MUTATION = gql`
  mutation PinUnpinComment($commentId: String!, $pinned: Boolean!) {
    pinOrUnpinComment(commentId: $commentId, pinned: $pinned) {
      message
      success
    }
  }
`;

export const LOAD_REPLIES_TO_COMMENT = gql`
  query LoadRepliesToAComment($commentId: uuid!) {
    comments(where: { id: { _eq: $commentId } }) {
      replies: comments(
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        id
        message
        noDownValues
        noUpValues
        upVoted
        downVoted
        isEdited
        isHidden
        createdAt
        questionId
        quizId
        pollId
        postShareId
        parentId
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        comment {
          user {
            name
          }
        }
        repliestoRepliesCount: childs_aggregate {
          aggregate {
            count
          }
        }
        repliesToReplies: comments(order_by: { createdAt: desc }) {
          id
          message
          noDownValues
          noUpValues
          upVoted
          downVoted
          isEdited
          isHidden
          createdAt
          parentId
          likes
          post_reactions {
            id
            user_id
            kofukon {
              id
              name
            }
          }
          comment {
            user {
              name
            }
          }
        }
      }
    }
  }
`;
