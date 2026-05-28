import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import createNoopStorage from '@/lib/noopStorage';
import rootReducer from '@/state/reducers';

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  // middleware: [thunk],
  whitelist: ['auth', 'necessary', 'profile'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';

export type AppDispatch = ThunkDispatch<
  ReturnType<typeof rootReducer>,
  any,
  AnyAction
>;
export default store;
