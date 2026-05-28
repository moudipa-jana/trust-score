{
  /**
   * Logo component renders the application's logo using a reusable CustomImage wrapper.
   */
}
import React from 'react';

import LogoImage from '/public/images/new-logo.svg';
import CustomImage from '@/components/Utility/CustomImage';

function Logo() {
  return <CustomImage src={LogoImage} alt="Logo" />;
}

export default Logo;
