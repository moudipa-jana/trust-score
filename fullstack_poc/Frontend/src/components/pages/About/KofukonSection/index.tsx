import Heading from '@/elements/Heading';
import { useEffect, useState } from 'react';

const kofukonWords = [
  { text: 'Hearty', className: 'text-primary' },
  { text: 'Mindful', className: '' },
  { text: 'Curious', className: '' },
  { text: 'Confusion', className: '' },
  { text: 'Disappointment', className: '' },
];

function getScrollFraction() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const scrollHeight = doc.scrollHeight;
  const clientHeight = doc.clientHeight;
  if (scrollHeight <= clientHeight) return 1;
  return scrollTop / (scrollHeight - clientHeight);
}

function Kofukons() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    function onScroll() {
      const fraction = getScrollFraction();
      let wordsToShow = Math.max(0, Math.min(kofukonWords.length, Math.ceil(fraction * kofukonWords.length)));
      // Fallback: if user is at the bottom, always show all words
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 2) {
        wordsToShow = kofukonWords.length;
      }
      setVisibleCount(wordsToShow);
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="section6">
      <div className="innerContent">
        <div className="text-center ">
          <Heading priority="4" variant="lg">
            <span className="!font-headingBold !font-extrabold">Kofukons </span>
          </Heading>
        </div>
        <div className="kofukonsTexts !font-headingBold font-bold">
          {kofukonWords.map((word, idx) => {
            const isVisible = idx <= visibleCount;
            return (
              <div
                key={word.text}
                className={`eachKofukon ${word.className} ${isVisible ? 'animate-fadeIn-Slow' : 'opacity-0'}`}
                style={{ transitionDelay: `${idx * 0.2}s` }}
              >
                {word.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Kofukons;
