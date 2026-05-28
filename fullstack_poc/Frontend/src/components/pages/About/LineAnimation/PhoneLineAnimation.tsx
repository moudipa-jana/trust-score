import { SVGPathElement } from '@/types/about';
function PhoneLineAnimation(param: string) {
  // Get the id of the <path> element and the length of <path>
  const SvgLine = document.getElementById(`${param}`) as SVGPathElement;
  const length = SvgLine.getTotalLength();

  // The start position of the drawing
  SvgLine.style.strokeDasharray = length.toString();

  // Hide the SvgLine by offsetting dash. Remove this line to show the SvgLine before scroll draw
  SvgLine.style.strokeDashoffset = length.toString();

  // Find scroll percentage on scroll (using cross-browser properties), and offset dash same amount as percentage scrolled
  let speed = 1;
  function myFunction() {
    const scrollpercent =
      (document.body.scrollTop + document.documentElement.scrollTop) /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight);
    if (scrollpercent >= 0.4396923076923077) {
      speed = 1.8;
    }

    const draw = length * scrollpercent * speed - 500;

    // Reverse the drawing (when scrolling upwards)
    SvgLine.style.strokeDashoffset = (length - draw).toString();
  }
  window.addEventListener('scroll', myFunction);
}

export default PhoneLineAnimation;
