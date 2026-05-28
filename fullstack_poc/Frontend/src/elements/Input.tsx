import { MouseEvent, useState } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

import useIsMobile from '@/Hooks/useIsMobile';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  rounded?: boolean;
  required?: boolean;
  type?: string;
  name?: string;
  password?: boolean;
  dark?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  isIcon?: boolean;
  onCopy?: () => void;
  id?: string;
  outline?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  help?: boolean;
  customClass?: string;
}

function Input({
  placeholder,
  rounded,
  required,
  type,
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
  customClass,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleTogglePassword(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setShowPassword((prevState) => !prevState);
  }
  const isMobile = useIsMobile();

  const commonAttributes = {
    ref,
    type,
    id,
    name,
    className: `${help && !isMobile ? 'p-4' : 'p-2.5'} ${
      dark ? 'border-gray-100 bg-gray-100 ' : 'bg-white'
    } border ${
      outline ? ' border-primary' : 'border-offwhite-100'
    }  text-black-200 placeholder-gray-700 ${
      rounded ? 'rounded-lg' : 'rounded-sm '
    } ${isIcon ? ' pr-10' : ''} block w-full text-base focus:outline-none ${customClass || ''}`,
    placeholder,
    required,
    value,
    onChange,
    ...props,
    autoComplete: 'false',
  };

  const inputAttributes = {
    ref,
    type,
    id,
    name,
    className: commonAttributes.className,
    placeholder,
    required,
    value,
    onChange,
    ...props,
    autoComplete: 'false',
  };

  const textareaAttributes = {
    id,
    name,
    className: commonAttributes.className,
    placeholder,
    required,
    value,
    onChange,
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
        <textarea {...textareaAttributes} />
      ) : (
        <input {...inputAttributes} />
      )}
    </div>
  ) : (
    <div className="relative w-full">
      <input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        id={name}
        className={`block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none ${customClass || ''}`}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
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
