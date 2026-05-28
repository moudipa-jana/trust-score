import { useMutation } from '@apollo/client/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import DownArrow from '/public/images/DownArrow.svg';
import HighAlert from '/public/images/HighAlert.svg';
import LowAlert from '/public/images/LowAlert.svg';
import OffAlert from '/public/images/OffAlert.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError, validateImageUrl } from '@/lib/helpers';
import { UPDATE_CAMPFIRE_NOTIFICATION_PREFS } from '@/service/graphql/Notifications';
import { getUserId } from '@/state/Slices/auth';
import { getUserToken } from '@/utils/verifyAuthentication';

interface CampfireData {
  campfireId: string;
  preference: string;
  campfire: {
    title: string;
    picture?: string;
    category?: {
      slug: string;
    };
  };
}

interface RenderItemProps {
  data: CampfireData;
  index: number;
  dropdownRef: React.RefObject<HTMLDivElement>;
  selectedOptions: { [key: string]: string };
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}

const RenderItem = ({
  data,
  index,
  dropdownRef,
  selectedOptions,
  setSelectedOptions,
}: RenderItemProps) => {
  const isMobile = useIsMobile();
  const id = data?.campfireId;
  const token = getUserToken();
  const userId = useAppSelector(getUserId);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

  const [updateCampfireNotificationPrefs] = useMutation(
    UPDATE_CAMPFIRE_NOTIFICATION_PREFS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        isDropdownVisible &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    },
    [isDropdownVisible, dropdownRef],
  );

  useEffect(() => {
    const handleClickOutsideGlobal = (event: MouseEvent) => {
      if (isDropdownVisible) {
        handleClickOutside(event);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideGlobal);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideGlobal);
    };
  }, [isDropdownVisible, handleClickOutside]);

  const handleOptionClick = (option: string) => {
    const updatedSelectedOptions = { ...selectedOptions, [id]: option };
    setSelectedOptions(updatedSelectedOptions);
    toggleDropdown();
    updateCampfireNotificationPrefs({
      variables: {
        campfireId: id,
        preference: option.toUpperCase(),
        userId,
      },
    });
  };

  return (
    <div key={index.toString()} className="mb-2 rounded-md px-2">
      <div className="mx-auto">
        <div className="flex items-center rounded-md p-2">
          <Link
            href={`/campfire/${encodeURI(data?.campfire?.title)}`}
            className={`flex w-full items-center justify-between ${isMobile ? 'gap-1' : 'gap-4'
              }`}
          >
            {data?.campfire?.picture ? (
              <div
                className={` ${isMobile ? 'h-7 w-7' : 'h-16 w-16'
                  }  rounded-full`}
              >
                <Image
                  className="h-full w-full object-cover"
                  src={validateImageUrl(data?.campfire?.picture)}
                  alt={data?.campfire?.title}
                  width={16}
                  height={16}
                  unoptimized
                />
              </div>
            ) : null}
            <div className="flex-1">
              <Text size={isMobile ? 'xs' : 'sm'} color="text-black">
                {data?.campfire?.title}
              </Text>
              <Text size={isMobile ? 'xs' : 'sm'} color="text-gray-500">
                {data?.campfire?.category?.slug}
              </Text>
            </div>
          </Link>
          <div className="relative flex items-center">
            <div
              className={`flex ${isMobile ? 'w-12' : 'w-15 pr-2'
                } flex-row items-center`}
            >
              <div className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} pr-1`}>
                {selectedOptions[id] === 'High' ? (
                  <CustomImage src={HighAlert} />
                ) : selectedOptions[id] === 'Low' ? (
                  <CustomImage src={LowAlert} />
                ) : (
                  <CustomImage src={OffAlert} />
                )}
              </div>
              <Text
                size={isMobile ? 'xs' : 'sm'}
                color="text-gray-500"
                customClass={" {isMobile ? 'mr-1' : 'mr-2'} capitalize"}
              >
                {selectedOptions[id]}
              </Text>
            </div>

            <div
              onClick={toggleDropdown}
              className={`${isMobile ? 'h-4 w-4' : 'h-7 w-7'
                }  cursor-pointer focus:outline-none`}
            >
              <CustomImage src={DownArrow} />
            </div>

            {isDropdownVisible ? (
              <div
                ref={dropdownRef}
                className="absolute right-0 z-10 mt-2 w-auto rounded-md bg-white shadow-lg"
              >
                <div key={id} className="py-1">
                  {['High', 'Low', 'Off'].map((item: string, idx: number) => {
                    return (
                      <div
                        key={idx.toString()}
                        className="flex cursor-pointer flex-row items-center p-2 hover:bg-gray-100"
                        onClick={() => handleOptionClick(item)}
                      >
                        <div className="h-7 w-7">
                          <CustomImage
                            src={
                              item === 'High'
                                ? HighAlert
                                : item === 'Low'
                                  ? LowAlert
                                  : OffAlert
                            }
                          />
                        </div>
                        <div
                          className={`w-full px-2 text-left text-gray-700
                        ${isMobile ? 'text-xs' : 'text-sm'}
                      `}
                        >
                          {item}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderItem;
