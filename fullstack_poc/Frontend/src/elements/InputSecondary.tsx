import { ChangeEvent, MouseEvent, RefObject, useState } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

import useIsMobile from '@/Hooks/useIsMobile';

interface InputProps {
  placeholder?: string;
  rounded?: boolean;
  required?: boolean;
  name?: string;
  password?: boolean;
  dark?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isIcon?: boolean;
  onCopy?: () => void;
  id?: string;
  outline?: boolean;
  ref?: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>;
  help?: boolean;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function Input({
  placeholder,
  rounded,
  required,
  name,
  password,
  dark,
  value,
  onChange,
  isIcon,
  onCopy,
  id,
  outline,
  ref,
  help,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleTogglePassword(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setShowPassword((prevState) => !prevState);
  }

  const isMobile = useIsMobile();

  const commonAttributes = {
    id,
    name,
    className: `${help && !isMobile ? 'p-4' : 'p-3'} ${
      dark ? 'border-gray-100 bg-gray-100 ' : 'bg-white'
    } border ${
      outline ? ' border-primary' : 'border-offwhite-100'
    }  text-black-200 placeholder-gray-950 resize-none ${
      rounded ? 'rounded-lg' : 'rounded'
    } ${isIcon ? ' pr-10' : ''} block w-full text-base focus:outline-none`,
    placeholder,
    required,
    value,
    onChange,
    ...props,
    autoComplete: 'false',
  };

  return !password ? (
    <div className="relative w-full">
      {isIcon && (
        <span
          className="absolute inset-y-0 right-2 flex cursor-pointer items-center pl-2"
          onClick={onCopy}
        >
          <MdOutlineContentCopy className="text-xl" />
        </span>
      )}

      {name === 'description' ? (
        <textarea
          ref={ref as RefObject<HTMLTextAreaElement>}
          {...commonAttributes}
        />
      ) : (
        <input ref={ref as RefObject<HTMLInputElement>} {...commonAttributes} />
      )}
    </div>
  ) : (
    <div className="relative w-full">
      <input
        ref={ref as RefObject<HTMLInputElement>}
        type={showPassword ? 'text' : 'password'}
        id={name}
        className="block w-full rounded border border-gray-600 bg-white p-3 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center px-2">
        <button onClick={handleTogglePassword}>
          {showPassword ? <VscEyeClosed /> : <VscEye />}
        </button>
      </div>
    </div>
  );
}

export default Input;
