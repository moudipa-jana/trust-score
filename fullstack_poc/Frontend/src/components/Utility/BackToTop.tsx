{
  /**
   * BackToTop renders a floating button that scrolls smoothly to a target section when clicked.
   * It becomes visible after scrolling past a threshold and uses react-scroll for animation.
   */
}
import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundUp } from 'react-icons/io';
import { Link } from 'react-scroll';

interface IBackToTop {
  to: string;
}

function BackToTop({ to }: IBackToTop) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const LinkComponent = Link as React.ElementType;

  return (
    <div className="container flex items-end justify-end">
      <div className="backcontainer  fixed bottom-10 z-130 ml-auto  flex   py-4 ">
        <LinkComponent to={to} spy smooth offset={-70} duration={500}>
          <div
            className={`backtoTopCircle relative  flex cursor-pointer ${
              showButton ? '' : 'hidden'
            }`}
          >
            <div className="bounceEffect">
              <IoIosArrowRoundUp />
            </div>
          </div>
        </LinkComponent>
      </div>
    </div>
  );
}

export default BackToTop;
