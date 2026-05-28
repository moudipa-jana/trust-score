import React from 'react';

import UserAboutIcon from '/public/images/userAbout.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';

function ProfileAbout({
  title,
  description,
  isDisabled,
}: {
  title: string;
  description: string;
  isDisabled?: boolean;
}) {
  return (
    <div className="lg:pt-4">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
        }}
        className={isDisabled ? 'blur-sm' : ''}
      >
        <Text>
          <p className="pt-1 text-base">{title}</p>
        </Text>
        <div style={{ height: '24px', width: '24px' }}>
          <CustomImage src={UserAboutIcon} />
        </div>
      </div>
      <div className="py-1.5" style={{ wordWrap: 'break-word' }}>
        <Text size="sm">{description}</Text>
      </div>
    </div>
  );
}

export default ProfileAbout;
