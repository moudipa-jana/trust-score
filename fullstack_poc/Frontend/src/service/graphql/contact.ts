import { gql } from '@apollo/client';

const INSERT_CONTACT_MUTATION = gql`
  mutation insertContact(
    $fullName: String!
    $gender: gender_types!
    $email: String!
    $phoneNumber: String!
    $city: String
    $zipCode: String
    $description: String
  ) {
    insert_contact_us(
      objects: {
        fullName: $fullName
        gender: $gender
        email: $email
        phoneNumber: $phoneNumber
        city: $city
        zipCode: $zipCode
        description: $description
      }
    ) {
      affected_rows
    }
  }
`;
export default INSERT_CONTACT_MUTATION;

export const UPDATE_CONTACT_MUTATION = gql`
  mutation submitContactUsForm(
    $firstName: String!
    $gender: gender_types!
    $email: String!
    $phoneNumber: String!
    $city: String
    $zipCode: String
    $description: String!
    $lastName: String!
    $middleName: String
    $userId: uuid
    $reasonId: uuid!
  ) {
    insert_contact_us(
      objects: {
        first_name: $firstName
        gender: $gender
        email: $email
        phoneNumber: $phoneNumber
        city: $city
        zipCode: $zipCode
        description: $description
        last_name: $lastName
        middle_name: $middleName
        user_id: $userId
        reason_id: $reasonId
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_CONTACT_REASONS = gql`
  query fetchContactUsReasons {
    contact_us_reasons {
      id
      reason
      created_at
    }
  }
`;
