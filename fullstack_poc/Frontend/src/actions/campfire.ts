import axios from 'axios';

import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import ApiClient from '@/service/graphql/apiClient';
import {
  FAILED_UPDATE_CAMPFIRE_DISPLAY_PICTURE,
  QUERY_POST_BY_CAMPFIRE_ID,
  UPDATE_CAMPFIRE_PICTURE,
} from '@/service/graphql/Campfire';
import { PostTypeEnum } from '@/types/enums';
import { ThreadType } from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';
type UploadFileProps = {
  file: File;
  campfireId: string;
  cb: (success: boolean, url?: string) => void;
};

// Uploads a picture for a specific campfire, updates the profile picture, and invokes the callback with success or failure.
// eslint-disable-next-line import/prefer-default-export
export async function uploadPicture({
  file,
  campfireId,
  cb,
}: UploadFileProps): Promise<void> {
  const fileType = file.type;
  const fileName = file.name;
  const token = getUserToken();
  const config = {
    headers: {
      'Content-Type': fileType,
    },
  };
  let response: any;
  try {
    response = await ApiClient.getClient().mutate({
      mutation: UPDATE_CAMPFIRE_PICTURE,
      variables: {
        campfireId,
        fileName,
        fileType,
      },
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    const signedUrl: string = response.data.campfireProfileUpdate.signedUrl;
    const imageUrl = response.data.campfireProfileUpdate.documentUrl;
    if (window.location.hostname.includes('localhost')) {
      cb(true, imageUrl);
      return;
    }
    if (signedUrl) {
      try {
        await axios.put(signedUrl, file, config);
        cb(true, imageUrl);
        return;
      } catch (err) {
        try {
          await ApiClient.getClient().mutate({
            mutation: FAILED_UPDATE_CAMPFIRE_DISPLAY_PICTURE,
            variables: {
              campfireId,
            },
            context: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          cb(false);
          return;
        } catch {
          cb(false);
          return;
        }
      }
    }
  } catch (error) {
    cb(false);
  }
}

// Fetches a post by its campfire ID, with pagination, and returns the post data or null if not found.
export async function getPostByCampfireId(
  id: string | undefined,
  limit = 10,
  offset = 0,
): Promise<ThreadType | null> {
  try {
    const token = getUserToken();
    const response: any = await ApiClient.getClient().query({
      query: QUERY_POST_BY_CAMPFIRE_ID,
      fetchPolicy: 'no-cache',
      variables: { id, limit, offset },
      context: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
    if (!response.data) {
      emitErrorNotification('Oops! No data found');
      return null;
    } else {
      const threadData = {
        campfireShare: response.data.campfire_shares_by_pk,
        id: response.data.campfire_shares_by_pk.id,
        type: PostTypeEnum.campfire,
        createdAt: response.data.campfire_shares_by_pk.createdAt,
      };
      return threadData;
    }
  } catch (error) {
    emitErrorNotification(formatGraphqlError(error));
    return null;
  }
}
