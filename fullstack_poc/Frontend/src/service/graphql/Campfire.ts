import { gql } from '@apollo/client';

import {
  CAMPFIRE_FIELDS_FRAGMENT,
  CAMPFIRE_POST_SHARE_FRAGMENT,
  CAMPFIRE_SHARE_FIELDS_FRAGMENT,
  COMMENT_FIELDS_FRAGMENT,
  COMMENT_FIELDS_NO_REPLIES_FRAGMENT,
  FEED_POST_SHARE_FIELDS_FRAGMENT,
  POLL_FIELD_FRAGMENT,
  QUESTION_FIELDS_FRAGMENT,
  QUIZ_FIELDS_FRAGMENT,
  USER_FIELDS_FRAGMENT,
} from '@/service/graphql/Fragments';

export const CREATE_CAMPFIRE_MUTATION = gql`
  mutation CreateCampfireMutation(
    $title: String!
    $description: String
    $categoryId: uuid!
    $is_public: Boolean!
    $avatarUrl: String
    $coverPicture: String
  ) {
    insert_campfires_one(
      object: {
        title: $title
        description: $description
        categoryId: $categoryId
        is_public: $is_public
        picture: $avatarUrl
        coverPicture: $coverPicture
      }
    ) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const GET_USERBY_NAME = gql`
  query get_campfire_invite_users($campfireId: uuid!, $name: String!) {
    get_campfire_invite_users(
      args: { p_campfire_id: $campfireId, p_search_text: $name }
    ) {
      id
      name
      profilepicture
    }
  }
`;

export const INVITE_CAMPFIRE_MUTATION = gql`
  mutation MyMutation($objs: [campfire_requests_insert_input!]!) {
    insert_campfire_requests(objects: $objs) {
      affected_rows
      returning {
        id
        userId
        status
        campfireId
        createdAt
      }
    }
  }
`;

export const SEARCH_CAMPFIRE_QUERY = gql`
  query SearchCampfireQuery($text: String!, $limit: Int = 30) {
    campfires(where: { title: { _ilike: $text } }, limit: $limit) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_FETCH_CAMPFIRE_DETAILS = gql`
  query campfireDetails($campfireName: String, $userId: uuid!) {
    campfires(where: { title: { _eq: $campfireName } }) {
      ...campfireFields
      campfire_users(where: { userId: { _eq: $userId } }) {
        is_blocked
      }
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_FETCH_RELATED_CAMPFIRE_DETAILS = gql`
  query relatedCampfireDetails($campfireName: String, $categoryId: uuid!) {
    campfires(
      where: {
        _not: { title: { _eq: $campfireName } }
        categoryId: { _eq: $categoryId }
      }
    ) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_MY_CAMPFIRES = gql`
  query myCampfires($userId: uuid!) {
    campfires: campfire_users(where: { userId: { _eq: $userId } }) {
      campfire {
        ...campfireFields
      }
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_JOINED_CAMPFIRES = gql`
  query getUserJoinedCampfires($userId: uuid!) {
    campfire_users(
      where: {
        userId: { _eq: $userId }
        deletedAt: { _is_null: true }
        is_blocked: { _eq: false }
        campfire: { userId: { _neq: $userId } }
      }
    ) {
      role
      mute
      campfire {
        ...campfireFields
      }
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_GUEST_CREATED_CAMPFIRES = gql`
  query getUserCreatedCampfires($userId: uuid!) {
    campfires(
      where: {
        campfire_users: {
          userId: { _eq: $userId }
          deletedAt: { _is_null: true }
        }
        deletedAt: { _is_null: true }
        userId: { _eq: $userId }
      }
    ) {
      ...campfireFields
      campfire_users(
        where: { deletedAt: { _is_null: true }, userId: { _eq: $userId } }
      ) {
        mute
      }
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const VALIDATE_CAMPFIRE_NAME = gql`
  query validateCampfirename($title: String) {
    campfireExists: campfires_aggregate(
      where: { title: { _ilike: $title } }
      limit: 1
    ) {
      aggregate {
        count
      }
    }
  }
`;
export const UPDATE_CAMPFIRE_DETAILS = gql`
  mutation updateCampfireDetails(
    $campfireId: uuid!
    $title: String
    $description: String
    $is_public: Boolean
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { title: $title, description: $description, is_public: $is_public }
    ) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const UPDATE_CAMPFIRE_PICTURE = gql`
  mutation updateCampfirePicture(
    $campfireId: uuid!
    $fileName: String!
    $fileType: String!
  ) {
    campfireProfileUpdate(
      campfireId: $campfireId
      fileName: $fileName
      fileType: $fileType
    ) {
      message
      success
      signedUrl
      documentUrl
    }
  }
`;

export const FAILED_UPDATE_CAMPFIRE_DISPLAY_PICTURE = gql`
  mutation failedPictureUpdate($campfireId: uuid!) {
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { picture: "null" }
    ) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const QUERY_GET_CAMPFIRE_MEMBER = gql`
  query getMembers($campfireId: uuid!, $search: String! = "%%") {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        is_blocked: { _eq: false }
        deletedAt: { _is_null: true }
        user: { name: { _ilike: $search } }
      }
    ) {
      id
      role
      createdAt
      user {
        id
        name
        profilePicture
        isFollowing
        isBlocked
      }
    }
  }
`;

export const NOTIFIICATION_ACTION_MUTATION = gql`
  mutation sendNotificationAction($notificationId: uuid!, $actionId: String!) {
    notificationAction(notificationId: $notificationId, actionId: $actionId) {
      message
      success
    }
  }
`;

export const MUTATION_JOIN_USER_CAMPFIRE = gql`
  mutation joinUserCampfire($campfireId: uuid!) {
    insert_campfire_requests_one(object: { campfireId: $campfireId }) {
      ...campfireFields
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;
export const MUTATION_CANCEL_JOIN_CAMPFIRE = gql`
  mutation cancelJoinRequest($campfireId: uuid!) {
    delete_campfire_requests(
      where: { campfireId: { _eq: $campfireId }, status: { _eq: "pending" } }
    ) {
      affected_rows
    }
  }
`;

export const ASSIGN_CAMPFIRE_ADMIN_MUTATION = gql`
  mutation assignAdmin(
    $assigneeId: uuid!
    $campfireId: uuid!
    $updatedBy: uuid
  ) {
    update_campfire_users(
      where: { userId: { _eq: $assigneeId }, campfireId: { _eq: $campfireId } }
      _set: { role: "admin", updated_by: $updatedBy }
    ) {
      affected_rows
      returning {
        id
        userId
        role
      }
    }
  }
`;

export const MUTATION_CAMPFIRE_ACTIVITIES = gql`
  mutation getCampfireActivities(
    $campfireId: uuid!
    $limit: Int = 2
    $offset: Int = 0
    $postId: uuid = "00000000-0000-0000-0000-000000000000"
    $search: String = "%%"
    $needPostOnTop: Boolean
  ) {
    getCampfireActivities(
      campfireId: $campfireId
      limit: $limit
      offset: $offset
      postId: $postId
      search: $search
      needPostOnTop: $needPostOnTop
    ) {
      activities: data
    }
  }
`;

export const MUTATION_ADD_QUESTION_CAMPFIRE = gql`
  mutation addCampfireQuestion(
    $title: String!
    $description: String
    $campfireId: uuid!
    $mediaLink: String
  ) {
    createCampfireQuestion(
      campfireId: $campfireId
      title: $title
      description: $description
      mediaLink: $mediaLink
    ) {
      message
      success
      data
    }
  }
`;

export const MUTATION_ADD_POLL_CAMPFIRE = gql`
  mutation addCampfirePoll(
    $title: String!
    $options: [PollOptionInput!]!
    $campfireId: uuid!
  ) {
    createCampfirePoll(
      campfireId: $campfireId
      options: $options
      title: $title
    ) {
      message
      success
      data
    }
  }
`;

export const MUTATION_ADD_QUIZ_CAMPFIRE = gql`
  mutation addCampfireQuiz(
    $title: String!
    $options: [QuizOptionInput!]!
    $campfireId: uuid!
  ) {
    createCampfireQuiz(
      campfireId: $campfireId
      options: $options
      title: $title
    ) {
      message
      success
      data
    }
  }
`;

export const SHARE_CAMPFIRE_MUTATION = gql`
  mutation ShareCampfire(
    $userId: uuid!
    $campfireId: uuid!
    $message: String!
  ) {
    insert_campfire_shares(
      objects: { userId: $userId, campfireId: $campfireId, message: $message }
    ) {
      affected_rows
    }
  }
`;

export const VOTE_CAMPFIRE_MUTATION = gql`
  mutation VoteCampfire($campfireShareId: uuid!, $isUpvoted: Boolean!) {
    insert_user_actions_one(
      object: { campfireShareId: $campfireShareId, isUpvoted: $isUpvoted }
      on_conflict: {
        constraint: user_actions_userId_campfireShareId_key
        update_columns: isUpvoted
      }
    ) {
      id
      isUpvoted
      createdAt
      campfireShare {
        ...campfireShareFields
      }
    }
  }
  ${USER_FIELDS_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
`;

export const QUERY_POST_BY_CAMPFIRE_ID = gql`
  query GetCampfireQuery(
    $id: uuid!
    $commentLimit: Int = 10
    $commentOffset: Int = 0
  ) {
    campfire_shares_by_pk(id: $id) {
      id
      message
      noUpValues
      noDownValues
      noComments
      noParticipants
      createdAt
      downVoted
      upVoted
      isBookmarked
      campfireData: campfire {
        title
        id
        picture
        createdAt
        isMember
        isRequested
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
      }
      comments(
        where: {
          parentId: { _is_null: true }
          campfireShareId: { _is_null: false }
        }
        limit: $commentLimit
        offset: $commentOffset
        order_by: { createdAt: desc }
      ) {
        ...commentFields
      }
      user {
        id
        name
        profilePicture
        isFollowing
      }
    }
  }
  ${COMMENT_FIELDS_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;

export const SHARE_POST_TO_FEED_MUTATION = gql`
  mutation sharePostToFeed($campfireThreadId: uuid!, $message: String!) {
    sharePostToFeed(campfireThreadId: $campfireThreadId, message: $message) {
      message
      success
    }
  }
`;

export const DELETE_SHARE_CAMPFIRE_SHARE_POST = gql`
  mutation deleteCampfirePostShare($id: uuid!) {
    delete_campfire_thread_shares_by_pk(id: $id) {
      id
    }
  }
`;

export const GET_SEARCHED_BLOG_VIDEOS = gql`
  query getSearchedVideoBlogs(
    $title: String
    $watch: Boolean = true
    $start: Int
    $limit: Int
  ) {
    blogs(
      filters: { Title: { containsi: $title }, and: { watch: { eq: $watch } } }
      pagination: { start: $start, limit: $limit }
    ) {
      data {
        id
        attributes {
          Title
          shortDes
          publish_date
          slug
          good_read
          recommended
          pick
          watch
          coverImg {
            data {
              id
              attributes {
                url
              }
            }
          }
          blog_categories {
            data {
              id
              attributes {
                title
                slug
              }
            }
          }

          views
          video {
            video {
              data {
                attributes {
                  url
                }
              }
            }
            coverImg {
              id
              image {
                data {
                  attributes {
                    url
                  }
                }
              }
              altText
            }
          }
          videoViews
          blog_authors {
            data {
              id
              attributes {
                name
                image {
                  data {
                    id
                    attributes {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_SEARCHED_BLOGS = gql`
  query getSearchedBlogs($title: String, $start: Int, $limit: Int) {
    sunriseBlogs(
      filters: { Title: { containsi: $title } }
      sort: "createdAt:desc"
      pagination: { start: $start, limit: $limit }
    ) {
      data {
        id
        attributes {
          Title
          shortDes
          publish_date
          slug
          good_read
          recommended
          pick
          watch
          coverImg {
            data {
              id
              attributes {
                url
              }
            }
          }
          blog_categories {
            data {
              id
              attributes {
                title
                slug
              }
            }
          }

          views
          video {
            video {
              data {
                attributes {
                  url
                }
              }
            }
            coverImg {
              id
              image {
                data {
                  attributes {
                    url
                  }
                }
              }
              altText
            }
          }
          videoViews
          blog_authors {
            data {
              id
              attributes {
                name
                image {
                  data {
                    id
                    attributes {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const PIN_UNPIN_CAMPFIRE_POST_MUTATION = gql`
  mutation PinUnpinCampfirePost(
    $thread_id: uuid!
    $is_pinned: Boolean!
    $pinned_at: timestamptz
    $pinned_by: uuid!
  ) {
    update_campfire_threads_by_pk(
      pk_columns: { id: $thread_id }
      _set: {
        is_pinned: $is_pinned
        pinned_at: $pinned_at
        pinned_by: $pinned_by
      }
    ) {
      id
      is_pinned
      pinned_at
    }
  }
`;

export const MUTE_UNMUTE_CAMPFIRE_MUTATION = gql`
  mutation muteOrUnmuteACampfire(
    $campfireId: uuid!
    $userId: uuid!
    $mute: Boolean!
    $mutedOn: date
    $mutedUpto: date
  ) {
    update_campfire_users(
      where: { campfireId: { _eq: $campfireId }, userId: { _eq: $userId } }
      _set: { mute: $mute, muted_on: $mutedOn, muted_upto: $mutedUpto }
    ) {
      affected_rows
    }
  }
`;

export const GET_MUTE_UNMUTE_STATUS = gql`
  query getMuteUnmuteStatus($campfireId: uuid!, $userId: uuid!) {
    campfire_users(
      where: { campfireId: { _eq: $campfireId }, userId: { _eq: $userId } }
    ) {
      mute
      muted_on
      muted_upto
    }
  }
`;

export const GET_POSTS_WITH_SAME_HASHTAG_IN_CAMPFIRE = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${CAMPFIRE_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_SHARE_FIELDS_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  query getPostsWithSameHashtagsInCampfire($text: String!, $campfireId: uuid!) {
    post_hashtag(
      where: {
        hashtag: { hashtag_name: { _eq: $text } }
        _or: [
          {
            question: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            quiz: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            poll: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            announcement: {
              isExpired: { _eq: false }
              campfire_id: { _eq: $campfireId }
            }
          }
          {
            comment: {
              _or: [
                {
                  question: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
                {
                  quiz: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
                {
                  poll: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
              ]
            }
          }
        ]
      }
      order_by: { createdat: desc }
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
      where: {
        hashtag: { hashtag_name: { _eq: $text } }
        _or: [
          {
            question: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            quiz: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            poll: {
              campfire_threads: {
                campfireId: { _eq: $campfireId }
                user: {
                  campfire_users: {
                    campfireId: { _eq: $campfireId }
                    deletedAt: { _is_null: true }
                    is_blocked: { _eq: false }
                  }
                }
              }
              deletedAt: { _is_null: true }
            }
          }
          {
            announcement: {
              isExpired: { _eq: false }
              campfire_id: { _eq: $campfireId }
            }
          }
          {
            comment: {
              _or: [
                {
                  question: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
                {
                  quiz: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
                {
                  poll: {
                    campfire_threads: {
                      campfireId: { _eq: $campfireId }
                      user: {
                        campfire_users: {
                          campfireId: { _eq: $campfireId }
                          deletedAt: { _is_null: true }
                          is_blocked: { _eq: false }
                        }
                      }
                    }
                    deletedAt: { _is_null: true }
                  }
                }
              ]
            }
          }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_LIVE_POSTS = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  query getAllLivePostsOfCampfire($id: uuid!) {
    campfires_by_pk(id: $id) {
      id
      isRequested
      is_public
      picture
      isMember
      category {
        title
      }
      userId
      user {
        ...userFields
        __typename
      }
      isAdmin
      is_public
      campfire_threads(
        where: {
          isArchived: { _eq: false }
          isHidden: { _eq: false }
          deletedAt: { _is_null: true }
          _or: [
            {
              question: {
                campfire_threads: {
                  campfireId: { _eq: $id }
                  user: {
                    campfire_users: {
                      campfireId: { _eq: $id }
                      deletedAt: { _is_null: true }
                      is_blocked: { _eq: false }
                    }
                  }
                }
                deletedAt: { _is_null: true }
                isArchived: { _eq: false }
              }
            }
            {
              quiz: {
                campfire_threads: {
                  campfireId: { _eq: $id }
                  user: {
                    campfire_users: {
                      campfireId: { _eq: $id }
                      deletedAt: { _is_null: true }
                      is_blocked: { _eq: false }
                    }
                  }
                }
                deletedAt: { _is_null: true }
                isArchived: { _eq: false }
              }
            }
            {
              poll: {
                campfire_threads: {
                  campfireId: { _eq: $id }
                  user: {
                    campfire_users: {
                      campfireId: { _eq: $id }
                      deletedAt: { _is_null: true }
                      is_blocked: { _eq: false }
                    }
                  }
                }
                deletedAt: { _is_null: true }
                isArchived: { _eq: false }
              }
            }
          ]
        }
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
              }
            }
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
              }
            }
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const GET_REPORTED_POSTS = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  ${FEED_POST_SHARE_FIELDS_FRAGMENT}
  ${CAMPFIRE_POST_SHARE_FRAGMENT}
  ${COMMENT_FIELDS_NO_REPLIES_FRAGMENT}
  ${COMMENT_FIELDS_FRAGMENT}
  query fetchReportedPostsOfCampfire($campfireid: uuid!) {
    reports(
      where: {
        _or: [
          {
            question: {
              isArchived: { _eq: false }
              campfire_threads: {
                deletedAt: { _is_null: true }
                campfireId: { _eq: $campfireid }
              }
            }
          }
          {
            quiz: {
              isArchived: { _eq: false }
              deletedAt: { _is_null: true }
              campfire_threads: { campfireId: { _eq: $campfireid } }
            }
          }
          {
            poll: {
              isArchived: { _eq: false }
              deletedAt: { _is_null: true }
              campfire_threads: { campfireId: { _eq: $campfireid } }
            }
          }
        ]
      }
      distinct_on: [campfireid, quizId, questionId, pollId, postShareId]
    ) {
      id
      report_type {
        id
        title
        description
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
        reports_aggregate(where: { campfireid: { _eq: $campfireid } }) {
          aggregate {
            count
          }
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
        reports_aggregate(where: { campfireid: { _eq: $campfireid } }) {
          aggregate {
            count
          }
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
        reports_aggregate(where: { campfireid: { _eq: $campfireid } }) {
          aggregate {
            count
          }
        }
      }
      post_share {
        ...postShareFields
        post_reactions {
          id
          user_id
          kofukon {
            id
            name
          }
        }
        reports_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

export const GET_DELETED_POSTS = gql`
  ${USER_FIELDS_FRAGMENT}
  ${QUESTION_FIELDS_FRAGMENT}
  ${POLL_FIELD_FRAGMENT}
  ${QUIZ_FIELDS_FRAGMENT}
  query fetchDeletedPostsOfCampfire($campfireId: uuid!) {
    campfire_threads(
      where: {
        campfireId: { _eq: $campfireId }
        deletedAt: { _is_null: false }
      }
    ) {
      id
      quizId
      pollId
      questionId
      type
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
      user {
        ...userFields
      }
      createdAt
      campfire {
        id
        categoryId
      }
    }
  }
`;

export const GET_BLOCKED_CAMPFIRE_USERS = gql`
  ${USER_FIELDS_FRAGMENT}
  query getBlockedCampfireUsers(
    $campfireId: uuid! = "91905a82-110b-4dc0-af1e-21cc44c811d9"
  ) {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        deletedAt: { _is_null: true }
        is_blocked: { _eq: true }
      }
      order_by: { blocked_at: desc }
    ) {
      id
      user {
        ...userFields
        npOfPosts: campfires(where: { id: { _eq: $campfireId } }) {
          campfire_threads_aggregate(where: { deletedAt: { _is_null: true } }) {
            aggregate {
              count
            }
          }
        }
        followers
        following
      }
    }
  }
`;

export const GET_REMOVED_CAMPFIRE_USERS = gql`
  ${USER_FIELDS_FRAGMENT}
  query getRemovedCampfireUsers(
    $campfireId: uuid! = "91905a82-110b-4dc0-af1e-21cc44c811d9"
  ) {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        deletedAt: { _is_null: false }
        is_blocked: { _eq: false }
      }
      order_by: { deletedAt: desc }
    ) {
      id
      user {
        ...userFields
        npOfPosts: campfires(where: { id: { _eq: $campfireId } }) {
          campfire_threads_aggregate(where: { deletedAt: { _is_null: true } }) {
            aggregate {
              count
            }
          }
        }
        followers
        following
      }
    }
  }
`;

export const GET_CAMPFIRE_MEMBERS = gql`
  ${USER_FIELDS_FRAGMENT}
  query getCampfireUsers(
    $campfireId: uuid! = "91905a82-110b-4dc0-af1e-21cc44c811d9"
  ) {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        deletedAt: { _is_null: true }
        is_blocked: { _eq: false }
        role: { _eq: "member" }
      }
      order_by: { user: { name: asc } }
    ) {
      id
      user {
        ...userFields
        npOfPosts: campfires(where: { id: { _eq: $campfireId } }) {
          campfire_threads_aggregate(where: { deletedAt: { _is_null: true } }) {
            aggregate {
              count
            }
          }
        }
        followers
        following
      }
    }
  }
`;

export const GET_CAMPFIRE_ADMINS = gql`
  ${USER_FIELDS_FRAGMENT}
  query getCampfireAdmins($campfireId: uuid!) {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        deletedAt: { _is_null: true }
        is_blocked: { _eq: false }
        role: { _eq: "admin" }
      }
      order_by: { user: { name: asc } }
    ) {
      id
      user {
        ...userFields
        npOfPosts: campfires(where: { id: { _eq: $campfireId } }) {
          campfire_threads_aggregate(where: { deletedAt: { _is_null: true } }) {
            aggregate {
              count
            }
          }
        }
        followers
        following
      }
    }
  }
`;

export const UNBLOCK_CAMPFIRE_USER = gql`
  mutation unblockAUserInCampfire(
    $campfireId: uuid!
    $userId: uuid!
    $updatedBy: uuid!
  ) {
    update_campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        userId: { _eq: $userId }
        deletedAt: { _is_null: true }
      }
      _set: {
        is_blocked: false
        blocked_by: null
        blocked_at: null
        updated_by: $updatedBy
      }
    ) {
      affected_rows
      __typename
    }
  }
`;

export const REMOVE_CAMPFIRE_USER = gql`
  mutation removeCampfireUser(
    $campfireId: uuid!
    $userId: uuid!
    $deletedBy: uuid!
  ) {
    update_campfire_users(
      where: { campfireId: { _eq: $campfireId }, userId: { _eq: $userId } }
      _set: { deletedAt: "now()", deleted_by: $deletedBy }
    ) {
      affected_rows
      returning {
        id
        userId
      }
    }
  }
`;
export const CHECK_IF_OTHER_ADMIN_IN_CAMPFIRE = gql`
  query checkIfOtherAdminExists($campfireId: uuid!, $userId: uuid!) {
    campfire_users(
      where: {
        campfireId: { _eq: $campfireId }
        role: { _eq: "admin" }
        userId: { _neq: $userId }
      }
    ) {
      id
    }
  }
`;
export const ASSIGN_ADMIN_AS_MEMBER = gql`
  mutation assignMember($userId: uuid!, $campfireId: uuid!, $updatedBy: uuid!) {
    update_campfire_users(
      where: {
        userId: { _eq: $userId }
        role: { _eq: "admin" }
        campfireId: { _eq: $campfireId }
      }
      _set: { role: "member", deletedAt: null, updated_by: $updatedBy }
    ) {
      affected_rows
      returning {
        id
        userId
        role
      }
    }
  }
`;

export const LEAVE_CAMPFIRE = gql`
  mutation leaveCampfire($campfireId: uuid!, $userId: uuid!) {
    leaveCampfire(campfireId: $campfireId, userId: $userId) {
      message
      success
    }
  }
`;

export const GET_CAMPFIRE_RULES = gql`
  query fetchCampfireRules($campfireId: uuid!) {
    campfire_rules(
      order_by: { index: asc }
      where: { campfire_id: { _eq: $campfireId } }
    ) {
      id
      index
      rule
      description
    }
  }
`;

export const ADD_CAMPFIRE_RULES = gql`
  mutation createCampfireRules(
    $index: Int!
    $rule: String!
    $campfire_id: uuid!
    $user_id: uuid!
    $description: String
  ) {
    insert_campfire_rules(
      objects: {
        index: $index
        rule: $rule
        campfire_id: $campfire_id
        user_id: $user_id
        description: $description
      }
    ) {
      returning {
        id
        index
        rule
        description
      }
    }
  }
`;

export const EDIT_CAMPFIRE_RULES = gql`
  mutation updateCampfireRule(
    $id: uuid!
    $rule: String!
    $description: String
  ) {
    update_campfire_rules_by_pk(
      pk_columns: { id: $id }
      _set: { rule: $rule, updated_at: "now()", description: $description }
    ) {
      id
      rule
      index
      description
    }
  }
`;

export const DELETE_CAMPFIRE_RULES = gql`
  mutation deleteCampfireRules($id: uuid!) {
    delete_campfire_rules(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const GET_REMOVAL_REASONS = gql`
  query fetchCampfireReasonsToRemove($campfireId: uuid!) {
    campfire_reasons_to_remove(
      order_by: { index: asc }
      where: { campfire_id: { _eq: $campfireId } }
    ) {
      id
      index
      reason
      description
    }
  }
`;

export const ADD_REMOVAL_REASON = gql`
  mutation createCampfireReasonsToRemove(
    $index: Int!
    $reason: String!
    $campfire_id: uuid!
    $user_id: uuid!
    $description: String
  ) {
    insert_campfire_reasons_to_remove(
      objects: {
        index: $index
        reason: $reason
        campfire_id: $campfire_id
        user_id: $user_id
        description: $description
      }
    ) {
      returning {
        id
        index
        reason
        description
      }
    }
  }
`;

export const EDIT_REMOVAL_REASON = gql`
  mutation updateCampfireReasonsToRemove(
    $id: uuid!
    $reason: String!
    $description: String
  ) {
    update_campfire_reasons_to_remove_by_pk(
      pk_columns: { id: $id }
      _set: { reason: $reason, description: $description }
    ) {
      id
      reason
      index
      description
    }
  }
`;

export const DELETE_REMOVAL_REASON = gql`
  mutation deleteCampfireReasonsToRemove($id: uuid!) {
    delete_campfire_reasons_to_remove(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const GET_PRIVACY_SECURITY = gql`
  query fetchPrivacyAndSecurityContentOfCampfire($campfire_id: uuid!) {
    campfires(where: { id: { _eq: $campfire_id } }) {
      exclude_content_by_blocked_user
      recommendation
    }
  }
`;

export const EXCLUDE_CONTENT_BY_BLOCKED_USER = gql`
  mutation toggleExcludeContentByBlockedUser(
    $id: uuid!
    $exclude_content_by_blocked_user: Boolean!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: {
        exclude_content_by_blocked_user: $exclude_content_by_blocked_user
      }
    ) {
      exclude_content_by_blocked_user
    }
  }
`;

export const DELETE_CAMPFIRE = gql`
  mutation deleteCampfire($campfireId: uuid!) {
    update_comments(
      where: {
        _or: [
          { quiz: { campfire_threads: { campfireId: { _eq: $campfireId } } } }
          {
            question: { campfire_threads: { campfireId: { _eq: $campfireId } } }
          }
          { poll: { campfire_threads: { campfireId: { _eq: $campfireId } } } }
          { announcement: { campfire_id: { _eq: $campfireId } } }
        ]
      }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    update_questions(
      where: { campfire_threads: { campfireId: { _eq: $campfireId } } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    update_quiz(
      where: { campfire_threads: { campfireId: { _eq: $campfireId } } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    update_polls(
      where: { campfire_threads: { campfireId: { _eq: $campfireId } } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    update_campfire_thread_shares(
      where: { campfireId: { _eq: $campfireId } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    delete_announcements(where: { campfire_id: { _eq: $campfireId } }) {
      affected_rows
    }
    update_campfire_threads(
      where: { campfireId: { _eq: $campfireId } }
      _set: { deletedAt: "now()" }
    ) {
      affected_rows
    }
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { deletedAt: "now()" }
    ) {
      id
      deletedAt
    }
  }
`;

export const UPDATE_RECOMMENDATIONS = gql`
  mutation updateRecommendations(
    $id: uuid!
    $recommendation: recommendation_types
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { recommendation: $recommendation }
    ) {
      exclude_content_by_blocked_user
    }
  }
`;

export const UPDATE_INDEX_OF_RULES = gql`
  mutation updateIndexRules(
    $campfire_id: uuid!
    $index: Int!
    $newIndex: Int!
  ) {
    update_campfire_rules(
      where: { campfire_id: { _eq: $campfire_id }, index: { _eq: $index } }
      _set: { index: $newIndex }
    ) {
      returning {
        id
        index
      }
    }
  }
`;

export const UPDATE_INDEX_OF_RULE_BY_ID = gql`
  mutation updateIndexOfRuleById($ruleId: uuid!, $newIndex: Int!) {
    update_campfire_rules(
      where: { id: { _eq: $ruleId } }
      _set: { index: $newIndex }
    ) {
      returning {
        id
        index
      }
    }
  }
`;

export const DELETE_AND_REARRANGE_RULES = gql`
  mutation delete_and_rearrange_rules(
    $campfireId: uuid!
    $index: Int!
    $ruleId: uuid!
  ) {
    delete_and_rearrange_rules(
      args: { p_campfire_id: $campfireId, p_index: $index, p_rule_id: $ruleId }
    ) {
      id
      index
      rule
    }
  }
`;

export const GET_USER_INTERESTS = gql`
  query fetchUserInterests($userId: uuid!) {
    user_interests(where: { userId: { _eq: $userId } }) {
      id
      userId
      categoryId
    }
  }
`;

export const JOIN_CAMPFIRE_QUERY = gql`
  query JoinCampfireQuery($categoryIds: [uuid!]) {
    campfires(
      where: {
        isMember: { _eq: false }
        _or: [
          { recommendation: { _eq: "all" } }
          {
            _and: [
              { recommendation: { _eq: "similar_category" } }
              { categoryId: { _in: $categoryIds } }
            ]
          }
        ]
      }
      limit: 10
      order_by: { createdAt: desc }
      offset: 0
    ) {
      ...campfireFields
      __typename
    }
  }
  ${CAMPFIRE_FIELDS_FRAGMENT}
`;

export const GET_LANGUAGES = gql`
  query fetchLanguages {
    languages {
      id
      language
    }
  }
`;

export const GET_CAMPFIRE_GENERAL_SETTINGS = gql`
  query fetchCampfireGeneralSettings($id: uuid!) {
    campfires_by_pk(id: $id) {
      id
      title
      description
      is_public
      campfire_settings {
        id
        send_welcome_message
        welcome_message
        language {
          id
          language
        }
        location
      }
    }
  }
`;

export const ADD_CAMPFIRE_GENERAL_SETTINGS = gql`
  mutation addCampfireGeneralSettings(
    $send_welcome_message: Boolean
    $welcome_message: String
    $language_id: uuid
    $location: String
    $campfire_id: uuid!
    $user_id: uuid!
  ) {
    insert_campfire_settings(
      objects: {
        send_welcome_message: $send_welcome_message
        welcome_message: $welcome_message
        language_id: $language_id
        location: $location
        campfire_id: $campfire_id
        user_id: $user_id
      }
    ) {
      returning {
        id
        language_id
        location
        send_welcome_message
        welcome_message
      }
    }
  }
`;

export const UPDATE_CAMPFIRE_GENERAL_SETTINGS = gql`
  mutation updateCampfireGeneralSettings(
    $id: uuid!
    $send_welcome_message: Boolean
    $welcome_message: String
    $language_id: uuid
    $location: String
  ) {
    update_campfire_settings_by_pk(
      pk_columns: { id: $id }
      _set: {
        send_welcome_message: $send_welcome_message
        welcome_message: $welcome_message
        language_id: $language_id
        location: $location
      }
    ) {
      id
      language_id
      location
      send_welcome_message
      welcome_message
    }
  }
`;

export const UPDATE_CAMPFIRE_DETAILS_SETTINGS = gql`
  mutation updateCampDetails(
    $id: uuid!
    $title: String!
    $description: String!
    $is_public: Boolean!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title, description: $description, is_public: $is_public }
    ) {
      id
      is_public
    }
  }
`;

export const GET_POSTS_COMMENTS = gql`
  query fetchCampfireSettingsPostsAndComments($campfireId: uuid!) {
    campfire_settings(where: { campfire_id: { _eq: $campfireId } }) {
      id
      show_posts_from_removed_users
      show_posts_from_left_users
      show_comments_from_removed_users
      show_comments_from_left_users
      collapse_deleted_and_removed_users_comments
    }
  }
`;

export const ADD_POSTS_COMMENTS = gql`
  mutation MyMutation(
    $show_comments_from_left_users: Boolean!
    $show_comments_from_removed_users: Boolean!
    $show_posts_from_left_users: Boolean!
    $show_posts_from_removed_users: Boolean!
    $collapse_deleted_and_removed_users_comments: Boolean!
    $campfire_id: uuid!
  ) {
    insert_campfire_settings(
      objects: {
        show_comments_from_left_users: $show_comments_from_left_users
        show_comments_from_removed_users: $show_comments_from_removed_users
        show_posts_from_left_users: $show_posts_from_left_users
        show_posts_from_removed_users: $show_posts_from_removed_users
        collapse_deleted_and_removed_users_comments: $collapse_deleted_and_removed_users_comments
        campfire_id: $campfire_id
      }
    ) {
      returning {
        id
        collapse_deleted_and_removed_users_comments
        show_comments_from_left_users
        show_comments_from_removed_users
        show_posts_from_left_users
        show_posts_from_removed_users
      }
    }
  }
`;

export const UPDATE_POSTS_COMMENTS = gql`
  mutation updatePostsComments(
    $id: uuid!
    $collapse_deleted_and_removed_users_comments: Boolean!
    $show_comments_from_left_users: Boolean!
    $show_comments_from_removed_users: Boolean!
    $show_posts_from_left_users: Boolean!
    $show_posts_from_removed_users: Boolean!
  ) {
    update_campfire_settings_by_pk(
      pk_columns: { id: $id }
      _set: {
        collapse_deleted_and_removed_users_comments: $collapse_deleted_and_removed_users_comments
        show_comments_from_left_users: $show_comments_from_left_users
        show_comments_from_removed_users: $show_comments_from_removed_users
        show_posts_from_left_users: $show_posts_from_left_users
        show_posts_from_removed_users: $show_posts_from_removed_users
      }
    ) {
      id
      collapse_deleted_and_removed_users_comments
      show_comments_from_left_users
      show_comments_from_removed_users
      show_posts_from_left_users
      show_posts_from_removed_users
    }
  }
`;

export function CampfirePostsById(
  collapse_deleted_and_removed_users_comments: boolean,
  exclude_content_by_blocked_user: boolean,
  show_posts_from_removed_users: boolean,
  show_posts_from_left_users: boolean,
  show_comments_from_removed_users: boolean,
  show_comments_from_left_users: boolean,
) {
  let newCondition = '',
    commentRemovedCondition = '',
    commentLeftCondition = '',
    newCommentsCondition = '',
    collapseCondition = '';
  const blockedCondition = '';
  const removedCondition = '';
  const leftCondition = '';

  newCondition = `user: {_or:[
    ${leftCondition},
    {
      _and: [
          ${removedCondition}
          ${blockedCondition}
      ]
    },
  ]}`;
  if (
    show_comments_from_removed_users == false ||
    show_comments_from_removed_users == undefined
  ) {
    commentRemovedCondition =
      '{campfire_users: {deletedAt: { _is_null: true }, campfireId: { _eq: $campfireId }}}, ';
  } else {
    commentRemovedCondition = '{}';
  }
  if (
    show_comments_from_left_users == false ||
    show_comments_from_left_users == undefined
  ) {
    commentLeftCondition = '';
  } else {
    commentLeftCondition =
      ' {left_campfire_users: {campfire_id: {_eq: $campfireId}}}';
  }
  if (
    collapse_deleted_and_removed_users_comments == false ||
    collapse_deleted_and_removed_users_comments == undefined
  ) {
    collapseCondition =
      '_or: [ {deletedAt: {_is_null: false}, is_deleted_by_admin_of_campfire: { _eq: true}},{deletedAt: {_is_null: true}}]';
  } else {
    collapseCondition =
      'deletedAt: {_is_null: true}, is_deleted_by_admin_of_campfire: { _eq: false},';
  }

  newCommentsCondition = `isBlocked: {_eq: false}, ${collapseCondition}, user: {_or:[
    ${commentLeftCondition},
    {
      _and: [
          ${commentRemovedCondition}
          ${blockedCondition}
      ]
    },
  ]}`;

  return `query getPostCampByID($id: uuid!, $commentLimit: Int = 100, $commentOffset: Int = 0, $campfireId:uuid!) {
  threads(
    where: {id: {_eq: $id}, _or: [{campfirePostShare: {}},{question: {}}, {poll: {}}, {quiz: {}}, {postShare: {}}], ${newCondition}}
  ) {
    id
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
    comments(where: { parentId: { _is_null: true }, isBlocked:{_eq: false} }) {
      ...commentFieldsWithNoRepliesForAuthenticatedUser
          comments(where:{ isBlocked:{_eq: false} }){
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
              id
              name
              profilePicture
              isFollowing
              is_disabled_by_admin
              is_blocked
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
      comments(
        where: {parentId: {_is_null: true},${newCommentsCondition}}
        limit: $commentLimit
        offset: $commentOffset
        order_by: {by_author: desc, ispinned: desc, createdAt: desc}
      ) {
        ...commentFieldsWithNoRepliesForAuthenticatedUser
        comments(where:{${newCommentsCondition}}) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          __typename
        }
        __typename
      }
      likes
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
          __typename
        }
           user {
              id
              name
              profilePicture
              isFollowing
              is_disabled_by_admin
              is_blocked
            }
        __typename
      }
      __typename
    }
    quiz {
      ...quizFields
      comments(
        where: {parentId: {_is_null: true},${newCommentsCondition}}
        limit: $commentLimit
        offset: $commentOffset
        order_by: {by_author: desc, ispinned: desc, createdAt: desc}
      ) {
        ...commentFieldsWithNoRepliesForAuthenticatedUser
        comments(where:{${newCommentsCondition}}) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          __typename
        }
        __typename
      }
      likes
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    question {
      ...questionFields
      comments(
        where: {parentId: {_is_null: true},${newCommentsCondition}}
        limit: $commentLimit
        offset: $commentOffset
        order_by: {by_author: desc, ispinned: desc, createdAt: desc}
      ) {
        ...commentFieldsWithNoRepliesForAuthenticatedUser
        comments(where:{${newCommentsCondition}}) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          __typename
        }
        __typename
      }
      likes
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    postShare {
      ...postShareFields
      comments(
        where: {parentId: {_is_null: true},${newCommentsCondition}}
        limit: $commentLimit
        offset: $commentOffset
        order_by: {by_author: desc, ispinned: desc, createdAt: desc}
      ) {
        ...commentFieldsWithNoRepliesForAuthenticatedUser
        comments(where:{${newCommentsCondition}}) {
          ...commentFieldsWithNoRepliesForAuthenticatedUser
          __typename
        }
        __typename
      }
      likes
      post_reactions {
        id
        user_id
        kofukon {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;
}

export const EDIT_CAMPFIRE_ABOUT = gql`
  mutation editAbout($campfireId: uuid!, $description: String!) {
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { description: $description }
    ) {
      id
      description
    }
  }
`;

export const FETCH_CAMPFIRE_INSIGHTS = gql`
  mutation FetchCampfireInsights($campfireId: String!, $duration: Int!) {
    fetchCampfireUsersInsight(campfireId: $campfireId, duration: $duration) {
      success
      message
      data
    }
  }
`;

export const FETCH_CAMPFIRE_USER_GROWTH = gql`
  mutation FetchCampfireUserGrowth($campfireId: String!, $duration: Int!) {
    fetchCampfireUserGrowth(campfireId: $campfireId, duration: $duration) {
      data
      message
      success
    }
  }
`;

export const FETCH_CAMPFIRE_TRAFFIC_GRAPH = gql`
  mutation FetchTrafficGraph($campfireId: String!, $duration: Int!) {
    fetchCampfireTrafficGraph(campfireId: $campfireId, duration: $duration) {
      data
      message
      success
    }
  }
`;

export const FETCH_CAMPFIRE_UNIQUE_USER_GRAPH = gql`
  query fetch_campfire_unique_users_graph($campfireId: uuid!, $duration: Int!) {
    fetch_campfire_unique_users_graph(
      args: { p_campfire_id: $campfireId, p_duration: $duration }
    ) {
      end_date
      count
      start_date
    }
  }
`;

export const FETCH_CAMPFIRE_NEW_USERS_GRAPH = gql`
  query fetch_campfire_new_users_graph($campfireId: uuid!, $duration: Int!) {
    fetch_campfire_new_users_graph(
      args: { p_campfire_id: $campfireId, p_duration: $duration }
    ) {
      end_date
      count
      start_date
    }
  }
`;

export const FETCH_CAMPFIRE_LEFT_USERS_GRAPH = gql`
  query fetch_campfire_left_users_graph($campfireId: uuid!, $duration: Int!) {
    fetch_campfire_left_users_graph(
      args: { p_campfire_id: $campfireId, p_duration: $duration }
    ) {
      end_date
      count: leftusers
      start_date
    }
  }
`;

export const CAMPFIRE_SEARCH = gql`
  mutation CampfireSearch($campfireId: String!, $text: String!) {
    campfireSearch(campfireId: $campfireId, text: $text) {
      data
      message
      success
    }
  }
`;

export const ADD_CAMPFIRE_VISIT = gql`
  mutation AddCampfireVisit($campfireId: uuid!, $userId: uuid!) {
    insert_campfire_visits_one(
      object: {
        campfire_id: $campfireId
        user_id: $userId
        created_at: "now()"
      }
      on_conflict: {
        constraint: campfire_visits_unique_per_day
        update_columns: []
      }
    ) {
      id
    }
  }
`;

export const FETCH_CAMPFIRE_ACTION_LOG = gql`
  ${USER_FIELDS_FRAGMENT}
  query fetchActionLogsByAdmins($campfireId: uuid!) {
    campfire_admin_actions(
      where: { campfire_id: { _eq: $campfireId } }
      order_by: { created_at: desc }
    ) {
      id
      action
      reason
      created_at
      user_name
      user_profile_picture
    }
  }
`;

export const FETCH_BANNED_WORDS = gql`
  query fetchBannedWordsInCampfire(
    $campfireId: uuid!
    $postPart: post_part_enum!
  ) {
    campfire_banned_words(
      where: {
        campfire_id: { _eq: $campfireId }
        post_part: { _eq: $postPart }
      }
    ) {
      id
      word
    }
  }
`;

export const FETCH_BANNED_DOMAINS = gql`
  query fetchCampfireBlockedDomains($campfireId: uuid!) {
    campfire_blocked_domains(where: { campfire_id: { _eq: $campfireId } }) {
      id
      domain
    }
  }
`;

export const TOGGLE_BANNED_KEYWORDS_IN_POST_TITLE = gql`
  mutation toggleBannedKeyWorkdsInPostTitle(
    $id: uuid!
    $iswordsbaninposttitle: Boolean!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { iswordsbaninposttitle: $iswordsbaninposttitle }
    ) {
      id
      iswordsbaninposttitle
    }
  }
`;

export const TOGGLE_BANNED_KEYWORDS_IN_POST_BODY = gql`
  mutation toggleBannedKeyWorkdsInPostBody(
    $id: uuid!
    $iswordsbaninpostbody: Boolean!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { iswordsbaninpostbody: $iswordsbaninpostbody }
    ) {
      id
      iswordsbaninpostbody
    }
  }
`;

export const TOGGLE_BANNED_DOMAINS_IN_POST_BODY = gql`
  mutation toggleBannedDomains($id: uuid!, $isDomainBanned: Boolean!) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { isDomainBanned: $isDomainBanned }
    ) {
      id
      isDomainBanned
    }
  }
`;
export const FETCH_CONTENT_CONTROL_DATA = gql`
  query fetchToggleDetails($id: uuid!) {
    campfires_by_pk(id: $id) {
      iswordsbaninpostbody
      iswordsbaninposttitle
      isDomainBanned
    }
  }
`;

export const FETCH_CURRENT_CONTENT_CONTROL_SETTING = gql`
  query fetchCurrentContentControlSetting($id: uuid!) {
    campfires(where: { id: { _eq: $id } }) {
      content_controls
    }
  }
`;

export const UPDATE_CONTENT_CONTROLS = gql`
  mutation updateContentControls(
    $id: uuid!
    $contentControls: content_controls_enum!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $id }
      _set: { content_controls: $contentControls }
    ) {
      id
      content_controls
    }
  }
`;

export const ADD_BANNED_KEYWORDS_FOR_CAMPFIRE_POST_BODY_OR_TITLE = gql`
  mutation addBannedKeywordsForCampfirePostBodyOrTitle(
    $objects: [campfire_banned_words_insert_input!] = {}
  ) {
    insert_campfire_banned_words(objects: $objects) {
      affected_rows
    }
  }
`;

export const ADD_BLOCKED_DOMAINS = gql`
  mutation addBlockedDomains(
    $objects: [campfire_blocked_domains_insert_input!] = {}
  ) {
    insert_campfire_blocked_domains(objects: $objects) {
      returning {
        id
        domain
      }
    }
  }
`;

export const DELETE_CAMPFIRE_BANNED_WORDS = gql`
  mutation deleteCampfireBannedWords($ids: [uuid!]!) {
    delete_campfire_banned_words(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

export const DELETE_CAMPFIRE_BLOCKED_DOMAINS = gql`
  mutation deleteCampfireBlockedDomains($ids: [uuid!]!) {
    delete_campfire_blocked_domains(where: { id: { _in: $ids } }) {
      affected_rows
    }
  }
`;

export const POSTS_WITHIN_CAMPFIRE = gql`
  mutation postsWithinCampfire($campfireId: String!, $duration: Int!) {
    fetchInsightsOfCampfirePosts(campfireId: $campfireId, duration: $duration) {
      data
      message
      success
    }
  }
`;

export const GET_CAMPFIRE_MAP_DATA = gql`
  mutation getCampfireMapData($campfireId: uuid!) {
    mapData(campfireId: $campfireId) {
      data
      message
      success
    }
  }
`;

export const DELETE_CAMPFIRE_POST = gql`
  mutation removeAPostInCampfire(
    $threadId: uuid!
    $deletedBy: uuid!
    $removalReason: uuid
  ) {
    update_campfire_threads(
      where: { id: { _eq: $threadId } }
      _set: {
        deletedAt: "now()"
        deleted_by: $deletedBy
        removal_reason: $removalReason
      }
    ) {
      affected_rows
    }
  }
`;

export const FETCH_CAMPFIRE_AVATARS = gql`
  query fetchCampfireAvatars {
    campfire_avatars {
      id
      key
      url
      createdAt
    }
  }
`;

export const FETCH_CAMPFIRE_COVER_PICTURES = gql`
  query fetchCampfireCoverPictures {
    campfire_cover_pictures {
      id
      key
      url
      createdAt
    }
  }
`;

export const UPDATE_CAMPFIRE_AVATAR = gql`
  mutation updateCampfireAvatar($campfireId: uuid!, $picture: String!) {
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { picture: $picture }
    ) {
      id
      description
    }
  }
`;

export const UPDATE_CAMPFIRE_COVER_PICTURE = gql`
  mutation updateCampfireCoverPicture(
    $campfireId: uuid!
    $coverPicture: String!
  ) {
    update_campfires_by_pk(
      pk_columns: { id: $campfireId }
      _set: { coverPicture: $coverPicture }
    ) {
      id
      coverPicture
      title
    }
  }
`;
