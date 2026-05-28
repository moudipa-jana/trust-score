/**
 * useOSDetection hook detects the operating system of the user's device.
 * - Sets `isWindows` to true if the device is running Windows.
 * - Sets `isMacOS` to true if the device is running macOS.
 * - Runs the detection once on mount and updates the state accordingly.
 */

import { useEffect, useState } from 'react';

const useOSDetection = () => {
  const [isWindows, setIsWindows] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    const detectOS = () => {
      const platform = navigator.platform;
      setIsWindows(platform.includes('Win'));
      setIsMacOS(platform.includes('Mac'));
    };

    detectOS();
  }, []);

  return { isWindows, isMacOS };
};

export default useOSDetection;
