import { useMutation } from '@apollo/client/react';
import { Field, Formik, FormikProps } from 'formik';
import { capitalize } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { postAuthSuccess } from '@/actions/auth';
import Social from '@/components/pages/Forum/Social';
import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useOSDetection from '@/Hooks/useOSDetection';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  allowOnlyNumericValue,
  contactFormatter,
  emitErrorNotification,
  formatGraphqlError,
  getRawContact,
} from '@/lib/helpers';
import { SIGNIN_MUTATION, SIGNIN_PHONE_MUTATION } from '@/service/graphql/Auth';
import { loginSuccess } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { validateForm } from '@/utils/verifyAuthForm';
import onReCAPTCHAChange from '@/utils/verifyCaptcha';
import SignupHeader from '@/components/Signup/SignupHeader';
import CustomImage from '../Utility/CustomImage';
import Link from 'next/link';

interface ISignin {
  handleForgot: () => void;
  SigninData?: any;
}

interface FormValues {
  email: string;
  phoneNumber: string;
  password: string;
}

function Signin({ handleForgot, SigninData }: ISignin) {
  const { isWindows } = useOSDetection();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const dispatch = useAppDispatch();
  const [recaptchaToken, setrecaptchaToken] = useState<string | null>('null');
  const socialAuthLoading = useAppSelector((state) => state.auth.authLoading);

  const [phoneSignin, { error: phoneError, data: phoneData }] = useMutation(
    SIGNIN_PHONE_MUTATION,
  );

  const [signin, { error, loading, data }] = useMutation(SIGNIN_MUTATION);

  // Handle mutation completion with useEffect
  useEffect(() => {
    if (data || phoneData) {
      const { accessToken, profile } = data
        ? (data as any).login
        : (phoneData as any).phoneLogin;
      dispatch(
        loginSuccess({
          token: accessToken,
          profile,
        }),
      );
      dispatch(postAuthSuccess(profile.id, accessToken));
    }
  }, [data, dispatch, phoneData]);

  const handleSignup = () => dispatch(toggleSignupDialog(true));

  // const handleLogin = (values: FormValues) => {
  //   if (!recaptchaToken) {
  //     return emitErrorNotification('Please verify the captcha to proceed!');
  //   }
  //   return signin({
  //     variables: values,
  //   });
  // };

  const handleLogin = (values: FormValues) => {
    if (!recaptchaToken) {
      return emitErrorNotification('Please verify the captcha to proceed!');
    }
    if (SigninData?.signupType === 'phone') {
      return phoneSignin({
        variables: {
          phone: '+91' + getRawContact(values.phoneNumber),
          password: values.password,
        },
      });
    } else {
      return signin({
        variables: {
          email: values.email,
          password: values.password,
        },
      });
    }
  };

  return (
    <div>
      <SignupHeader type={'signin'} />

      <Formik<FormValues>
        initialValues={{ email: '', phoneNumber: '', password: '' }}
        validateOnMount
        onSubmit={handleLogin}
      >
        {({ handleSubmit, isValid, errors }: FormikProps<FormValues>) => (
          <form onSubmit={handleSubmit}>
            {SigninData.signupType === 'phone' ? (
              <div className="flex items-start gap-3 mt-4 mb-4">
                <div className="flex items-center px-3 py-2 border rounded-lg bg-white cursor-pointer min-w-[50px] justify-between mb-2">
                  <span className=" ">
                    <CustomImage
                      src={'/images/ind-flag.svg'}
                      width={16}
                      height={24}
                      alt="India Flag"
                    />
                  </span>
                </div>

                <div className="flex-1">
                  <Field
                    name="phoneNumber"
                    component={FormInput}
                    placeholder="Enter phone number"
                    type="tel"
                    onKeyPress={allowOnlyNumericValue}
                    onKeyUp={(e: any) => contactFormatter(e)}
                    validate={(value: string) => {
                      if (!value) return '*Required';
                      if (!/^[0-9]{10}$/.test(getRawContact(value)))
                        return 'Invalid phone number';
                      return undefined;
                    }}
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
            ) : (
              <Field
                name="email"
                component={FormInput}
                placeholder="Enter Email"
                type="email"
                className="block w-full  rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                validate={validateForm.email}
              />
            )}

            <div className="relative">
              <Field
                placeholder="Enter Password"
                name="password"
                password="true"
                component={FormInput}
                validate={validateForm.password}
                className="block w-full rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
              />
              <div
                className={`right-0 cursor-pointer text-right ${
                  errors?.password && errors.password.length > 80
                    ? '-bottom-4'
                    : 'bottom-0'
                }`}
                onClick={handleForgot}
              >
                <Text size="xs" color="text-primary">
                  Forgot password
                </Text>
              </div>
            </div>
            <div className="flex items-center justify-center mt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                size="normal"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY as string}
                onChange={(captchaToken: string | null) =>
                  onReCAPTCHAChange(
                    captchaToken,
                    recaptchaRef,
                    setrecaptchaToken,
                  )
                }
              />
            </div>

            <div className={isWindows ? 'my-4' : 'my-6'}>
              <Button
                legacyType="submit"
                block
                isLoading={loading}
                isdisabled={
                  loading || socialAuthLoading || !isValid || !recaptchaToken
                }
              >
                Continue
              </Button>

              <div className="flex items-center justify-center">
                <Text size="sm" color="text-[red]">
                  {error &&
                    (capitalize(formatGraphqlError(error)) ||
                      'please try again ')}
                </Text>
              </div>
            </div>
          </form>
        )}
      </Formik>
      <div className="lg:my-10 my-5">
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
      <div className="flex items-center pb-4">
        <div className="h-px flex-grow bg-gray-800"></div>
        <span className="flex-shrink px-4 text-sm font-normal text-black-400">
          New user?{' '}
          <span className="cursor-pointer text-primary" onClick={handleSignup}>
            Sign up
          </span>
        </span>
        <div className="h-px flex-grow bg-gray-800"></div>
      </div>

      <Social />
    </div>
  );
}

export default Signin;
