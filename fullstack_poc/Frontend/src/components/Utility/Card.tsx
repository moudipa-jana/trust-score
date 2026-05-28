import Image from 'next/image';
import * as React from 'react';
import { MdOutlineAccessTime } from 'react-icons/md';

import { cn } from '@/components/Utility/utils';
import { validateImageUrl } from '@/lib/helpers';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('overflow-hidden rounded bg-gray-250', className)}
    {...props}
  />
));
Card.displayName = 'Card';
interface CardBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  roundedLeft?: boolean;
  border?: boolean;
  variant?: 'light' | 'dark';
  bgColor?: string;
  src?: string;
  alt?: string;
  title?: string;
  sizes?: string;
}
const CardBanner = React.forwardRef<HTMLDivElement, CardBannerProps>(
  (
    {
      className,
      src,
      alt = '',
      title,
      bgColor = '#fff',
      roundedLeft = false,
      sizes,
    },
    ref,
  ) => {
    return (
      <div
        className={`${className} relative h-full w-full overflow-hidden bg-black-50 ${roundedLeft ? 'rounded-l' : 'rounded-t'
          }`}
        ref={ref}
        style={{ backgroundColor: bgColor }}
      >
        {src ? (
          <Image
            unoptimized
            src={validateImageUrl(src)}
            alt={alt}
            fill
            className="object-cover"
            loading="lazy"
            sizes={
              sizes ||
              '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
          />
        ) : null}
      </div>
    );
  },
);

CardBanner.displayName = 'CardBanner';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: 'light' | 'dark';
  size?: 'base' | 'lg';
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, variant = 'light', size = 'base', ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        ' mb-3 line-clamp-2',
        {
          'text-black': variant === 'light',
          'text-white': variant === 'dark',
          'h-10 max-h-10 text-sm font-bold leading-5 xl:text-base':
            size === 'base',
          'h-19.5 max-h-19.5 font-extrabold leading-9 md:text-2xl xl:text-4xl':
            size === 'lg',
        },
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDate = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-gray-350 text-sm line-clamp-1', className)}
    {...props}
  />
));
CardDate.displayName = 'CardDate';

const CardTime = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div className="text-gray-350 flex items-center gap-1 ">
    <MdOutlineAccessTime />
    <div
      ref={ref}
      className={cn('text-gray-350  text-sm line-clamp-1', className)}
      {...props}
    />
  </div>
));
CardTime.displayName = 'CardTime';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardBanner,
  CardContent,
  CardDate,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTime,
  CardTitle,
};
