/**
 * ForgetPassword component allows users to request a password reset link.
 * It accepts an email, sends the reset link via a GraphQL mutation, and displays success or error messages.
 * Optionally, a "Go back" button is provided to navigate back to the previous screen.
 */

import { useMutation } from '@apollo/client/react';
import { Field, Formik, FormikProps } from 'formik';
import React, { useEffect, useState } from 'react';

import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import { VERIFY_RESET_PASSWORD_EMAIL } from '@/service/graphql/Auth';
import { validateForm } from '@/utils/verifyAuthForm';
import { upperCase } from 'lodash';
import CustomImage from '../Utility/CustomImage';

interface IProps {
  goBack?: () => void;
  nextStep?: () => void;
}

interface FormValues {
  email: string;
}

function ForgetPassword({ goBack, nextStep }: IProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [verifyResetEmail, { error }] = useMutation(
    VERIFY_RESET_PASSWORD_EMAIL,
  );
  const [VerifyMessage, setVerifyMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle mutation errors with useEffect
  useEffect(() => {
    if (error) {
      setErrorMessage((error as any)?.message || 'An error occurred');
    }
  }, [error]);

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-4 text-center">
        <div className=" ">
          <div className="text-center">
            <CustomImage
              src={'/images/logo-icon.svg'}
              className="!w-[38px] mx-auto"
              width={38}
              height={48}
            />
          </div>

          <h2 className="text-2xl text-black-200 font-regular text-center">
            Forget password
          </h2>
        </div>
      </div>
      {!showSuccess && (
        <div>
          <Formik
            initialValues={{ email: '' }}
            validateOnMount
            onSubmit={async (values: FormValues) => {
              try {
                const verifyData = await verifyResetEmail({
                  variables: {
                    ...values,
                  },
                });
                if ((verifyData.data as any).sendResetLink.success) {
                  setVerifyMessage('Please Check the email');
                  setShowSuccess(true);
                }
              } catch {
                setVerifyMessage('');
              }
            }}
          >
            {({
              handleSubmit,
              isSubmitting,
              isValid,
            }: FormikProps<FormValues>) => {
              return (
                <>
                  <form onSubmit={handleSubmit}>
                    <Field
                      name="email"
                      component={FormInput}
                      placeholder="Enter email address"
                      type="email"
                      validate={validateForm.email}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                      onKeyUp={() => {
                        setErrorMessage('');
                      }}
                    />
                    <div className="my-6">
                      <Button
                        type="secondary "
                        block
                        isdisabled={isSubmitting || !isValid}
                      >
                        Verify Email
                      </Button>
                      <div className="flex items-center justify-center">
                        <Text size="sm" color="text-error">
                          {errorMessage &&
                            (errorMessage || 'please try again ')}
                        </Text>
                        <Text size="sm" color="text-[green]">
                          {VerifyMessage}
                        </Text>
                      </div>
                      {goBack && (
                        <div
                          className="my-6 cursor-pointer text-center text-primary"
                          onClick={goBack}
                        >
                          <p>Go back</p>
                        </div>
                      )}
                    </div>
                  </form>
                </>
              );
            }}
          </Formik>
        </div>
      )}

      {showSuccess && (
        <>
          <p className="text-center text-base text-gray-500">
            A verification mail will be sent to your given email address{' '}
          </p>
          <CustomImage
            src={'/images/email-sent-icon.png'}
            className="!w-[240px] mx-auto mt-4"
            width={240}
            height={240}
            alt="Forget Password Image"
          />
        </>
      )}
    </div>
  );
}

export default ForgetPassword;
