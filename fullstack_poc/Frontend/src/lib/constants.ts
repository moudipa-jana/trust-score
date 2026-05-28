import { Department, EmploymentType, Location } from '@/types/enums';

export const METADATA_TITLE = 'Kofuku Social | Medical forum';

export const METADATA_DESCRIPTION =
  'Kofuku Social is similar Reddit forum but for medical industry.';

export const BASE_URL = 'https://www.kofukusocial.com';
export const isLogIn = true;
export const HEADER_HEIGHT = 90;
export const OPTION_LIMIT = 100; // 100 chars limit for options
export const BLOG_VISIT_WAIT_TIME = 2 * 1000; // 10 sec
export const TITLE_WORD_LIMIT = 50; // 50 words limit for title of Question ,Quiz and Poll

export const MAX_WORD_LIMIT = 500;
export const WARNING_SENSITIVE_CATEGORY = [
  'hush-talks',
  'she-reads',
  `she-read`,
];
export const SESSION_EXPIRED_MSG =
  'Looks like your session expired. Login and try again!';
export const FALLBACK_PROFILE_PIC = '/images/user_200.svg';
export const CAMPFIRE_FALLBACK_PROFILE_PIC = '/images/200.svg';
export const CAMPFIRE_FALLBACK_COVER_PIC =
  '/images/campfire cover fallback.svg';
export const FALLBACK_BLOG_PIC = '/images/blg-fallback.png';
export const FALLBACK_AVATARS = [
  {
    id: '63071ad0-07ab-4333-98e1-676983734088',
    url: '/images/alien.png',
    slug: 'alien1',
  },
  {
    id: 'db1c66e0-8cea-41fd-a380-ed88b081d498',
    url: '/images/alien.png',
    slug: 'alien2',
  },
  {
    id: 'd6e578e3-1bf8-4ea8-bdc6-95817c7e2ef9',
    url: '/images/alien.png',
    slug: 'alien3',
  },
  {
    id: 'a91f3820-3ea7-4b77-ace7-f3a51c2c375a',
    url: '/images/alien.png',
    slug: 'alien4',
  },

  {
    id: '4fe277b8-d2cc-477c-84af-9564c850154e',
    url: '/images/usernew.png',
    slug: 'usernew',
  },
  {
    id: '89842a48-eafc-43f8-8279-667f13b03f1a',
    url: '/images/usernew.png',
    slug: 'usernew',
  },
  {
    id: '3d9c7204-18d2-4e1f-a857-d888145f1898',
    url: '/images/usernew.png',
    slug: 'usernew',
  },
  {
    id: '986336d1-fe46-4c4f-963a-10db7b44d78e',
    url: '/images/usernew.png',
    slug: 'usernew',
  },

  {
    id: 'be451628-7eba-4ecf-a6b2-5e9dceb912f8',
    url: 'https://kofuku-bucket.s3.ap-south-1.amazonaws.com/morden1.svg',
    slug: 'morden1',
  },
  {
    id: '48c579e2-d55b-4baa-a9a0-96b663634e8d',
    url: 'https://kofuku-bucket.s3.ap-south-1.amazonaws.com/morden2.svg',
    slug: 'morden2',
  },
  {
    id: 'e74fb6ad-c88e-4ed6-9ba4-aa158dd4643e',
    url: 'https://kofuku-bucket.s3.ap-south-1.amazonaws.com/morden3.svg',
    slug: 'morden3',
  },
  {
    id: 'dae0ea2a-beb3-4fe7-81f5-c52ec64d7c84',
    url: 'https://kofuku-bucket.s3.ap-south-1.amazonaws.com/morden4.svg',
    slug: 'morden4',
  },

  {
    id: 'dd6c4d82-9030-439b-8ad2-dcb0cea2b355',
    url: '/images/pig.png',
    slug: 'pig1',
  },
  {
    id: '07d463e0-3f3c-4866-bf30-9a2419fe2626',
    url: '/images/pig.png',
    slug: 'pig2',
  },
  {
    id: '5bcd6077-9033-447c-82ea-5083eca109be',
    url: 'https://kofuku-bucket.s3.ap-south-1.amazonaws.com/pig3.svg',
    slug: 'pig3',
  },
];

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const COUNTRIES_OPTIONS = [
  { value: 'Australia', label: 'Australia' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'China', label: 'China' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'DR Congo', label: 'DR Congo' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Iran', label: 'Iran' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Myanmar', label: 'Myanmar' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Russia', label: 'Russia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Ukraine', label: 'Ukraine' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Vietnam', label: 'Vietnam' },
];

export const DEPARTMENT_OPTIONS = [
  { value: Department.PRODUCT, label: 'Product' },
  { value: Department.CREATIVE, label: 'Creative' },
  { value: Department.IT, label: 'IT' },
  { value: Department.CONTENT, label: 'Content' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: EmploymentType.FULL_TIME_ONSITE, label: 'Full time (On-site)' },
  { value: EmploymentType.FULL_TIME_REMOTE, label: 'Full time (Remote)' },
  { value: EmploymentType.FULL_TIME_HYBRID, label: 'Full time (Hybrid)' },
  { value: EmploymentType.EMPLOYMENT_CONTRACT, label: 'Employment Contract' },
  { value: EmploymentType.CASUAL_EMPLOYMENT, label: 'Casual Employment' },
  { value: EmploymentType.APPRENTICESHIP, label: 'Apprenticeship' },
  { value: EmploymentType.INTERNSHIP, label: 'Internship' },
];

export const LOCATION_OPTIONS = [
  { value: Location.KOLKATA, label: 'Kolkata' },
  { value: Location.BANGALORE, label: 'Bangalore' },
  { value: Location.HYDERABAD, label: 'Hyderabad' },
];

export const FORUM_ANIMATED_PLACEHOLDER = [
  500,
  'Search for Kofuku Social',
  1000,
  'Search for People',
  1000,
  'Search for Discussions',
  1000,
  'Search for Campfires',
  1000,
  'Search for Blogs',
  1000,
  'Search for #hashtags',
  500,
];

export const BLOG_ANIMATED_PLACEHOLDER = [
  500,
  'Search for Trending',
  1000,
  'Search for Quick Reads',
  1000,
  'Search for Related Videos',
  1000,
  'Search for Good Reads',
  500,
];

export const WEAK_PASSWORDS_VALIDaTION_LIST = [
  'admin',
  'admin@12345',
  '123456789',
  'abcde',
  'password',
  'pass@123',
  'test',
  'test@123',
  'welcome',
  'user',
  'abcd1234',
  'abc123',
  'kofuku',
].map((item) => item.toLowerCase()); // <-- normalize list to lowercase
