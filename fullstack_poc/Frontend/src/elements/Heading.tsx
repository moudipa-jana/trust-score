import { useEffect } from 'react';

interface HeadingProps {
  priority: 1 | 2 | 3 | 4 | 5 | 6 | string;
  children: React.ReactNode;
  color?: string;
  font?: string;
  variant?:
    | 'base'
    | 'xl'
    | 'lg'
    | 'md'
    | 'xxl'
    | 'sm'
    | 'xs'
    | string
    | boolean;
  width?: string;
  clamp?: string;
  customClass?: string;
}

const Heading = ({
  priority,
  children,
  color,
  font,
  variant,
  width,
  clamp,
  customClass,
}: HeadingProps) => {
  const DynamicTag = `h${priority}` as keyof JSX.IntrinsicElements;
  useEffect(() => {
    const headings = document.querySelectorAll('.headingh3 h3');
    headings.forEach((heading) => {
      const computedHeight = window
        .getComputedStyle(heading)
        .getPropertyValue('height');
      (heading as HTMLElement).style.height = computedHeight;
      (heading as HTMLElement).style.margin = '0';
      (heading as HTMLElement).style.lineHeight = '1';
    });
  }, []);

  return (
    <DynamicTag
      className={` ${font ? `${font}` : 'font-bold'} ${
        priority == 1
          ? `${
              variant == 'base'
                ? 'text-base'
                : variant == 'xl'
                  ? 'text-5.5xl xl:text-7.5xl'
                  : variant == 'lg'
                    ? 'text-sm lg:text-4xl xl:text-5xl'
                    : variant == 'md'
                      ? 'text-lg lg:text-4.5xl'
                      : 'text-2xl lg:text-6xl'
            }`
          : priority == 2
            ? `${
                variant
                  ? variant == 'xxl'
                    ? 'text-2xl lg:text-4.5xl xl:text-5.5xl'
                    : variant == 'xl'
                      ? 'xl:text-4.5xl'
                      : variant == 'base'
                        ? 'text-base lg:text-4xl'
                        : 'text-lg'
                  : 'text-md lg:text-lg'
              }`
            : priority == 3
              ? `${variant ? 'text-4xl' : 'text-3xl '}`
              : priority == 4
                ? `${variant == 'lg' ? 'text-6xl' : 'text-2xl '}`
                : priority == 5
                  ? `${
                      variant == 'sm'
                        ? 'text-base'
                        : 'text-sm lg:text-base xl:text-md'
                    }`
                  : priority == 6 &&
                    `${variant == 'xs' ? 'text-xs' : 'text-sm'}`
      }
    ${color ? `${color}` : 'text-black'}
    ${width ? `${width}` : ''}
    ${clamp && `${clamp}`}
    ${customClass ? `${customClass}` : ''}
`}
    >
      {children}
    </DynamicTag>
  );
};

export default Heading;
