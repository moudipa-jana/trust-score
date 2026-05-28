{
  /**
   * Alert displays contextual feedback messages with optional icons and close actions.
   * Supports different types like success, warning, and error for styling purposes.
   */
}
import { ReactNode } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

import Text from '@/elements/Text';

interface Ialert {
  isIcon?: boolean;
  title: string;
  type?: string;
  cancel?: () => void;
  children?: ReactNode;
}

function Alert({ isIcon, title, type, children, cancel }: Ialert) {
  return (
    <div className={`${type == 'success' ? ' py-0' : ''}`}>
      <div className="rounded-md bg-[#F8F8F8] px-6 py-5 ">
        <div className="flex items-start justify-between ">
          <div className="flex  items-center">
            {isIcon && (
              <div className="mr-2 ">
                {type === 'success' ? (
                  <FaCheckCircle className="text-[28px] text-green" />
                ) : (
                  children
                )}
              </div>
            )}
            <Text
              size="md"
              color={`${
                type == 'success'
                  ? 'text-black-200'
                  : type == 'warning'
                    ? 'text-warning'
                    : type == 'error'
                      ? 'text-error'
                      : 'text-black-200'
              }`}
            >
              {title}
            </Text>
          </div>
          {cancel && (
            <div className="flex items-end">
              <FaTimes />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alert;
