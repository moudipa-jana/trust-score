/**
 * CardContainer Component
 *
 * A flexible layout wrapper for cards with optional styles, alerts, and layout variants.
 * Supports border, padding, background color, and embedded alerts.
 */

// Disable prop-types as we're using TypeScript interfaces

import Alert from '@/components/Utility/Alert';
import clsxm from '@/lib/clsxm';

interface CardContainerProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'vertical' | 'horizontal' | 'lg' | 'sm' | 'xl' | string;
  alert?: boolean;
  alertTitle?: string;
  alertIcon?: boolean;
  alertType?: string;
  isBorder?: boolean;
  roundBorder?: string;
  flow?: string;
  height?: string;
  isBorderRadius?: boolean;
  className?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  color,
  variant,
  alert,
  alertTitle,
  alertIcon,
  alertType,
  isBorder,
  roundBorder,
  flow,
  height,
  isBorderRadius,
  className,
}) => {
  return (
    <div
      className={clsxm(
        `card relative  ${isBorder && 'border-[1px] border-primary'} 
       ${isBorderRadius && 'rounded-xl'} ${color ? `${color}` : 'bg-transparent'}
      ${variant == 'vertical' && flow == 'column' && 'flex flex-col'}
      ${height && `${height}`}
      ${roundBorder && `${roundBorder}`}
      ${
        variant == 'vertical'
          ? 'p-0 rounded bg-[#EDEDED] max-w-[387px]'
          : variant == 'horizontal'
            ? ' p-0'
            : variant == 'lg'
              ? 'rounded-lg p-4  lg:p-8'
              : variant == 'sm'
                ? 'rounded-md p-2'
                : variant == 'xl'
                  ? 'p-3 lg:px-3 lg:py-4 xl:p-3'
                  : 'rounded-md p-3'
      }
    `,
        className,
      )}
    >
      {alert && (
        <div className="py-4">
          <Alert
            type={alertType}
            title={alertTitle as string}
            isIcon={alertIcon as boolean}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default CardContainer;
