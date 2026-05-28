import { gql } from '@apollo/client';

const QUERY_GET_REPORT_TYPES = gql`
  query reportTypes {
    report_types {
      id
      title
      description
    }
  }
`;

const ADD_REPORT_MUTATION = gql`
  mutation flagReport(
    $questionId: uuid
    $quizId: uuid
    $pollId: uuid
    $postShareId: uuid
    $commentId: uuid
    $reportTypeId: uuid
    $message: String
    $campfireid: uuid
    $reportedUserId: uuid
  ) {
    insert_reports_one(
      object: {
        questionId: $questionId
        pollId: $pollId
        quizId: $quizId
        postShareId: $postShareId
        commentId: $commentId
        reportTypeId: $reportTypeId
        message: $message
        campfireid: $campfireid
        reporteduserid: $reportedUserId
      }
    ) {
      id
      message
      __typename
    }
  }
`;

export { ADD_REPORT_MUTATION, QUERY_GET_REPORT_TYPES };
