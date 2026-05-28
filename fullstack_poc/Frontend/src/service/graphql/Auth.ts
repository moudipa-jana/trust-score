import { gql } from '@apollo/client';

const SIGNUP_MUTATION = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $confirmPassword: String!
    $name: String!
    $profilePicture: String!
    $gender: String!
    $areaOfInterests: jsonb
    $isVerified: Boolean
  ) {
    signup(
      email: $email
      password: $password
      confirmPassword: $confirmPassword
      name: $name
      profilePicture: $profilePicture
      gender: $gender
      areaOfInterests: $areaOfInterests
      isVerified: $isVerified
    ) {
      success
      message
    }
  }
`;

const SIGNUP_MUTATION_APP = gql`
  mutation signUpApp(
    $profilePicture: String!
    $password: String!
    $name: String!
    $gender: String
    $email: String!
    $dateOfBirth: String!
    $about: String!
    $areaOfInterests: jsonb!
    $phoneNumber: String
    $isVerified: Boolean
    $phVerified: Boolean
  ) {
    signUpApp(
      phoneNumber: $phoneNumber
      confirmPassword: $password
      email: $email
      gender: $gender
      name: $name
      password: $password
      profilePicture: $profilePicture
      dob: $dateOfBirth
      about: $about
      areaOfInterests: $areaOfInterests
      isVerified: $isVerified
      phVerified: $phVerified
    ) {
      message
      success
      __typename
    }
  }
`;

const SIGNIN_MUTATION = gql`
  mutation SigninMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      profile
    }
  }
`;

const SIGNIN_PHONE_MUTATION = gql`
  mutation phoneLogin($phone: String!, $password: String!) {
    phoneLogin(phone: $phone, password: $password) {
      accessToken
      profile
    }
  }
`;

const VERIFY_GOOGLE_TOKEN_MUTATION = gql`
  mutation VerifyTokenMutation($redirectTo: String!, $code: String!) {
    getTokenGoogle(redirectTo: $redirectTo, code: $code) {
      accessToken
      message
      success
      isSignUp
      profile
      loginType
    }
  }
`;
const VERIFY_FACEBOOK_TOKEN_MUTATION = gql`
  mutation VerifyTokenMutation($code: String!, $redirectTo: String!) {
    getTokenFacebook(code: $code, redirectTo: $redirectTo) {
      success
      message
      accessToken
      profile
      isSignUp
    }
  }
`;

const VERIFY_SIGNUP_TOKEN_MUTATION = gql`
  mutation VerifySignupMutation($token: String!) {
    verifyWithLink(token: $token) {
      success
      message
      accessToken
      profile
    }
  }
`;

const VERIFY_SIGNUP_EMAIL_QUERY = gql`
  query verifyEmail($email: String) {
    users(where: { email: { _eq: $email } }) {
      id
    }
  }
`;

const VERIFY_SIGNUP_PHONE_QUERY = gql`
  query VERIFY_SIGNUP_PHONE_NUMBER($phoneNumber: String) {
    users_aggregate(where: { phone: { _eq: $phoneNumber } }) {
      aggregate {
        count
      }
    }
  }
`;

const SEND_EMAIL_OTP_MUTATION = gql`
  mutation requestEmailOtp($email: String!) {
    socialotp(email: $email) {
      __typename
      message
      success
    }
  }
`;

const SEND_PHONE_OTP_MUTATION = gql`
  mutation RequestPhoneNumberOtp($phoneNumber: String!) {
    socialotp(phoneNumber: $phoneNumber) {
      otp
      message
      success
    }
  }
`;

export const VALIDATE_OTP_MUTATION = gql`
  mutation ValidateOtp($email: String!, $otp: Int!) {
    validateOtp(userGivenEmail: $email, userGivenOtp: $otp) {
      message
      success
    }
  }
`;
export const VALIDATE_PHONE_OTP_MUTATION = gql`
  mutation ValidateOtp($phoneNumber: String!, $otp: Int!) {
    validateOtp(phoneNumber: $phoneNumber, userGivenOtp: $otp) {
      message
      success
    }
  }
`;

const VERIFY_ALIAS_NAME_QUERY = gql`
  query validateName($name: String) {
    users_aggregate(where: { name: { _eq: $name } }) {
      aggregate {
        count
      }
    }
  }
`;

const FETCH_USER_BY_NAME_QUERY = gql`
  query fetchUserByName($name: String) {
    users(where: { name: { _eq: $name } }) {
      id
      name
    }
  }
`;
const VERIFY_RESET_PASSWORD_EMAIL = gql`
  mutation VerifyResetPasswordEmail($email: String!) {
    sendResetLink(email: $email) {
      message
      success
    }
  }
`;
const VERIFY_RESET_PASSWORD_SET = gql`
  mutation verifyResetPasswordSet(
    $confirmPassword: String!
    $password: String!
  ) {
    resetPassword(confirmPassword: $confirmPassword, password: $password) {
      message
      success
    }
  }
`;
const VERIFY_RESET_PASSWORD_TOKEN = gql`
  mutation verifyResetToken($token: String!) {
    validateToken(token: $token) {
      accessToken
      message
      success
      profile
    }
  }
`;
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUser(
    $userId: uuid!
    $gender: gender_types
    $name: String
    $profilePicture: String
    $dob: date
    $about: String
    $areaOfInterests: [user_interests_insert_input!]!
  ) {
    delete_user_interests(where: { userId: { _eq: $userId } }) {
      affected_rows
    }
    insert_user_interests(
      objects: $areaOfInterests
      on_conflict: {
        constraint: user_interests_userId_categoryId_key
        update_columns: [userId, categoryId]
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: {
        gender: $gender
        name: $name
        profilePicture: $profilePicture
        dob: $dob
        about: $about
      }
    ) {
      id
      name
      email
      gender
      profilePicture
      about
      isAllowFollow
      isCampfireVisibility
      country
      createdAt
      isFollowing
      is_disabled_by_admin
      user_interests {
        categoryId
      }
    }
  }
`;

const UPDATE_USER_AVATAR = gql`
  mutation updateAvatar($profilePicture: String!, $userId: uuid!) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: { profilePicture: $profilePicture }
    ) {
      id
      profilePicture
    }
  }
`;
const RESEND_VERIFICARION_LINK = gql`
  mutation verifyResetToken($token: String!) {
    validateToken(token: $token) {
      accessToken
      message
      success
    }
  }
`;

const GET_AVATARS = gql`
  query getAvatars {
    avatars {
      id
      url
      slug: key
    }
  }
`;

const UPDATE_EMAIL_TOKEN_MUTATION = gql`
  mutation confirmMagicToken($token: String!) {
    confirmMagicToken(magicToken: $token) {
      message
      success
      accessToken
      profile
    }
  }
`;

// eslint-disable-next-line import/prefer-default-export
// eslint-disable-next-line import/prefer-default-export
export {
  FETCH_USER_BY_NAME_QUERY,
  GET_AVATARS,
  RESEND_VERIFICARION_LINK,
  SIGNIN_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_EMAIL_TOKEN_MUTATION,
  UPDATE_USER_AVATAR,
  UPDATE_USER_PROFILE,
  VERIFY_ALIAS_NAME_QUERY,
  VERIFY_FACEBOOK_TOKEN_MUTATION,
  VERIFY_GOOGLE_TOKEN_MUTATION,
  VERIFY_RESET_PASSWORD_EMAIL,
  VERIFY_RESET_PASSWORD_SET,
  VERIFY_RESET_PASSWORD_TOKEN,
  VERIFY_SIGNUP_EMAIL_QUERY,
  VERIFY_SIGNUP_PHONE_QUERY,
  VERIFY_SIGNUP_TOKEN_MUTATION,
  SEND_EMAIL_OTP_MUTATION,
  SIGNIN_PHONE_MUTATION,
  SEND_PHONE_OTP_MUTATION,
  SIGNUP_MUTATION_APP,
};
