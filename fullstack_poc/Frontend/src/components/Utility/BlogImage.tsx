{
  /**
   * BlogImage is a wrapper around Next.js Image that supports a fallback image on error.
   * It ensures graceful image degradation and retains all standard ImageProps functionality.
   */
}
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

import clsxm from '@/lib/clsxm';
import { validateImageUrl } from '@/lib/helpers';

type BlogImageProps = ImageProps & {
  fallbackSrc?: string;
};

export default function BlogImage({
  src,
  alt,
  fallbackSrc = '/images/blog/blog_fallback_1.png',
  className,
  ...props
}: BlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState<any>(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={validateImageUrl(currentSrc ?? src)}
      alt={alt}
      className={clsxm(className)}
      onError={() => setCurrentSrc(fallbackSrc)}
      unoptimized
    />
  );
}
