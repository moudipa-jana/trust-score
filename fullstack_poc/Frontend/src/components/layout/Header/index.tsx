/**
 * Header component for the website, handling different layouts based on user authentication and scroll state.
 * - Dynamically adjusts padding and layout depending on whether the user is authenticated, the page route, and scroll position.
 * - Displays different content in the right section of the header depending on whether the user is logged in (BeforeLoginHeader or AfterLoginHeader).
 * - Includes a search bar that behaves differently based on the route, scroll position, and user authentication state.
 * - Uses custom hooks (`useIsMobile` for mobile detection and `useAppSelector` for authentication state) to tailor the header's content and appearance.
 * - The logo and menu toggle visibility based on screen size and scroll state.
 * - Includes dynamic event listeners for scroll and click detection for handling state changes in the menu and scroll behavior.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import Logo from '/public/images/new-logo.svg';
import Menu from '@/components/layout/Header/Menu';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CustomImage from '@/components/Utility/CustomImage';
import SearchBar from '@/components/Utility/SearchBar';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { FORUM_ANIMATED_PLACEHOLDER } from '@/lib/constants';

import AfterLoginHeader from './AfterLoginHeader';
import BeforeLoginHeader from './BeforeLoginHeader';

interface MenuRef extends HTMLDivElement {
  contains(target: EventTarget | null): boolean;
}

interface MenuItem {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

interface HeaderProps {
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
  searchData: Blog[];
}

function Header({
  initialMenus = [],
  initialBottomMenus = [],
  initialSocials = [],
  searchData = [],
}: HeaderProps) {
  const router = useRouter();
  const menuRef = useRef<MenuRef>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isNotAuthenticated = !isAuthenticated;

  const { pathname } = router;
  let rightSectionHeader = null;
  const [isActive, setIsActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const ismobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (isActive && menuRef.current && !menuRef.current.contains(e.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [isActive]);

  if (isAuthenticated) {
    rightSectionHeader = <AfterLoginHeader />;
  } else {
    rightSectionHeader = <BeforeLoginHeader />;
  }
  const isIndexRoute =
    pathname.startsWith('/sunrise-club') ||
    pathname.startsWith('/author') ||
    pathname.startsWith('/doctor');
  const isHomeRoute = pathname === '/' || pathname === '/kofuku-social';

  return (
    <div
      id="topHeaderHolder"
      className={`header sticky top-0 bg-white ${
        !isActive ? 'z-120' : 'z-130'
      } ${isScrolled ? 'scrolled' : ''}`}
    >
      <div
        className={`container relative ${
          isNotAuthenticated
            ? 'py-0.5 lg:py-3 xl:py-3.5'
            : isScrolled && !isIndexRoute && isAuthenticated && isHomeRoute
              ? 'py-2.5 lg:py-3 xl:py-3.5'
              : !isHomeRoute && !isIndexRoute && isAuthenticated
                ? 'py-2.5 lg:py-3 xl:py-3.5'
                : 'py-2.5 lg:py-3 xl:py-5'
        }`}
        ref={menuRef}
      >
        <div
          className={`flex items-center justify-between pl-0 md:pl-2.5
          ${
            isNotAuthenticated
              ? 'py-1'
              : isActive && isIndexRoute
                ? 'xl:py-1'
                : isActive && !isScrolled && isHomeRoute
                  ? 'xl:py-1'
                  : !isScrolled && isHomeRoute
                    ? 'py-0'
                    : isIndexRoute
                      ? 'py-0'
                      : 'pt-0 lg:pb-px '
          }  
          ${
            isScrolled && isHomeRoute && isAuthenticated
              ? 'xl:flex-row'
              : !isHomeRoute && !isIndexRoute && isAuthenticated
                ? 'xl:flex-row'
                : isNotAuthenticated && !isIndexRoute && isHomeRoute
                  ? 'xl:flex-row'
                  : 'xl:grid xl:grid-cols-2'
          }`}
        >
          <div className="flex-auto">
            <div className="flex items-center">
              <Menu
                isActive={isActive}
                setIsActive={setIsActive}
                initialMenus={initialMenus}
                initialBottomMenus={initialBottomMenus}
                initialSocials={initialSocials}
              />

              <div
                className={` ${
                  isActive ? 'xl:hidden' : ''
                } ml-2 hidden lg:ml-6 xl:ml-6 xl:block`}
              >
                <Link href="/">
                  <div className="relative md:h-3.5 md:w-13 lg:h-12 lg:w-44 xl:w-44">
                    <CustomImage className="!w-auto" src={Logo} alt="kofuku" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {isNotAuthenticated && !isIndexRoute && isHomeRoute && (
            <div
              className={`${
                ismobile ? '' : 'mr-3'
              } flex w-full justify-end justify-self-center lg:mr-0 lg:block lg:w-fit`}
            >
              <SearchBar
                inlineBar
                isAnimatedText
                placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
                searchData={searchData}
              />
            </div>
          )}

          {isScrolled && !isIndexRoute && isAuthenticated && isHomeRoute && (
            <div className="mr-2 flex animate-fadeIn justify-end">
              <SearchBar
                inlineBar
                isAnimatedText
                isScrolled={isScrolled}
                placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
                searchData={searchData}
              />
            </div>
          )}

          {!isIndexRoute && isAuthenticated && !isHomeRoute && (
            <div className="w-fit">
              <SearchBar
                inlineBar
                isAnimatedText
                placeholderSequence={FORUM_ANIMATED_PLACEHOLDER}
                searchData={searchData}
              />
            </div>
          )}

          <div
            id="flexnav"
            className={`relative z-20 flex justify-end justify-self-end  ${
              isNotAuthenticated || !isHomeRoute ? 'ml-2' : null
            }`}
          >
            {rightSectionHeader}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
