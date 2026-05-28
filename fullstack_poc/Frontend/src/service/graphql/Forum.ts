import { gql } from '@apollo/client';

import {
  CAMPFIRE_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_POST_SHARE_WITHOUT_COMMENTS_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FOR_GUEST_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FOR_GUEST_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  POLL_FIELD_FOR_GUEST_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FOR_GUEST_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FOR_GUEST_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FOR_GUEST_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

export const QUERY_UNAUTHENTICATED_POST_BY_ID = gql`
  ${USER_FIELDS_FOR_GUEST_FRAGMENT}
  ${QUESTION_FIELDS_FOR_GUEST_FRAGMENT}
  ${POLL_FIELD_FOR_GUEST_FRAGMENT}
  ${QUIZ_FIELDS_FOR_GUEST_FRAGMENT}
  ${COMMENT_FIELDS_NO_REPLIES_FOR_GUEST_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FOR_GUEST_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_WITHOUT_COMMENTS_FRAGMENT}
  query getUnauthenticatedPostByID(
    $id: uuid!
    $commentLimit: Int = 100
    $commentOffset: Int = 0
  ) {
    threads(
      where: {
        id: { _eq: $id }
        _or: [
          { campfirePostShare: {} }
          { question: {} }
          { poll: {} }
          { quiz: {} }
          { postShare: {} }
        ]
      }
    ) {
      id
      type
      campfirePostShare {
        ...campfirePostShareFieldsWithoutComments
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
        comments(
          where: { parentId: { _is_null: true } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesGuest
          comments {
            ...commentFieldsWithNoRepliesGuest
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
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
        comments(
          where: { parentId: { _is_null: true } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesGuest
          comments {
            ...commentFieldsWithNoRepliesGuest
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
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
        comments(
          where: { parentId: { _is_null: true } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesGuest
          comments {
            ...commentFieldsWithNoRepliesGuest
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
      postShare {
        ...postShareFieldsGuest
        comments(
          where: { parentId: { _is_null: true } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesGuest
          comments {
            ...commentFieldsWithNoRepliesGuest
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
    }
  }
`;

export const QUERY_POST_BY_ID_WITHOUT_COMMENTS = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_NO_REPLIES_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_WITHOUT_COMMENTS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  query getPostByIDWithoutComments($id: uuid!) {
    threads(where: { id: { _eq: $id } }) {
      id
      type
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
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
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
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
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
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
      postShare {
        ...postShareFields
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
      }
    }
  }
`;
export const QUERY_POST_BY_ID = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_NO_REPLIES_FOR_AUTHENTICATED_USERS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  query getPostByID(
    $id: uuid!
    $commentLimit: Int = 100
    $commentOffset: Int = 0
  ) {
    threads(where: { id: { _eq: $id } }) {
      id
      isBlocked
      isArchived
      userId
      type
      campfirePostShare {
        is_disabled_by_admin
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
        comments(
          where: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
        ) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where: { isBlocked: { _eq: false } }) {
            ...commentFieldsWithNoRepliesForAuthenticatedUser
          }
        }
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
          user {
          ...userFields
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
        comments(
          where: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where: { isBlocked: { _eq: false } }) {
            ...commentFieldsWithNoRepliesForAuthenticatedUser
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
            user {
          ...userFields
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
        comments(
          where: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where: { isBlocked: { _eq: false } }) {
            ...commentFieldsWithNoRepliesForAuthenticatedUser
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
            user {
          ...userFields
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
        comments(
          where: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where: { isBlocked: { _eq: false } }) {
            ...commentFieldsWithNoRepliesForAuthenticatedUser
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
            user {
          ...userFields
        }
        }
      }
      postShare {
        ...postShareFields
        comments(
          where: { parentId: { _is_null: true }, isBlocked: { _eq: false } }
          limit: $commentLimit
          offset: $commentOffset
          order_by: {
            by_author: desc
            ispinned: desc
            pinned_at: desc_nulls_last
            createdAt: desc
          }
        ) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where: { isBlocked: { _eq: false } }) {
            ...commentFieldsWithNoRepliesForAuthenticatedUser
          }
        }
        likes
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
            user {
          ...userFields
        }
        }
      }
    }
  }
`;

//#region  //*=========== Create Post Mutations ===========

export const QUERY_GET_SIMILAR_QUESTION = gql`
  query GetSimilarQuestion($title: String!) {
    questions(where: { title: { _iregex: $title } }, limit: 3) {
      id
      title
    }
  }
`;

export const QUERY_GET_TOP_QUESTION_BY_PARTICIPANTS = gql`
  query GetTopQuestionByParticipants {
    questions(
      order_by: { noParticipants: desc }
      limit: 1
      where: { isHidden: { _eq: false }, isArchived: { _eq: false }, is_disabled_by_admin: { _eq: false } }
    ) {
      id
      title
      noParticipants
      type
    }
  }
`;

export const QUERY_GET_TOP_QUESTIONS_BY_CATEGORY = gql`
  query GetTopQuestionsByCategory($categorySlug: String!) {
    questions(
      order_by: { noParticipants: desc }
      limit: 2
      where: { 
        isHidden: { _eq: false }, 
        isArchived: { _eq: false }, 
        is_disabled_by_admin: { _eq: false },
        post_categories: { category: { slug: { _eq: $categorySlug } } }
      }
    ) {
      id
      title
      noParticipants
      type
    }
  }
`;


export const MUTATION_ADD_QUESTION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  mutation AddQuestion(
    $title: String!
    $description: String
    $categoryId: uuid!
    $media_link: String
  ) {
    insert_questions_one(
      object: {
        title: $title
        description: $description
        media_link: $media_link
        post_categories: { data: { categoryId: $categoryId } }
      }
    ) {
      ...questionFields
    }
  }
`;

export const MUTATION_ADD_QUIZ = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  mutation AddQuiz(
    $title: String!
    $categoryId: uuid!
    $quizOptions: [quiz_options_insert_input!]!
  ) {
    insert_quiz_one(
      object: {
        title: $title
        quiz_options: { data: $quizOptions }
        post_categories: { data: { categoryId: $categoryId } }
      }
    ) {
      ...quizFields
    }
  }
`;

export const MUTATION_ADD_POLL = gql`
  ${USER_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  mutation AddPoll(
    $categoryId: uuid!
    $title: String!
    $pollOptions: [poll_options_insert_input!]!
  ) {
    insert_polls_one(
      object: {
        title: $title
        poll_options: { data: $pollOptions }
        post_categories: { data: { categoryId: $categoryId } }
      }
    ) {
      ...pollFields
    }
  }
`;

export const MUTATION_SHARE_POST = gql`
  ${USER_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  mutation MyMutation(
    $pollId: uuid
    $questionId: uuid
    $quizId: uuid
    $title: String
    $categoryId: uuid
    $campfire_post_share_id: uuid
  ) {
    insert_post_shares_one(
      object: {
        pollId: $pollId
        questionId: $questionId
        quizId: $quizId
        campfire_post_share_id: $campfire_post_share_id
        title: $title
        post_categories: { data: { categoryId: $categoryId } }
      }
    ) {
      ...postShareFields
    }
  }
`;

//#endregion  //*======== Create Post Mutations ===========

//#region  //*=========== Post action Mutations ===========

//#region  //*=========== Vote Mutations ===========

export const VOTE_QUESTION_MUTATION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  mutation VoteQuestion(
    $userId: uuid!
    $questionId: uuid!
    $isUpvoted: Boolean!
  ) {
    insert_user_actions_one(
      object: {
        questionId: $questionId
        userId: $userId
        isUpvoted: $isUpvoted
      }
      on_conflict: {
        constraint: user_actions_userId_questionId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      question {
        ...questionFields
      }
    }
  }
`;

export const VOTE_POLL_MUTATION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  mutation VotePoll($userId: uuid!, $pollId: uuid!, $isUpvoted: Boolean!) {
    insert_user_actions_one(
      object: { pollId: $pollId, userId: $userId, isUpvoted: $isUpvoted }
      on_conflict: {
        constraint: user_actions_userId_pollId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      poll {
        ...pollFields
      }
    }
  }
`;

export const VOTE_QUIZ_MUTATION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  mutation VoteQuiz($userId: uuid!, $quizId: uuid!, $isUpvoted: Boolean!) {
    insert_user_actions_one(
      object: { quizId: $quizId, userId: $userId, isUpvoted: $isUpvoted }
      on_conflict: {
        constraint: user_actions_userId_quizId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      quiz {
        ...quizFields
      }
    }
  }
`;

export const VOTE_COMMENT_MUTATION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  mutation VoteComment(
    $userId: uuid!
    $commentId: uuid!
    $isUpvoted: Boolean!
  ) {
    insert_user_actions_one(
      object: { commentId: $commentId, userId: $userId, isUpvoted: $isUpvoted }
      on_conflict: {
        constraint: user_actions_userId_commentId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      comment {
        ...commentFields
      }
    }
  }
`;

export const VOTE_FEED_POST_SHARE_MUTATION = gql`
  ${USER_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  mutation VotePostShare($postShareId: uuid!, $isUpvoted: Boolean!) {
    insert_user_actions_one(
      object: { postShareId: $postShareId, isUpvoted: $isUpvoted }
      on_conflict: {
        constraint: user_actions_postShareId_userId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      postShare: post_share {
        ...postShareFields
      }
    }
  }
`;

export const REMOVE_VOTE_MUTATION = gql`
  mutation RemoveVote(
    $userId: uuid!
    $questionId: uuid = "00000000-0000-0000-0000-000000000000"
    $pollId: uuid = "00000000-0000-0000-0000-000000000000"
    $quizId: uuid = "00000000-0000-0000-0000-000000000000"
    $commentId: uuid = "00000000-0000-0000-0000-000000000000"
    $campfireShareId: uuid = "00000000-0000-0000-0000-000000000000"
    $postShareId: uuid = "00000000-0000-0000-0000-000000000000"
  ) {
    delete_user_actions(
      where: {
        _or: [
          { questionId: { _eq: $questionId } }
          { pollId: { _eq: $pollId } }
          { quizId: { _eq: $quizId } }
          { commentId: { _eq: $commentId } }
          { campfireShareId: { _eq: $campfireShareId } }
          { postShareId: { _eq: $postShareId } }
        ]
        userId: { _eq: $userId }
      }
    ) {
      affected_rows
    }
  }
`;

//#endregion  //*======== Vote Mutations ===========

export const BOOKMARK_POST_MUTATION = gql`
  mutation BookmarkPost(
    $userId: uuid!
    $questionId: uuid
    $pollId: uuid
    $quizId: uuid
    $commentId: uuid
    $postShareId: uuid
  ) {
    insert_bookmarks_one(
      object: {
        userId: $userId
        questionId: $questionId
        pollId: $pollId
        quizId: $quizId
        commentId: $commentId
        postShareId: $postShareId
      }
    ) {
      id
    }
  }
`;

export const UNBOOKMARK_POST_MUTATION = gql`
  mutation RemoveBookmark($id: uuid!) {
    update_bookmarks_by_pk(
      pk_columns: { id: $id }
      _set: { deletedAt: "now()" }
    ) {
      id
    }
  }
`;

//#endregion  //*======== Post action Mutations ===========

//#region  //*=========== Delete Mutations ===========

export const DELETE_QUESTION_MUTATION = gql`
  mutation DeleteQuestion($id: uuid!) {
    update_questions_by_pk(
      pk_columns: { id: $id }
      _set: { deletedAt: "now()" }
    ) {
      id
    }
  }
`;

export const DELETE_POLL_MUTATION = gql`
  mutation DeltePoll($pollId: uuid!) {
    update_poll_options_many(
      updates: {
        where: { pollId: { _eq: $pollId } }
        _set: { deletedAt: "now()" }
      }
    ) {
      affected_rows
    }
    update_polls_by_pk(
      pk_columns: { id: $pollId }
      _set: { deletedAt: "now()" }
    ) {
      id
    }
  }
`;

export const DELETE_QUIZ_MUTATION = gql`
  mutation DeleteQuiz($quizId: uuid!) {
    update_quiz_options_many(
      updates: {
        where: { quizId: { _eq: $quizId } }
        _set: { deletedAt: "now()" }
      }
    ) {
      affected_rows
    }
    update_quiz_by_pk(
      pk_columns: { id: $quizId }
      _set: { deletedAt: "now()" }
    ) {
      id
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($commentId: uuid, $isDeletedByAdmin: Boolean) {
    update_comments(
      where: { id: { _eq: $commentId } }
      _set: {
        deletedAt: "now()"
        is_deleted_by_admin_of_campfire: $isDeletedByAdmin
      }
    ) {
      returning {
        id
        isArchived
      }
    }
  }
`;

export const DELETE_POST_SHARE_MUTATION = gql`
  mutation DeletePostShare($id: uuid!) {
    update_post_shares_by_pk(
      pk_columns: { id: $id }
      _set: { deletedAt: "now()" }
    ) {
      id
    }
  }
`;
//#endregion  //*======== Delete Mutations ===========

//#region  //*=========== Edit Mutations ===========

export const EDIT_QUESTION_MUTATION_OLD = gql`
  mutation EditQuestion($id: uuid!, $title: String, $description: String) {
    update_questions_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title, description: $description }
    ) {
      ...questionFields
    }
  }
  ${QUESTION_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

export const EDIT_QUESTION_MUTATION = gql`
  mutation editQuestionAndCategory(
    $id: String!
    $description: String!
    $categoryId: String!
  ) {
    editQuestionAndCategory(
      id: $id
      description: $description
      categoryId: $categoryId
    ) {
      message
      success
    }
  }
  ${QUESTION_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

export const EDIT_COMMENT_MUTATION = gql`
  mutation EditComment($commentId: uuid!, $message: String!) {
    update_comments_by_pk(
      pk_columns: { id: $commentId }
      _set: { message: $message }
    ) {
      ...commentFields
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

export const UPDATE_POST_SHARE_TITLE_MUTATION = gql`
  mutation UpdateTitleOfPostShare($id: uuid!, $title: String) {
    update_post_shares_by_pk(pk_columns: { id: $id }, _set: { title: $title }) {
      id
    }
  }
`;
//#endregion  //*======== Edit Mutations ===========

//#region  //*=========== Archive/Unarchive Mutations ===========
export const ARCHIVE_QUESTION_MUTATION = gql`
  mutation ArchiveQuestion($id: uuid!, $isArchived: Boolean!) {
    update_questions_by_pk(
      pk_columns: { id: $id }
      _set: { isArchived: $isArchived }
    ) {
      id
    }
  }
`;
export const ARCHIVE_POLL_MUTATION = gql`
  mutation ArchivePoll($pollId: uuid!, $isArchived: Boolean!) {
    update_polls_by_pk(
      pk_columns: { id: $pollId }
      _set: { isArchived: $isArchived }
    ) {
      id
    }
  }
`;
export const ARCHIVE_QUIZ_MUTATION = gql`
  mutation ArchiveQuiz($quizId: uuid!, $isArchived: Boolean!) {
    update_quiz_by_pk(
      pk_columns: { id: $quizId }
      _set: { isArchived: $isArchived }
    ) {
      id
    }
  }
`;

export const ARCHIVE_POST_SHARE_MUTATION = gql`
  mutation ArchivePostShare($id: uuid!, $isArchived: Boolean!) {
    update_post_shares_by_pk(
      pk_columns: { id: $id }
      _set: { isArchived: $isArchived, archivedAt: "now()" }
    ) {
      id
    }
  }
`;

//#endregion  //*======== Archive/Unarchive Mutations ===========

//search

export const SEARCH_POST_MUTATION = gql`
  mutation getSearchbarDetails($text: String!) {
    search(text: $text) {
      data
      message
      success
    }
  }
`;

export const FETCH_QUESTION_PARTICIPANTS = gql`
  query fetchQuestionParticipants($id: uuid!) {
    questions_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_POLL_PARTICIPANTS = gql`
  query fetchPollParticipants($id: uuid!) {
    polls_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_QUIZ_PARTICIPANTS = gql`
  query fetchQuizParticipants($id: uuid!) {
    quiz_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_CAMPFIRESHARE_PARTICIPANTS = gql`
  query fetchCampfireShareParticipants($id: uuid!) {
    campfire_shares_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_POSTSHARE_PARTICIPANTS = gql`
  query fetchPostShareParticipants($id: uuid!) {
    post_shares_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_COMMENT_PARTICIPANTS = gql`
  query fetchCommentParticipants($id: uuid!) {
    comments_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const FETCH_ANNOUNCEMENT_PARTICIPANTS = gql`
  query fetchAnnouncementParticipants($id: uuid!) {
    announcements_by_pk(id: $id) {
      noParticipants: no_of_participants
    }
  }
`;

export const FETCH_CAMPFIRE_POST_SHARE_PARTICIPANTS = gql`
  query fetchCampfirePostShareParticipants($id: uuid!) {
    campfire_thread_shares_by_pk(id: $id) {
      noParticipants
    }
  }
`;

export const QUERY_GET_EDITED_HISTORY = gql`
  query getEditedHistory($id: uuid!) {
    questions_by_pk(id: $id) {
      id
      editPost
    }
  }
`;

export const SEARCH_QUERY_TEXT = gql`
  mutation searchQueryText(
    $searchQuery: String!
    $searchCategory: String!
    $limit: Int!
    $offset: Int!
  ) {
    paginatedSearch(
      searchQuery: $searchQuery
      searchCategory: $searchCategory
      limit: $limit
      offset: $offset
    ) {
      data
      message
      success
    }
  }
`;

export const SEARCH_QUERY_HASHTAG = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  query getPostsWithSameHashtags($text: String!) {
    post_hashtag(
      where: { hashtag: { hashtag_name: { _eq: $text } } }
      distinct_on: [
        hashtagid
        questionid
        quizid
        pollid
        postshareid
        campfire_post_share_id
        announcement_id
        comment_id
        campfireshareid
      ]
    ) {
      id
      comment {
        id
        ...commentFields
      }
      question {
        id
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
        id
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
      poll {
        id
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
      campfire_share {
        id
        ...campfireShareFields
      }
      post_share {
        id
        ...postShareFields
      }
    }
    post_hashtag_aggregate(
      where: { hashtag: { hashtag_name: { _eq: $text } } }
      distinct_on: [
        hashtagid
        questionid
        quizid
        pollid
        postshareid
        campfire_post_share_id
        announcement_id
        comment_id
        campfireshareid
      ]
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_SEARCHED_TAG = gql`
  query getSearchedTag($userName: String!, $loggedInUserId: uuid!) {
    users(
      where: {
        name: { _ilike: $userName }
        id: { _neq: $loggedInUserId }
        role: { _eq: "user" }
        isBlocked: { _eq: false }
      }
      limit: 10
    ) {
      id
      name
      profilePicture
      is_disabled_by_admin
    }
  }
`;

export const CREATE_HASHTAG = gql`
  mutation createHashtags(
    $postId: uuid!
    $postType: String!
    $hashtags: [String!]!
    $commentId: uuid
  ) {
    createHashtags(
      postId: $postId
      postType: $postType
      hashtags: $hashtags
      commentId: $commentId
    ) {
      success
      message
    }
  }
`;

export const GET_DISABLED_HASHTAGS = gql`
  query disabledHashtags {
    hashtags(
      where: { is_disabled: { _eq: true } }
      order_by: { hashtag_name: asc }
    ) {
      id
      hashtag_name
      created_at
    }
  }
`;

export const SEARCH_HASHTAG = gql`
  query searchHashtags($searchString: String! = "%%") {
    hashtags(
      where: {
        hashtag_name: { _ilike: $searchString }
        is_disabled: { _eq: false }
      }
      order_by: { hashtag_name: asc }
    ) {
      id
      hashtag_name
      created_at
      number_of_posts
    }
  }
`;

export function DELETE_POST_HASHTAG(postType: string) {
  let id;
  if (postType == 'quiz') {
    id = 'quizid';
  }
  if (postType == 'question') {
    id = 'questionid';
  }
  if (postType == 'poll') {
    id = 'pollid';
  }
  if (postType == 'post_share') {
    id = 'postshareid';
  }
  if (postType == 'campfireShare') {
    id = 'campfireshareid';
  }
  return gql`mutation deleteHashtag($postId: uuid!, $hashtagNames: [String!]!) {
  delete_post_hashtag(where: {${id}: {_eq: $postId}, hashtag: {hashtag_name: {_in: $hashtagNames}}}) {
    returning {
      id
    }
  }
}`;
}

export const GET_POPULAR_HASHTAGS = gql`
  query popularHashtags($campfireId: uuid!, $search: String = "%%") {
    campfire_hashtag_counts(
      where: {
        usage_count: { _gt: "0" }
        campfireid: { _eq: $campfireId }
        hashtag_name: { _ilike: $search }
      }
      order_by: { usage_count: desc_nulls_last }
    ) {
      hashtag_name
      id: hashtagid
    }
  }
`;

export const GET_SEARCH_HISTORY = gql`
  query getSearchHistory($userId: uuid!) {
    search_history(
      limit: 6
      order_by: { updatedAt: desc }
      where: { userId: { _eq: $userId } }
    ) {
      text
    }
  }
`;

export const DELETE_SEARCH_ITEM = gql`
  mutation DeleteSearchItem($text: String!, $userId: uuid!) {
    delete_search_history(
      where: { text: { _eq: $text }, userId: { _eq: $userId } }
    ) {
      affected_rows
    }
  }
`;

export const CLEAR_ALL_SEARCH = gql`
  mutation ClearAllSearchIteams($userId: uuid!) {
    delete_search_history(where: { userId: { _eq: $userId } }) {
      affected_rows
    }
  }
`;

export const FEED_ANNOUNCEMENTS_QUERY = gql`
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  query fetchForumFeedAnnouncements {
    announcements(
      where: {
        _or: [
          { scheduled_at: { _is_null: false, _lte: "now()" } }
          {
            created_at: { _is_null: false }
            scheduled_at: { _is_null: true }
            _or: [
              { isMember: { _eq: true } }
              { campfire_id: { _is_null: true } }
            ]
          }
        ]
        isExpired: { _eq: false }
        isBlocked: { _eq: false }
      }
      order_by: { scheduled_at: desc, created_at: desc }
    ) {
      id
      title
      isBlocked
      description
      noComments: no_of_comments
      noParticipants: no_of_participants
      likes
      isMember
      user {
        ...userFields
      }
      createdAt: created_at
      scheduled_at
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
  }
`;

export const CREATE_ANNOUNCEMENT = gql`
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  mutation createAnnouncementsForCampfire(
    $title: String!
    $description: String!
    $userId: uuid!
    $campfireId: uuid!
  ) {
    insert_announcements_one(
      object: {
        title: $title
        description: $description
        user_id: $userId
        campfire_id: $campfireId
      }
    ) {
      id
      title
      description
      noComments: no_of_comments
      noParticipants: no_of_participants
      likes
      isMember
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
  }
`;

export const FEED_ANNOUNCEMENTS_IN_CAMPFIRE_QUERY = gql`
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  query fetchCampfireFeedAnnouncements($campfireId: uuid!) {
    announcements(
      where: {
        campfire_id: { _eq: $campfireId }
        isExpired: { _eq: false }
        user: {
          campfire_users: {
            is_blocked: { _eq: false }
            campfireId: { _eq: $campfireId }
          }
        }
      }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      noComments: no_of_comments
      noParticipants: no_of_participants
      likes
      isMember
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
  }
`;

export const GET_ANNOUNCEMENT_BY_ID = gql`
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  query getAnnouncementById($id: uuid!) {
    announcements_by_pk(id: $id) {
      id
      title
      description
      noComments: no_of_comments
      noParticipants: no_of_participants
      likes
      isMember
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
  }
`;
