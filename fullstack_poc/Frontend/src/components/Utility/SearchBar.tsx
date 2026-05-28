/**
 * SearchBar component renders a responsive search input with optional animated placeholder,
 * tailored for various views like inline, modal, or campfire pages, and conditionally includes
 * the ForumMenu and search functionalities based on device type and route.
 */

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ForumMenu from '@/components/pages/Forum/forumMenu/index';
import CustomSearchList from '@/components/Utility/CustomSearchList';
import { useIsipad } from '@/Hooks/useIsIpad';
import { useIsMobile } from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { selectIsAuthenticated } from '@/state/Slices/auth';
import {
  setCampfireSearch,
  setIsCampfirePeopleSearch,
  setIsCampfirePostsSearch,
} from '@/state/Slices/campfire';

interface Props {
  placeholder?: string;
  inlineBar?: boolean;
  modalInput?: boolean;
  isCustomOpen?: boolean;
  setIsCustomOpen?: (isOpen: boolean) => void;
  isAnimatedText?: boolean;
  placeholderSequence?: (string | number)[] | null;
  isScrolled?: boolean;
  campfirePage?: boolean;
  isCampfireSearch?: boolean;
  campfireId?: string;
  searchData?: Blog[];
}
function SearchBar({
  placeholder,
  inlineBar,
  modalInput,
  setIsCustomOpen,
  isCustomOpen,
  isAnimatedText = false,
  placeholderSequence = null,
  isScrolled = false,
  campfirePage,
  isCampfireSearch,
  campfireId,
  searchData,
}: Props) {
  const isipad = useIsipad();
  const ismobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pathname } = router;
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isHomeRoute = pathname === '/' || pathname === '/kofuku-social';
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPlusSvg = target.id === 'plus';
      const isSpecificPath = target.tagName === 'path';

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !isPlusSvg &&
        !isSpecificPath
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isCampfireSearch) {
      dispatch(setCampfireSearch(''));
      dispatch(setIsCampfirePeopleSearch(false));
      dispatch(setIsCampfirePostsSearch(false));
    }
  }, [isCampfireSearch, dispatch]);

  return (
    <div className="xl:sm-container py-0 lg:py-0.5">
      <div className="grid">
        {inlineBar ? (
          <div className="flex items-center">
            {isipad ? (
              <div className="flex flex-row">
                <div
                  className={`${
                    isipad && isAuthenticated && isHomeRoute ? 'mr-4' : null
                  }`}
                >
                  <CustomSearchList
                    searchIcon
                    placeholder="Search"
                    isScrolled={isScrolled}
                    searchInitData={searchData}
                  />
                </div>

                <ForumMenu campModal navView />
              </div>
            ) : ismobile ? (
              <>
                <CustomSearchList
                  isAnimatedText={isAnimatedText}
                  placeholderSequence={placeholderSequence}
                  searchIcon
                  placeholder={placeholder}
                  searchInitData={searchData}
                />
                {!isAuthenticated ? null : <ForumMenu campModal navView />}
              </>
            ) : (
              <>
                <CustomSearchList
                  isAnimatedText={isAnimatedText}
                  placeholderSequence={placeholderSequence}
                  placeholder={placeholder}
                  searchInitData={searchData}
                />
                <ForumMenu campModal navView />
              </>
            )}
          </div>
        ) : campfirePage ? (
          <div
            className={`flex items-center ${ismobile ? 'mb-4 ml-4' : 'mt-2'}`}
          >
            <CustomSearchList
              isAnimatedText={isAnimatedText}
              placeholderSequence={placeholderSequence}
              placeholder={placeholder}
              campfirePage
              isCampfireSearch={isCampfireSearch}
              campfireId={campfireId}
              searchInitData={searchData}
            />
            <ForumMenu
              isCampfirePage
              navView
              campfirePage
              isCampfireSearch={isCampfireSearch}
            />
          </div>
        ) : modalInput ? (
          <div className="col-span-12 pt-1">
            <CustomSearchList
              isOpen={isCustomOpen}
              setIsOpen={setIsCustomOpen}
              modaltop
              noBorder
              placeholder={placeholder}
              isAnimatedText={isAnimatedText}
              placeholderSequence={placeholderSequence}
              modalInput={modalInput}
              isCampfireSearch={isCampfireSearch}
              searchInitData={searchData}
            />
          </div>
        ) : (
          <div className="mt-2 px-2.75 lg:mt-0 lg:px-13 xl:col-span-11 xl:pl-0">
            <CustomSearchList
              isAnimatedText={isAnimatedText}
              placeholderSequence={placeholderSequence}
              placeholder={placeholder}
              searchInitData={searchData}
            />
            <ForumMenu campModal />
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
