import React from 'react';
import Button from '../Utility/Button';
import Link from 'next/link';
import SignupHeader from './SignupHeader';
import Social from '@/components/pages/Forum/Social';
import useOSDetection from '@/Hooks/useOSDetection';
import { toggleLoginDialog, toggleSignupDialog } from '@/state/Slices/dialog';
import { useAppDispatch } from '@/Hooks/useRedux';

interface IProps {
  nextStep: () => void;
  setDetails: any;
  type: SignupHeaderProps;
}

interface SignupHeaderProps {
  type?: 'signup' | 'signin';
}

function SignupWith({ nextStep, setDetails, type }: IProps) {
  const { isWindows } = useOSDetection();
  const dispatch = useAppDispatch();

  const HandleContinueWith = (type: string) => {
    setDetails((prevDetails: any) => ({ ...prevDetails, signupType: type }));
    nextStep();
  };

  const handleSignin = () => {
    dispatch(toggleLoginDialog(true));
  };

  const handleSignup = () => dispatch(toggleSignupDialog(true));

  return (
    <div>
      <div className="flex flex-col gap-4 w-full">
        <SignupHeader type={type?.type} />

        <Button
          type="secondary"
          size="md"
          block
          customClassName="w-full"
          onClick={() => HandleContinueWith('email')}
        >
          {' '}
          Continue with email{' '}
        </Button>
        <Button
          type="primary"
          size="md"
          block
          customClassName="w-full"
          onClick={() => HandleContinueWith('phone')}
        >
          {' '}
          Continue with phone number{' '}
        </Button>
      </div>
      <div className="lg:my-8 my-5">
        <div className="m-auto max-w-lg justify-center  text-center text-xs font-normal text-gray-700 md:text-sm mt-3">
          By continuing, you agree to Kofuku&apos;s&nbsp;{''}
          <Link
            href="/terms"
            target="_blank"
            className="cursor-pointer text-primary"
          >
            Terms of Use
          </Link>
          &nbsp;and&nbsp;
          <Link
            href="/privacy-policy"
            target="_blank"
            className="cursor-pointer text-primary"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="m-auto max-w-lg justify-center px-0 text-center text-sm font-normal text-offwhite-650 mb-3">
          (Our website uses cookies to provide you a better user experience)
        </div>
      </div>
      <div
        className={`flex items-center mb-5 ${isWindows ? 'pb-1' : 'pb-4'} `}
      >
        <div className="ml-0 h-px flex-grow bg-gray-800 md:ml-5"></div>
        <span className="flex-shrink px-4 text-sm font-normal text-gray-50">
          {type?.type === 'signup' ? 'Already registered ?' : 'New user ?'}{' '}
          <span
            className="cursor-pointer text-primary"
            onClick={type?.type === 'signup' ? handleSignin : handleSignup}
          >
            {type?.type === 'signup' ? 'Sign-in' : 'Sign-up'}
          </span>
        </span>
        <div className="mr-0 h-px flex-grow bg-gray-800 md:mr-5"></div>
      </div>
      <Social />
    </div>
  );
}

export default SignupWith;
