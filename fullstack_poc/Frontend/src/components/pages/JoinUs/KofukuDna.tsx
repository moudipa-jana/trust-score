import capitalize from 'lodash/capitalize';
import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';

import culture from '../../../../public/images/culture.png';

export default function KofukuDna({
  kofukuDnaDetails,
}: {
  kofukuDnaDetails: {
    title: string;
    description: string;
  };
}) {
  return (
    <div className="sm-container py-8">
      <div className=" pb-10 text-center">
        <Text>
          <p className="text-[56px]">{kofukuDnaDetails?.title}</p>
        </Text>
        <div className="lg:px-48">
          <Text size="md">{capitalize(kofukuDnaDetails?.description)}</Text>
        </div>
      </div>
      <hr />
      <div className="pt-10 lg:px-28">
        <CustomImage src={culture} alt="Logo" />
      </div>
    </div>
  );
}
