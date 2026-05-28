import Image from 'next/image';
import { CSSProperties } from 'react';

import clsxm from '@/lib/clsxm';

interface LoaderProps {
  style?: CSSProperties;
  className?: string;
}

export default function LogoLoader({ style, className }: LoaderProps) {
  return (
    <Image
      src="/images/Loader_animation.gif"
      alt="Loading animation"
      width={500}
      height={500}
      style={style}
      quality={25}
      className={clsxm('max-md:h-[150px] max-md:w-[150px]', className)}
    />
  );
}

LogoLoader.defaultProps = {
  style: {},
};
