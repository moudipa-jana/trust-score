import { validateImageUrl } from "@/lib/helpers";

const PROFILE_NAVIGATION = [
  {
    id: 1,
    name: 'Account settings',
    link: '/account',
    image: '/images/profile/settings.svg',
  },
  {
    id: 2,
    name: 'My activities',
    link: '/profile#activities',
    image: '/images/profile/myActivities.svg',
  },
  {
    id: 3,
    name: 'View archived post(s)',
    link: '/profile#archived',
    image: '/images/profile/archivedPosts.svg',
  },
  {
    id: 4,
    name: 'View bookmarked item(s)',
    link: '/profile#bookmark',
    image: '/images/profile/bookmark.svg',
  },
  {
    id: 5,
    name: 'View hidden post(s)',
    link: '/profile#hidden',
    image: '/images/profile/hiddenPost.svg',
  },
  {
    id: 6,
    name: 'View blocked users',
    link: '/account/blocked-users',
    image: '/images/profile/blockedUsers.svg',
  },
  {
    id: 7,
    name: 'Help and support',
    link: '/help-support',
    image: '/images/profile/help.svg',
  },
  {
    id: 8,
    name: 'Sign out',
    link: '/',
    image: '/images/profile/signOut.svg',
  },
];
export default PROFILE_NAVIGATION;

export const getDefaultCampfireImage = (image: string) => {
  if (image && image !== 'null') {
    return validateImageUrl(image);
  }
  return 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
};
