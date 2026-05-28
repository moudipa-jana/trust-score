import { ErrorLike } from '@apollo/client';
import { startCase, toLower, trim } from 'lodash';
import { toast } from 'react-toastify';

import { FALLBACK_BLOG_PIC, FALLBACK_PROFILE_PIC } from '@/lib/constants';
import EventEmitter from '@/lib/eventEmitter';
import { CampfireActivity } from '@/types/campfire';
const CDN = process.env.NEXT_PUBLIC_AWS_S3_CDN_BASE_URL || '';

interface SIUnit {
  value: number;
  symbol: string;
  rounding: number;
}

interface ThreadObject {
  id: string;
  threadId?: string;
  poll?: { id: string | null };
  quiz?: { id: string | null };
  question?: { id: string | null };
}

export function getStrapiURL(path = '') {
  return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://139.84.137.62:1337'
    }${path}`;
}

export function getStrapiMedia(url: string | undefined) {
  if (!url) {
    return FALLBACK_BLOG_PIC;
  }
  if (url && (url.includes('amazonaws.com') || url.startsWith(CDN))) {
    return validateImageUrl(url);
  }
  return getStrapiURL(url);
}

export function MultiPathSvgLine() {
  return null;
}

export function toggleModalLoader(isVisible = false) {
  EventEmitter.emit('toggleLoader', {
    isVisible,
  });
}

export function emitErrorNotification(msg?: string, id?: string) {
  if (msg && msg !== 'http exception when calling webhook') {
    toast.error(msg, {
      toastId: id || msg, // Use provided id or fallback to message as id
    });
  }
}

export function emitNewsLetterErrorNotification(
  msg?: string,
  icon?: any,
  bgColor?: string,
) {
  if (msg && msg !== 'http exception when calling webhook') {
    toast.error(msg, {
      toastId: msg,
      icon: () => icon,
      style: {
        backgroundColor:
          bgColor === 'warning'
            ? '#D09975'
            : bgColor === 'success'
              ? '#4CAF50'
              : undefined,
      },
    });
  }
}

export function formatGraphqlError(error: ErrorLike | Error | unknown): string {
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const graphQLError = error as any;
    if (graphQLError.graphQLErrors?.[0]) {
      return graphQLError.graphQLErrors[0].message;
    }
    return 'Something went wrong, Please try again!';
  }
  return (
        (error as Error).message
      ?.replace(/^(ApolloError:|CombinedGraphQLErrors:?)\s*/i, '')
      .trim() || 'Unknown error occurred'
  );

  // return (
  //   (error as Error).message?.replace('ApolloError:', '') ||
  //   'Unknown error occurred'
  // );
}

export function isIgnorableHashtagMutationError(
  error: ErrorLike | Error | unknown,
): boolean {
  const formattedError = formatGraphqlError(error);

  return (
    formattedError.includes('post_hashtag_pollid_fkey') &&
    formattedError.includes('Foreign key violation')
  );
}

export function emitNotification(
  variant: 'success' | 'error' | 'warning' | 'info',
  msg: string,
) {
  toast[variant](msg);
}

/**
 * Format a count
 * @export
 * @param {number} count - No. of votes or comments
 * @returns {String} - Represents currency value in the with suffix ex. 850K
 */
export function formatShortCount(count: number | string): string | number {
  if (count === null || count === undefined) {
    return '';
  }

  const numericValue = typeof count === 'string' ? Number(count) : count;

  // Invalid number check
  if (!Number.isFinite(numericValue)) {
    return '';
  }

  if (!count || numericValue < 0) {
    return 0;
  }
  const si: SIUnit[] = [
    { value: 1, symbol: '', rounding: 0 },
    { value: 1e3, symbol: 'K', rounding: 1 },
    { value: 1e6, symbol: 'M', rounding: 2 },
    { value: 1e9, symbol: 'B', rounding: 2 },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i: number;
  for (i = si.length - 1; i > 0; i--) {
    if (numericValue >= si[i].value) {
      break;
    }
  }
  const formatted = (numericValue / si[i].value)
    .toFixed(si[i].rounding)
    .replace(rx, '$1');
  if (formatted === '1000') {
    return `1${si[i + 1].symbol}`;
  }
  return `${formatted}${si[i].symbol}`;
}

export function replaceObjectById<T extends { id: string }>(
  arr: T[],
  id: string,
  newObject: T,
): T[] {
  const index = arr.findIndex((obj) => obj.id === id);
  if (index !== -1) {
    arr[index] = newObject;
  }
  return arr;
}

export function dateFormate(ctx: string | number | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return new Date(`${ctx}`).toLocaleDateString('en-GB', options);
}

export function shortWords(text: string, manNumber: number) {
  return text && text.length > manNumber
    ? text.slice(0, manNumber).split(' ').slice(0, -1).join(' ')
    : text;
}

export function removeDshFromString(ctx: string | undefined): string {
  const strArray = ctx?.split('-');
  const capitalizedArray = strArray?.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  return capitalizedArray?.join(' ') ?? '';
}

export function hasUserViewedBlogToday(blogSlug: string): boolean {
  const storageKey = `blogView_${blogSlug}`;
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const previousVisitDate = localStorage.getItem(storageKey);

  if (previousVisitDate && previousVisitDate === today) {
    return true;
  } else {
    localStorage.setItem(storageKey, today);
    return false;
  }
}

export function bytesToMb(bytes: number) {
  const mb = bytes / 1000000;

  return mb;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-GB');

  return formattedDate;
}

export function isProduction() {
  if (
    (typeof window !== 'undefined' && location.hostname === 'localhost') ||
    location.hostname === '127.0.0.1'
  ) {
    return false;
  }
  return true;
}
// Transform text to clean format
export const transformText = (text: string | undefined): string | undefined => {
  if (!text) return text;

  let transformed = text;

  transformed = transformed.replace(
    /<([^|>]+)>/g,
    (_match: string, display: string) => `${display} `,
  );

  transformed = transformed.replace(
    /<([^|]+)\s*\|\s*[^>]+>/g,
    (_match: string, display: string) => `${display} `,
  );

  return transformed;
};

export function getThreadIdObject(obj: ThreadObject): ThreadObject {
  const newObj: ThreadObject = { ...obj };
  if (newObj.threadId) {
    return newObj;
  }
  if (newObj.poll && newObj.poll.id !== null && newObj.poll.id !== undefined) {
    newObj.threadId = newObj.id;
    newObj.id = newObj.poll.id;
  }
  if (newObj.quiz && newObj.quiz.id !== null && newObj.quiz.id !== undefined) {
    newObj.threadId = newObj.id;
    newObj.id = newObj.quiz.id;
  }
  if (
    newObj.question &&
    newObj.question.id !== null &&
    newObj.question.id !== undefined
  ) {
    newObj.threadId = newObj.id;
    newObj.id = newObj.question.id;
  }
  return newObj;
}

export const getDefaultProfileImage = (image: string) => {
  if (image && image !== 'null') {
    return image;
  }
  return FALLBACK_PROFILE_PIC;
};

export const checkInputChangeLimit = (name: string, limit: number) => {
  let input = trim(name);
  const words = input.split(/\s+/);
  if (words.length >= limit) {
    input = words.slice(0, limit).join(' ');
    return;
  } else {
    return name;
  }
};



export function pinSort(posts: CampfireActivity[]) {
  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    if (a.is_pinned && b.is_pinned) {
      return (
        new Date(b.pinned_at || 0).getTime() -
        new Date(a.pinned_at || 0).getTime()
      );
    }

    return (
      new Date(b?.createdAt as string).getTime() -
      new Date(a?.createdAt as string).getTime()
    );
  });
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function matchesAnyBannedWord(str: string, bannedWords: string[]) {
  const strWords = str.toLowerCase().split(' ');
  const lowerCaseBannedWords = bannedWords.map((word) => word.toLowerCase());

  return strWords.some((word) => lowerCaseBannedWords.includes(word));
}

export const validateImageUrl = (str?: string): string => {
  if (typeof str !== 'string' || !str) return str || '';
  const S3_BASE = process.env.NEXT_PUBLIC_AWS_S3_BASE_URL || '';
  const S3_REGION = process.env.NEXT_PUBLIC_AWS_S3_BASE_URL_WITH_REGION || '';
  let finalUrl = str;

  // Return as-is for Next.js static/media, local/static assets, data/blob URIs, relative/absolute paths, or http(s) URLs
  if (
    str.startsWith('/_next/static/media/') ||
    str.startsWith('/static/') ||
    str.startsWith('images/') ||
    str.startsWith('/images/') ||
    str.startsWith('./') ||
    str.startsWith('../') ||
    str.startsWith('/') ||
    /^(data:|blob:)/i.test(str) ||
    /^https?:\/\//i.test(str)
  ) {
    return str;
  }

  // If already using CDN, return as-is
  if (CDN && str.startsWith(CDN)) {
    return str;
  }

  if (str.includes('amazonaws.com')) {
    [
      S3_BASE,
      S3_REGION,
      'https://kofuku-staging-cms.s3.ap-south-1.amazonaws.com/colored_Like_f9c293d05e.svg',
    ].forEach((s3Url) => {
      if (str.startsWith(s3Url)) {
        finalUrl = str.replace(s3Url, CDN);
      }
    });
    return finalUrl;
  }

  // Fallback: prefix with CDN
  finalUrl = CDN + str;
  return finalUrl;
};

export const removeS3DomainFromImageUrl = (str?: string): string => {
  if (typeof str !== 'string' || !str) return str || '';
  const S3_BASE = process.env.NEXT_PUBLIC_AWS_S3_BASE_URL || '';
  const S3_REGION = process.env.NEXT_PUBLIC_AWS_S3_BASE_URL_WITH_REGION || '';
  let finalUrl = str;

  [
    S3_BASE,
    S3_REGION,
    'https://kofuku-staging-cms.s3.ap-south-1.amazonaws.com/colored_Like_f9c293d05e.svg',
  ].forEach((s3Url) => {
    if (str.startsWith(s3Url)) {
      finalUrl = str.replace(s3Url, '');
    }
  });

  return finalUrl;
};

export const getYouTubeVideoId = (url: string) => {
  if (!url) {
    return '';
  }
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : '';
};
``;

export const formatTitleCaseName = (text = '') => {
  if (!text) return '';

  return startCase(toLower(text));
};

export const TrimTitleforSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const allowOnlyNumericValue = (e: any) => {
  var numbers = /^[0-9]$/;
  // Allow enter
  if (e.keyCode === 13) {
    return true;
  }
  if (!e.key.match(numbers) && e.keyCode != 8) {
    e.preventDefault();
    return false;
  }

  if (e.currentTarget.value.length > 11) {
    e.preventDefault();
    return false;
  }
};

export const contactFormatter = (e: any) => {
  if (e.currentTarget.value) {
    e.currentTarget.value = getFormattedContact(
      e.currentTarget.value ? e.currentTarget.value.replaceAll('-', '') : '',
    );
  }
};

export const getFormattedContact = (e: any) => {
  if (e) {
    const match = e.toString().replace(/\D+/g, '');
    const part1 = match.length > 2 ? `${match.substring(0, 3)}` : match;
    const part2 = match.length > 3 ? `-${match.substring(3, 6)}` : '';
    const part3 = match.length > 6 ? `-${match.substring(6, 10)}` : '';
    var x = part1 + '' + part2 + '' + part3;
    return x;
  } else {
    return e;
  }
};

export const getRawContact = (value: any) => {
  if (!value) return value;

  return value.toString().replace(/\D+/g, '');
};

export const calculateAge = (dob: string) => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday not yet occurred this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const getWordCount = (text?: string): number => {
  if (!text) return 0;

  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const normalizeWhitespace = (text?: string): string => {
  if (!text) return '';

  return text.replace(/\s+/g, ' ').trim();
};
