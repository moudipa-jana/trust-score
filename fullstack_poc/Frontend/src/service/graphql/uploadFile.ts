import gql from 'graphql-tag';

const UPLOAD_FILE_MUTATION = gql`
  mutation uploadFile($fileName: String!, $fileType: String!, $path: String!) {
    uploadFile(fileName: $fileName, fileType: $fileType, path: $path) {
      message
      success
      signedUrl
      finalPath
    }
  }
`;

export default UPLOAD_FILE_MUTATION;
