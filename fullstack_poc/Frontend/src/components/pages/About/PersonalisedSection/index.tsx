import { useEffect } from 'react';

import Pizza from '@/components/pages/About/PersonalisedSection/Pizza';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import ScrollAnimationCommon from '@/Hooks/ScrollAnimationCommon';

function PersonalisedSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  useEffect(() => {
    const speed = 80; // Doubled speed for even faster animation
    ScrollAnimationCommon('section5', 'path002', speed);
    ScrollAnimationCommon('section5', 'path001', speed);
    ScrollAnimationCommon('section5', 'path00ew2', speed);
    ScrollAnimationCommon('section5', 'path003', speed);
    ScrollAnimationCommon('section5', 'path005', speed);
    ScrollAnimationCommon('section5', 'path004', speed);

    ScrollAnimationCommon('section5', 'path006', speed);
    ScrollAnimationCommon('section5', 'path00ew2', speed);
    ScrollAnimationCommon('section5', 'path005', speed);
    ScrollAnimationCommon('section5', 'path004', speed);
    ScrollAnimationCommon('section5', 'pagerth002', speed);
  }, []);

  return (
    <div className="container relative" id="section5">
      <div className="personalisedImg absolute">
        <Pizza />
      </div>
      <div className="innerContent flex  flex-col ">
        <div className="personalisedTitle">
          <Heading priority="4" font="font-black" variant="lg">
            <span className="sectionTitle font-headingBold font-extrabold">
              {title}
            </span>
          </Heading>
        </div>
        <div className="mt-36 leading-[18px] lg:leading-relaxed xl:max-w-[325px]">
          <Text customClass="lg:!text-base">
            <p className="sectionDesc">{description}</p>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default PersonalisedSection;
