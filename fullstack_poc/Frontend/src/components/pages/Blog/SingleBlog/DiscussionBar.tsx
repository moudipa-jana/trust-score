import React from 'react';

import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';

export default function DiscussionBar() {
  return (
    <div className="sm-container">
      <div className=" my-5 flex justify-center py-8 lg:my-10">
        <div className=" discussion flex items-center justify-center gap-4 rounded bg-blue-800 py-2 px-4">
          <Text size="lg">
            <span className="text-sm text-white lg:text-2xl">
              Continue this discussion on Kofuku Social
            </span>
          </Text>
          <Button type="bgWhite" size="xs" customClassName="rounded" link="/">
            <span className="goShadow text-2xl font-extrabold lg:text-4.5xl">
              Go
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
