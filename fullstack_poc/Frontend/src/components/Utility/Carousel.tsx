{
  /**
   * Carousel is a customizable slider component powered by react-slick.
   * It supports responsive settings, custom arrows, autoplay, fade, and dynamic slide control,
   * with optional configuration for mobile and desktop breakpoints.
   */
}
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import Slider from 'react-slick';
const SlickSlider = Slider as any;

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface PrevArrowProps {
  className?: string;
  onClick?: () => void;
  joinCampfire?: boolean;
}

interface NextArrowProps {
  className?: string;
  onClick?: () => void;
}

interface CarouselProps {
  children: React.ReactNode;
  slidesToShow: number;
  slidesToScroll?: number;
  initialSlide?: number;
  smSlidesToShow: number;
  mdSlidesToShow: number;
  arrow?: boolean;
  dots?: boolean;
  fade?: boolean;
  autoplay?: boolean;
  infinite?: boolean;
  joinCampfire?: boolean;
}

function SamplePrevArrow({ className, onClick, joinCampfire }: PrevArrowProps) {
  const prevArrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const prevArrowElement = document.querySelector('.slick-prev');
      if (prevArrowElement) {
        prevArrowElement.classList.add('slick-disable');
      }
    }, 0);
  }, []);

  return (
    <div
      onClick={onClick}
      className={`${className} ${joinCampfire ? '!left-[-20px]' : ''} z-10`}
      ref={prevArrowRef}
    >
      <FaAngleLeft />
    </div>
  );
}

function SampleNextArrow({ className, onClick }: NextArrowProps) {
  const nextArrowRef = useRef<HTMLDivElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const handleClick = () => {
    setIsDisabled(true);
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (isDisabled) {
        const prevArrowElement = document.querySelector('.slick-prev');
        if (prevArrowElement) {
          prevArrowElement.classList.remove('slick-disable');
        }
      }
    }, 0);
  }, [isDisabled]);

  return (
    <div
      onClick={handleClick}
      className={`${className} z-10`}
      ref={nextArrowRef}
    >
      <FaAngleRight />
    </div>
  );
}

function Carousel({
  children,
  slidesToShow,
  slidesToScroll,
  initialSlide,
  smSlidesToShow,
  mdSlidesToShow,
  arrow,
  dots,
  fade,
  autoplay,
  infinite,
  joinCampfire,
}: CarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();

  const settings = {
    dots: dots ? dots : false,
    fade: false,
    infinite: infinite ? infinite : false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToScroll,
    autoplay: autoplay,
    arrows: arrow ? arrow : true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow joinCampfire={joinCampfire} />,
    initialSlide: router.pathname.startsWith('/sunrise-club/') ? activeSlide : initialSlide,
    touchThreshold: 10,
    draggable: true,
    afterChange: (index: number) => setActiveSlide(index),
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1279,
        settings: {
          slidesToShow: mdSlidesToShow,
          slidesToScroll: slidesToScroll,
          infinite: infinite ? infinite : false,
          arrows: arrow ? arrow : true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: smSlidesToShow,
          slidesToScroll: 1,
          initialSlide: 1,
          infinite: infinite ? infinite : false,
          arrows: arrow ? arrow : true,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: smSlidesToShow,
          slidesToScroll: 1,
          infinite: infinite ? infinite : false,
          arrows: arrow ? arrow : true,
          fade: fade ? false : true,
        },
      },
    ],
  };

  return (
    <div>
      <style jsx global>{`
        .slick-slide {
          margin: 0 10px;
        }
        .slick-list {
          margin: 0 -10px;
        }
        @media only screen and (max-width: 1279px) {
          .slick-slide {
            margin: 0;
          }
          .slick-list {
            margin: 0;
          }
        }

        @media only screen and (max-width: 767px) {
          .slick-slide {
            margin: 0;
          }
          .slick-list {
            margin: 0;
          }
        }
      `}</style>
      <div>
        <SlickSlider swipe {...settings}>
          {React.Children.toArray(children).slice(0, 9)}
        </SlickSlider>
      </div>
    </div>
  );
}

export default Carousel;
