import Image from 'next/image';
import React from 'react';

interface LoadingIndicatorProps {
  style?: React.CSSProperties;
  className?: string;
  classNames?: Record<string, string>;
}

function LoadingIndicator({ style, className }: LoadingIndicatorProps) {
  return (
    <div style={style} className={className}>
      <Image
        src="/images/Loader_animation.gif"
        alt="Loading"
        width={24}
        height={24}
      />
    </div>
  );
}

const defaultstyle = {};

export default LoadingIndicator;
