import { createSlice } from '@reduxjs/toolkit';

import { Announcement } from '@/components/pages/Forum/posts/ForumAnnouncementCard';
import { RootState } from '@/state/reducers';
import { CampfireDetails } from '@/types/campfire';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  isFollowing: boolean;
  isBlocked: boolean;
}

interface CampfireMember {
  id: string;
  role: string;
  createdAt: string;
  user: User;
}

// interface Comment {
//   id: string;
//   parentId: string | null;
//   by_author: boolean;
//   ispinned: boolean;
//   pinned_at: string | null;
//   createdAt: string;
// }

// interface Reaction {
//   id: string;
//   user_id: string;
//   kofukon: {
//     id: string;
//     name: string;
//   };
// }

// interface Announcement {
//   id: string;
//   title: string;
//   description: string;
//   noComments: number;
//   noParticipants: number;
//   likes: number;
//   isMember: boolean;
//   user: User;
//   createdAt: string;
//   campfire: CampfireDetails;
//   comments: Comment[];
//   post_reactions: Reaction[];
// }

interface BannedWord {
  id: string;
  word: string;
}

interface BannedDomain {
  id: string;
  domain: string;
}

interface BannedData {
  bannedTitleWords: BannedWord[];
  bannedBodyWords: BannedWord[];
  bannedDomains: BannedDomain[];
}

interface InitialState {
  campfireDetails: CampfireDetails | null;
  campfireMembers: CampfireMember[];
  campfireAnnouncements: Announcement[];
  campfireSearch: string;
  isCampfirePostsSearch: boolean;
  isCampfirePeopleSearch: boolean;
  isMemberModalOpen: boolean;
  postCampfireId: string;
  bannedData: BannedData;
}

const initialState: InitialState = {
  campfireDetails: null,
  campfireMembers: [],
  campfireAnnouncements: [],
  campfireSearch: '',
  isCampfirePostsSearch: false,
  isCampfirePeopleSearch: false,
  isMemberModalOpen: false,
  postCampfireId: '',
  bannedData: {
    bannedTitleWords: [],
    bannedBodyWords: [],
    bannedDomains: [],
  },
};

const campfireSlice = createSlice({
  name: 'campfire',
  initialState,
  reducers: {
    campfireFetchSuccess: (state, action) => {
      state.campfireDetails = action.payload;
    },
    setPicture: (state, action) => {
      if (state.campfireDetails) state.campfireDetails.picture = action.payload;
    },
    setCampfireSearch: (state, action) => {
      state.campfireSearch = action.payload;
    },
    setIsCampfirePostsSearch: (state, action) => {
      state.isCampfirePostsSearch = action.payload;
    },
    setIsCampfirePeopleSearch: (state, action) => {
      state.isCampfirePeopleSearch = action.payload;
    },
    setIsMemberModalOpen: (state, action) => {
      state.isMemberModalOpen = action.payload;
    },
    setPostCampfireId: (state, action) => {
      state.postCampfireId = action.payload;
    },
    assignAdminRole: (state, action) => {
      if (state.campfireDetails) {
        state.campfireDetails.isAdmin = false;
      }
      if (state.campfireMembers) {
        const adminObjIndex = state.campfireMembers.findIndex(
          (obj: { role: string }) => obj.role.toLowerCase() === 'admin',
        );
        state.campfireMembers[adminObjIndex].role = 'member';
        const objIndex = state.campfireMembers.findIndex(
          (obj: { user: { id: string } }) => obj.user.id === action.payload,
        );
        state.campfireMembers[objIndex].role = 'admin';
      }
    },
    removeUser: (state, action) => {
      if (state.campfireMembers) {
        const filteredCamfireMember = state.campfireMembers.filter(
          (obj: { user: { id: string } }) => obj.user.id !== action.payload,
        );
        state.campfireMembers = [...filteredCamfireMember];
      }
    },
    campfireMemberFetchSuccess: (state, action) => {
      state.campfireMembers = action.payload;
    },
    updateCampfire: (state, action) => {
      state.campfireDetails = { ...state.campfireDetails, ...action.payload };
    },
    updateFeedByAnnouncement: (state, action) => {
      const threadIndex = state.campfireAnnouncements.findIndex(
        (announcement: { id: string }) => announcement.id === action.payload.id,
      );
      if (threadIndex !== -1) {
        state.campfireAnnouncements[threadIndex] = action.payload;
      }
    },
    updateAnnouncements: (state, action) => {
      state.campfireAnnouncements.unshift(action.payload);
    },
    updateAnnouncementsArray: (state, action) => {
      const newAnnouncements = action.payload;
      const combinedAnnouncements = [...newAnnouncements];
      const uniqueAnnouncements = combinedAnnouncements.filter(
        (announcement, index, self) =>
          index === self.findIndex((a) => a.id === announcement.id),
      );
      state.campfireAnnouncements = uniqueAnnouncements;
    },
    resetAnnouncementsThread: (state) => {
      state.campfireAnnouncements = [];
    },
    updateCampfireCover: (state, action) => {
      if (state.campfireDetails)
        state.campfireDetails.coverPicture = action.payload;
    },
    setBannedData: (state, action) => {
      state.bannedData = action.payload;
    },
    resetBannedData: (state) => {
      state.bannedData = {
        bannedTitleWords: [],
        bannedBodyWords: [],
        bannedDomains: [],
      };
    },
  },
});

export const getCampfireSearch = (state: RootState) =>
  state.campfire.campfireSearch;
export const getIsMemberModalOpen = (state: RootState) =>
  state.campfire.isMemberModalOpen;

export const getIsCampfirePostsSearch = (state: RootState) =>
  state.campfire.isCampfirePostsSearch;
export const getIsCampfirePeopleSearch = (state: RootState) =>
  state.campfire.isCampfirePeopleSearch;

export const getCampfireId = (state: RootState) =>
  state.campfire.campfireDetails?.id;
export const getPostCampfireId = (state: RootState) =>
  state.campfire.postCampfireId;
export const getIsMember = (state: RootState) =>
  state.campfire.campfireDetails?.isMember;
export const getCampfireData = (state: RootState) =>
  state.campfire.campfireDetails;

export const getAnnouncements = (state: RootState) =>
  state.campfire.campfireAnnouncements;

export const getBannedData = (state: RootState) => state.campfire.bannedData;

export const {
  campfireFetchSuccess,
  setPicture,
  assignAdminRole,
  campfireMemberFetchSuccess,
  updateCampfire,
  removeUser,
  updateAnnouncements,
  updateAnnouncementsArray,
  updateFeedByAnnouncement,
  resetAnnouncementsThread,
  // updateMember,
  updateCampfireCover,
  setCampfireSearch,
  setIsCampfirePostsSearch,
  setIsCampfirePeopleSearch,
  setIsMemberModalOpen,
  setPostCampfireId,
  setBannedData,
  resetBannedData,
} = campfireSlice.actions;

export default campfireSlice;
