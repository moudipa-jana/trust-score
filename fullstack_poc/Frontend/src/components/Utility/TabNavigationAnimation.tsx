'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { GoogleGeminiEffect } from './google-gemini-effect';

type Props = {
  label?: string;
  className?: string;
};

const TabNavigationAnimation: React.FC<Props> = ({
  label = 'Written By',
  className = '',
}) => {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  const pathLengths = Array.from({ length: 5 }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(scrollYProgress, {
      stiffness: 400,
      damping: 30,
      restDelta: 0.001,
    }),
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setIsVisible(latest < 0.7);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className="relative h-64 w-full">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex aspect-video h-full w-full items-center justify-center">
          <GoogleGeminiEffect
            pathLengths={pathLengths}
            label={label}
            className="flex h-full w-full items-center justify-center"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TabNavigationAnimation;
