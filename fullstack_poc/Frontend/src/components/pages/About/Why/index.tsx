import { useEffect } from 'react';

import RightSideMan from '@/components/pages/About/Why/RightSideMan';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';

interface ScrollElement extends HTMLElement {
  scrollTop: number;
  scrollHeight: number;
}

function Why({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    const rightSideManEl: HTMLElement | null =
      document.getElementById('rightSideMan');

    function updateImagePosition(offset: number) {
      if (offset > 4.94 && offset < 6.2) {
        rightSideManEl?.classList.add('moveRightMan');
        rightSideManEl?.classList.remove('moveBackRightMan');
      } else {
        rightSideManEl?.classList.remove('moveRightMan');
        rightSideManEl?.classList.add('moveBackRightMan');
      }
    }
    function getScrollFraction() {
      const h = document.documentElement as ScrollElement,
        b = document.body as ScrollElement,
        st = 'scrollTop',
        sh = 'scrollHeight';
      return ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 13.6;
    }

    function onScroll() {
      updateImagePosition(getScrollFraction());
    }

    updateImagePosition(0);

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="container relative" id="section4">
      <div className=" absolute right-0 -top-[7rem]" id="rightSideMan">
        <RightSideMan />
      </div>
      <div className="innerContent lg:flex lg:items-center lg:justify-center">
        <div className="text-center leading-none">
          <Heading priority="4" variant="lg" font="font-black">
            <span className="aboutWhyTitle">
              <span className="sectionTitle font-headingBold font-extrabold capitalize">
                {title}
              </span>
            </span>
          </Heading>
        </div>
        <div className="whyUsText sectionDesc mt-2 lg:mt-0 lg:pl-0 pl-5">
          <Text customClass="lg:!text-base">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Why;
