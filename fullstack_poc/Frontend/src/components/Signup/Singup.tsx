/**
 * Signup component handles the user sign-up process, including email and password validation.
 * It verifies email availability via a GraphQL mutation, and if successful, proceeds to the next step of the signup process.
 * Includes a form for user input (email, password, confirm password), and offers options for continuing with social media accounts.
 * If the user is already registered, a sign-in option is provided.
 */

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
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import { VERIFY_SIGNUP_EMAIL_QUERY } from '@/service/graphql/Auth';
import { SEND_EMAIL_OTP_MUTATION } from '@/service/graphql/Auth';
import { toggleLoginDialog } from '@/state/Slices/dialog';
import { validateForm } from '@/utils/verifyAuthForm';
import SignupHeader from './SignupHeader';

interface IProps {
  nextStep: () => void;
  setDetails: Dispatch<SetStateAction<ISignupState>>;
  data?: any;
}

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SendOtpResponse {
  socialotp: {
    success: boolean;
    message: string;
  };
}

function Signup({ nextStep, setDetails, data }: IProps) {
  const { isWindows } = useOSDetection();
  const dispatch = useAppDispatch();
  const [verifyEmailExist, { error }] = useLazyQuery(VERIFY_SIGNUP_EMAIL_QUERY);
  const [sendOtpMutation, { loading: otpLoading }] =
    useMutation<SendOtpResponse>(SEND_EMAIL_OTP_MUTATION);

  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const VerifyEmailAndPassword = async (
    values: FormValues,
  ): Promise<boolean> => {
    try {
      const verifyData = await verifyEmailExist({
        variables: { ...values },
      });
      return (verifyData.data as any).users.length === 0;
    } catch (err: unknown) {
      return false;
    }
  };
  const handleSignin = () => {
    dispatch(toggleLoginDialog(true));
  };

  const handleFormSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    const isVerified = await VerifyEmailAndPassword(values);
    if (isVerified) {
      setDetails((prevState) => ({
        ...prevState,
        ...(values.email && { email: values.email }),
        password: values.password,
      }));
      setSubmitting(false);
      nextStep();
    } else {
      emitErrorNotification('Email already exists');
      setSubmitting(false);
    }
  };

  const SendOTP = async (email: string) => {
    try {
      const { data } = await sendOtpMutation({
        variables: { email },
      });

      if (data?.socialotp?.success) {
        emitNotification('success', 'OTP sent to your email');
      } else {
        emitErrorNotification(data?.socialotp?.message || 'OTP sending failed');
      }
    } catch (error: any) {
      const apiMessage =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        'Otp sending failed, please try again later';
      emitErrorNotification(apiMessage);
    }
  };

  return (
    <div className="h-full py-3 lg:p-3 ">
      <div className={`text-center ${isWindows ? 'mb-1' : 'mb-3'}`}>
        <SignupHeader type="signup" />
      </div>
      {data && (
        <Formik<FormValues>
          initialValues={{
            email: data.email || '',
            password: data.password || '',
            confirmPassword: data.password || '',
          }}
          validateOnMount
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            handleSubmit,
            isSubmitting,
          }: FormikProps<FormValues>) => {
            const isFormValid =
              values.email.trim() !== '' &&
              values.password.trim() !== '' &&
              values.confirmPassword.trim() !== '';

            return (
              <form onSubmit={handleSubmit}>
                <div>
                  <Field
                    isModal
                    name="email"
                    component={FormInput}
                    disabled={data?.signupType === 'email'}
                    placeholder="Enter Email Address *"
                    type="email"
                    value={values.email}
                    validate={validateForm.email}
                    // validate={
                    //   data?.signupType === 'phone'
                    //     ? validateForm.email // optional but validate if filled
                    //     : undefined
                    // }
                    className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                  />
                  <Field
                    isModal
                    placeholder="Enter Password *"
                    name="password"
                    password="true"
                    component={FormInput}
                    validate={validateForm.enforcePassword}
                    className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                  />
                  <Field
                    isModal
                    name="confirmPassword"
                    component={FormInput}
                    placeholder="Confirm Password *"
                    password="true"
                    className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    validate={(value: string) =>
                      validateForm.confirmPassword(value, values.password)
                    }
                  />
                </div>
                <div className={isWindows ? 'my-2' : 'my-4'}>
                  <Button
                    block
                    legacyType="submit"
                    isLoading={isSubmitting}
                    isdisabled={!isFormValid}
                  >
                    Next
                  </Button>
                </div>
              </form>
            );
          }}
        </Formik>
      )}
    </div>
  );
}
export default Signup;
