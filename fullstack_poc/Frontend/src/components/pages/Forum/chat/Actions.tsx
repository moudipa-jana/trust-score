import React, { useEffect, useRef, useState } from 'react';

import verticalMenuIcon from '/public/images/Shape3dots.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';

import ActionList from './ActionsList.json';

interface ActionsProps {
  variant?: 'lg' | string;
  admin?: boolean;
}

interface ActionItem {
  id: number;
  title: string;
  icon: string;
}

function Actions({ variant, admin }: ActionsProps) {
  const [toggle, setToggle] = useState(false);
  const actionsList = admin ? ActionList.AdminList : ActionList.MenuList;

  const actionRefRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        toggle &&
        actionRefRef.current &&
        !actionRefRef.current.contains(e.target as Node)
      ) {
        setToggle(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [toggle]);
  return (
    <>
      <div
        ref={actionRefRef}
        className="cursor-pointer p-2"
        onClick={() => setToggle((oldState) => !oldState)}
      >
        <CustomImage src={verticalMenuIcon} alt="verticalMenu" />
      </div>
      {toggle && (
        <div
          className={` absolute  ${
            variant == 'lg' ? 'top-14 right-9' : 'top-8 right-4'
          }   z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-2" role="none">
            <ul>
              {actionsList.map((data: ActionItem) => {
                return (
                  <li
                    className="group block cursor-pointer  px-2 "
                    key={data.id}
                  >
                    <div className="flex justify-between rounded-md p-2 hover:bg-gray-100">
                      <Text size="sm" color="group-hover:text-primary">
                        {data.title}
                      </Text>
                      <div className=" group-hover:text-primary">
                        <span className={`${data.icon}`} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default Actions;
