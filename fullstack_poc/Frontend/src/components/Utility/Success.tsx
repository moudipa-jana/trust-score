{
  /**
   * A success notification component displaying a title, message, and optional button.
   */
}
import Link from 'next/link';
import { useEffect } from 'react';

import LogoLoader from '@/components/Utility/LogoLoader';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import CustomImage from '@/components/Utility/CustomImage';

interface IProps {
  title: string;
  message?: string;
  name?: string;
  isActive?: boolean;
  buttonComponent?: React.ReactNode;
  delay?: number;
  autoClose?: () => void;
  src?: string;
  icon?: any;
}
function Success({
  title,
  message,
  name,
  src,
  isActive,
  autoClose,
  icon,
  buttonComponent,
  delay = 1000,
}: IProps) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive && autoClose) {
      timeoutId = setTimeout(() => {
        autoClose();
      }, delay);
    }

    // Cleanup function to clear timeout if component unmounts or dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, autoClose, delay]);

  return (
    <div className="text-center">
      {src && (
        <div className="flex justify-center">
          <div className="w-36 py-4 ">
            <Link href={src}>
              <LogoLoader />
            </Link>
          </div>
        </div>
      )}
      {!icon && !src && (
        <div className="flex justify-center">
          <div className="w-40 py-4 ">
            <LogoLoader />
          </div>
        </div>
      )}

      <Heading priority={src ? 3 : 2} variant>
        {title}
      </Heading>
      <div className="py-2">
        <Text size="base">
          {message}
          <span className="text-primary">{name}</span>
        </Text>
      </div>
      {icon && (
        <div className="flex justify-center">
          <div className="pt-8 ">
            <CustomImage src={icon} alt="Success Icon" width={110} height={110} className='!w-28 !h-28' />
          </div>
        </div>
      )}
      {buttonComponent && buttonComponent}
    </div>
  );
}

export default Success;
