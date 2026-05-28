{
  /**
   * PageProgressBar displays a horizontal progress indicator at the top of the page,
   * reflecting how much of the page the user has scrolled through.
   */
}
import { useEffect } from 'react';

function PageProgressBar() {
  function scrollBody() {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressElem: HTMLElement | null = document.getElementById('scrollBodyBar');
    progressElem && ((progressElem as HTMLElement).style.width = scrolled + '%');
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollBody, true);
    window.onbeforeunload = null;
    return () => {
      window.removeEventListener('scroll', scrollBody, true);
      window.onbeforeunload = null;
    };
  }, []);
  return (
    <div className="progress-container">
      <div className="progress-bar" id="scrollBodyBar"></div>
    </div>
  );
}

export default PageProgressBar;
