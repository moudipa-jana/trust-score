import { gql } from '@apollo/client';

const CHECK_FOR_INSTANT_LOGOUT = gql`
  subscription checkForInstantLogout($userId: uuid!) {
    users_by_pk(id: $userId) {
      is_archived_by_admin
      is_disabled_by_admin
      isLoggedIn
    }
  }
`;
export default CHECK_FOR_INSTANT_LOGOUT;
