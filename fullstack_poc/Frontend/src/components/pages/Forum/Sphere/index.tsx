import { startCase } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import social from '/public/images/o-logo.svg';
import CustomImage from '@/components/Utility/CustomImage';
import { useIsDesktop } from '@/Hooks/useIsDesktop';
import { useAppDispatch } from '@/Hooks/useRedux';
import { setRefreshHomeFeed } from '@/state/Slices/home';
import { TopCategories } from '@/types/topCategories';

import CategoryDetailsBox from './CategoryDetailsBox';

interface ISphereProps {
  topCategories: TopCategories[];
  spaceTop?: boolean;
}

function Sphere({ topCategories, spaceTop }: ISphereProps) {
  const isdesktop = useIsDesktop();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [Catorgrytitle, setCatorgrytitle] = useState<any>(null);
  const [isScrolledPastHalf, setIsScrolledPastHalf] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const halfScreen = windowHeight / 3;

      setIsScrolledPastHalf(scrollPosition >= halfScreen);
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = (category: TopCategories) => {
    const el = document.querySelector('.showCategory');
    const detailsEl = document.querySelector('.tabCategoryDetails');

    if (isdesktop) {
      router.push(`/category/${encodeURIComponent(startCase(category.title))}`);
    } else {
      if (el) {
        el.classList.remove('showCategory');
      }
    }

    const categoryElement = document.getElementById('category' + category.id);
    if (categoryElement) {
      categoryElement.classList.add('showCategory');
    }

    if (detailsEl) {
      detailsEl.classList.add('showBg');
    }
  };

  const redirectToCategory = (category: TopCategories) => {
    router.push(`/category/${encodeURIComponent(startCase(category.title))}`);
  };

  const hideBg = () => {
    const el = document.querySelector('.showCategory');
    const detailsEl = document.querySelector('.tabCategoryDetails');

    if (el) {
      el.classList.remove('showCategory');
    }

    if (!isdesktop && detailsEl) {
      detailsEl.classList.remove('showBg');
    }
  };

  const handleLogoClick = () => {
    dispatch(setRefreshHomeFeed(true));
  };




  return (
    <>

      <div
        className={`sphereGradient relative ${spaceTop ? 'pt-20' : ''}`}
      // style={{ background: frameLinearGradient(hovered) }}
      >
        <div className="container mb-16 pt-8 ">
          <div className="sphereHolder  relative">
            <div className="sphereCircle circle-1 ">
              <div className="sphereCircle circle-2">
                <div className="sphereCircle circle-3">
                  <div className="sphereCircle circle-4"></div>
                </div>
              </div>
            </div>
            <div
              className="socialCenter h-[98px] w-[71px] cursor-pointer"
              onClick={handleLogoClick}
            >
              <CustomImage
                src={social}
                className="h-[98px] w-[71px] object-contain"
                fill
              />
            </div>
            <div className="categoryHolder">
              {topCategories &&
                topCategories.map((category: any, i) => {
                  const isBottomPositionDefault = [1, 4, 5].includes(i);

                  const isSmallScreen = window.innerHeight <= 880;
                  const isExtraBottomPosition = isSmallScreen && [7, 6, 2].includes(i);

                  const isBottomPosition = isBottomPositionDefault || isExtraBottomPosition;

                  const shouldShowBottomPosition = isBottomPosition && !isScrolledPastHalf;

                  return (
                    <div
                      className={`categoryHover ${i}_index ${hoveredCategoryId && hoveredCategoryId !== category.id ? 'hover-eff' : ''
                        }`}
                      onMouseEnter={() => {
                        setHoveredCategoryId(category.id);
                      }}
                      onMouseLeave={() => {
                        setHoveredCategoryId(null);
                      }}
                      key={category.id}
                      onClick={() => handleClick(category)}
                    >
                      <div className="iconHolder">
                        <div className="sphereIcons relative h-full max-h-full w-full max-w-full ">
                          <CustomImage
                            src={category.picture}
                            alt={category.title}
                            className="regular-img"
                            width={96}
                            height={96}
                          />
                          <CustomImage
                            src={category.hover_picture}
                            alt={category.title}
                            className="color-img"
                            width={96}
                            height={96}
                          />
                        </div>
                        <CategoryDetailsBox
                          title={startCase(category.title)}
                          category={category}
                        />
                      </div>
                    </div>
                  );
                })}

            </div>
          </div>
        </div>
        <div className="tabCategoryDetails" onClick={() => hideBg()}>
          <div className="tabCategoryBox">
            {topCategories &&
              topCategories.map((category) => {
                return (
                  <div
                    className="tabcategoryHover"
                    id={'category' + category.id}
                    key={category.id}
                    onClick={() => redirectToCategory(category)}
                  >
                    <div>
                      <CategoryDetailsBox
                        title={startCase(category.title)}
                        category={category}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sphere;
