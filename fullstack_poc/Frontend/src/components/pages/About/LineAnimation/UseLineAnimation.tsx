import { SVGPathElement } from '@/types/about';

export default function UseLineAnimation(sectionId: string, pathId: string) {
  let speed = 1;
  const value = 400;
  let ticking = false;
  let LastKnownScrollPosition = 0;
  const test = 0;
  let updatePath = false;

  const element = document.querySelector(`#${sectionId}`) as HTMLElement;
  const path = document.querySelector(`#${pathId}`) as SVGPathElement;

  let totalLength = 0;

  function initPath(pathValue: SVGPathElement) {
    totalLength = pathValue?.getTotalLength();
    if (pathValue) {
      pathValue.style.strokeDasharray = `${totalLength}`;
      pathValue.style.strokeDashoffset = totalLength.toString();
    }
  }

  initPath(path);
  function handleEntries(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        updatePath = true;
      } else {
        updatePath = false;
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      handleEntries(entries);

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updatePath = true;
        } else {
          updatePath = false;
        }
      });
    },
    { rootMargin: '0px 0px 0px 0px' },
  );

  observer.observe(element);

  function doSomething(scrollPosition: number) {
    if (!updatePath) return;
    window.requestAnimationFrame(() => {
      const center = window.innerHeight / 2;

      const boundaries = path && path.getBoundingClientRect();

      const top = boundaries && boundaries.top;
      const height = boundaries && boundaries.height;
      const percentage = (center - top) / height;

      if (scrollPosition >= 0.25647458767354453) {
        speed = 1.1;
      }
      if (scrollPosition <= 0.25647458767354453) {
        speed = 2.6;
      }
      if (scrollPosition >= 0.4437586299609322) {
        speed = 1.22 ;
      }

      const drawLength =
        percentage > 0 ? totalLength * percentage * speed - value + test : 0;

      if (path) {
        path.style.strokeDashoffset =
          drawLength < totalLength
            ? (totalLength - drawLength).toString()
            : '0';

        path.style.transition = 'stroke-dashoffset 0.3s ease';
      }
    });
  }

  window.addEventListener('scroll', function () {
    LastKnownScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function () {
        doSomething(LastKnownScrollPosition);
        ticking = false;
      });

      ticking = true;
    }
  });
}
