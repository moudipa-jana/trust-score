/**
 * useIsDesktop hook checks if the current screen width is at least 1280px (desktop size).
 * - It uses the useMediaQuery hook to determine if the screen size matches the desktop criteria.
 * - Returns `true` if the screen width is 1280px or greater, otherwise `false`.
 */

import { useMediaQuery } from '@react-hook/media-query';

export const useIsDesktop = () => {
  return useMediaQuery('(min-width: 1280px)');
};

export default useIsDesktop;
