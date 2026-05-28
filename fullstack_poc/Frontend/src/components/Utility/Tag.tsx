// Tag component renders a customizable tag with background, color, size, and click functionality; can be styled as a "chips" or "card" type.

import { MouseEvent } from 'react';

import Text from '@/elements/Text';

interface TagProps {
  bg?: string;
  color?: string;
  children: React.ReactNode;
  type?: 'chips' | 'card' | string;
  size?: string;
  isActive?: boolean;
  rounded?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

function Tag({
  bg,
  color,
  children,
  type,
  size,
  isActive,
  rounded,
  onClick,
}: TagProps) {
  return (
    <div
      onClick={onClick}
      className={` flex cursor-pointer items-center justify-center  self-start whitespace-nowrap ${
        rounded
          ? ' rounded-full border-[1px] py-1.5 px-4 text-center'
          : 'rounded-lg px-2 py-1 text-xs '
      } ${isActive ? 'border border-primary  bg-white' : 'text-primary'} ${bg}`}
    >
      <Text
        size={size ? size : 'xs'}
        color={` ${
          isActive && type == 'chips'
            ? 'text-primary'
            : isActive && type == 'card'
              ? 'text-primary'
              : 'text-gray-700 font-semibold'
        } ${color} `}
      >
        {children}
      </Text>
    </div>
  );
}

export default Tag;
