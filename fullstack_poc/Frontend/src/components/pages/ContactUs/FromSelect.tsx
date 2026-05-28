import React, { useEffect, useRef, useState } from 'react';

const DownIcon = () => {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9372 0L5.99837 5.02711L1.06117 0.0016102L0 1.08176L6 7.2L12 1.08176L10.9372 0Z"
        fill="#737373"
      />
    </svg>
  );
};

const UpIcon = () => {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9372 8L5.99837 2.97289L1.06117 7.99839L0 6.91824L6 0.8L12 6.91824L10.9372 8Z"
        fill="#737373"
      />
    </svg>
  );
};

type DropdownProps = {
  label: string;
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const FormSelect = ({
  label,
  options,
  selectedValue,
  onChange,
  required = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="flex flex-col gap-1">
      <label className="font-display text-base font-semibold text-black-200">
        {label}{' '}
        {required && <span className="text-xs font-normal text-error">*</span>}
      </label>

      <div className="relative">
        <div
          className={`flex w-full cursor-pointer items-center justify-between border border-gray-600 px-3 py-2.5 text-base leading-5 ${
            selectedValue ? '' : 'text-gray-950'
          }`}
          onClick={toggleDropdown}
        >
          {selectedValue ? selectedValue : 'Gender'}
          {isOpen ? <UpIcon /> : <DownIcon />}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-10 mt-1 w-full border border-offwhite-100 bg-white shadow-md">
            <ul>
              {options.map((option) => (
                <li
                  key={option}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSelect;
