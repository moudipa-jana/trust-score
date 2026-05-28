import Link from 'next/link';

import openTabIconPrimary from '/public/images/blog/openTabIconPrimary.svg';
import CustomImage from '@/components/Utility/CustomImage';

interface ReadMoreProps {
  color?: 'primary' | string;
  size?: 'xl' | string;
  link: string;
}
function ReadMore({ color, size, link }: ReadMoreProps) {
  return (
    <div
      className={`flex justify-end ${
        color == 'primary' ? 'text-primary' : 'text-white'
      } ${size == 'xl' ? 'big text-lg' : 'text-base'} `}
    >
      <Link href={link}>
        <div className="flex items-center justify-end">
          Read more
          <div className="relative h-4 w-4">
            <CustomImage
              src={openTabIconPrimary}
              className={`h-1 w-1 object-contain ${
                color == 'primary' ? '' : 'brightness-0 invert'
              }`}
            ></CustomImage>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ReadMore;
