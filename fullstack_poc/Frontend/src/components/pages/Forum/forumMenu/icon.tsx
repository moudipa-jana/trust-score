import { StaticImageData } from 'next/image';
import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';

interface IconProps {
  icon: string | StaticImageData;
  noMargin?: boolean;
  mobMenu?: boolean;
  posts?: boolean;
}

function Icon({ icon, noMargin, mobMenu, posts }: IconProps) {
  return (
    <div
      className={`relative ${
        noMargin
          ? 'mr-0 h-5 w-5 xl:h-7 xl:w-7'
          : mobMenu
            ? 'h-4 w-4'
            : posts
              ? 'mr-3 h-9 w-9'
              : 'mr-1 h-5 w-5 md:w-3.5 lg:h-3.5 xl:mr-2 xl:h-7.5 xl:w-7.5'
      }`}
    >
      <CustomImage src={icon} />
    </div>
  );
}

export default Icon;
