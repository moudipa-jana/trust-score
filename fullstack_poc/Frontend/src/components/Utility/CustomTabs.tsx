{
  /**
   * CustomTabs is a flexible tab component that supports both standard and search-based tab layouts.
   * It handles active tab state, hash-based routing, optional tab icons, and renders content conditionally.
   */
}
import router from 'next/router';
import { useEffect, useState } from 'react';

import CustomImage from '@/components/Utility/CustomImage';

interface TabItem {
  id: number;
  name: string;
  hash?: string;
  icon?: boolean;
  numberOf?: string | number;
}

interface CustomTabsProps {
  tabs: TabItem[];
  children: React.ReactNode[];
  index?: number;
  width?: string;
  setIndex?: (index: number) => void;
  searchTabs?: boolean;
  noContain?: boolean;
}

function CustomTabs({
  tabs,
  children,
  index: defaultIndex,
  width,
  setIndex,
  searchTabs,
  noContain,
}: CustomTabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex || 1);

  const handleTabClick = (index: number, hash?: string) => {
    setActiveIndex(index);
    if (hash) {
      router.push(`/profile${hash}`);
    }
    if (setIndex) setIndex(index);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hashIndex = tabs.findIndex(
        (item: TabItem) => item.hash === `#${router.asPath.split('#')[1]}`,
      );
      if (hashIndex !== -1) {
        setActiveIndex(tabs[hashIndex].id);
        if (setIndex) setIndex(tabs[hashIndex].id);
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    router.events.on('hashChangeComplete', handleHashChange);

    return () => {
      router.events.off('hashChangeComplete', handleHashChange);
    };
  }, [tabs, setIndex]);

  return searchTabs ? (
    <div className="!mt-3">
      <ul className="sm-container flex gap-12 border-b border-black-50 pb-3 xl:px-0">
        {tabs &&
          tabs.map((eachTab: TabItem) => (
            <li
              key={eachTab.id}
              className={`tab-list relative flex cursor-pointer
                   ${
                     eachTab.id === activeIndex
                       ? 'active font-semibold text-black-200'
                       : 'text-gray-550'
                   }`}
              onClick={() => handleTabClick(eachTab.id, eachTab.hash)}
            >
              <div>{eachTab.name}</div>
              {eachTab.icon && (
                <div className="-z-1 -mt-1 -ml-2 h-8">
                  <CustomImage src="/video/play.gif" fill />
                </div>
              )}
            </li>
          ))}
      </ul>
      <div className="tabContent pt-6.25 !pl-0">
        {children[activeIndex - 1]}
      </div>
    </div>
  ) : (
    <div>
      <div className="sm-container">
        <ul className="tabHolder" style={{ width: `${width}px` }}>
          {tabs &&
            tabs.map((eachTab: TabItem) => (
              <li
                key={eachTab.id}
                className={`tab-label ${
                  eachTab.id === activeIndex ? 'active' : ''
                }`}
                onClick={() => handleTabClick(eachTab.id, eachTab.hash)}
              >
                <div className="numberOf">{eachTab.numberOf}</div>
                <div>{eachTab.name}</div>
              </li>
            ))}
        </ul>
      </div>
      <div
        className={`${
          noContain ? '' : 'sm-container'
        } tabContent min-h-full pb-4 lg:min-h-141`}
      >
        {children[activeIndex - 1]}
      </div>
    </div>
  );
}

export default CustomTabs;
