import { useQuery } from '@apollo/client/react';
import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import { GET_CONTACT_REASONS } from '@/service/graphql/contact';
import { ContactReason } from '@/types/contactus';

type ContactDropDownProps = {
  selectedReason: string;
  setSelectedReason: (reason: string) => void;
  setSelectedReasonId: (id: string) => void;
};
const ContactDropDown = ({
  selectedReason,
  setSelectedReason,
  setSelectedReasonId,
}: ContactDropDownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const { data: reasonData } = useQuery(GET_CONTACT_REASONS);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelect = (item: ContactReason) => {
    setSelectedReason(item.reason);
    setSelectedReasonId(item.id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex max-w-[508px] flex-col gap-1">
      <h3 className="flex items-center gap-1 font-display text-base leading-6 text-[#272727]">
        Reason <span className="text-[#FF4343]">*</span>
      </h3>
      <div ref={dropdownRef}>
        <div
          className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#D4D4D4] bg-[#EDEDED] p-3"
          onClick={toggleDropdown}
        >
          <span
            className={`font-display text-base leading-6 ${
              !selectedReason ? 'text-[#959595]' : 'text-black'
            }`}
          >
            {selectedReason || 'Choose a reason for contacting us'}
          </span>
          <Image
            src={
              isDropdownOpen
                ? '/images/contactus/dropdown-up.svg'
                : '/images/contactus/dropdownfilled.svg'
            }
            alt="dropdown"
            height={6}
            width={9}
          />
        </div>

        <div
          className={classNames(
            'absolute z-10 w-full transition-all duration-200 ease-in-out',
            {
              'scale-y-0 opacity-0': !isDropdownOpen,
              'scale-y-100 opacity-100': isDropdownOpen,
            },
          )}
          style={{
            transformOrigin: 'top',
            display: isDropdownOpen ? 'block' : 'none',
          }}
        >
          <div className="shadow-EmailPresetShadow flex flex-col gap-5 overflow-y-auto rounded-[4px] bg-[#F4F4F4] p-3">
            {(reasonData as any)?.contact_us_reasons?.map(
              (item: ContactReason) => (
                <div
                  key={item?.id}
                  onClick={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <button className="w-full text-left font-display text-base leading-6 text-black">
                    {item?.reason}
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDropDown;
