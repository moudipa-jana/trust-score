import { StaticImageData } from 'next/image';

import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';

function HeroSection({ src }: { src: string | StaticImageData }) {
  return (
    <div>
      <div className="h-110 xl:h-screen">
        <CustomImage src={src} alt="Banner" />
      </div>
      <div className="absolute top-32 w-full text-center xl:top-1/3">
        <div className="gradientText">
          <Heading priority="1" variant="xl" font="font-extrabold">
            Top Reads
          </Heading>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
