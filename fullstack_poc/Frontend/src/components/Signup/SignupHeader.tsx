import React from 'react';
import CustomImage from '../Utility/CustomImage';

interface SignupHeaderProps {
  type?: 'signup' | 'signin';
}

const SignupHeader: React.FC<SignupHeaderProps> = ({ type = 'signup' }) => {
  const title = type === 'signin' ? 'Sign In' : 'Sign Up';

  return (
    <div className='mb-3'>
      <div className="text-center">
        <CustomImage
          src={'/images/logo-icon.svg'}
          className="!w-[38px] mx-auto"
          width={38}
          height={48}
          alt={title}
        />
      </div>

      <h2 className="text-2xl text-black-200 font-regular text-center">
        {title}
      </h2>
    </div>
  );
};

export default SignupHeader;