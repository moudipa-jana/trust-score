import {
  createAsyncThunk,
  createSlice,
  SerializedError,
} from '@reduxjs/toolkit';

import { UserFollowing } from '@/actions/auth';
import { BookmarkPost } from '@/components/pages/Profile/ProfileBookmark';
import { RootState } from '@/state/reducers';
import { UserProfile } from '@/types/authentication';
import { CardTypeEnum } from '@/types/enums';

interface LoginResponse {
  login: {
    accessToken: string;
    profile: UserProfile;
  };
}

interface Iauth {
  authLoading: boolean;
  error: SerializedError | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: UserProfile | null;
  token: string;
  loginType: string | null;
  userFollowings: UserFollowing[];
  userBookmarks: BookmarkPost[];
}

const initialState: Iauth = {
  authLoading: false,
  error: null,
  isAuthenticated: false,
  isLoading: false,
  profile: null,
  token: '',
  loginType: null,
  userFollowings: [],
  userBookmarks: [],
};

export const Asynclogin = createAsyncThunk<
  { token: string; profile: UserProfile },
  {
    email: string;
    password: string;
    signin: (options: {
      variables: { email: string; password: string };
    }) => Promise<{ data: LoginResponse }>;
  },
  { rejectValue: string }
>('auth/login', async ({ email, password, signin }) => {
  try {
    const { data } = await signin({
      variables: { email, password },
    });
    return { token: data.login.accessToken, profile: data.login.profile };
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error((error as any).message);
    }
    throw new Error(error as string);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => initialState,
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserProfile: (state, action) => {
      state.profile =
        { ...state.profile, ...action.payload };
    },
    updateUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateUserProfilePicture: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    toggleAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.loginType = action.payload.loginType || null;
      state.isAuthenticated = true;
      state.authLoading = false;
    },
    singupSuccess: (state, action) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.isAuthenticated = true;
      state.authLoading = false;
    },
    socialAuthSuccess: (state, action) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.loginType = action.payload.loginType || null;
      state.isAuthenticated = true;
      state.authLoading = false;
    },
    fetchFollowings: (state, action) => {
      state.userFollowings = action.payload;
    },
    followersCount: (state, action) => {
      if (state.profile) state.profile.followersCount = action.payload;
    },
    decreaseFollowersCount: (state) => {
      if (state.profile && state.profile.followersCount > 0) {
        state.profile.followersCount -= 1;
      }
    },
    followingCount: (state, action) => {
      if (state.profile) state.profile.followingCount = action.payload;
    },
    followUserSuccess: (state, action) => {
      state.userFollowings.unshift(action.payload);
      if (state.profile) state.profile.followingCount += 1;
    },
    unFollowSuccess: (state) => {
      if (state.profile && state.profile.followingCount > 0) {
        state.profile.followingCount -= 1;
      }
    },
    decreaseActivePostCount: (state) => {
      if (state.profile && (state.profile?.noActivities?.totalCount ?? 0) > 0) {
        state.profile = {
          ...state.profile,
          noActivities: {
            ...state.profile?.noActivities,
            totalCount: (state.profile?.noActivities?.totalCount ?? 0) - 1,
          },
        };
      }
    },
    decreaseHiddenPostCount: (state, action) => {
      if (state?.profile) {
        const count =
          state.profile.noHidden.aggregate.count +
          state.profile.noHiddenComments.aggregate.count;
        if (
          state.profile?.noHiddenComments.aggregate &&
          action.payload.type === CardTypeEnum.comment
        ) {
          if (count > 0) {
            state.profile.noHiddenComments.aggregate.count -= 1;
          }
        }
        if (
          state.profile?.noHidden.aggregate &&
          action.payload.type !== CardTypeEnum.comment
        ) {
          if (count > 0) {
            state.profile.noHidden.aggregate.count -= 1;
          }
        }
      }
    },
    increaseHiddenPostCount: (state, action) => {
      if (state?.profile) {
        const count =
          state.profile.noHidden.aggregate.count +
          state.profile.noHiddenComments.aggregate.count;
        if (
          state.profile?.noHiddenComments.aggregate &&
          action.payload.type === CardTypeEnum.comment
        ) {
          if (count >= 0) {
            state.profile.noHiddenComments.aggregate.count += 1;
          }
        }
        if (
          state.profile?.noHidden.aggregate &&
          action.payload.type !== CardTypeEnum.comment
        ) {
          if (count >= 0) {
            state.profile.noHidden.aggregate.count += 1;
          }
        }
      }
    },
    increaseActivePostCount: (state) => {
      if (state.profile)
        state.profile = {
          ...state.profile,
          noActivities: {
            ...state.profile?.noActivities,
            totalCount: (state.profile?.noActivities?.totalCount ?? 0) + 1,
          },
        };
    },
    genderUpdateSuccess: (state, action) => {
      if (state.profile) {
        state.profile.gender = action.payload;
      }
    },
    countryUpdateSuccess: (state, action) => {
      if (state.profile) {
        state.profile.country = action.payload;
      }
    },
    updateIsVerified: (state, action) => {
      if (state.profile) {
        state.profile.isVerified = action.payload;
      }
    },
    updateEmailSuccess: (state, action) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.loginType = action.payload.loginType || state.loginType;
      state.isAuthenticated = true;
      state.authLoading = false;
    },
    blockUserSuccess: (state, action) => {
      const blockedUserId = action.payload;
      const isFollowing = state.userFollowings.some(
        (follower) => follower.id === blockedUserId,
      );
      if (isFollowing) {
        state.userFollowings = state.userFollowings.filter(
          (follower) => follower.id !== blockedUserId,
        );
        if (state.profile && state.profile.followingCount > 0) {
          state.profile.followingCount -= 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(Asynclogin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(Asynclogin.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.profile = action.payload.profile;
      state.error = null;
      state.isAuthenticated = true;
      state.isLoading = false;
    });
    builder.addCase(Asynclogin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as SerializedError;
    });
  },
});

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectGetToken = (state: RootState) => state.auth.token;
export const selectGetUserProfile = (state: RootState) => state.auth.profile;
export const selectLoginType = (state: RootState) => state.auth.loginType;
export const getUserProfile = (state: RootState) => state.profile;
export const getUserId = (state: RootState) => state.auth.profile?.id;
export const getCurrentUserName = (state: RootState) =>
  state.auth.profile?.name;
export const {
  logout,
  setToken,
  setUserProfile,
  toggleAuthLoading,
  socialAuthSuccess,
  followUserSuccess,
  loginSuccess,
  singupSuccess,
  fetchFollowings,
  unFollowSuccess,
  increaseHiddenPostCount,
  decreaseHiddenPostCount,
  increaseActivePostCount,
  decreaseActivePostCount,
  genderUpdateSuccess,
  countryUpdateSuccess,
  updateUserProfile,
  followersCount,
  decreaseFollowersCount,
  followingCount,
  updateUserProfilePicture,
  updateIsVerified,
  updateEmailSuccess,
  blockUserSuccess,
} = authSlice.actions;

export default authSlice;
