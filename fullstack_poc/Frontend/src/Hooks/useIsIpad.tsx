/**
 * useIsIpad hook checks if the current screen width is between 768px and 1279px (iPad-sized devices).
 * - It uses the useMediaQuery hook to determine if the screen size matches the iPad criteria.
 * - Returns `true` if the screen width is within the iPad range, otherwise `false`.
 */

import { useMediaQuery } from '@react-hook/media-query';

export const useIsipad = () => {
  return useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
};

export default useIsipad;
