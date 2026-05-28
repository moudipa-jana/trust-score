import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Hill1 from '/public/images/trending/hill1.png';
import Hill3 from '/public/images/trending/hill1.png';
import Hill5 from '/public/images/trending/hill1.png';
import Hill7 from '/public/images/trending/hill1.png';
import Hill9 from '/public/images/trending/hill1.png';
import Hill2 from '/public/images/trending/hill2.png';
import Hill4 from '/public/images/trending/hill2.png';
import Hill6 from '/public/images/trending/hill2.png';
import Hill8 from '/public/images/trending/hill2.png';
import Hill10 from '/public/images/trending/hill2.png';
import TrendingImg from '/public/images/trending/trending.svg';
import TrendingTabImg from '/public/images/trending/trendingTab.svg';
import TrendingBox, {
  TrendingBoxData,
} from '@/components/pages/Trending/TrendingBox';
import Breadcrumb from '@/components/Utility/Breadcrumb';
import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';

interface BlogAttributes {
  title: string;
  // Add other blog attributes as needed
}

export interface BlogData {
  id: string;
  attributes: BlogAttributes;
  rank: number;
}

interface TrendingData {
  id: string;
  attributes: BlogAttributes;
  rank: number;
}

export interface BlogsList {
  data: BlogData[];
}

interface TrendingDataResults {
  [key: string]: TrendingData;
}

const hillImages = [
  Hill1,
  Hill2,
  Hill3,
  Hill4,
  Hill5,
  Hill6,
  Hill7,
  Hill8,
  Hill9,
  Hill10,
];

export default function TrendingHills({
  blogsList,
}: {
  blogsList: BlogData[];
}): JSX.Element {
  const noOfTrendingBlogs = blogsList?.length;
  const [visiblePages, setVisiblePages] = useState<boolean[]>([
    true,
    true,
    true,
    false,
    false,
  ]);

  const thresholdValues = useMemo(
    () => [20, 80, 200, 320, 520, 1000, 1600, 2300, 3400, 4000],
    [], // No dependencies as this is a static array
  );

  const [trendingDataResults, setTrendingDataResults] =
    useState<TrendingDataResults>({});

  useEffect(() => {
    const newTrendingData: TrendingDataResults = {};
    blogsList?.forEach((blog, index) => {
      newTrendingData[`blogsList${index}`] = {
        id: blog.id,
        attributes: blog.attributes,
        rank: blog.rank ?? index + 1,
      };
    });
    setTrendingDataResults(newTrendingData);
  }, [blogsList]);

  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef(0);

  const handleVisibility = useCallback(
    (index: number, threshold: number, isScrollingDown: boolean) => {
      const isVisible = scrollPosition > threshold;

      if (isScrollingDown && isVisible) {
        const newVisiblePages = [...visiblePages];
        newVisiblePages[index] = false;
        newVisiblePages[index + 4] = true;
        setVisiblePages(newVisiblePages);
      } else if (!isScrollingDown && isVisible) {
        const updateVisiblePages = (start: number, end: number) => {
          const newVisiblePages = Array(13).fill(false);
          for (let i = start; i < end; i++) {
            newVisiblePages[i] = true;
          }
          setVisiblePages(newVisiblePages);
        };
        const getPageRange = (scrollY: number, thresholds: number[]) => {
          for (let i = 0; i < thresholds.length; i++) {
            if (scrollY < thresholds[i]) {
              return { start: i, end: i + 4 };
            }
          }
          return { start: thresholds.length - 1, end: thresholds.length + 3 };
        };
        const { start, end } = getPageRange(window.scrollY, thresholdValues);
        updateVisiblePages(start, end);
      }
    },
    [scrollPosition, visiblePages, thresholdValues],
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      const isScrollingDown = currentScrollPosition > scrollPositionRef.current;

      setScrollPosition(currentScrollPosition);
      scrollPositionRef.current = currentScrollPosition;

      const elements = Array.from({ length: 9 }, (_, index) => index);
      elements.forEach((index) => {
        handleVisibility(index, thresholdValues[index], isScrollingDown);
      });
    };

    const handleKeyDown: (event: KeyboardEvent) => void = (
      event: KeyboardEvent,
    ) => {
      const isArrowDown = event.key === 'ArrowDown';
      const isArrowUp = event.key === 'ArrowUp';

      if (isArrowDown || isArrowUp) {
        event.preventDefault();

        const currentIndex = visiblePages.findIndex((visible) => visible);
        const nextIndex = isArrowDown ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= 0 && nextIndex < visiblePages.length) {
          const threshold = [5, 45, 130, 240, 450, 800, 1200, 1900, 2700, 5000];
          const newScrollPosition = threshold[nextIndex];
          window.scrollTo({ top: newScrollPosition, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollPosition, handleVisibility, thresholdValues, visiblePages]);

  const hillsOnThisPage = 1;

  const crumbs = [
    {
      title: 'Social',
      path: '/kofuku-social',
    },
    {
      title: 'Sunrise Club',
      path: '/sunrise-club',
    },
    {
      title: 'Trending',
      path: '/sunrise-club/trending',
    },
  ];

  return (
    <>
      <div className="hidden lg:block">
        <div className="container relative z-50 pt-5 bg-transparent">
          <Breadcrumb crumbs={crumbs} homeIcon={true} size="lg" />
        </div>
        <div>
          <div className="fixed top-48 left-16 hidden h-70-screen w-40 xl:block">
            <CustomImage src={TrendingImg} alt="Trending" objectFit="contain" />
          </div>
          <div className="fixed top-32 left-16 hidden lg:block xlg:left-60 xl:hidden">
            <CustomImage
              src={TrendingTabImg}
              alt="Trending"
              objectFit="contain"
            />
          </div>

          <div className="fixed top-48 left-0 mb-20 min-h-70-screen w-full">
            <div className="whiteGradient fixed bottom-0 left-0 z-42 hidden h-52 w-full lg:block"></div>
            <div>
              {Array.from({ length: noOfTrendingBlogs }, (_, index) => {
                const pageData = trendingDataResults[`blogsList${index}`];
                if (pageData) {
                  return (
                    <div
                      className={`hillPages page${index + 1} 
                    ${index < 4 ? `element${index + 1}` : ''} 
                    ${!visiblePages[index] ? 'hiddenHills' : ''}`}
                      key={index}
                      style={{
                        zIndex: 40 - index,
                      }}
                    >
                      {[...Array(hillsOnThisPage)].map((__, i) => {
                        const hillIndex = index + i;
                        const scrollPositionResp = scrollPosition;
                        const translateZValues = [
                          0.2, 0.14, 0.12, 0.1, 0.08, 0.06, 0.055, 0.048, 0.045,
                          0.025,
                        ];

                        let translateZ;

                        if (hillIndex + 1 >= 1 && hillIndex + 1 <= 10) {
                          translateZ =
                            (noOfTrendingBlogs + 1 - hillIndex) *
                            (scrollPositionResp * translateZValues[hillIndex]);
                        }

                        return (
                          <div
                            className={`hills absolute bottom-0 flex flex-col items-center justify-center hillType${
                              hillIndex + 1
                            }`}
                            key={hillIndex}
                            style={{
                              transform: `translateZ(${translateZ}px)`,
                            }}
                          >
                            {trendingDataResults[`blogsList${hillIndex}`] && (
                              <>
                                <TrendingBox
                                  trendingData={
                                    trendingDataResults[
                                      `blogsList${hillIndex}`
                                    ] as unknown as TrendingBoxData
                                  }
                                />

                                <div className="w-full">
                                  <CustomImage
                                    src={hillImages[hillIndex]}
                                    alt={`Trending ${hillIndex + 1}`}
                                    objectFit="contain"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        </div>
        {Array.from({ length: noOfTrendingBlogs + 1 }, (_, index) => (
          <div
            key={`section${index + 1}`}
            className="h-125 w-full"
            id={`section${index + 1}`}
          ></div>
        ))}
      </div>

      {/* For mobile  */}
      <div className="container lg:hidden">
        <div className="py-2">
          <Breadcrumb crumbs={crumbs} />
        </div>
        <div className="border-t border-offwhite-750 py-5 pl-5">
          <Heading priority="1">Trending</Heading>
        </div>
        <div className="mobileTrending relative m-5 ml-8 mt-0">
          {Object.keys(trendingDataResults).map((key) => (
            <TrendingBox
              key={key}
              trendingData={
                trendingDataResults[key] as unknown as TrendingBoxData
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}
