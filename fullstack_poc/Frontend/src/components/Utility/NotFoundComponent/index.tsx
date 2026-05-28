import React from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import HomeRedirect from '@/elements/HomeRedirect';

interface IProps {
  errorMessage?: string;
  showRedirect?: boolean;
}

function NotFoundComponent({ errorMessage, showRedirect }: IProps) {
  return (
    <div className="layout mt-10 flex flex-col items-center justify-center text-center text-black">
      <RiAlarmWarningFill
        size={60}
        className="drop-shadow-glow animate-flicker text-red-500"
      />
      <h2 className="mt-8 text-2xl lg:text-3xl">
        {errorMessage || "Oops! We couldn't find anything"}
      </h2>
      {showRedirect && (
        <HomeRedirect className="mt-4 cursor-pointer underline lg:text-lg">
          Back to Home
        </HomeRedirect>
      )}
    </div>
  );
}
export default NotFoundComponent;
