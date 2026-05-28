import { useLazyQuery, useMutation } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import Text from '@/elements/Text';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  ADD_POSTS_COMMENTS,
  GET_POSTS_COMMENTS,
  UPDATE_POSTS_COMMENTS,
} from '@/service/graphql/Campfire';
import { getUserToken } from '@/utils/verifyAuthentication';

interface ICampfirePosts {
  campfireId: string;
}

export default function PostsAndComments({ campfireId }: ICampfirePosts) {
  const token = getUserToken();
  const [isCampfireSettingsEmpty, setCampfireSettingsEmpty] =
    useState<boolean>(false);
  const [campfireSettingId, setCampfireSettingId] = useState('');
  const [showPostBlockedUser, setShowPostBlockedUser] = useState(false);
  const [showpostLeftUser, setShowPostLeftUser] = useState(false);

  const [showcommentBlockedUser, setShowCommentBlockedUser] = useState(false);
  const [showcommentLeftUser, setShowCommentLeftUser] = useState(false);
  const [collapseDeletedRemovedComments, setcollapseDeletedRemovedComments] =
    useState(false);

  const [fetchPostsCommentsRules, { data, error }] = useLazyQuery(
    GET_POSTS_COMMENTS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if ((data as any)?.campfire_settings) {
      const response = data as any;
      if (isEmpty(response?.campfire_settings)) {
        setCampfireSettingsEmpty(true);
      } else {
        setCampfireSettingId(response?.campfire_settings[0]?.id);
        setShowPostBlockedUser(
          response?.campfire_settings[0]?.show_posts_from_removed_users,
        );
        setShowPostLeftUser(
          response?.campfire_settings[0]?.show_posts_from_left_users,
        );
        setShowCommentBlockedUser(
          response?.campfire_settings[0]?.show_comments_from_removed_users,
        );
        setShowCommentLeftUser(
          response?.campfire_settings[0]?.show_comments_from_left_users,
        );
        setcollapseDeletedRemovedComments(
          response?.campfire_settings[0]
            ?.collapse_deleted_and_removed_users_comments,
        );
        setCampfireSettingsEmpty(false);
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  useEffect(() => {
    if (campfireId && token !== '') {
      fetchPostsCommentsRules({
        variables: {
          campfireId,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }
  }, [campfireId, token, fetchPostsCommentsRules]);

  const [addPostsComments] = useMutation(ADD_POSTS_COMMENTS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      emitNotification('success', 'Saved successfully!');
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [updatePostsComments] = useMutation(UPDATE_POSTS_COMMENTS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      emitNotification('success', 'Saved successfully!');
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleSaveChanges = () => {
    if (isCampfireSettingsEmpty) {
      addPostsComments({
        variables: {
          campfire_id: campfireId,
          show_comments_from_left_users: showcommentLeftUser,
          show_comments_from_removed_users: showcommentBlockedUser,
          show_posts_from_left_users: showpostLeftUser,
          show_posts_from_removed_users: showPostBlockedUser,
          collapse_deleted_and_removed_users_comments:
            collapseDeletedRemovedComments,
        },
      });
    } else {
      updatePostsComments({
        variables: {
          id: campfireSettingId,
          collapse_deleted_and_removed_users_comments:
            collapseDeletedRemovedComments,
          show_comments_from_left_users: showcommentLeftUser,
          show_comments_from_removed_users: showcommentBlockedUser,
          show_posts_from_left_users: showpostLeftUser,
          show_posts_from_removed_users: showPostBlockedUser,
        },
      });
    }
  };

  return (
    <div className="p-2">
      <div className="mb-5 flex flex-row justify-between">
        <Text size="md">Post and comment</Text>
        <button
          className="rounded-full border border-blue-100 bg-sky-400 px-4 py-1 text-white"
          onClick={handleSaveChanges}
        >
          Save changes
        </button>
      </div>

      {/* Posts */}
      <div className="mb-5 p-2">
        <Text color="text-gray-500 border-b-2 border-gray-300">Post</Text>
        <div>
          <div className="flex flex-row justify-between py-2">
            <Text>Show posts from removed user</Text>
            <label className="mx-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showPostBlockedUser}
                onChange={() => setShowPostBlockedUser(!showPostBlockedUser)}
              />
              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          <div className="flex flex-row justify-between pb-2">
            <Text>Show posts from left user</Text>
            <label className="mx-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showpostLeftUser}
                onChange={() => setShowPostLeftUser(!showpostLeftUser)}
              />
              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="p-2">
        <Text color="text-gray-500 border-b-2 border-gray-300">Comments</Text>
        <div>
          <div className="flex flex-row justify-between py-2">
            <Text>Show comments from removed user</Text>
            <label className="mx-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showcommentBlockedUser}
                onChange={() =>
                  setShowCommentBlockedUser(!showcommentBlockedUser)
                }
              />
              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          <div className="flex flex-row justify-between pb-2">
            <Text>Show comments from left user</Text>
            <label className="mx-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showcommentLeftUser}
                onChange={() => setShowCommentLeftUser(!showcommentLeftUser)}
              />
              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          <div className="flex flex-row justify-between pb-2">
            <Text>Collapse deleted and removed comments</Text>
            <label className="mx-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={collapseDeletedRemovedComments}
                onChange={() =>
                  setcollapseDeletedRemovedComments(
                    !collapseDeletedRemovedComments,
                  )
                }
              />
              <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
