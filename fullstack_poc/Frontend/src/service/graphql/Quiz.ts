import { gql } from '@apollo/client';

import {
  COMMENT_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

const SELECT_QUIZ_OPTION = gql`
  mutation selectQuizMutation(
    $userId: uuid!
    $quizOptionId: uuid!
    $quizId: uuid!
  ) {
    insert_quiz_actions_one(
      object: { userId: $userId, quizOptionId: $quizOptionId, quizId: $quizId }
    ) {
      id
      userId
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
        likes
        post_reactions(where: { user_id: { _eq: $userId } }) {
          kofukon {
            id
            name
          }
          id
          user_id
        }
        comments(
          limit: 4
          order_by: { createdAt: desc }
          where: { parentId: { _is_null: true } }
        ) {
          ...commentFields
        }
      }
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

// eslint-disable-next-line import/prefer-default-export
export { SELECT_QUIZ_OPTION };
