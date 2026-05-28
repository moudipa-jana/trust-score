import { gql } from '@apollo/client';

const USER_FIELDS_FRAGMENT = gql`
  fragment userFields on users {
    id
    name
    profilePicture
    isFollowing
    is_disabled_by_admin
  }
`;

const QUESTION_FIELDS_FRAGMENT = gql`
  fragment questionFields on questions {
    id
    title
    description
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    createdAt
    type
    categoryName
    post_categories {
      category {
        id
        title
        is_enabled
      }
    }
    upVoted
    downVoted
    likes
    isBookmarked
    isHidden
    isArchived
    isEdited
    isCampfire
    campfireName
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    user {
      ...userFields
    }
    media_link
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const POLL_FIELD_FRAGMENT = gql`
  fragment pollFields on polls {
    id
    title
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    isAnalytics
    createdAt
    type
    categoryName
    upVoted
    likes
    downVoted
    isBookmarked
    isHidden
    isArchived
    isCampfire
    campfireName
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    poll_options(order_by: { createdAt: asc }) {
      id
      title
      analyticsCount
      isSelected
    }
    user {
      ...userFields
    }
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const QUIZ_FIELDS_FRAGMENT = gql`
  fragment quizFields on quiz {
    id
    title
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    isAnalytics
    createdAt
    type
    categoryName
    upVoted
    downVoted
    likes
    isBookmarked
    isHidden
    isArchived
    isCampfire
    campfireName
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    quiz_options(order_by: { createdAt: asc }) {
      id
      title
      isSelected
      isAnswer: getAnswer
      analyticsCount
    }
    user {
      ...userFields
    }
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const COMMENT_FIELDS_FRAGMENT = gql`
  fragment commentFields on comments {
    id
    message
    noDownValues
    noUpValues
    createdAt
    upVoted
    downVoted
    noParticipants
    isBookmarked
    isEdited
    ispinned
    isHidden
    questionId
    quizId
    pollId
    likes
    is_disabled_by_admin
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    postShareId
    campfire_post_share_id
    campfireShareId
    announcement_id
    parentId
    parent {
      id
      message
      pollId
      quizId
      questionId
      postShareId
      campfireShareId
      campfire_post_share_id
      announcement_id
      parentId
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        campfireShareId
        campfire_post_share_id
        announcement_id
        parentId
        is_disabled_by_admin
        user {
          ...userFields
        }
      }
      is_disabled_by_admin
      user {
        ...userFields
      }
    }
    comment {
      user {
        name
      }
    }
    replies: comments(
      order_by: {
        by_author: desc
        ispinned: desc
        pinned_at: desc_nulls_last
        createdAt: desc
      }
    ) {
      id
      message
      noDownValues
      noUpValues
      upVoted
      downVoted
      isEdited
      isHidden
      createdAt
      questionId
      quizId
      pollId
      postShareId
      campfire_post_share_id
      announcement_id
      parentId
      likes
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      comment {
        user {
          name
        }
      }
      user {
        ...userFields
      }
      repliesToReplies: comments(order_by: { createdAt: desc }) {
        id
        message
        noDownValues
        noUpValues
        upVoted
        downVoted
        isEdited
        isHidden
        createdAt
        parentId
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        comment {
          user {
            name
          }
        }
        user {
          ...userFields
        }
      }
      repliestoRepliesCount: childs_aggregate {
        aggregate {
          count
        }
      }
    }
    repliesCount: childs_aggregate {
      aggregate {
        count
      }
    }
    user {
      ...userFields
    }
  }
`;

const COMMENT_FIELDS_NO_REPLIES_FRAGMENT = gql`
  fragment commentFieldsWithNoReplies on comments {
    id
    message
    noDownValues
    noUpValues
    createdAt
    upVoted
    downVoted
    noParticipants
    isBookmarked
    isEdited
    ispinned
    isHidden
    questionId
    quizId
    pollId
    likes
    is_deleted_by_admin_of_campfire
    is_disabled_by_admin
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    postShareId
    campfireShareId
    parentId
    parent {
      id
      message
      pollId
      quizId
      questionId
      postShareId
      campfireShareId
      campfire_post_share_id
      parentId
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        campfireShareId
        campfire_post_share_id
        parentId
        is_disabled_by_admin
        user {
          ...userFields
        }
      }
      is_disabled_by_admin
      user {
        ...userFields
      }
    }
    comment {
      user {
        name
      }
    }
    replies: comments(
      order_by: {
        by_author: desc
        ispinned: desc
        pinned_at: desc_nulls_last
        createdAt: desc
      }
    ) {
      id
      message
      noDownValues
      noUpValues
      upVoted
      downVoted
      isEdited
      isHidden
      createdAt
      questionId
      quizId
      pollId
      postShareId
      parentId
      likes
      is_disabled_by_admin
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      comment {
        user {
          name
        }
      }
      user {
        ...userFields
      }
      repliesToReplies: comments(order_by: { createdAt: desc }) {
        id
        message
        isEdited
        isHidden
        createdAt
        parentId
        likes
        is_disabled_by_admin
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        comment {
          user {
            name
          }
        }
        user {
          ...userFields
        }
      }
    }
    repliesCount: childs_aggregate {
      aggregate {
        count
      }
    }
    user {
      ...userFields
    }
  }
`;

const COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT = gql`
  fragment commentFieldsWithNoRepliesForAuthenticatedUser on comments {
    id
    message
    noDownValues
    noUpValues
    createdAt
    upVoted
    downVoted
    noParticipants
    isBookmarked
    isEdited
    ispinned
    isHidden
    questionId
    quizId
    pollId
    likes
    is_deleted_by_admin_of_campfire
    is_disabled_by_admin
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    postShareId
    campfireShareId
    parentId
    parent {
      id
      message
      pollId
      quizId
      questionId
      postShareId
      campfireShareId
      campfire_post_share_id
      parentId
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        campfireShareId
        campfire_post_share_id
        parentId
        is_disabled_by_admin
        user {
          ...userFields
        }
      }
      is_disabled_by_admin
      user {
        ...userFields
      }
    }
    comment {
      user {
        name
      }
    }
    replies: comments(
      where: { isBlocked: { _eq: false } }
      order_by: {
        by_author: desc
        ispinned: desc
        pinned_at: desc_nulls_last
        createdAt: desc
      }
    ) {
      id
      message
      noDownValues
      noUpValues
      upVoted
      downVoted
      isEdited
      isHidden
      createdAt
      questionId
      quizId
      pollId
      postShareId
      parentId
      likes
      is_disabled_by_admin
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      comment {
        user {
          name
        }
      }
      user {
        ...userFields
      }
      repliesToReplies: comments(
        where: { isBlocked: { _eq: false } }
        order_by: { createdAt: desc }
      ) {
        id
        message
        isEdited
        isHidden
        createdAt
        parentId
        likes
        is_disabled_by_admin
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        comment {
          user {
            name
          }
        }
        user {
          ...userFields
        }
      }
    }
    repliesCount: childs_aggregate {
      aggregate {
        count
      }
    }
    user {
      ...userFields
    }
  }
`;

const CAMPFIRE_FIELDS_FRAGMENT = gql`
  fragment campfireFields on campfires {
    id
    title
    description
    categoryId
    noParticipants
    isMember
    isAdmin
    is_public
    picture
    coverPicture
    isRequested
    createdAt
    is_disabled_by_admin
    category {
      title
    }
  }
`;

const CAMPFIRE_SHARE_FIELDS_FRAGMENT = gql`
  fragment campfireShareFields on campfire_shares {
    id
    campfireId
    message
    noUpValues
    noDownValues
    likes
    noComments
    noParticipants
    createdAt
    campfireData: campfire {
      id
      title
      description
      categoryId
      noParticipants
      isMember
      picture
      category {
        title
      }
      noPosts: campfire_threads_aggregate {
        aggregate {
          count
        }
      }
    }
    user {
      ...userFields
    }
  }
`;

const FEED_POST_SHARE_FIELDS_FRAGMENT = gql`
  fragment postShareFields on post_shares {
    id
    isArchived
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    type
    isBookmarked
    categoryName
    isHidden
    title
    userId
    upVoted
    downVoted
    likes
    createdAt
    is_disabled_by_admin
    campfire_thread_share {
      ...campfirePostShareFields
    }
    question {
      ...questionFields
      isBlocked
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
    poll {
      ...pollFields
      isBlocked
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
      isBlocked
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
    user {
      ...userFields
    }
    
  }
`;

const FEED_COMMENTS_AND_REPLIES_FRAGMENT = gql`
  fragment threadFields on threads {
    id
    createdAt
    type
    poll {
      ...pollFields
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    question {
      ...questionFields
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    quiz {
      ...quizFields
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    postShare {
      id
      isArchived
      noComments
      noDownValues
      noParticipants
      noUpValues
      likes
      noViews
      type
      isBookmarked
      categoryName
      isHidden
      pollId
      questionId
      quizId
      title
      userId
      upVoted
      downVoted
      createdAt
      archivedAt
      is_disabled_by_admin
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      hasPostCreatorRequestedForDeactivation
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
      user {
        ...userFields
      }
      poll {
        ...pollFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      question {
        ...questionFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      quiz {
        ...quizFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
    }
    campfirePostShare {
      id
      message
      createdAt
      is_disabled_by_admin
      campfire {
        title
        id
        picture
        createdAt
        category {
          title
        }
        noParticipants
        noPosts: campfire_threads_aggregate {
          aggregate {
            count
          }
        }
        createdAt
        isRequested
        isMember
      }
      user {
        ...userFields
      }
      poll {
        ...pollFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      question {
        ...questionFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      quiz {
        ...quizFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
    }
  }
`;

const CAMPFIRE_POST_SHARE_FRAGMENT = gql`
  fragment campfirePostShareFields on campfire_thread_shares {
    is_disabled_by_admin
    question {
      ...questionFields
      isBlocked
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
      isBlocked
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
    poll {
      ...pollFields
      isBlocked
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
    comments(where: { parentId: { _is_null: true } }) {
      ...commentFields
    }
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    campfireId
    campfireThreadId
    id
    likes
    message
    noComments
    noParticipants
    isBookmarked
    createdAt
    user {
      ...userFields
    }
      sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const RELATED_THREAD_FIELDS_FRAGMENT = gql`
  fragment relatedThreadFields on related_threads {
    id
    createdAt
    type
    poll {
      ...pollFields
       post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    question {
      ...questionFields
       post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    quiz {
      ...quizFields
       post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
    }
    postShare {
      id
      isArchived
      noComments
      noDownValues
      noParticipants
      noUpValues
      likes
      noViews
      type
      isBookmarked
      categoryName
      isHidden
      is_disabled_by_admin
      pollId
      questionId
      quizId
      title
      userId
      upVoted
      downVoted
      createdAt
      archivedAt
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      hasPostCreatorRequestedForDeactivation
      comments(
        where: { parentId: { _is_null: true } }
        limit: 4
        order_by: {
          by_author: desc
          ispinned: desc
          pinned_at: desc_nulls_last
          createdAt: desc
        }
      ) {
        ...commentFields
      }
      user {
        ...userFields
      }
      campfire_thread_share {
        ...campfirePostShareFields
      }
      poll {
        ...pollFields
         post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      question {
        ...questionFields
         post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      quiz {
        ...quizFields
         post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
    }
    campfirePostShare {
      id
      likes
      noComments
      noParticipants
      message
      createdAt
      campfire {
        title
        id
        picture
        createdAt
        category {
          title
        }
        noParticipants
        noPosts: campfire_threads_aggregate {
          aggregate {
            count
          }
        }
        createdAt
        isRequested
        isMember
        is_public
      }
      user {
        ...userFields
      }
      poll {
        ...pollFields
      }
      question {
        ...questionFields
        comments(
          where: { parentId: { _is_null: true } }
          limit: 4
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFields
        }
      }
      quiz {
        ...quizFields
      }
    }
  }
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
`;

const ANNOUNCEMENT_FIELDS_FRAGMENT = gql`
  fragment announcementFields on announcements {
    id
    title
    description
    noComments: no_of_comments
    noParticipants: no_of_participants
    likes
    isMember
    isExpired
    campfire_id
    user {
      ...userFields
    }
    createdAt: created_at
    campfire {
      ...campfireFields
    }
    comments(
      where: { parentId: { _is_null: true } }
      order_by: {
        by_author: desc
        ispinned: desc
        pinned_at: desc_nulls_last
        createdAt: desc
      }
    ) {
      ...commentFields
    }
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
`;
const USER_FIELDS_FOR_GUEST_FRAGMENT = gql`
  fragment userFieldsGuest on users {
    id
    profilePicture
    is_disabled_by_admin
  }
`;

const QUESTION_FIELDS_FOR_GUEST_FRAGMENT = gql`
  fragment questionFieldsGuest on questions {
    id
    title
    description
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    createdAt
    type
    categoryName
    post_categories {
      category {
        id
        title
        is_enabled
      }
    }
    upVoted
    downVoted
    likes
    isBookmarked
    isHidden
    isArchived
    isEdited
    isCampfire
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    user {
      ...userFieldsGuest
    }
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const POLL_FIELD_FOR_GUEST_FRAGMENT = gql`
  fragment pollFieldsGuest on polls {
    id
    title
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    isAnalytics
    createdAt
    type
    categoryName
    upVoted
    likes
    downVoted
    isBookmarked
    isHidden
    isArchived
    isCampfire
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    poll_options(order_by: { createdAt: asc }) {
      id
      title
      analyticsCount
      isSelected
    }
    user {
      ...userFieldsGuest
    }
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const QUIZ_FIELDS_FOR_GUEST_FRAGMENT = gql`
  fragment quizFieldsGuest on quiz {
    id
    title
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    isAnalytics
    createdAt
    type
    categoryName
    upVoted
    downVoted
    likes
    isBookmarked
    isHidden
    isArchived
    isCampfire
    is_disabled_by_admin
    hasPostCreatorRequestedForDeactivation
    quiz_options(order_by: { createdAt: asc }) {
      id
      title
      isSelected
      isAnswer: getAnswer
      analyticsCount
    }
    user {
      ...userFieldsGuest
    }
    sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const COMMENT_FIELDS_NO_REPLIES_FOR_GUEST_FRAGMENT = gql`
  fragment commentFieldsWithNoRepliesGuest on comments {
    id
    message
    noDownValues
    noUpValues
    createdAt
    upVoted
    downVoted
    noParticipants
    isBookmarked
    isEdited
    ispinned
    isHidden
    questionId
    quizId
    pollId
    likes
    is_deleted_by_admin_of_campfire
    is_disabled_by_admin
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    postShareId
    campfireShareId
    parentId
    parent {
      id
      message
      pollId
      quizId
      questionId
      postShareId
      campfireShareId
      campfire_post_share_id
      parentId
      parent {
        id
        message
        pollId
        quizId
        questionId
        postShareId
        campfireShareId
        campfire_post_share_id
        parentId
        is_disabled_by_admin
        user {
          ...userFieldsGuest
        }
      }
      is_disabled_by_admin
      user {
        ...userFieldsGuest
      }
    }
    comment {
      user {
        name
      }
    }
    replies: comments(
      order_by: {
        by_author: desc
        ispinned: desc
        pinned_at: desc_nulls_last
        createdAt: desc
      }
    ) {
      id
      message
      noDownValues
      noUpValues
      upVoted
      downVoted
      isEdited
      isHidden
      createdAt
      questionId
      quizId
      pollId
      postShareId
      parentId
      likes
      is_disabled_by_admin
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
        }
      }
      comment {
        user {
          name
        }
      }
      user {
        ...userFieldsGuest
      }
      repliesToReplies: comments(order_by: { createdAt: desc }) {
        id
        message
        isEdited
        isHidden
        createdAt
        parentId
        likes
        is_disabled_by_admin
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        comment {
          user {
            name
          }
        }
        user {
          ...userFieldsGuest
        }
      }
    }
    repliesCount: childs_aggregate {
      aggregate {
        count
      }
    }
    user {
      ...userFieldsGuest
    }
  }
`;

const FEED_POST_SHARE_FIELDS_FOR_GUEST_FRAGMENT = gql`
  fragment postShareFieldsGuest on post_shares {
    id
    isArchived
    noComments
    noDownValues
    noParticipants
    noUpValues
    noViews
    type
    isBookmarked
    categoryName
    isHidden
    title
    userId
    upVoted
    downVoted
    likes
    createdAt
    is_disabled_by_admin
    campfire_thread_share {
      ...campfirePostShareFieldsWithoutComments
    }
    question {
      ...questionFieldsGuest
      isBlocked
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
    poll {
      ...pollFieldsGuest
      isBlocked
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
      ...quizFieldsGuest
      isBlocked
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
    user {
      ...userFieldsGuest
    }
    
  }
`;

const CAMPFIRE_POST_SHARE_WITHOUT_COMMENTS_FRAGMENT = gql`
  fragment campfirePostShareFieldsWithoutComments on campfire_thread_shares {
    is_disabled_by_admin
    question {
      ...questionFieldsGuest
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
      ...quizFieldsGuest
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
    poll {
      ...pollFieldsGuest
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
    post_reactions {
      id
      user_id
      kofukon {
        id
        name
      }
    }
    campfireId
    campfireThreadId
    id
    likes
    message
    noComments
    noParticipants
    isBookmarked
    createdAt
    user {
      ...userFieldsGuest
    }
    
      sharesCount: post_shares_aggregate {
      aggregate {
        count
      }
    }
  }
`;
export {
  ANNOUNCEMENT_FIELDS_FRAGMENT,
  CAMPFIRE_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_POST_SHARE_WITHOUT_COMMENTS_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FOR_GUEST_FRAGMENT,
  FEED_COMMENTS_AND_REPLIES_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FOR_GUEST_FRAGMENT,
  POLL_FIELD_FOR_GUEST_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FOR_GUEST_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FOR_GUEST_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  RELATED_THREAD_FIELDS_FRAGMENT,
  USER_FIELDS_FOR_GUEST_FRAGMENT,
  USER_FIELDS_FRAGMENT,
};
