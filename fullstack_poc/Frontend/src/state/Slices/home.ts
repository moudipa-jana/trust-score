import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Kofukon } from '@/pages';
import { RootState } from '@/state/reducers';

interface InitialState {
  refreshHomeFeed: boolean;
  kofukons: Kofukon[];
}
const initialState: InitialState = {
  refreshHomeFeed: false,
  kofukons: [],
};

export const fetchKofukons = createAsyncThunk(
  'home/fetchKofukons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/kofukons');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setRefreshHomeFeed: (state, action) => {
      state.refreshHomeFeed = action.payload;
    },
    setKofukons: (state, action) => {
      state.kofukons = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchKofukons.fulfilled, (state, action) => {
      state.kofukons = action.payload;
    });
  },
});

export const getRefreshHomeFeed = (state: RootState) =>
  state.home.refreshHomeFeed;
export const getKofukons = (state: RootState) => state.home.kofukons;
export const { setRefreshHomeFeed, setKofukons } = homeSlice.actions;
export default homeSlice;
