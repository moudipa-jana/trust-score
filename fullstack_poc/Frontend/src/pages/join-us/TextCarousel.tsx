import { useEffect, useState } from 'react';

import Heading from '@/elements/Heading';

interface TextCarouselProps {
  joinUsData: any;
}

const TextCarousel = ({ joinUsData }: TextCarouselProps) => {
  const [visibleTextIndex, setVisibleTextIndex] = useState(0);
  const [progress, setProgress] = useState(100); // Start at 100%

  const textData = [
    {
      heading: joinUsData?.attributes?.heroSection?.Title1,
      text: joinUsData?.attributes?.heroSection?.Description1,
    },
    {
      heading: joinUsData?.attributes?.heroSection?.Title2,
      text: joinUsData?.attributes?.heroSection?.Description2,
    },
    {
      heading: joinUsData?.attributes?.heroSection?.Title3,
      text: joinUsData?.attributes?.heroSection?.Description3,
    },
  ];

  useEffect(() => {
    // Reset progress to 100% when text changes
    setProgress(100);

    // Progress bar animation (decreasing from 100% to 0%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 2; // Decrease by 2% every 60ms (3000ms / 50 steps)
      });
    }, 60);

    // Change text after 3 seconds
    const textTimeout = setTimeout(() => {
      setVisibleTextIndex((prevIndex) => {
        return (prevIndex + 1) % textData.length;
      });
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(textTimeout);
    };
  }, [visibleTextIndex, textData.length]);

  return (
    <>
      {textData.map((item, index) => (
        <div
          key={index}
          className="flex gap-5 mb-6 main-div transition-height duration-300 ease-in-out"
        >
          <div className="bg-[#D9D9D9] min-w-2 min-h-11 relative overflow-hidden">
            <div
              className={`bg-gray-500 w-full transition-all duration-75 ease-linear absolute left-0 right-0 bottom-0 ${visibleTextIndex === index ? 'opacity-100' : 'opacity-30'
                }`}
              style={{
                height: visibleTextIndex === index ? `${progress}%` : '0%',
              }}
            ></div>
          </div>
          <div className="transition-height duration-300 ease-in-out animate-fade-in self-center">
            <Heading
              priority={4}
              variant="bold"
              color="text-[#6E6E6E] lg:text-2xl text-lg"
            >
              {item.heading}
            </Heading>
            <div
              className={`text transition-height duration-300 ease-in-out animate-fade-in text-[#6E6E6E] lg:text-base text-sm ${visibleTextIndex === index ? 'lg:h-17' : 'h-0 overflow-hidden'
                }`}
            >
              {item.text}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TextCarousel;
