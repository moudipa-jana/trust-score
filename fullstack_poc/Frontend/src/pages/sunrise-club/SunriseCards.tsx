import type { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';

import CustomImage from '@/components/Utility/CustomImage';

interface SunriseCardProps {
  backgroundColor: string;
  cardName: string;
  iconRegular: string | StaticImageData;
  iconHover: string | StaticImageData;
  routeLink: string;
  className?: string;
}

const SunriseCards = ({
  backgroundColor,
  cardName,
  iconRegular,
  iconHover,
  routeLink,
}: SunriseCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(routeLink);
  };

  return (
    <>
      <div
        className={`rounded-3xl p-2 sunrise-card cursor-pointer `}
        style={{ backgroundColor }}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-center lg:mb-3 mb-3">
          <div className="hover-div bg-white w-26 h-13 rounded-full"></div>
          <div className="arrow-icon absolute right-3 top-4 p-2">
            <svg
              width="29"
              height="21"
              viewBox="0 0 29 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 10.5L27.5 10.5M27.5 10.5L17.75 20.25M27.5 10.5L17.75 0.75"
                stroke="#A8A8A8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="card-name font-headingBold">{cardName}</div>
        <div className="card-icon">
          <CustomImage
            src={iconRegular}
            alt={`Icon ${cardName}`}
            width={100}
            height={100}
            className="icon-regular transition-all duration-300 ease-in-out"
          />
          <CustomImage
            src={iconHover}
            alt={`Icon ${cardName}`}
            width={100}
            height={100}
            className="icon-hover transition-all duration-300 ease-in-out"
          />
        </div>
      </div>
    </>
  );
};

export default SunriseCards;
