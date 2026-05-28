/**
 * useIsMobile hook checks if the current screen width is 767px or less (mobile-sized devices).
 * - It uses the useMediaQuery hook to determine if the screen size matches the mobile criteria.
 * - Returns `true` if the screen width is 767px or less, otherwise `false`.
 */

import { useMediaQuery } from '@react-hook/media-query';

export const useIsMobile = () => {
  return useMediaQuery('(max-width: 767px)');
};

export default useIsMobile;
