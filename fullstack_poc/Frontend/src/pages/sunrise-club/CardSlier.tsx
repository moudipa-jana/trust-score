import { useEffect, useRef, useState } from 'react';

import IconContagion from '../../../public/images/sunrise/Contagion.png';
import IconContagionHover from '../../../public/images/sunrise/img-Contagion-hover.png';
import IconFitness from '../../../public/images/sunrise/Fitness.png';
import IconFitnessHover from '../../../public/images/sunrise/img-Fitness-hover.png';
import IconHushTalks from '../../../public/images/sunrise/Hush Talks.png';
import IconHushTalksHover from '../../../public/images/sunrise/img-HushTalks-hover.png';
import IconLifestyle from '../../../public/images/sunrise/Lifestyle Diseases.png';
import IconLifestyleHover from '../../../public/images/sunrise/img-Lifestyle-hover.png';
import IconMentalHealthHover from '../../../public/images/sunrise/img-mentail-health-hover.png';
import IconMentalHealthReg from '../../../public/images/sunrise/Mental Health.png';
import IconParenting from '../../../public/images/sunrise/Parenting.png';
import IconParentingHover from '../../../public/images/sunrise/img-parrenting-hover.png';
import IconWelness from '../../../public/images/sunrise/Wellness Corner.png';
import IconWelnessHover from '../../../public/images/sunrise/img-WellnessCorner-hover.png';
import IconSheReads from '../../../public/images/sunrise/She Reads.png';
import IconSheReadsHover from '../../../public/images/sunrise/img-SheReads-hover.png';
import SunriseCards from './SunriseCards';
import { BlogCategory } from '@/pages/sunrise-club';
import { lowerCase } from 'lodash';

interface CardSliderProps {
  blogsCategories: BlogCategory[];
}

export const CATEGORY_CONFIG: Record<string, { iconRegular: any; iconHover: any; backgroundColor: string }> = {
  'mental health': {
    iconRegular: IconMentalHealthReg,
    iconHover: IconMentalHealthHover,
    backgroundColor: '#AEFFD3',
  },
  'fitness': {
    iconRegular: IconFitness,
    iconHover: IconFitnessHover,
    backgroundColor: '#FFD9F3',
  },
  'hush talks': {
    iconRegular: IconHushTalks,
    iconHover: IconHushTalksHover,
    backgroundColor: '#DCF4FF',
  },
  'contagion': {
    iconRegular: IconContagion,
    iconHover: IconContagionHover,
    backgroundColor: '#AEF9DD',
  },
  'wellness corner': {
    iconRegular: IconWelness,
    iconHover: IconWelnessHover,
    backgroundColor: '#F6FBCE',
  },
  'parenting': {
    iconRegular: IconParenting,
    iconHover: IconParentingHover,
    backgroundColor: '#FFCFCF',
  },
  'lifestyle diseases': {
    iconRegular: IconLifestyle,
    iconHover: IconLifestyleHover,
    backgroundColor: '#FFCFCF',
  },
  'she reads': {
    iconRegular: IconSheReads,
    iconHover: IconSheReadsHover,
    backgroundColor: '#D4EEED',
  },
};

const CardSlider = ({ blogsCategories }: CardSliderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [sunriseCardsData, setSunriseCardsData] = useState<BlogCategory[]>([]);
  const isHoveredRef = useRef<boolean>(false);
  const fastScrollRef = useRef<{
    isActive: boolean;
    direction: 'left' | 'right' | null;
    speed: number;
  }>({
    isActive: false,
    direction: null,
    speed: 0,
  });

  useEffect(() => {
    if (!blogsCategories?.length) return;

    const updatedCategories = blogsCategories.map((cat) => {
      const title = lowerCase(cat.attributes?.title || '');
      const config = CATEGORY_CONFIG[title];

      return config
        ? {
          ...cat,
          attributes: {
            ...cat.attributes,
            ...config,
          },
        }
        : cat;
    });

    setSunriseCardsData(updatedCategories);
  }, [blogsCategories]);

  const startContinuousScroll = (): void => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scroll = (): void => {
      if (isHoveredRef.current && !fastScrollRef.current.isActive) {
        // Pause normal scrolling when hovered (but not during fast scroll)
        animationFrameRef.current = requestAnimationFrame(scroll);
        return;
      }

      // Calculate scrolling speed
      let scrollSpeed = 1; // Default slow scroll

      // Fast scroll when arrow buttons are clicked
      if (fastScrollRef.current.isActive) {
        scrollSpeed = fastScrollRef.current.speed;

        // Gradually reduce speed for smooth deceleration
        fastScrollRef.current.speed *= 0.95;

        // Stop fast scroll when speed becomes very low
        if (fastScrollRef.current.speed < 1) {
          fastScrollRef.current.isActive = false;
          fastScrollRef.current.direction = null;
          fastScrollRef.current.speed = 0;
        }
      }

      // Apply scroll based on direction
      if (
        fastScrollRef.current.isActive &&
        fastScrollRef.current.direction === 'left'
      ) {
        container.scrollLeft -= scrollSpeed;
      } else {
        container.scrollLeft += scrollSpeed;
      }

      // Calculate container dimensions for seamless loop
      const containerWidth = container.scrollWidth;

      // Reset to beginning when reaching halfway point (seamless loop)
      if (container.scrollLeft >= containerWidth / 2) {
        container.scrollLeft = 0;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft = containerWidth / 2;
      }

      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    scroll();
  };

  const handleMouseEnter = (): void => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = (): void => {
    isHoveredRef.current = false;
  };

  const handleLeftScroll = (): void => {
    const container = scrollContainerRef.current;
    if (container) {
      // Start fast scroll to the left
      fastScrollRef.current = {
        isActive: true,
        direction: 'left',
        speed: 15, // Fast initial speed
      };
    }
  };

  const handleRightScroll = (): void => {
    const container = scrollContainerRef.current;
    if (container) {
      // Start fast scroll to the right
      fastScrollRef.current = {
        isActive: true,
        direction: 'right',
        speed: 15, // Fast initial speed
      };
    }
  };

  useEffect(() => {
    // Start continuous scrolling when component mounts
    const timer = setTimeout(() => {
      startContinuousScroll();
    }, 1000); // 1 second delay to allow component to render

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="lg:mb-26 slider-sec group lg:block hidden">
        <div className="lg:px-0 px-5">
          <div className="lg:flex hidden justify-between items-center mb-3 px-5 slide-nav opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
            <div
              className="bg-[#E6E6E6] p-6 cursor-pointer hover:bg-gray-300 hover:scale-110 transition-all duration-200 rounded-full select-none active:scale-95"
              onClick={handleLeftScroll}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.8422 14.9999L14.7202 25.8779C14.9149 26.0726 15.0169 26.3019 15.0262 26.5659C15.0342 26.8299 14.9275 27.0719 14.7062 27.2919C14.4875 27.5052 14.2522 27.6139 14.0002 27.6179C13.7495 27.6206 13.5135 27.5119 13.2922 27.2919L1.1322 15.1319C0.957536 14.9559 0.83487 14.7772 0.764203 14.5959C0.693536 14.4146 0.658203 14.2159 0.658203 13.9999C0.658203 13.7839 0.693536 13.5852 0.764203 13.4039C0.83487 13.2226 0.957536 13.0446 1.1322 12.8699L13.2922 0.707915C13.4789 0.521248 13.7062 0.421248 13.9742 0.407915C14.2435 0.394581 14.4882 0.494582 14.7082 0.707915C14.9282 0.927915 15.0382 1.16525 15.0382 1.41991C15.0382 1.67591 14.9282 1.91391 14.7082 2.13391L3.8402 12.9999H27.0002C27.2855 12.9999 27.5235 13.0952 27.7142 13.2859C27.9049 13.4766 28.0002 13.7146 28.0002 13.9999C28.0002 14.2852 27.9049 14.5232 27.7142 14.7139C27.5235 14.9046 27.2855 14.9999 27.0002 14.9999H3.8422Z"
                  fill="black"
                />
              </svg>
            </div>
            <div
              className="bg-[#E6E6E6] p-6 cursor-pointer hover:bg-gray-300 hover:scale-110 transition-all duration-200 rounded-full select-none active:scale-95"
              onClick={handleRightScroll}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24.1578 14.9999L13.2798 25.8779C13.0851 26.0726 12.9831 26.3019 12.9738 26.5659C12.9658 26.8299 13.0725 27.0719 13.2938 27.2919C13.5125 27.5052 13.7478 27.6139 13.9998 27.6179C14.2505 27.6206 14.4865 27.5119 14.7078 27.2919L26.8678 15.1319C27.0425 14.9559 27.1651 14.7772 27.2358 14.5959C27.3065 14.4146 27.3418 14.2159 27.3418 13.9999C27.3418 13.7839 27.3065 13.5852 27.2358 13.4039C27.1651 13.2226 27.0425 13.0446 26.8678 12.8699L14.7078 0.707915C14.5211 0.521248 14.2938 0.421248 14.0258 0.407915C13.7565 0.394581 13.5118 0.494582 13.2918 0.707915C13.0718 0.927915 12.9618 1.16525 12.9618 1.41991C12.9618 1.67591 13.0718 1.91391 13.2918 2.13391L24.1598 12.9999H0.999798C0.714464 12.9999 0.476463 13.0952 0.285797 13.2859C0.0951309 13.4766 -0.000202179 13.7146 -0.000202179 13.9999C-0.000202179 14.2852 0.0951309 14.5232 0.285797 14.7139C0.476463 14.9046 0.714464 14.9999 0.999798 14.9999H24.1578Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          <div className="overflow-hidden ">
            <div
              ref={scrollContainerRef}
              className="flex gap-6 scrollbar-hide sunrise-card-wraper overflow-x-auto"
              style={{ scrollBehavior: 'auto', scrollbarWidth: 'none' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* First set of cards */}
              {sunriseCardsData.map((card: BlogCategory, index: number) => (
                <SunriseCards
                  key={`first-${index}`}
                  backgroundColor={card.attributes.backgroundColor || ''}
                  cardName={card.attributes.title || ''}
                  iconRegular={card.attributes.iconRegular || ''}
                  iconHover={card.attributes.iconHover || ''}
                  routeLink={`/sunrise-club/${card?.attributes.slug}`}
                />
              ))}

              {/* Duplicate set for seamless loop */}
              {sunriseCardsData.map((card: BlogCategory, index: number) => (
                <SunriseCards
                  key={`second-${index}`}
                  backgroundColor={card.attributes.backgroundColor || ''}
                  cardName={card.attributes.title || ''}
                  iconRegular={card.attributes.iconRegular || ''}
                  iconHover={card.attributes.iconHover || ''}
                  routeLink={`/sunrise-club/${card?.attributes.slug}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden block px-5 mb-20">
        {sunriseCardsData.map((card: BlogCategory, index: number) => (
          <SunriseCards
            key={`second-${index}`}
            backgroundColor={card.attributes.backgroundColor || ''}
            cardName={card.attributes.title || ''}
            iconRegular={card.attributes.iconRegular || ''}
            iconHover={card.attributes.iconHover || ''}
            routeLink={`/sunrise-club/${card?.attributes.slug}`}
          />
        ))}
      </div>
    </>
  );
};

export default CardSlider;
