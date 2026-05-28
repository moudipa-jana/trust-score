/**
 * Menu component renders the main navigation menu for the site.
 * - Fetches main and bottom menus from services (`MenuService`, `BottomMenuService`).
 * - Displays a toggleable menu with links to sorted main navigation items.
 * - Contains social media links and additional bottom links.
 * - Closes the menu when a menu item is clicked or when clicking outside the menu.
 * - On route change, the menu closes automatically.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import Logo from '/public/images/new-logo.svg';
import CustomImage from '@/components/Utility/CustomImage';
import SocialIconList from '@/components/Utility/Icons';
import HomeRedirect from '@/elements/HomeRedirect';
import Text from '@/elements/Text';

interface MenuItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

interface MenuProps {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

function Menu({
  isActive,
  setIsActive,
  initialMenus = [],
  initialBottomMenus = [],
  initialSocials = [],
}: MenuProps) {
  const [sortedMenus, setSortedMenus] = useState<MenuItem[]>([]);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getIconForTitle = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    switch (normalizedTitle) {
      // case 'website':
      //   return SocialIconList[5]?.icon[1]; // Website 25x25
      case 'facebook':
        return SocialIconList[0]?.icon[1]; // Facebook 25x25
      case 'youtube':
        return SocialIconList[3]?.icon[1]; // YouTube 25x25
      case 'instagram':
        return SocialIconList[2]?.icon[1]; // Instagram 25x25
      // case 'twitter':
      //   return SocialIconList[1]?.icon[1]; // Twitter 25x25
      case 'linkedin':
        return SocialIconList[4]?.icon[1]; // LinkedIn 25x25
      default:
        return null;
    }
  };

  useEffect(() => {
    if (initialMenus) {
      const sorted = [...initialMenus].sort(
        (a: MenuItem, b: MenuItem) => b.id - a.id,
      );
      setSortedMenus(sorted);
    }
  }, [initialMenus]);

  useEffect(() => {
    setIsActive(false);
  }, [router.pathname, setIsActive]);

  const toggleMenubar = () => {
    setIsActive((current: boolean) => !current);
  };

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target as Node)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [setIsActive]);

  const handleMenuItemClick = () => {
    setIsActive(false);
  };

  return (
    <div ref={headerMenuRef}>
      <nav className="flex items-center">
        <div
          className={`toggle-wrap ${isActive ? 'active' : ''}`}
          onClick={toggleMenubar}
        >
          <span className="toggle-bar"></span>
        </div>
        <div className="ml-2 lg:ml-6 xl:ml-3 xl:hidden">
          <HomeRedirect href="/">
            <div className="relative md:h-3.5 md:w-13 lg:h-12 lg:w-44 xl:w-52.25">
              <CustomImage src={Logo} alt="kofuku" />
            </div>
          </HomeRedirect>
        </div>
      </nav>
      <aside className={isActive ? 'active' : ''}>
        <div className="boxMenu container relative">
          <div className="flex items-center justify-between px-4 lg:justify-end xl:justify-between">
            <div
              className={`relative hidden h-[71px] w-[262px] justify-center xl:block ${isActive
                  ? 'opacity-100 transition-opacity duration-1000 ease-in'
                  : 'opacity-0'
                }`}
            >
              <CustomImage src={Logo} alt="kofuku" />
            </div>
            <ul className="menu-link lg:text-right">
              {sortedMenus &&
                sortedMenus.map((data: MenuItem) => (
                  <li
                    className="font-headingBold text-lg font-extrabold lg:text-4xl"
                    key={data.attributes.slug}
                    onClick={handleMenuItemClick}
                  >
                    <Link href={`/${data.attributes.slug}`}>
                      {data.attributes.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div className="line light" />
          <div className="mb-4 flex flex-col-reverse items-center py-4 px-4 lg:flex-row lg:justify-between">
            <div className="socialIcons pt-10 lg:pt-0">
              <ul className="flex justify-center gap-6">
                {initialSocials?.map((social) => {
                  const { title, link } = social.attributes;
                  const icon = getIconForTitle(title);

                  if (icon) {
                    return (
                      <li key={social.id} onClick={handleMenuItemClick}>
                        <a
                          href={
                            link.startsWith('http') ? link : `https://${link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl text-gray-1200 filter grayscale hover:grayscale-0"
                        >
                          {icon}
                        </a>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </div>
            <div className="pageLinks px-4">
              <ul className="bottomMenuHolder">
                {initialBottomMenus &&
                  initialBottomMenus
                    .filter(
                      (data: MenuItem) => data.attributes.title !== 'FAQs',
                    )
                    .map((data: MenuItem) => (
                      <li
                        key={data.attributes.slug}
                        onClick={handleMenuItemClick}
                      >
                        <Link href={`/${data.attributes.slug}`}>
                          <Text>
                            <p className="text-sm xl:text-base">
                              {data.attributes.title}
                            </p>
                          </Text>
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Menu;
