import { useState } from 'react';

import ForgetPassword from '@/components/Signin/ForgetPassword';
import Signin from '@/components/Signin/Signin';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import SignupWith from '@/components/Signup/SignupWith';
import CustomImage from '@/components/Utility/CustomImage';

export interface ISignupState {
  email: string;
  phoneNumber: string;
  password: string;
  signupType: string;
}

function SigninModal() {
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState<ISignupState>({
    email: '',
    phoneNumber: '',
    password: '',
    signupType: '',
  });
  return (
    <>
      <div className="grid grid-cols-12 w-full h-full gap-15 items-center">
        <div className="col-span-6">
          <CustomImage
            src={'/images/signup-img.png'}
            className="w-full"
            width={490}
            height={570}
            alt="SignUp Image"
          />
        </div>

        <div className="col-span-6 relative z-10">
          {index === 1 && (
            <div className="pb-2">
              <button
                className="modal-back-close absolute left-3 -top-2"
                onClick={() => setIndex(0)}
              >
                <svg
                  width="18"
                  height="17"
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.29546 0.783953C7.68887 0.396332 8.32202 0.40102 8.70964 0.794426C9.09726 1.18783 9.09257 1.82098 8.69917 2.2086L3.32881 7.5H17C17.5523 7.5 18 7.94772 18 8.5C18 9.05229 17.5523 9.5 17 9.5H3.33542L8.69917 14.7849C9.09257 15.1725 9.09726 15.8057 8.70964 16.1991C8.32202 16.5925 7.68887 16.5972 7.29546 16.2095L0.371273 9.38715C-0.125641 8.89754 -0.125641 8.09595 0.371273 7.60634L7.29546 0.783953Z"
                    fill="#737373"
                  />
                </svg>
              </button>
            </div>
          )}

          <SwipeableViews index={index} disabled>
            <SignupWith
              nextStep={() => setIndex(1)}
              setDetails={setDetails}
              type={{ type: 'signin' }}
            />
            <Signin handleForgot={() => setIndex(2)} SigninData={details} />
            <ForgetPassword
              goBack={() => setIndex(1)}
              nextStep={() => setIndex(3)}
            />
          </SwipeableViews>
        </div>
      </div>
    </>
  );
}

export default SigninModal;
