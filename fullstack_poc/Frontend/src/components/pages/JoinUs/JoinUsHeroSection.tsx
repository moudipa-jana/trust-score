import React from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import { getStrapiMedia } from '@/lib/helpers';

export default function JoinUsHeroSection({
  heroImage,
}: {
  heroImage: string;
}) {
  return (
    <div className="sm-container py-4">
      <div className=" rounded-lg">
        <CustomImage fill src={getStrapiMedia(heroImage)} />
      </div>
    </div>
  );
}
