import Text from '@/elements/Text';

interface ForumCardContainerProps {
  children?: React.ReactNode;
  color?: string;
  variant?: string;
  isBorder?: boolean;
  isDisable?: boolean;
  disableMessage?: string;
}

export default function ForumCardContainer({
  children,
  color,
  variant,
  isBorder,
  isDisable,
  disableMessage = 'This content has been disabled',
}: ForumCardContainerProps) {
  return (
    <div
      className={`card relative  ${isBorder && 'border-[1px]'}  ${color ? `bg-transparent` : 'bg-transparent'} 
      ${
        variant == 'vertical'
          ? 'p-0'
          : variant == 'horizontal'
            ? 'p-0'
            : variant == 'lg'
              ? 'rounded-lg p-20  lg:p-0'
              : variant == 'sm'
                ? 'rounded-md p-0'
                : 'rounded-md p-0 lg:p-0'
      }
    `}
    >
      {isDisable && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <Text color="text-black" size="lg">
            {disableMessage}
          </Text>
        </div>
      )}
      <div className={isDisable ? 'pointer-events-none blur-sm' : ''}>
        {children}
      </div>
    </div>
  );
}
