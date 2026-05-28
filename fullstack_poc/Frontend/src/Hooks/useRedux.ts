/**
 * Custom hooks for using Redux state and dispatch with type safety.
 *
 * - `useAppDispatch`: Returns the `dispatch` function typed with `AppDispatch` for dispatching actions.
 * - `useAppSelector`: A typed version of `useSelector` that provides state selection with the `RootState` type for state access.
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/state/reducers';
import { AppDispatch } from '@/state/store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
