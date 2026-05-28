import { gql } from '@apollo/client';

import {
  ANNOUNCEMENT_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

export const QUERY_GET_BASIC_USER_NAME = gql`
  query GetBasicUserName($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      name
    }
  }
`;

export const QUERY_GET_USER_PROFILE = gql`
  query GetUserProfile($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      createdAt
      email: safeEmail
      gender
      isVerified
      name
      profilePicture
      about
      isPasswordSet
      country
      isAllowFollow
      isCampfireVisibility
      isPasswordSet
      user_interests {
        category {
          title
          id
        }
      }
      following
      followers
      no_of_posts
      isBlocked
      noActivities: user_activity_summary {
        totalCount: total_count
      }
      noArchives: threads_aggregate(
        where: {
          isArchived: { _eq: true }
          type: { _neq: "campfirePostShare" }
        }
      ) {
        aggregate {
          count
        }
      }
      noBookmarks: bookmarks_aggregate(
        where: {
          _or: [
            {
              question: {
                isArchived: { _eq: false }
                isBlocked: { _eq: false }
              }
            }
            { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
            { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
            {
              comment: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
            }
            {
              post_share: {
                isArchived: { _eq: false }
                isBlocked: { _eq: false }
              }
            }
          ]
        }
      ) {
        aggregate {
          count
        }
      }
      noHiddenPosts
      noHidden: hidden_threads_aggregate(
        where: {
          _or: [
            {
              question: {
                isArchived: { _eq: false }
                isBlocked: { _eq: false }
              }
            }
            { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
            { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
            {
              post_share: {
                isArchived: { _eq: false }
                isBlocked: { _eq: false }
              }
            }
          ]
        }
      ) {
        aggregate {
          count
        }
      }
      noHiddenComments: hidden_comments_aggregate(
        where: {
          comment: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const QUERY_GET_UPDATED_USER_PROFILE = gql`
  query userProfileAfterEdit($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      name
      profilePicture
      about
      isAllowFollow
      isCampfireVisibility
      user_interests {
        category {
          title
          id
        }
      }
    }
  }
`;

export const QUERY_FETCH_FOLLOWING = gql`
  query GetUserFollowing($userId: uuid) {
    user_followings: user_followers(where: { userId: { _eq: $userId } }) {
      userFollowing {
        id
        name
        profilePicture
      }
    }
  }
`;

export const QUERY_FETCH_BOOKMARK = gql`
  query GetUserBookmark(
    $limit: Int! = 10
    $offset: Int! = 0
    $sort: [bookmarks_order_by!]
  ) {
    bookmarks(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: {
        _or: [
          {
            question: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
          }
          { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { comment: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          {
            post_share: {
              isArchived: { _eq: false }
              isBlocked: { _eq: false }
            }
          }
        ]
      }
    ) {
      id
      type
      campfire_thread_share {
        ...campfirePostShareFields
        __typename
      }
      comment {
        ...commentFields
        __typename
      }
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      question {
        ...questionFields
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      quiz {
        ...quizFields
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      postShare: post_share {
        ...postShareFields
        __typename
      }
      campfireShare {
        ...campfireShareFields
        __typename
      }
      __typename
    }
    totalBookmarks: bookmarks_aggregate(
      where: {
        _or: [
          {
            question: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
          }
          { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { comment: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          {
            post_share: {
              isArchived: { _eq: false }
              isBlocked: { _eq: false }
            }
          }
        ]
      }
    ) {
      aggregate {
        count
        __typename
      }
      __typename
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
`;

export const MUTATION_ADD_BOOKMARK = gql`
  mutation AddBookmark(
    $questionId: uuid
    $pollId: uuid
    $quizId: uuid
    $commentId: uuid
    $campfireShareId: uuid
    $postShareId: uuid
    $campfirePostShareId: uuid
  ) {
    insert_bookmarks_one(
      object: {
        questionId: $questionId
        pollId: $pollId
        quizId: $quizId
        commentId: $commentId
        campfireShareId: $campfireShareId
        postShareId: $postShareId
        campfirePostShareId: $campfirePostShareId
      }
    ) {
      id
      type
      campfirePostShare: campfire_thread_share {
        ...campfirePostShareFields
      }
      quiz {
        ...quizFields
      }
      poll {
        ...pollFields
      }
      question {
        ...questionFields
      }
      comment {
        ...commentFields
      }
      campfireShare {
        ...campfireShareFields
      }
      postShare: post_share {
        ...postShareFields
      }
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
`;

export const MUTATION_REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark(
    $questionId: uuid = "00000000-0000-0000-0000-000000000000"
    $pollId: uuid = "00000000-0000-0000-0000-000000000000"
    $quizId: uuid = "00000000-0000-0000-0000-000000000000"
    $commentId: uuid = "00000000-0000-0000-0000-000000000000"
    $campfireShareId: uuid = "00000000-0000-0000-0000-000000000000"
    $postShareId: uuid = "00000000-0000-0000-0000-000000000000"
  ) {
    update_bookmarks(
      where: {
        _or: [
          { questionId: { _eq: $questionId } }
          { pollId: { _eq: $pollId } }
          { quizId: { _eq: $quizId } }
          { commentId: { _eq: $commentId } }
          { campfireShareId: { _eq: $campfireShareId } }
          { postShareId: { _eq: $postShareId } }
        ]
      }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
  }
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($followingId: uuid!) {
    insert_user_followers_one(
      object: { followingId: $followingId }
      on_conflict: {
        constraint: user_followers_userId_followingId_key
        update_columns: [followingId, userId]
      }
    ) {
      id
      createdAt
      following: userFollowing {
        id
        name
        profilePicture
        isFollowing
      }
    }
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnFollowUser($followingId: uuid!) {
    delete_user_followers(where: { followingId: { _eq: $followingId } }) {
      affected_rows
    }
  }
`;

export const QUERY_USER_FOLLOWERS_FOLLOWING_COUNT = gql`
  query userFollowersFollowingCount($userId: uuid!) {
    users(where: { id: { _eq: $userId } }) {
      followers
      following
    }
  }
`;

export const REMOVE_FOLLOWERS_MUTATION = gql`
  mutation DeleteFollowers($userId: uuid!) {
    delete_user_followers(where: { userId: { _eq: $userId } }) {
      affected_rows
    }
  }
`;

// activity  query start//

export const QUERY_USER_ACTIVITIES_POST = gql`
  query QueryPosts($limit: Int = 10, $offset: Int = 0, $userId: uuid!) {
    posts: threads(
      where: {
        userId: { _eq: $userId }
        isArchived: { _eq: false }
        isHidden: { _eq: false }
      }
      limit: $limit
      offset: $offset
    ) {
      type
      id
      campfirePostShare {
        ...campfirePostShareFields
      }
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
      }
      question {
        ...questionFields
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
      }
      quiz {
        ...quizFields
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
      }
      postShare {
        ...postShareFields
        likes
        post_reactions(where: { user_id: { _eq: $userId } }) {
          kofukon {
            id
            name
          }
          id
          user_id
        }
      }
    }
  }

  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
`;

export const QUERY_USER_ACTIVITIES_COMMENT = gql`
  query userActivitiesComment(
    $userId: uuid!
    $limit: Int = 10
    $offset: Int = 0
  ) {
    comments: comments(
      where: {
        isArchived: { _eq: false }
        is_post_archived_by_user: { _eq: false }
        deletedAt: { _is_null: true }
        parentId: { _is_null: true }
        userId: { _eq: $userId }
      }
      order_by: { createdAt: desc }
      limit: $limit
      offset: $offset
    ) {
      ...commentFields
      poll {
        user {
          ...userFields
        }
      }
      question {
        user {
          ...userFields
        }
      }
      quiz {
        user {
          ...userFields
        }
      }
      postShare: post_share {
        user {
          ...userFields
        }
      }
      campfire_thread_share {
        user {
          ...userFields
        }
      }
      campfireShare {
        campfire {
          title
        }
        user {
          ...userFields
        }
      }
      announcement {
        id
        ...announcementFields
      }
    }
  }
  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

export const QUERY_USER_ACTIVITIES_REPLY = gql`
  query userActivitiesReplies(
    $userId: uuid!
    $limit: Int = 10
    $offset: Int = 0
  ) {
    replies: comments(
      where: {
        parentId: { _is_null: false }
        userId: { _eq: $userId }
        is_post_archived_by_user: { _eq: false }
      }
      order_by: { createdAt: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      message
      is_disabled_by_admin
      noDownValues
      noUpValues
      upVoted
      downVoted
      questionId
      pollId
      quizId
      parentId
      announcement_id
      campfireShareId
      announcement {
        ...announcementFields
      }
      campfireShare {
        campfire {
          title
        }
        user {
          ...userFields
        }
      }
      postShareId
      campfire_post_share_id
      isEdited
      createdAt
      hasPostCommentorRequestedForDeactivation
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        announcement_id
        announcement {
          ...announcementFields
        }
        campfireShareId
        campfireShare {
          campfire {
            title
          }
          user {
            ...userFields
          }
        }
        campfire_post_share_id
        parent {
          id
          message
          pollId
          quizId
          questionId
          postShareId
          campfireShareId
          announcement_id
          announcement {
            ...announcementFields
          }
          campfireShare {
            campfire {
              title
            }
            user {
              ...userFields
            }
          }
          campfire_post_share_id
          parentId
          is_disabled_by_admin
          user {
            ...userFields
          }
        }
        parentId
        is_disabled_by_admin
        user {
          ...userFields
        }
      }
      user {
        ...userFields
      }
    }
  }
  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
`;

export const QUERY_USER_VALUED_POST = gql`
  query valuedPosts($limit: Int = 10, $offset: Int = 0) {
    valuedPosts: user_actions(
      where: {
        isUpvoted: { _eq: true }
        _or: [{ question: {} }, { poll: {} }, { quiz: {} }]
      }
      limit: $limit
      offset: $offset
    ) {
      id
      type
      pollId
      questionId
      quizId
      poll {
        ...pollFields
      }
      question {
        ...questionFields
      }
      quiz {
        ...quizFields
      }
    }
  }
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

export const QUERY_USER_UNVALUED_POST = gql`
  query unvaluedPosts($limit: Int = 10, $offset: Int = 0) {
    valuedPosts: user_actions(
      where: {
        isUpvoted: { _eq: false }
        _or: [{ question: {} }, { poll: {} }, { quiz: {} }]
      }
      limit: $limit
      offset: $offset
    ) {
      id
      type
      pollId
      questionId
      quizId
      poll {
        ...pollFields
      }
      question {
        ...questionFields
      }
      quiz {
        ...quizFields
      }
    }
  }
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

//activity query end//

//profile user edit start//
export const EDIT_USER_PROFILE_MUTATION = gql`
  mutation editProfileMutation(
    $userId: uuid!
    $name: String
    $about: String
    $isAllowFollow: Boolean
    $isCampfireVisibility: Boolean
    $areaOfInterests: [user_interests_insert_input!]!
  ) {
    delete_user_interests(where: { userId: { _eq: $userId } }) {
      affected_rows
    }
    insert_user_interests(
      objects: $areaOfInterests
      on_conflict: {
        constraint: user_interests_userId_categoryId_key
        update_columns: [categoryId]
      }
    ) {
      affected_rows
    }
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: {
        name: $name
        about: $about
        isAllowFollow: $isAllowFollow
        isCampfireVisibility: $isCampfireVisibility
      }
    ) {
      id
      createdAt
      email: safeEmail
      gender
      isVerified
      name
      profilePicture
      about
      country
      isAllowFollow
      isCampfireVisibility
      isPasswordSet
      user_interests {
        category {
          title
          id
        }
      }
      followersCount: followers
      followingCount: following
      no_of_posts
      isBlocked
      noActivities: user_activity_summary {
        totalCount: total_count
      }
      noArchives: threads_aggregate(where: { isArchived: { _eq: true } }) {
        aggregate {
          count
        }
      }
      noBookmarks: bookmarks_aggregate(
        where: {
          _or: [{ question: {} }, { poll: {} }, { quiz: {} }, { comment: {} }]
        }
      ) {
        aggregate {
          count
        }
      }
      noHiddenPosts
    }
  }
`;
//profile user edit end//
//account settings query start//

export const UPDATE_GENDER_MUTATION = gql`
  mutation UpdateGender($userId: uuid!, $gender: gender_types!) {
    update_users_by_pk(pk_columns: { id: $userId }, _set: { gender: $gender }) {
      id
    }
  }
`;

export const UPDATE_COUNTRY_MUTATION = gql`
  mutation UpdateCountry($userId: uuid!, $country: String!) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: { country: $country }
    ) {
      id
    }
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword(
    $currentPassword: String!
    $confirmPassword: String!
    $newPassword: String!
  ) {
    updatePassword(
      confirmPassword: $confirmPassword
      newPassword: $newPassword
      password: $currentPassword
    ) {
      message
      success
    }
  }
`;

export const UPDATE_EMAIL_MUTATION = gql`
  mutation UpdateEmail($currentEmail: String!, $newEmail: String!) {
    updateEmail(currentEmail: $currentEmail, newEmail: $newEmail) {
      message
      success
    }
  }
`;

//account settings query end//

//archive query start//

export const QUERY_ARCHIVE_POST = gql`
  query archivePostQuery(
    $userId: uuid!
    $limit: Int = 10
    $offset: Int = 0
    $sort: [threads_order_by!]
  ) {
    archivedPosts: threads(
      where: {
        userId: { _eq: $userId }
        isArchived: { _eq: true }
        _or: [{ question: {} }, { poll: {} }, { quiz: {} }, { postShare: {} }]
      }
      limit: $limit
      offset: $offset
      order_by: $sort
    ) {
      id
      type
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
      }
      question {
        ...questionFields
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
      }
      quiz {
        ...quizFields
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
      }
      postShare {
        ...postShareFields
      }
      campfirePostShare {
        ...campfirePostShareFields
      }
    }
    totalArchives: threads_aggregate(
      where: {
        userId: { _eq: $userId }
        isArchived: { _eq: true }
        _or: [{ question: {} }, { poll: {} }, { quiz: {} }, { postShare: {} }]
      }
    ) {
      aggregate {
        count
      }
    }
  }
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

//archive query end//

//hide post  mutation and query start //
export const HIDE_POST_MUTATION = gql`
  mutation hidePostMutation(
    $questionId: uuid
    $pollId: uuid
    $quizId: uuid
    $postShareId: uuid
  ) {
    insert_hidden_posts_one(
      object: {
        questionId: $questionId
        pollId: $pollId
        quizId: $quizId
        postShareId: $postShareId
      }
    ) {
      id
      createdAt
      pollId
      questionId
      quizId
      userId
    }
  }
`;

export const UNHIDE_POST_MUTATION = gql`
  mutation unhidePostMutation(
    $questionId: uuid = "00000000-0000-0000-0000-000000000000"
    $pollId: uuid = "00000000-0000-0000-0000-000000000000"
    $quizId: uuid = "00000000-0000-0000-0000-000000000000"
    $postShareId: uuid = "00000000-0000-0000-0000-000000000000"
  ) {
    update_hidden_posts(
      where: {
        _or: [
          { questionId: { _eq: $questionId } }
          { pollId: { _eq: $pollId } }
          { quizId: { _eq: $quizId } }
          { postShareId: { _eq: $postShareId } }
        ]
      }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
      returning {
        poll {
          ...pollFields
        }
        question {
          ...questionFields
        }
        quiz {
          ...quizFields
        }
      }
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
`;

export const QUERY_FETCH_HIDE_POST = gql`
  ${COMMENT_FIELDS_FRAGMENT}
  query fetchhiddenPost(
    $limit: Int! = 10
    $offset: Int! = 0
    $sort: [hidden_posts_order_by!]
  ) {
    hidden_posts(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: {
        _or: [
          {
            question: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
          }
          { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          {
            post_share: {
              isArchived: { _eq: false }
              isBlocked: { _eq: false }
            }
          }
        ]
      }
    ) {
      id
      createdAt
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      question {
        ...questionFields
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      quiz {
        ...quizFields
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
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      postShare: post_share {
        ...postShareFields
        __typename
      }
      __typename
    }
    totalHiddenPosts: hidden_posts_aggregate(
      where: {
        _or: [
          {
            question: { isArchived: { _eq: false }, isBlocked: { _eq: false } }
          }
          { poll: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          { quiz: { isArchived: { _eq: false }, isBlocked: { _eq: false } } }
          {
            post_share: {
              isArchived: { _eq: false }
              isBlocked: { _eq: false }
            }
          }
        ]
      }
    ) {
      aggregate {
        count
        __typename
      }
      __typename
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
`;

export const QUERY_FETCH_HIDE_COMMENT = gql`
  query fetchHiddenComments(
    $limit: Int = 10
    $offset: Int = 0
    $sort: [comments_order_by!]
  ) {
    comments(
      where: {
        parentId: { _is_null: true }
        isHidden: { _eq: true }
        isBlocked: { _eq: false }
      }
      order_by: $sort
      limit: $limit
      offset: $offset
    ) {
      ...commentFields
      __typename
    }
    totalHiddenComments: hidden_comments_aggregate(
      where: {
        comment: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
      }
    ) {
      aggregate {
        count
        __typename
      }
      __typename
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

export const QUERY_FETCH_HIDE_REPLIES = gql`
  query fetchHiddenReplies(
    $limit: Int = 10
    $offset: Int = 0
    $sort: [comments_order_by!]
  ) {
    comments(
      where: {
        parentId: { _is_null: false }
        isHidden: { _eq: true }
        isBlocked: { _eq: false }
      }
      order_by: $sort
      limit: $limit
      offset: $offset
    ) {
      ...commentFields
      __typename
    }
    totalHiddenReplies: comments_aggregate(
      where: {
        parentId: { _is_null: false }
        isHidden: { _eq: true }
        isBlocked: { _eq: false }
      }
    ) {
      aggregate {
        count
        __typename
      }
      __typename
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

export const HIDE_COMMENT_MUTATION = gql`
  mutation hideCommentMutation($commentId: uuid!) {
    insert_hidden_comments_one(object: { commentId: $commentId }) {
      createdAt
      comment {
        ...commentFields
      }
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;

export const UNHIDE_COMMENT_MUTATION = gql`
  mutation unhideCommentMutation($commentId: uuid!, $userId: uuid!) {
    delete_hidden_comments(
      where: { commentId: { _eq: $commentId }, userId: { _eq: $userId } }
    ) {
      affected_rows
      returning {
        createdAt
        comment {
          ...commentFields
        }
      }
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;
//hide post  mutation and query end //

//block user start//
export const BLOCK_USER_MUTATION = gql`
  mutation blockUserMutation($blockedUserId: String!, $campfireId: String) {
    blockAUser(blockedUserId: $blockedUserId, campfireId: $campfireId) {
      data
      message
      success
    }
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation unBlockUsers($blockedUserId: uuid!) {
    update_blocked_users(
      where: { blockedUserId: { _eq: $blockedUserId } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
  }
`;

export const QUERY_GET_BLOCK_USERS = gql`
  query getBlockedUsers($userId: uuid!) {
    blocked_users(where: { userId: { _eq: $userId } }) {
      id
      blocked_user {
        id
        name
        profilePicture
      }
    }
  }
`;

export const QUERY_GET_USERS_WHO_BLOCKED_ME = gql`
  query getUsersWhoBlockedMe($myId: uuid!) {
    blocked_users(where: { blockedUserId: { _eq: $myId } }) {
      userId
    }
  }
`;
//block user end//

//guest user details//
export const QUERY_GET_GUEST_USER_PROFILE = gql`
  query getGuestUserProfile($username: String!) {
    users(
      where: { name: { _eq: $username }, is_archived_by_admin: { _eq: false } }
    ) {
      id
      about
      is_archived_by_admin
      is_disabled_by_admin
      profilePicture
      createdAt
      isFollowing
      isBlocked
      name
      isCampfireVisibility
      followersCount: followers
      followingCount: following
      noPosts: no_of_posts
      user_interests {
        category {
          title
        }
      }
    }
  }
`;

export const QUERY_GET_COUNT_OF_REPLIES_AND_COMMENTS = gql`
  query getCountOfCommentsAndReplies($username: String!) {
    users(where: { name: { _eq: $username } }) {
      comments_aggregate(where: { is_post_archived_by_user: { _eq: false } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const QUERY_GET_GUEST_USER_POST = gql`
  query guestUserPost(
    $userId: uuid!
    $limit: Int = 10
    $offset: Int = 0
    $sort: [threads_order_by!]
  ) {
    posts: threads(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: { userId: { _eq: $userId }, isArchived: { _eq: false } }
    ) {
      id
      type
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
      }
      question {
        ...questionFields
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
      }
      quiz {
        ...quizFields
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
      }
      postShare {
        ...postShareFields
      }
      campfirePostShare {
        ...campfirePostShareFields
      }
    }
  }
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
`;

export const QUERY_GET_GUEST_USER_COMMENT = gql`
  query guestUserComment(
    $username: String!
    $limit: Int = 10
    $offset: Int = 0
    $sort: [comments_order_by!]
  ) {
    comments(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: {
        user: { name: { _eq: $username } }
        parentId: { _is_null: true }
      }
    ) {
      id
      message
      noDownValues
      noUpValues
      createdAt
      upVoted
      downVoted
      noParticipants
      isBookmarked
      quizId
      questionId
      pollId
      campfireShareId
      postShareId
      user {
        ...userFields
        __typename
      }
      repliesCount: childs_aggregate {
        aggregate {
          count
          __typename
        }
        __typename
      }
      __typename
    }
  }

  ${USER_FIELDS_FRAGMENT}
`;

export const QUERY_GET_GUEST_USER_REPLIES = gql`
  query guestUserReplies(
    $username: String!
    $limit: Int = 10
    $offset: Int = 0
    $sort: [comments_order_by!]
  ) {
    replies: comments(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: {
        user: { name: { _eq: $username } }
        parentId: { _is_null: false }
      }
    ) {
      id
      createdAt
      message
      noDownValues
      noUpValues
      upVoted
      downVoted
      quizId
      questionId
      pollId
      campfireShareId
      postShareId
      user {
        ...userFields
        __typename
      }
      __typename
    }
  }

  ${USER_FIELDS_FRAGMENT}
`;

export const QUERY_GET_GUEST_USER_COMMENT_AND_REPLIES = gql`
  query getCommentsAndRepliesByUser(
    $userId: uuid!
    $limit: Int = 10
    $offset: Int = 0
    $sort: [comments_order_by!]
  ) {
    comments(
      limit: $limit
      offset: $offset
      order_by: $sort
      where: {
        userId: { _eq: $userId }
        is_post_archived_by_user: { _eq: false }
      }
    ) {
      id
      message
      is_disabled_by_admin
      noDownValues
      noUpValues
      upVoted
      downVoted
      questionId
      pollId
      quizId
      parentId
      announcement_id
      campfireShareId
      poll {
        user {
          ...userFields
        }
      }
      question {
        user {
          ...userFields
        }
      }
      quiz {
        user {
          ...userFields
        }
      }
      postShare: post_share {
        user {
          ...userFields
        }
      }
      campfire_thread_share {
        user {
          ...userFields
        }
      }
      announcement {
        ...announcementFields
      }
      campfireShare {
        campfire {
          title
        }
        user {
          ...userFields
        }
      }
      postShareId
      campfire_post_share_id
      isEdited
      createdAt
      hasPostCommentorRequestedForDeactivation
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        announcement_id
        campfireShareId
        poll {
          user {
            ...userFields
          }
        }
        question {
          user {
            ...userFields
          }
        }
        quiz {
          user {
            ...userFields
          }
        }
        postShare: post_share {
          user {
            ...userFields
          }
        }
        campfire_thread_share {
          user {
            ...userFields
          }
        }
        announcement {
          ...announcementFields
        }
        campfireShare {
          campfire {
            title
          }
          user {
            ...userFields
          }
        }
        campfire_post_share_id
        parent {
          id
          message
          pollId
          quizId
          questionId
          postShareId
          campfireShareId
          announcement_id
          poll {
            user {
              ...userFields
            }
          }
          question {
            user {
              ...userFields
            }
          }
          quiz {
            user {
              ...userFields
            }
          }
          postShare: post_share {
            user {
              ...userFields
            }
          }
          campfire_thread_share {
            user {
              ...userFields
            }
          }
          announcement {
            ...announcementFields
          }
          campfireShare {
            campfire {
              title
            }
            user {
              ...userFields
            }
          }
          campfire_post_share_id
          parentId
          is_disabled_by_admin
          user {
            ...userFields
          }
        }
        parentId
        is_disabled_by_admin
        user {
          ...userFields
        }
      }
      user {
        ...userFields
      }
    }
  }

  ${ANNOUNCEMENT_FIELDS_FRAGMENT}
`;
//guest user details end

export const QUERY_GET_FOLLOWERS = gql`
  query GetFollowers($userId: uuid) {
    user_followers: user_followers(where: { followingId: { _eq: $userId } }) {
      follower: user {
        id
        name
        profilePicture
        isFollowing
      }
    }
  }
`;

export const QUERY_GET_FOLLOWING = gql`
  query GetFollowing($userId: uuid) {
    user_followings: user_followers(where: { userId: { _eq: $userId } }) {
      userFollowing {
        id
        name
        profilePicture
        isFollowing
      }
    }
  }
`;
export const SET_PASSWORD_MUTATION = gql`
  mutation SetPassword($newPassword: String!, $confirmPassword: String!) {
    setPassword(newPassword: $newPassword, confirmPassword: $confirmPassword) {
      message
      success
    }
  }
`;

export const DEACTIVTE_PROFILE = gql`
  mutation DeactiaveMyProfile($password: String!) {
    deactivateUser(password: $password) {
      message
      success
    }
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeleteMyProfile($password: String!) {
    deleteAccount(password: $password) {
      message
      success
    }
  }
`;

export const SUBSCRIBED_TO_NEWSLETTER = gql`
  mutation SubscribedNewsletter(
    $email: String = ""
    $isSubscribedTo: Boolean = false
  ) {
    insert_subscriptions_one(
      object: { email: $email, isSubscribedTo: $isSubscribedTo }
    ) {
      id
      isSubscribedTo
    }
  }
`;

export const SUBSCRIBED_USERS_LIST = gql`
  query subscribedUsersList($email: String!) {
    subscriptions(where: { email: { _eq: $email } }) {
      isSubscribedTo
    }
  }
`;
