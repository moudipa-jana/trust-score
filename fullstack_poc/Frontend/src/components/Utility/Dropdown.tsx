{
  /**
   * Dropdown is a customizable select input supporting single or multi-select, search, suggestions,
   * and various styling options. It handles option selection, input filtering, tag removal,
   * and integration with external handlers like category suggestions.
   */
}
import lowerCase from 'lodash/lowerCase';
import React, { useEffect, useRef, useState } from 'react';

import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import { Department, EmploymentType, Location } from '@/types/enums';
import { activitiesProfileOption } from '@/types/profile';

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

const CloseIcon = () => {
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

export type DropdownValue =
  | string
  | {
    sort: { createdAt: string };
    username?: string;
    upVoted?: boolean[];
    downVoted?: boolean[];
  }
  | {
    sort: {
      createdAt: string;
    };
    username?: string;
    upVoted?: boolean[];
    downVoted?: boolean[];
  }
  | Department
  | Location
  | EmploymentType;

export type DropdownOptionType = {
  value: DropdownValue;
  label: string;
};

interface IProps {
  placeHolder?: string;
  options: DropdownOptionType[];
  isMulti?: boolean;
  isLabel?: boolean;
  isSearchable?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: DropdownOptionType | DropdownOptionType[]) => void;
  color?: string;
  checkbox?: boolean;
  textCenter?: boolean;
  rounded?: boolean;
  // eslint-disable-next-line no-unused-vars
  handleCategorySuggestion?: (value: string) => void;
  defaultOption?: DropdownOptionType;
  type?: string;
  width?: string;
}

const Dropdown = ({
  placeHolder,
  options,
  isMulti,
  isLabel,
  isSearchable,
  onChange,
  color,
  checkbox,
  textCenter,
  rounded,
  handleCategorySuggestion,
  defaultOption,
  type,
  width,
}: IProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedValue, setSelectedValue] = useState<
    DropdownOptionType | DropdownOptionType[] | null
  >(isMulti ? [] : null);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultOption) {
      setSelectedValue(defaultOption);
    }
  }, [defaultOption]);

  useEffect(() => {
    setSearchValue('');
    if (showMenu && searchRef.current) {
      searchRef.current.focus();
    }
    document
      .getElementById('car')
      ?.addEventListener('click', function (e: MouseEvent) {
        e.stopPropagation();
      });
  }, [showMenu]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('click', handler);
    };
  });
  const handleInputClick = () => {
    setShowMenu(!showMenu);
  };
  const removeOption = (option: DropdownOptionType) => {
    return (selectedValue as DropdownOptionType[]).filter(
      (o) => o.value !== option.value,
    );
  };
  const onTagRemove = (
    e: React.MouseEvent<HTMLSpanElement>,
    option: DropdownOptionType,
  ) => {
    e.stopPropagation();
    const newValue = removeOption(option) as DropdownOptionType[];
    setSelectedValue(newValue);
    onChange(newValue);
  };

  const checkValidSuggestion = () => {
    if (searchValue.trim()) {
      return !options.some(
        (option) => lowerCase(option.label) === lowerCase(searchValue).trim(),
      );
    }
    return false;
  };
  const isValidSuggestion = checkValidSuggestion();
  const getDisplay = () => {
    if (
      !selectedValue ||
      (selectedValue as DropdownOptionType[]).length === 0
    ) {
      return placeHolder;
    }
    if (isMulti) {
      return (
        <div className="dropdown-tags ">
          {(selectedValue as DropdownOptionType[]).map(
            (option: DropdownOptionType) => (
              <div key={option.value as string} className="dropdown-tag-item">
                {option.label}
                <span
                  onClick={(e) => onTagRemove(e, option)}
                  className="dropdown-tag-close"
                >
                  <CloseIcon />
                </span>
              </div>
            ),
          )}
        </div>
      );
    }
    return (selectedValue as DropdownOptionType).label;
  };

  const onItemClick = (option: DropdownOptionType) => {
    let newValue: DropdownOptionType | DropdownOptionType[];
    if (isMulti) {
      const currentValue = selectedValue as
        | DropdownOptionType[]
        | activitiesProfileOption[];
      if (currentValue.findIndex((o) => o.value === option.value) >= 0) {
        newValue = removeOption(option) as
          | DropdownOptionType[]
          | activitiesProfileOption[];
      } else {
        newValue = [...currentValue, option] as
          | DropdownOptionType[]
          | activitiesProfileOption[];
      }
    } else {
      newValue = option;
    }
    setSelectedValue(newValue);
    onChange(newValue);
  };

  const isSelected = (option: DropdownOptionType | activitiesProfileOption) => {
    if (isMulti) {
      return (
        (selectedValue as DropdownOptionType[]).filter(
          (o: DropdownOptionType) => o.value === option.value,
        ).length > 0
      );
    }

    if (!selectedValue) {
      return false;
    }

    return (selectedValue as DropdownOptionType).value === option.value;
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Filter out special characters, but allow spaces anywhere
    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, '');
    setSearchValue(filteredValue);
  };

  const getOptions = () => {
    if (!searchValue) {
      return options;
    }

    return options.filter(
      (option: DropdownOptionType | activitiesProfileOption) =>
        option.label.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0,
    );
  };

  return (
    <div
      className={` relative  ${width} border-[1px]  ${type == 'md' ? ' rounded-md px-2' : 'p-0'
        } ${color ? color : ' cursor-pointer  border-primary'} ${rounded ? 'rounded' : ''
        }  text-left  ${showMenu ? 'z-50' : ''}`}
      ref={dropdownRef}
    >
      <div
        ref={inputRef}
        onClick={handleInputClick}
        className={`dropdown-input flex items-center ${textCenter ? 'justify-center' : 'justify-between'
          }  text-center`}
      >
        <div className="dropdown-selected-value mr-2 text-black-800">
          {isLabel && <span className="labelSpec">Sort By</span>}
          <span>{getDisplay()}</span>
        </div>
        <div
          className={`${!showMenu ? '' : 'hidden'} ${width && 'absolute right-4'
            }`}
        >
          <DownIcon />
        </div>
        <div
          className={`${!showMenu ? 'hidden' : ''} ${width && 'absolute right-4'
            }`}
        >
          <UpIcon />
        </div>
      </div>
      {showMenu && (
        <div className="dropdown-menu top-12  border-none  shadow-xl ">
          {isSearchable && (
            <div className="  sticky top-0 border-b-[1px] border-gray-400 bg-white p-2">
              <div className=" sticky top-0 outline-none">
                <form className="flex items-center ">
                  <label htmlFor="voice-search" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full">
                    <div className=" absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      onChange={onSearch}
                      value={searchValue}
                      ref={searchRef}
                      id="voice-search"
                      className="block w-full rounded-lg  border-none  p-2.5 pl-10 text-base text-black-800 outline-none placeholder:text-gray-600 focus:bg-none"
                      placeholder="Search categories"
                      required
                      autoComplete="false"
                    />
                  </div>
                  <div className=" inline-flex cursor-pointer items-center">
                    <div className="mr-2" onClick={() => setSearchValue('')}>
                      <svg
                        width="12"
                        height="13"
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 5.16667L1.33333 0.5L0 1.83333L4.66667 6.5L0 11.1667L1.33333 12.5L6 7.83333L10.6667 12.5L12 11.1667L7.33333 6.5L12 1.83333L10.6667 0.5L6 5.16667Z"
                          fill="#737373"
                        />
                      </svg>
                    </div>

                    <Button
                      type={isValidSuggestion ? 'secondary' : 'light'}
                      size="sm"
                      textColor={
                        isValidSuggestion ? 'text-primary' : 'text-gray-200'
                      }
                      color="bg-white"
                      isdisabled={!isValidSuggestion}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        if (handleCategorySuggestion) {
                          handleCategorySuggestion(searchValue.trim());
                          setShowMenu(false);
                        }
                      }}
                    >
                      Suggest
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {getOptions().map(
            (option: DropdownOptionType | activitiesProfileOption) => (
              <div
                onClick={() => {
                  setShowMenu(false);
                  onItemClick(option as DropdownOptionType);
                }}
                key={option.value as string}
                className={`dropdown-item p-4 ${isSelected(option) && 'selected'
                  }`}
              >
                {checkbox && (
                  <span className=" mr-2">
                    <input
                      type="checkbox"
                      role="checkbox"
                      checked={selectedValue === option ? true : false}
                      className="h-4  w-4 accent-primary"
                      name=""
                      id=""
                      autoComplete="false"
                    />
                  </span>
                )}
                <Text size="sm" color="text-black-200">
                  {' '}
                  {option.label}
                </Text>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
