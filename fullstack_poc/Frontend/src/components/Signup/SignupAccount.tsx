import React, { useState } from 'react';

import { useLazyQuery, useMutation } from '@apollo/client/react';
import { Field, Formik, FormikHelpers, FormikProps } from 'formik';
import Link from 'next/link';
import { Dispatch, SetStateAction, useEffect } from 'react';
import Social from '@/components/pages/Forum/Social';
import Button from '@/components/Utility/Button';
import { ISignupState } from '@/components/Utility/Dialogs/SignupDialog';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import useOSDetection from '@/Hooks/useOSDetection';
import { useAppDispatch } from '@/Hooks/useRedux';
import Label from '@/elements/Label';

import {
  allowOnlyNumericValue,
  contactFormatter,
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  getRawContact,
} from '@/lib/helpers';
import {
  SEND_EMAIL_OTP_MUTATION,
  SEND_PHONE_OTP_MUTATION,
  VERIFY_SIGNUP_EMAIL_QUERY,
  VERIFY_SIGNUP_PHONE_QUERY,
} from '@/service/graphql/Auth';
import { toggleLoginDialog } from '@/state/Slices/dialog';
import { validateForm } from '@/utils/verifyAuthForm';
import SignupHeader from './SignupHeader';
import CustomImage from '../Utility/CustomImage';

interface IProps {
  nextStep: () => void;
  data?: any;
  setDetails: Dispatch<SetStateAction<ISignupState>>;
  back: () => void;
}

interface SendOtpResponse {
  socialotp: {
    success: boolean;
    message: string;
  };
}

const SignupAccount = ({ nextStep, data, setDetails, back }: IProps) => {
  const { isWindows } = useOSDetection();
  const dispatch = useAppDispatch();

  const [country, setCountry] = useState({
    code: '+91',
    flag: String.fromCodePoint(0x1f1ee, 0x1f1f3),
  });
  const [sendEmailOtpMutation, { loading: otpLoading }] =
    useMutation<SendOtpResponse>(SEND_EMAIL_OTP_MUTATION);

  const [sendPhoneOtpMutation, { loading: otpPhoneLoading }] =
    useMutation<SendOtpResponse>(SEND_PHONE_OTP_MUTATION);

  const [verifyEmailExist, { error: emailError }] = useLazyQuery(
    VERIFY_SIGNUP_EMAIL_QUERY,
  );
  const [verifyPhoneExist, { error: phoneError }] = useLazyQuery(
    VERIFY_SIGNUP_PHONE_QUERY,
  );

  useEffect(() => {
    if (emailError) {
      emitErrorNotification(formatGraphqlError(emailError));
    }
    if (phoneError) {
      emitErrorNotification(formatGraphqlError(phoneError));
    }
  }, [emailError, phoneError]);

  const VerifyEmailAndPassword = async (values: any): Promise<boolean> => {
    try {
      const verifyData = await verifyEmailExist({
        variables: { ...values },
      });

      return (verifyData.data as any).users.length === 0;
    } catch (err: unknown) {
      return false;
    }
  };

  const VerifyPhone = async (values: any): Promise<boolean> => {
    try {
      const verifyData = await verifyPhoneExist({
        variables: {
          phoneNumber: country.code + getRawContact(values.phone),
        },
      });
      const count =
        (verifyData.data as any)?.users_aggregate?.aggregate?.count || 0;

      return count > 0 ? false : true;
    } catch (err: unknown) {
      return false;
    }
  };

  const handleSendOtp = async ({
    type,
    email,
    phone,
  }: {
    type: any;
    email?: string;
    phone?: string;
  }) => {
    try {
      if (type === 'email' && email) {
        const { data } = await sendEmailOtpMutation({
          variables: { email },
        });

        if (data?.socialotp?.success) {
          emitNotification('success', 'OTP sent to your email');

          nextStep();
        } else {
          emitErrorNotification(data?.socialotp?.message);
        }
      }

      if (type === 'phone' && phone) {
        const { data } = await sendPhoneOtpMutation({
          variables: {
            phoneNumber: phone,
          },
        });
        1;

        if (data?.socialotp?.success) {
          emitNotification('success', 'OTP sent to your Mobile Number');
          nextStep();
        } else {
          emitErrorNotification(
            data?.socialotp?.message || 'OTP sending failed',
          );
        }
      }
    } catch (error: any) {
      const msg = formatGraphqlError(error) || 'OTP sending failed';
      emitErrorNotification(msg);
    }
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting }: FormikHelpers<any>,
  ) => {
    const isEmail = data?.signupType === 'email';

    const isValid = isEmail
      ? await VerifyEmailAndPassword(values)
      : await VerifyPhone(values);

    if (isValid) {
      setDetails((prev) => ({
        ...prev,
        ...(data?.signupType === 'phone' &&
          values.phone && {
            phoneNumber: country.code + getRawContact(values.phone),
          }),
        email: data?.signupType === 'email' ? values.email : '',
      }));
      setSubmitting(false);
      if (data?.signupType === 'email') {
        handleSendOtp({
          type: 'email',
          email: values.email,
        });
      } else {
        handleSendOtp({
          type: 'phone',
          phone: country.code + getRawContact(values.phone),
        });
      }
    } else {
      emitErrorNotification(
        `${data?.signupType === 'email' ? 'Email' : 'Phone'} already exists`,
      );
      setSubmitting(false);
    }
  };

  const handleSignin = () => {
    dispatch(toggleLoginDialog(true));
  };

  return (
    <>
      <div className={`text-center `}>
        {/* <button
          className="modal-back-close absolute left-3 top-0"
          onClick={back}
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
        </button> */}
        <SignupHeader type="signup" />
      </div>
      <Formik
        initialValues={{
          phone: '',
          email: '',
        }}
        validateOnMount
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, isSubmitting }) => {
          const isFormValid =
            values.email.trim() !== '' || values.phone.trim() !== '';

          return (
            <form onSubmit={handleSubmit}>
              <div className=" items-center gap-3 mt-4">
                {data?.signupType === 'phone' ? (
                  <>
                    <div className="flex items-start gap-3 mt-4 mb-4">
                      <div className="flex items-center px-3 py-2.5 border border-blue-400 rounded-xl bg-white cursor-pointer min-w-[50px] justify-between mb-2">
                        {/* <span className="text-lg">{country.flag}</span> */}
                        <CustomImage
                          src={'/images/ind-flag.svg'}
                          width={16}
                          height={24}
                          alt="India Flag"
                        />
                      </div>

                      <div className="flex-1">
                        <Field
                          name="phone"
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
                          className="w-full px-4 py-3 border border-blue-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Field
                      name="email"
                      component={FormInput}
                      placeholder="Enter email address"
                      type="email"
                      validate={validateForm.email}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 mt-2 mb-4 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    />
                  </>
                )}
              </div>

              <Button
                block
                legacyType="submit"
                isLoading={isSubmitting || otpLoading || otpPhoneLoading}
                isdisabled={!isFormValid}
              >
                Create Account
              </Button>
            </form>
          );
        }}
      </Formik>

      <div className="mt-4">
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
      <div className={`flex items-center mb-4 ${isWindows ? 'pb-1' : 'pb-4'} `}>
        <div className="ml-0 h-px flex-grow bg-gray-800 md:ml-5"></div>
        <span className="flex-shrink px-4 text-sm font-normal text-gray-50">
          Already registered ?{' '}
          <span className="cursor-pointer text-primary" onClick={handleSignin}>
            Sign-in
          </span>
        </span>
        <div className="mr-0 h-px flex-grow bg-gray-800 md:mr-5"></div>
      </div>
      <Social />
    </>
  );
};

export default SignupAccount;
