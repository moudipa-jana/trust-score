'use client';
{
  /**
   * CustomImage wraps Next.js's Image component with enhanced support for fallback images,
   * dynamic fill, optional styles, and backward compatibility for deprecated props like `layout` and `objectFit`.
   */
}

import { validateImageUrl } from '@/lib/helpers';
import Image, { StaticImageData } from 'next/image';
import { CSSProperties, useEffect, useState } from 'react';

interface Props {
  src: string | StaticImageData | undefined;
  height?: number;
  width?: number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  alt: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void; fill?: boolean;
  fallbackSrc?: string;

  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * Use `style` prop instead.
   *
   * @deprecated
   */
  objectFit?: string;
  /**
   * Use `fill` prop instead of `layout="fill"`.
   *
   * @deprecated
   */
  layout?: string; // @deprecated Use `style` prop instead
}
function CustomImage({
  alt,
  className,
  fill,
  fallbackSrc,
  height,
  layout,
  objectFit,
  priority,
  src,
  style,
  onClick,
  width,
  onError, // Pass the onError prop
}: Props) {
  const [imageSrc, setImageSrc] = useState<any>(src);
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };
  return (
    <div
      className="image-container"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick?.(e);
        }

      }}
    >

      <Image
        width={width}
        height={height}
        unoptimized
        src={validateImageUrl(imageSrc ?? '')}
        className={`image ${className} `}
        alt={alt}
        fill={fill}
        priority={priority ? true : false}
        objectFit={objectFit}
        layout={layout}
        style={style}
        onError={handleError}
      />
    </div>
  );
}

CustomImage.defaultProps = {
  alt: 'image',
};
export default CustomImage;
