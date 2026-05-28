import { gql } from '@apollo/client';

import {
  ANNOUNCEMENT_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

export const REACT_TO_POST = gql`
  mutation reactToPost(
    $user_id: uuid!
    $kofukon_id: uuid!
    $question_id: uuid
    $quiz_id: uuid
    $post_share_id: uuid
    $poll_id: uuid
    $comment_id: uuid
    $campfire_share_id: uuid
    $announcement_id: uuid
    $campfire_post_share_id: uuid
  ) {
    insert_post_reactions(
      objects: {
        user_id: $user_id
        kofukon_id: $kofukon_id
        question_id: $question_id
        quiz_id: $quiz_id
        post_share_id: $post_share_id
        poll_id: $poll_id
        comment_id: $comment_id
        campfire_share_id: $campfire_share_id
        announcement_id: $announcement_id
        campfire_post_share_id: $campfire_post_share_id
      }
    ) {
      affected_rows
      returning {
        id
        __typename
      }
      __typename
    }
  }
`;

export const DELETE_REACTION_TO_POST = gql`
  mutation deleteTheReactionToAPost($id: uuid!) {
    delete_post_reactions(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const QUERY_USER_REACTED_POSTS = gql`
  ${COMMENT_FIELDS_FRAGMENT}
  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
  query reactedPosts($userId: uuid!, $limit: Int = 10, $offset: Int = 0) {
    post_reactions(
      where: { user_id: { _eq: $userId }, comment_id: { _is_null: true } }
      limit: $limit
      offset: $offset
      order_by: { created_at: desc }
    ) {
      id
      kofukon {
        id
        name
      }
      poll_id
      question_id
      quiz_id
      campfire_share_id
      post_share_id
      announcement_id
      announcement {
        ...announcementFields
      }
      poll {
        ...pollFields
        campfire_threads {
          id
          campfire {
            id
            isRequested
            is_public
            picture
            isMember
            category {
              title
            }
          }
        }
      }
      question {
        ...questionFields
        campfire_threads {
          id
          campfire {
            id
            isRequested
            is_public
            picture
            isMember
            category {
              title
            }
          }
        }
      }
      quiz {
        ...quizFields
        campfire_threads {
          id
          campfire {
            id
            isRequested
            is_public
            picture
            isMember
            category {
              title
            }
          }
        }
      }
      campfire_share {
        ...campfireShareFields
      }
      post_share {
        ...postShareFields
      }
      campfire_post_share_id
      campfire_thread_share {
        ...campfirePostShareFields
      }
    }
  }

  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
`;

export const QUERY_POST_REACTION_BY_ID = gql`
  ${USER_FIELDS_FRAGMENT}   
  query getPostByID($id: uuid!) {
  threads(where: { id: { _eq: $id } }) {
    id 
    campfirePostShare {
      is_disabled_by_admin

      question {
        campfire_threads {
          id
          campfire {
            id
            isRequested
            is_public
            picture
            isMember
            category {
              title
            }
          }
        }
      }

      quiz {
        campfire_threads {
          id
          campfire {
            id
            isRequested
            is_public
            picture
            isMember
            category {
              title
            }
          }
        }
      }
    }

    poll {
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
        user {
         ...userFields
        }
      }
    }

    quiz {
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
        user {
         ...userFields
        }
      }
    }

    question {
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
        user {
        ...userFields
        }
      }
    }

    postShare {
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
        user {
         ...userFields
        }
      }
    }
  }
}
`;

export const QUERY_COMMENT_REACTIONS_BY_ID = gql`
query GetComment($id: uuid!) {
  comments_by_pk(id: $id) {
    id
   userId
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
      user {
        id
        name
        profilePicture
        isFollowing
        is_disabled_by_admin
      }
    }
  }
}
`;


export const GET_COMMENT_LIST_BY_POST_ID = gql`
  query CommentList(
    $where: comments_bool_exp!
    $limit: Int!
    $offset: Int!
  ) {
    comments(
      where: $where
      limit: $limit
      offset: $offset
      order_by: { createdAt: desc }
    ) {
      ...commentFields
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  `; 