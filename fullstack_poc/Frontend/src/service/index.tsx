import { gql } from '@apollo/client';

import cmsClient from '@/service/cmsClient';

export function HomeService() {
  return cmsClient.query({
    query: gql`
      query getHome {
        home {
          data {
            attributes {
              title
              video {
                data {
                  attributes {
                    url
                  }
                }
              }
              who {
                title
                description
              }
              sunrise {
                title
                description
              }
              why {
                title
                description
              }
              Kofu {
                title
              }
              kofukons {
                data {
                  attributes {
                    title
                    image {
                      data {
                        attributes {
                          url
                        }
                      }
                    }
                  }
                }
              }
              PersonalisedSearch {
                title
                description
              }
              memoirs {
                data {
                  id
                  attributes {
                    title
                    description
                    altText
                    image {
                      data {
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
    `,
  });
}

export const QUERY_RECENT_BLOG = gql`
  query getRecentBlog {
    sunriseBlogs(sort: "publish_date:desc", pagination: { limit: 1 }) {
      data {
        attributes {
          Title
          slug
        }
      }
    }
  }
`;

export const QUERY_RECENT_VIDEO = gql`
  query getRecentVideo {
    youtubes(sort: "publish_date:desc", pagination: { limit: 1 }) {
      data {
        attributes {
          Title
          slug
        }
      }
    }
  }
`;

export function MenuService() {
  return cmsClient.query({
    query: gql`
      query getMenu {
        menus {
          data {
            id
            attributes {
              title
              slug
            }
          }
        }
      }
    `,
  });
}

export function BottomMenuService() {
  return cmsClient.query({
    query: gql`
      query getBottomMenu {
        bottomMenus {
          data {
            attributes {
              title
              slug
            }
          }
        }
      }
    `,
  });
}

export function KofukonsService() {
  return cmsClient.query({
    query: gql`
      query getKofukons {
        kofukons {
          data {
            attributes {
              title
              image {
                data {
                  attributes {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
  });
}

export const QUERY_BLOG_CATEGORIES = gql`
  query blogCategories {
    blogCategories {
      data {
        id
        attributes {
          title
          slug
          slider {
            title
            description
            bgColor
            image {
              id
              altText
              image {
                data {
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
`;

export function BlogCategoryService() {
  return cmsClient.query({
    query: QUERY_BLOG_CATEGORIES,
  });
}

export function BlogService() {
  return cmsClient.query({
    query: gql`
      query getBlog {
        sunriseBlogs {
          data {
            id
            attributes {
              Title
              readDuration
              shortDes
              publish_date
              slug
              good_read
              recommended
              pick
              watch
              trending
              coverImg {
                data {
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
                        attributes {
                          url
                        }
                      }
                    }
                  }
                }
              }
              sunrise_club_author {
                data {
                  id
                  attributes {
                    Name
                    Name_Slug
                    Image {
                      data {
                        attributes {
                          url
                        }
                      }
                    }
                  }
                }
              }
              sunrise_doctor {
                data {
                  id
                  attributes {
                    Name
                    Name_Slug
                    Image {
                      data {
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
    `,
  });
}

export function BingeWatchService() {
  return cmsClient.query({
    query: gql`
      query getBingeWatch {
        youtubes {
          data {
            id
            attributes {
              Title
              Description
              Link
              slug
              watchTime
              publish_date
              createdAt
              CoverImg {
                data {
                  attributes {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
  });
}

export function BlogSearch(text: string, limit: number) {
  return cmsClient.query({
    query: gql`
      query Blogs($text: String!, $limit: Int!) {
        sunriseBlogs(
          filters: {
            or: [{ Title: { containsi: $text } }]
            trending: { eq: true }
          }
          sort: "views:desc"
          pagination: { limit: $limit }
        ) {
          data {
            id
            attributes {
              Title
              shortDes
              publish_date
              coverImg {
                data {
                  id
                  attributes {
                    name
                    alternativeText
                    caption
                    width
                    height
                    formats
                    size
                    url
                    previewUrl
                    provider
                    provider_metadata
                    createdAt
                    updatedAt
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
              slug
              views
              trending
              videoViews
              readDuration
              createdAt
              publishedAt
            }
          }
        }
      }
    `,
    variables: {
      text,
      limit,
    },
  });
}

export function GetCategoryBySlug(ctx: string) {
  return cmsClient.query({
    query: gql`
      query GetCategoryBySlug($input: String!) {
        getCategoryBySlug(input: $input) {
          blogCategories(filters: { slug: { eq: $input } }) {
            data {
              attributes {
                title
                slug
                slider {
                  id
                  title
                  description
                  image {
                    altText
                    image {
                      data {
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
    `,
    variables: {
      input: ctx,
    },
  });
}

export function GetBookmarkBlogs(ctx: string) {
  return cmsClient.query({
    query: gql`
      query bookmarkBlogs($userId: String!) {
        bookMarks(filters: { userId: { eq: $userId } }) {
          data {
            id
            attributes {
              userId
              sunrise_blog {
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
                    trending
                    coverImg {
                      data {
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
          }
        }
      }
    `,
    variables: {
      userId: ctx,
    },
  });
}

export function getSingleAuthorService(name_slug: string) {
  return cmsClient.query({
    query: gql`
      query getSingleAuthor($name_slug: String!) {
        sunriseClubAuthors(
          filters: { Name_Slug: { eq: $name_slug } }
          publicationState: LIVE
          pagination: { page: 1, pageSize: 1 }
        ) {
          data {
            id
            attributes {
              Name
              Name_Slug
              Designation
              Bio
              AltText
              LinkedinLink
              TwitterLink
              Image {
                data {
                  id
                  attributes {
                    url
                    alternativeText
                    caption
                    width
                    height
                    mime
                    size
                    formats
                  }
                }
              }
              sunrise_blogs {
                data {
                  id
                  attributes {
                    Title
                    slug
                    publish_date
                    coverImg {
                      data {
                        attributes {
                          url
                          alternativeText
                        }
                      }
                    }
                    blog_categories {
                      data {
                        attributes {
                          title
                        }
                      }
                    }
                  }
                }
              }

              createdAt
              updatedAt
              publishedAt
            }
          }
        }
      }
    `,
    variables: { name_slug },
  });
}

export function getSingleDoctorService(name_slug: string) {
  return cmsClient.query({
    query: gql`
      query getSingleDoctor($name_slug: String!) {
        sunriseDoctors(
          filters: { Name_Slug: { eq: $name_slug } }
          publicationState: LIVE
          pagination: { page: 1, pageSize: 1 }
        ) {
          data {
            id
            attributes {
              Name
              Name_Slug
              DoctorBio
              DoctorExperience
              AltText
              LinkedinLink
              TwitterLink
              Image {
                data {
                  id
                  attributes {
                    url
                    alternativeText
                    caption
                    width
                    height
                    mime
                    size
                    formats
                  }
                }
              }
              sunrise_blogs {
                data {
                  id
                  attributes {
                    Title
                    slug
                    publish_date
                    coverImg {
                      data {
                        attributes {
                          url
                          alternativeText
                        }
                      }
                    }
                    blog_categories {
                      data {
                        attributes {
                          title
                        }
                      }
                    }
                  }
                }
              }

              createdAt
              updatedAt
              publishedAt
            }
          }
        }
      }
    `,
    variables: { name_slug },
  });
}

export function TermsService() {
  return cmsClient.query({
    query: gql`
      query getTerms {
        term {
          data {
            attributes {
              title
              description
              publishedAt
              updatedAt
            }
          }
        }
      }
    `,
  });
}
export function PrivacyPolicyService() {
  return cmsClient.query({
    query: gql`
      query getPrivacyPolicy {
        privacyPolicie {
          data {
            attributes {
              title
              description
              publishedAt
              updatedAt
            }
          }
        }
      }
    `,
  });
}

export function FaqsService() {
  return cmsClient.query({
    query: gql`
      query getFaqs {
        faqs {
          data {
            id
            attributes {
              question
              answer
            }
          }
        }
      }
    `,
  });
}

//Get blogs by title for search
export function getBlogsByTitle(titleString: string, page: number = 1, pageSize: number = 5) {
  return cmsClient.query({
    query: gql`
      query GetBlogsByTitle($titleString: String, $page: Int, $pageSize: Int) {
        sunriseBlogs(
          filters: { 
            Title: { containsi: $titleString },
            or: [
              { watch: { ne: true } },
              { watch: { null: true } }
            ]
          }
          sort: "createdAt:desc"
          pagination: { page: $page, pageSize: $pageSize }
        ) {
          data {
            id
            attributes {
              Title
              shortDes
              slug
              blog_categories {
                data {
                  id
                  attributes {
                    title
                    slug
                  }
                }
              }
              coverImg {
                data {
                  id
                  attributes {
                    alternativeText
                    url
                  }
                }
              }
              sunrise_club_author {
                data {
                  id
                  attributes {
                    Name
                    Name_Slug
                  }
                }
              }
            }
          }
          meta {
            pagination {
              total
              page
              pageSize
              pageCount
            }
          }
        }
        youtubes(
          filters: { Title: { containsi: $titleString } }
          sort: "publish_date:desc"
          pagination: { page: $page, pageSize: $pageSize }
        ) {
          data {
            id
            attributes {
              Title
              Description
              Link
              slug
              CoverImg {
                data {
                  attributes {
                    url
                  }
                }
              }
            }
          }
          meta {
            pagination {
              total
              page
              pageSize
              pageCount
            }
          }
        }
      }
    `,
    variables: {
      titleString: titleString,
      page: page,
      pageSize: pageSize,
    },
  });
}

export const createBookMark = gql`
  mutation createBookMark($userId: String, $sunrise_blog: ID) {
    createBookMark(data: { userId: $userId, sunrise_blog: $sunrise_blog }) {
      data {
        id
        attributes {
          userId
          sunrise_blog {
            data {
              id
              attributes {
                Title
                shortDes
                coverImg {
                  data {
                    id
                    attributes {
                      alternativeText
                      url
                    }
                  }
                }
                publish_date
              }
            }
          }
        }
      }
    }
  }
`;

export const createYouTubeBookmark = gql`
  mutation createYouTubeBookmark($userId: String, $sunrise_blog: ID) {
    createBookMark(data: { userId: $userId, youtubes: $sunrise_blog }) {
      data {
        id
        attributes {
          userId
          youtubes {
            data {
              id
              attributes {
                Title
                Description
                Link
                publish_date
                CoverImg {
                  data {
                    id
                    attributes {
                      url
                      alternativeText
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

export const getVideoBlogs = gql`
  query getVideoBlogs($userId: String, $page: Int, $pageSize: Int) {
    bookMarks(
      filters: {
        userId: { eq: $userId }
        or: [
          { sunrise_blog: { video: { not: null } } }
          { youtubes: { not: null } }
        ]
      }
      sort: "createdAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          userId
          sunrise_blog {
            data {
              id
              attributes {
                Title
                shortDes
                publish_date
                slug
                coverImg {
                  data {
                    id
                    attributes {
                      alternativeText
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
          youtubes {
            data {
              id
              attributes {
                Title
                Description
                Link
                publish_date
                CoverImg {
                  data {
                    id
                    attributes {
                      url
                      alternativeText
                    }
                  }
                }
              }
            }
          }
        }
      }
      meta {
        pagination {
          total
          page
          pageSize
          pageCount
        }
      }
    }
  }
`;

export const getBlogs = gql`
  query getBlogs($userId: String, $page: Int, $pageSize: Int) {
    bookMarks(
      filters: {
        and: [
          { userId: { eq: $userId } }
          {
            or: [
              { sunrise_blog: { watch: { ne: true } } }
              { sunrise_blog: { watch: { null: true } } }
            ]
          }
        ]
      }
      sort: "createdAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          userId
          sunrise_blog {
            data {
              id
              attributes {
                Title
                shortDes
                publish_date
                watch
                slug
                coverImg {
                  data {
                    id
                    attributes {
                      alternativeText
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
      }
      meta {
        pagination {
          total
          page
          pageSize
          pageCount
        }
      }
    }
  }
`;

export const GetBookmarksTotalCount = gql`
  query GetBookmarkCount($userId: String) {
    bookMarks(
      filters: {
        userId: { eq: $userId }
        sunrise_blog: { id: { notNull: true } }
      }
    ) {
      data {
        id
      }
    }
  }
`;
export const getBookmarkByUserIdBlogId = gql`
  query getSunriseBlogsByUserId($userId: String, $id: ID) {
    bookMarks(
      filters: {
        userId: { eq: $userId }
        or: [
          { sunrise_blog: { id: { eq: $id } } }
          { youtubes: { id: { eq: $id } } }
        ]
      }
    ) {
      data {
        id
        attributes {
          userId
          sunrise_blog {
            data {
              id
              attributes {
                Title
                shortDes
                coverImg {
                  data {
                    id
                    attributes {
                      alternativeText
                      url
                    }
                  }
                }
                publish_date
              }
            }
          }
        }
      }
    }
  }
`;

export const deleteBookMark = gql`
  mutation deleteBookMark($id: ID!) {
    deleteBookMark(id: $id) {
      data {
        id
        attributes {
          userId
          sunrise_blog {
            data {
              id
              attributes {
                Title
                shortDes
                coverImg {
                  data {
                    id
                    attributes {
                      alternativeText
                      url
                    }
                  }
                }
                publish_date
              }
            }
          }
        }
      }
    }
  }
`;

export function UpdateBlogCount(blogId: string, views: number) {
  return cmsClient.mutate({
    mutation: gql`
      mutation UpdateBlog($blogId: ID!, $views: Long!) {
        updateSunriseBlog(id: $blogId, data: { views: $views }) {
          data {
            id
            attributes {
              Title
              views
            }
          }
        }
      }
    `,
    variables: {
      blogId,
      views,
    },
  });
}

export function UpdateBlogVideoCount(blogId: string, videoViews: number) {
  return cmsClient.mutate({
    mutation: gql`
      mutation UpdateBlogVideoCount($blogId: ID!, $videoViews: Long!) {
        updateSunriseBlog(id: $blogId, data: { videoViews: $videoViews }) {
          data {
            attributes {
              videoViews
            }
          }
        }
      }
    `,
    variables: {
      blogId,
      videoViews,
    },
  });
}

export function JoinUsService() {
  return cmsClient.query({
    query: gql`
      query JoinUs {
        joinUs {
          data {
            attributes {
              heroSection {
                Title
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title1
                Description1
                Title2
                Description2
                Title3
                Description3
              }
              TeamProductSection {
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title
                Description
              }
              TeamContentSection {
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title
                Description
              }
              TeamTechnologySection {
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title
                Description
              }
              TeamCreativeSection {
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title
                Description
              }
              TeamAdminSection {
                coverImg {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Title
                Description
              }
            }
          }
        }
      }
    `,
  });
}

export function FETCH_LIST_OF_KOFUKONS() {
  return cmsClient.query({
    query: gql`
      query fetchListOfKofukons {
        kofukons {
          data {
            attributes {
              k_id
              title
              image {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              altText
            }
          }
        }
      }
    `,
  });
}

export function jobOpeningsService() {
  return cmsClient.query({
    query: gql`
      query jobOpenings {
        jobOpenings {
          data {
            attributes {
              jobRole
              jobDescription
              jobPostedDate
              salary
              location
              multipleOpenings
              jobPostedDate
              experience
              job_location {
                data {
                  attributes {
                    City
                  }
                }
              }
              employment_type {
                data {
                  attributes {
                    JobTitle
                  }
                }
              }
              department {
                data {
                  attributes {
                    Name
                  }
                }
              }
            }
          }
        }
      }
    `,
  });
}

export const FaqData = gql`
  query AllFaqs($page: Int!, $type: String!) {
    allFaqs(
      pagination: { page: $page, pageSize: 10 }
      sort: "createdAt:desc"
      filters: { faq_types: { slug: { eq: $type } } }
    ) {
      data {
        id
        attributes {
          createdAt
          updatedAt
          publishedAt
          question
          answer
          faq_types {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export const FaqSearchData = gql`
  query AllSearchedFaqs($page: Int!, $searchTerm: String!) {
    allFaqs(
      pagination: { page: $page, pageSize: 10 }
      sort: "createdAt:desc"
      filters: {
        or: [
          { answer: { containsi: $searchTerm } }
          { question: { containsi: $searchTerm } }
        ]
      }
    ) {
      data {
        id
        attributes {
          createdAt
          updatedAt
          publishedAt
          question
          answer
          faq_types {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export function helpSupportService() {
  return cmsClient.query({
    query: gql`
      query helpSupportPageData {
        helpCenter {
          data {
            attributes {
              Title
              SubTitle
              Banner {
                data {
                  attributes {
                    url
                  }
                }
              }
              ForumTitle
              ForumDescription
              ForumBg {
                data {
                  attributes {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `,
  });
}

export function faqTypesService() {
  return cmsClient.query({
    query: gql`
      query helpSupportFaqTypes {
        faqTypes(filters: { id: { ne: 1 } }) {
          data {
            id
            attributes {
              title
              Descrption
              slug
              Icon {
                data {
                  attributes {
                    url
                  }
                }
              }
              all_faqs {
                data {
                  id
                  attributes {
                    question
                    answer
                  }
                }
              }
            }
          }
        }
      }
    `,
  });
}

export function contentPolicyService() {
  return cmsClient.query({
    query: gql`
      query contentPolicyPage {
        contentPolicy {
          data {
            attributes {
              Title
              Description
              publishedAt
            }
          }
        }
      }
    `,
  });
}

export const FOOTER_DISCLAIMER = gql`
  query footerDisclaimer {
    footerDisclaimer {
      data {
        attributes {
          title
          description
        }
      }
    }
  }
`;

export const SOCIAL_QUERY = gql`
  query getSocials {
    socials {
      data {
        id
        attributes {
          title
          link
        }
      }
    }
  }
`;

export const CREATE_USER_QUERY = gql`
  mutation createUserQuery(
    $email: String!
    $query: String!
    $publishedAt: DateTime!
  ) {
    createUsersQuery(
      data: { email: $email, query: $query, publishedAt: $publishedAt }
    ) {
      data {
        attributes {
          email
          query
          publishedAt
        }
      }
    }
  }
`;

export const QUERY_BLOGS_BY_CATEGORY = gql`
  query GetBlogsByCategory($slug: String!) {
    sunriseBlogs(
      filters: { blog_categories: { slug: { eq: $slug } } }
      sort: "publish_date:desc"
    ) {
      data {
        id
        attributes {
          Title
          slug
          publish_date
          shortDes
          coverImg {
            data {
              attributes {
                url
              }
            }
          }
          blog_categories {
            data {
              attributes {
                title
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export const QUERY_RECENT_BLOGS_BY_CATEGORY = gql`
  query GetRecentBlogsByCategory($slug: String!) {
    sunriseBlogs(
      filters: { blog_categories: { slug: { eq: $slug } } }
      sort: "publish_date:desc"
      pagination: { limit: 2 }
    ) {
      data {
        id
        attributes {
          Title
          slug
          publish_date
        }
      }
    }
  }
`;

export const QUERY_RECENT_VIDEOS_BY_CATEGORY = gql`
  query getRecentVideo {
    youtubes(sort: "publish_date:desc", pagination: { limit: 10 }) {
      data {
        attributes {
          Title
          slug
        }
      }
    }
  }
`;
