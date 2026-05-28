import Image from 'next/image';

import Text from '@/elements/Text';

import HeroImg from '../../../public/images/sunrise/herro-full-banner-img.webp';

const HeroSection = () => {
  return (
    <>
      <section className="lg:mb-5 lg:block hidden">
        <div className="h-full">
          <Image
            src={HeroImg}
            alt="Hero Image"
            width={1920}
            height={500}
            className=" w-full max-w-[1400px] mx-auto"
          />
        </div>
      </section>
      <div className="lg:hidden block p-5 text-center">
        <h1 className="text-4xl font-extrabold font-headingBold text-gray-1050 leading-none mb-4">
          Sunrise Club
        </h1>
        <Text size="base">
          Spending more time walking on the lines and curves of health doesn’t
          need a fancy gym membership or a personal dietitian.{' '}
        </Text>{' '}
        <br />
        <Text size="base">
          Sometimes, simple clicks on these illustrations can give you answers!
          From busting anxiety to inspiring empathy, our Sunrise Club is a boon
          to your health and wellbeing!{' '}
        </Text>
      </div>
    </>
  );
};

export default HeroSection;
