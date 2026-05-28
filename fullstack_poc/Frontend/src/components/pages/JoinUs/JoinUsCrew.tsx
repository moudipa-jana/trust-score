import { capitalize } from 'lodash';
import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import { getStrapiMedia } from '@/lib/helpers';
import { JoinUsAttributes } from '@/types/joinUs';

import bgyellow from '../../../../public/images/bgyellow.png';

export default function JoinUsCrew({
  JoinUsCrewDetails,
}: {
  JoinUsCrewDetails: JoinUsAttributes['heroSection'];
}) {
  return (
    <div className="sm-container">
      <div className=" grid lg:grid-cols-10 lg:gap-2">
        <div
          className="p-4 lg:col-span-6"
          style={{
            backgroundImage: `url(${bgyellow.src})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          <Text>
            <p className="pb-2 text-[40px] lg:text-[56px]">
              {capitalize(JoinUsCrewDetails?.Title)}
            </p>
          </Text>
          <Text size="md"></Text>
          <Text size="md">{JoinUsCrewDetails?.description}</Text>
        </div>
        <div className="h-full lg:col-span-4">
          <CustomImage
            fill
            className="object-cover"
            src={getStrapiMedia(
              JoinUsCrewDetails?.coverImg?.image?.data?.attributes?.url,
            )}
            alt={JoinUsCrewDetails?.altText}
          />
        </div>
      </div>
    </div>
  );
}
