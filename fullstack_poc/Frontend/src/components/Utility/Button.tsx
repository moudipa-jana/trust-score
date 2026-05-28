{
  /**
   * Button is a flexible, styled button component with support for various visual types,
   * sizes, loading states, link routing, and full-width options.
   * Internally uses ButtonSpan for consistent styling across both <button> and <Link> usages.
   */
}
import Link from 'next/link';

import ButtonLoader from '@/components/Utility/ButtonLoader';

interface IButtonSpanProps {
  children: React.ReactNode;
  type?: string;
  size?: string;
  block?: boolean;
  textColor?: string;
  color?: string;
  width?: string;
  roundedlg?: boolean;
}
const ButtonSpan = ({
  children,
  type,
  size,
  block,
  textColor,
  color,
  width,
  roundedlg,
}: IButtonSpanProps) => {
  return (
    <div
      className={`btnClass ${roundedlg ? 'rounded-lg' : 'rounded-md'
        } text-center ${type == 'secondary'
          ? `border   border-primary 
           ${textColor ? textColor : 'text-primary'} bg-transparent`
          : type == 'light'
            ? `border-[1px]  border-gray-275 ${color ? color : 'bg-gray-275'}
           ${textColor ? textColor : 'text-black-275'} `
            : type == 'outline'
              ? `border border-primary bg-white py-1 px-4  ${textColor ? textColor : 'text-black-300'
              } `
              : type == 'borderRed'
                ? 'border border-red-400 bg-white py-1 px-4 text-red-400'
                : type == 'bgWhite'
                  ? 'bg-white text-blue-800'
                  : type == 'bgRed'
                    ? 'bg-red-400 text-white-100'
                    : type == 'bgDarkRed'
                      ? 'bg-error text-white-100'
                      : 'border border-transparent bg-primary text-white'
        } ${size == 'xxs'
          ? 'py-0 px-1 text-xs lg:px-2 lg:text-base'
          : size == 'xs'
            ? 'py-0 px-2 text-xs lg:px-4 lg:text-sm'
            : size == 'sm'
              ? 'py-1 px-4 text-sm'
              : size == 'base'
                ? 'text-base'
                : size == 'md'
                  ? 'w-24 py-2 px-4'
                  : size == 'lg'
                    ? 'py-2  px-4 text-sm lg:text-lg xl:px-8'
                    : `py-2 px-4 ${block ? 'text-sm lg:text-base' : 'text-sm lg:text-lg'
                    } `
        }
         ${block && 'w-full text-center'}  ${width}`}
    >
      {children}
    </div>
  );
};

interface IButtonProps {
  type?:
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'light'
  | 'bgWhite'
  | 'bgRed'
  | 'bgDarkRed'
  | 'borderRed'
  | string;
  legacyType?: 'button' | 'submit' | 'reset';
  size?: 'xxs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | string;
  link?: string;
  children: React.ReactNode;
  target?: string;
  block?: boolean;
  textColor?: string;
  color?: string;
  // eslint-disable-next-line no-unused-vars
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isdisabled?: boolean;
  isLoading?: boolean;
  customClassName?: string;
  width?: string;
  roundedlg?: boolean;
}
function Button({
  type,
  size,
  link,
  children,
  target,
  block,
  textColor,
  color,
  onClick,
  isdisabled,
  isLoading,
  legacyType,
  customClassName,
  width,
  roundedlg,
}: IButtonProps) {
  return link ? (
    <Link
      href={`${link}`}
      prefetch={false}
      target={target}
      className={`${customClassName ? customClassName : ''}`}
    >
      <ButtonSpan
        type={isdisabled ? 'light' : type}
        size={size}
        block={block}
        textColor={textColor}
        width={width}
        roundedlg={roundedlg}
      >
        {children}
      </ButtonSpan>
    </Link>
  ) : (
    <button
      className={`${block && 'w-full'} ${customClassName ? customClassName : ''
        }`}
      disabled={isdisabled}
      type={legacyType}
      onClick={onClick}
    >
      <ButtonSpan
        type={isdisabled ? 'light' : type}
        size={size}
        block={block}
        textColor={textColor}
        color={color}
        width={width}
        roundedlg={roundedlg}
      >
        {isLoading ? (
          <div className="flex justify-center">
            <ButtonLoader variant="circle" size="6" />

          </div>
        ) : (
          children
        )}
      </ButtonSpan>
    </button>
  );
}

export default Button;
