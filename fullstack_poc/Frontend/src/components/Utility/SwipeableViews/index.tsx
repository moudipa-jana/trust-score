/**
 * SwipeableViews is now a wrapper around SwiperJS,
 * enabling touch-enabled sliding transitions.
 * It supports custom styles, lazy loading, scroll handling, and transition callbacks.
 */
import 'swiper/css';

import { Children } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

type OnChangeIndexCallback = (index: number, indexLatest: number) => void;
type OnTransitionEndCallback = () => void;

interface IProps {
  children: React.ReactNode;
  index: number;
  disabled?: boolean;
  style?: React.CSSProperties | undefined;
  slideStyle?: React.CSSProperties | undefined;
  onChangeIndex?: OnChangeIndexCallback | undefined;
  onTransitionEnd?: OnTransitionEndCallback | undefined;
}

function SwipeableViews({
  children,
  index,
  disabled,
  style,
  slideStyle,
  onChangeIndex,
  onTransitionEnd,
}: IProps) {
  return (
    <Swiper
      allowTouchMove={!disabled}
      style={style}
      initialSlide={index}
      onSlideChange={(swiper: SwiperType) => {
        if (onChangeIndex && swiper.activeIndex !== index) {
          onChangeIndex(swiper.activeIndex, index);
        }
      }}
      onTransitionEnd={() => {
        if (onTransitionEnd) {
          onTransitionEnd();
        }
      }}
      onSwiper={(swiper: any) => {
        if (swiper.activeIndex !== index) {
          swiper.slideTo(index, 0);
        }
      }}
      // Keep Swiper in sync with prop index
      // This effect is needed to update Swiper when index prop changes

      key={index}
    >
      {Children.map(children, (child, i) => (
        <SwiperSlide key={i} style={slideStyle}>
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

SwipeableViews.defaultProps = {
  index: 0,
};

export default SwipeableViews;
