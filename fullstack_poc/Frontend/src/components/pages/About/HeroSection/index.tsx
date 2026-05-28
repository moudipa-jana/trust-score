import { useEffect } from 'react';

import Video from './video';

interface ScrollElement extends HTMLElement {
  scrollTop: number;
  scrollHeight: number;
}

function HeroSection() {
  useEffect(() => {
    const tapTextElem = document.getElementById('tapText');

    function updateImagePosition(offset: number) {
      if (offset > 0.87 && offset < 1.25) {
        tapTextElem?.classList.add('showText');
      } else {
        tapTextElem?.classList.remove('showText');
      }
    }

    function getScrollFraction(): number {
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
    <div className="w-full " id="section1">
      <h1 className="sr-only ">Roboot Health</h1>
      <Video />
      <div className="tapStyle tapRhythm " id="tapText">
        <div className="font-headingBold text-lg  font-extrabold text-primary lg:text-[35px] xl:text-[62px]">
          Tap to the Rhythm{' '}
        </div>
        <div className="text-xs font-bold tracking-[2px] lg:text-md lg:tracking-[5px] xl:text-3xl">
          {' '}
          Filter the noise
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
