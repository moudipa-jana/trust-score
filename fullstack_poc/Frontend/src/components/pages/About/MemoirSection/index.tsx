import { useEffect, useState } from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import { useIsDesktop } from '@/Hooks/useIsDesktop';
interface ScrollElement extends HTMLElement {
  scrollTop: number;
  scrollHeight: number;
}
const cardsData = [
  {
    url: 'images/memoir/card-1.png',
    alt: 'card-1',
  },
  {
    url: 'images/memoir/card-2.png',
    alt: 'card-2',
  },
  {
    url: 'images/memoir/card-3.svg',
    alt: 'card-3',
  },
  {
    url: 'images/memoir/card-4.svg',
    alt: 'card-4',
  },
  {
    url: 'images/memoir/card-5.svg',
    alt: 'card-5',
  },
  {
    url: 'images/memoir/card-6.svg',
    alt: 'card-6',
  },
];

function MemoirSection() {
  const [hasSeenCards, setHasSeenCards] = useState(false);
  const isdesktop = useIsDesktop();

  useEffect(() => {
    function updateImagePosition(offset: number) {
      if (offset > 9.8 && offset < 12.7) {
        if (isdesktop) {
          setHasSeenCards(true);
        }
      } else {
        setHasSeenCards(false);
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
  }, [isdesktop]);

  return (
    <div className="container" id="section7">
      <div className="innerContent relative">
        <div className="pr-[70px] text-right lg:pr-[120px] xl:pr-[300px]">
          <Heading priority="4" variant="lg" font="font-headingBold font-extrabold">
            Memoir
          </Heading>
        </div>
        <div className="allCardsHolder relative">
          {cardsData &&
            cardsData.map(
              (
                card: {
                  url: string;
                  alt: string;
                },
                index: number,
              ) => (
                <div
                  className="eachCardHolder"
                  id={'card' + index}
                  key={card.alt}
                >
                  <div
                    className={`rotateBeg ${
                      hasSeenCards ? 'animate-swing-once' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <div className="cardFront !z-75 !rounded-none !p-0">
                      <CustomImage
                        src={card.url}
                        fill
                        style={{ objectFit: 'contain' }}
                        alt={card.alt}
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
        </div>
      </div>
    </div>
  );
}

export default MemoirSection;
