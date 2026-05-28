interface TextProps {
  size?:
    | 'xxl'
    | 'md'
    | 'xl'
    | 'xs'
    | 'sm'
    | 'xsm'
    | 'base'
    | '3xl'
    | '2xl'
    | 'lg'
    | 'xxs'
    | string;
  children?: React.ReactNode;
  color?: string;
  font?: 'bold' | 'regular' | 'font-semibold' | string;
  variant?: boolean;
  customClass?: string;
  italic?: 'italic' | 'non-italic' | string;
  participant?: boolean;
  like?: boolean;
}

function Text({
  size,
  children,
  color,
  font,
  variant,
  customClass,
  italic,
  participant,
  like,
}: TextProps) {
  return (
    <div
      className={` lineHeight font-display ${customClass} 
      ${font == 'bold' ? 'font-bold' : 'font-regular'} 
      ${italic == 'italic' ? 'italic' : 'non-italic'}
      ${
        size == 'xxl'
          ? `${variant ? 'text-6xl' : 'text-4xl'}`
          : size == 'md'
            ? 'text-sm lg:text-lg '
            : size == 'xl'
              ? `${variant ? 'text-sm lg:text-lg' : 'text-4xl'}`
              : size == 'xs'
                ? `${variant ? 'text-xs lg:text-base' : 'text-xs'}`
                : size == 'sm'
                  ? `${
                      variant
                        ? 'text-md lg:text-4xl'
                        : like
                          ? 'text-[12px] lg:text-sm'
                          : 'text-sm'
                    }`
                  : size == 'xsm'
                    ? 'text-xxs lg:text-sm'
                    : size == 'base'
                      ? `${
                          variant
                            ? 'text-lg lg:text-4.5xl xl:text-5.5xl'
                            : 'text-sm xl:text-base'
                        }`
                      : size == '3xl'
                        ? `${
                            variant
                              ? 'text-lg lg:text-5.5xl'
                              : participant
                                ? 'text-[12px] lg:text-base'
                                : 'text-base'
                          }`
                        : size == '2xl'
                          ? `${variant ? 'text-2xl' : 'text-sm lg:text-base xl:text-lg '}`
                          : size == 'lg'
                            ? `${variant ? 'text-sm lg:text-lg xl:text-2xl' : 'text-xl'}`
                            : size == 'xxs'
                              ? 'text-xxs'
                              : 'text-md '
      }
         ${color}
         ${font}
       `}
    >
      {children}
    </div>
  );
}

export default Text;
