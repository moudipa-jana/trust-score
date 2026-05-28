import capitalize from 'lodash/capitalize';
import React from 'react';

import Text from '@/elements/Text';
import { JoinUsAttributes } from '@/types/joinUs';

export default function FlamingoText({
  heroDetails,
}: {
  heroDetails: JoinUsAttributes['heroSection'];
}) {
  return (
    <div className=" sm-container">
      <div className="w-full justify-between py-4 lg:flex">
        <div className="lg:w-1/2">
          <Text>
            <span className="text-[36px] text-primary lg:text-[56px] ">
              {capitalize(heroDetails?.Title)}
            </span>
          </Text>
        </div>
        <div className="lg:w-1/2">
          <Text size="base">{heroDetails?.description}</Text>
        </div>
      </div>
    </div>
  );
}
