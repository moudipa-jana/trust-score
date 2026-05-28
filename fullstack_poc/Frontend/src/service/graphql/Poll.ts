import { gql } from '@apollo/client';

import {
  COMMENT_FIELDS_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

const SELECT_POLL_OPTION = gql`
  mutation selectPollMutation(
    $userId: uuid!
    $pollOptionId: uuid!
    $pollId: uuid!
  ) {
    insert_poll_actions_one(
      object: { userId: $userId, pollOptionId: $pollOptionId, pollId: $pollId }
    ) {
      id
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
        likes
        post_reactions(where: { user_id: { _eq: $userId } }) {
          kofukon {
            id
            name
          }
          id
          user_id
        }
        __typename
        comments(
          limit: 4
          order_by: { createdAt: desc }
          where: { parentId: { _is_null: true } }
        ) {
          ...commentFields
        }
      }
      __typename
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

// eslint-disable-next-line import/prefer-default-export
export { SELECT_POLL_OPTION };
