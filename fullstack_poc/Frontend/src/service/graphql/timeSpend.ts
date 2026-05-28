import { gql } from '@apollo/client';

const APPEND_TIME_SPENT = gql`
  mutation AppendTimeSpent($userId: uuid!, $timeSpentInSecs: Int!) {
    update_users_time_spent(
      where: { userId: { _eq: $userId }, date: { _eq: "now()" } }
      _inc: { timeSpentInSecs: $timeSpentInSecs }
    ) {
      returning {
        timeSpentInSecs
      }
    }
    insert_users_time_spent_one(
      object: {
        userId: $userId
        date: "now()"
        timeSpentInSecs: $timeSpentInSecs
      }
      on_conflict: {
        constraint: users_time_spent_userid_date_unique
        update_columns: []
      }
    ) {
      id
      userId
      date
      timeSpentInSecs
    }
  }
`;
export default APPEND_TIME_SPENT;
