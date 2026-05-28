import { useRouter } from 'next/router';

import openTabIconPrimary from '/public/images/blog/openTabIconPrimary.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';

interface SeeAllProps {
  color?: 'primary' | 'white';
  size?: 'xl' | 'base';
  link?: string;
  handleClick?: () => void;
  noButton?: boolean;
  navigate?: boolean;
}

function SeeAll({
  color,
  size,
  link,
  handleClick,
  noButton,
  navigate,
}: SeeAllProps) {
  const router = useRouter();
  const handleRedirection = () => {
    router.push(link ?? '');
  };
  return (
    <div
      className={`flex ${
        noButton
          ? ''
          : navigate
            ? 'mt-10 justify-center lg:mt-6 lg:justify-end'
            : 'my-5 justify-end'
      } ${color == 'primary' ? 'text-primary' : 'text-white'} ${
        size == 'xl' ? 'big text-lg' : 'text-base'
      } `}
    >
      <div
        className="relative z-10 cursor-pointer"
        onClick={link ? handleRedirection : handleClick}
      >
        {noButton ? (
          <div className="flex items-center justify-end">
            See all
            <div className="relative h-4 w-4">
              <CustomImage
                src={openTabIconPrimary}
                className={`h-1 w-1 object-contain ${
                  color == 'primary' ? '' : 'brightness-0 invert'
                }`}
              ></CustomImage>
            </div>
          </div>
        ) : (
          <Button type="outline" size="xxs" textColor="text-primary">
            <span className="flex items-center gap-2">
              <span>{'                                  '}</span>
              <span> See all </span>
              <span>{'                                  '}</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default SeeAll;
