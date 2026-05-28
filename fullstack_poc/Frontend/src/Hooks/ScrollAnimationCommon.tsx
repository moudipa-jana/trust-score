/**
 * ScrollAnimationCommon animates an SVG path based on scroll position and visibility.
 * - Uses IntersectionObserver to track when an element comes into view.
 * - Animates stroke properties of the SVG path based on the scroll position and a specified speed.
 */

interface SVGPathElement extends HTMLElement {
  getTotalLength(): number;
  style: CSSStyleDeclaration & {
    strokeDasharray: string;
    strokeDashoffset: string | number;
    transition: string;
  };
}

interface IntersectionEntry {
  target: HTMLElement;
  isIntersecting: boolean;
}

function ScrollAnimationCommon(
  targetElement: string,
  svgPath: string,
  speed = 2,
) {
  let value = 0;
  let ticking = false;
  let updatePath = false;
  const element = document.querySelector(`#${targetElement}`) as HTMLElement;
  const path = document.querySelector(`#${svgPath}`) as SVGPathElement;

  let totalLength = 0;

  function initPath(pathValue: SVGPathElement) {
    totalLength = pathValue.getTotalLength();
    pathValue.style.strokeDasharray = `${totalLength}`;
    pathValue.style.strokeDashoffset = totalLength as unknown as string;
  }
  initPath(path);

  function handleEntries(entries: IntersectionEntry[]) {
    if (entries[0].target.id === 'section1') {
      value = 1000.0919354941647;
    }

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        return 0;
      }
      return null;
    });

    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      handleEntries(entries as unknown as IntersectionEntry[]);

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updatePath = true;
        } else {
          updatePath = false;
        }
      });
    },
    { rootMargin: '10px 0px 0px 0px' },
  );

  observer.observe(element);

  function doSomething(updatePathValue: boolean) {
    if (!updatePathValue || !path) return;

    window.requestAnimationFrame(() => {
      const center = window.innerHeight / 2;
      const boundaries = path.getBoundingClientRect();
      const top = boundaries.top;
      const height = boundaries.height;
      const percentage = (center - top) / height;
      const drawLength =
        percentage > 0 ? totalLength * percentage * speed - value : 0;

      path.style.strokeDashoffset = `${
        drawLength < totalLength ? totalLength - drawLength : 0
      }`;
      path.style.transition = 'stroke-dashoffset 0.2s ease';
    });
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        doSomething(updatePath);
        ticking = false;
      });

      ticking = true;
    }
  });
}

export default ScrollAnimationCommon;
