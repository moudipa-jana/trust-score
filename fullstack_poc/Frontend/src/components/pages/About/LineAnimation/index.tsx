import { ReactNode, useEffect } from 'react';

import UseLineAnimation from '@/components/pages/About/LineAnimation/UseLineAnimation';

import Line from './Line';

function LineAnimation({ children }: { children: ReactNode }) {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1280px)').matches;

    if (isDesktop) {
      UseLineAnimation('fullBody', 'VarticalPath');
    }
  }, []);

  return (
    <div id="fullBody">
      <div className="container relative overflow-hidden">
        <div className="container absolute left-[5px] top-[102px] bottom-0 flex justify-center lg:top-[290px]">
          <Line />
        </div>
        {children}
      </div>
    </div>
  );
}

export default LineAnimation;
