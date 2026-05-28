import { gql } from '@apollo/client';

const JOIN_US_FILE_UPLOAD_MUTATION = gql`
  mutation StoreJoinUsDetails(
    $email: String!
    $coverLetter: String
    $cvLink: String!
    $role: String
    $department: String
    $location: String
    $employment: String
    $workmode: String
    $fileName: String!
  ) {
    insert_join_us(
      objects: {
        email: $email
        coverLetter: $coverLetter
        cvLink: $cvLink
        fileName: $fileName
        role: $role
        department: $department
        location: $location
        employment: $employment
        workmode: $workmode
      }
    ) {
      affected_rows
    }
  }
`;

const JOIN_US_FAILED_UPLOAD_MUTATION = gql`
  mutation failedUpload($id: uuid!) {
    update_join_us_by_pk(pk_columns: { id: $id }, _set: { cvLink: "null" }) {
      id
      email
      cvLink
    }
  }
`;
export { JOIN_US_FAILED_UPLOAD_MUTATION, JOIN_US_FILE_UPLOAD_MUTATION };
