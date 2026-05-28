/**
 * ResetPassword component allows users to set a new password after receiving a reset link.
 * It includes fields for password and confirmation, performs validation, and submits the reset request via a GraphQL mutation.
 * On success, the user is redirected to the homepage; on error, an error message is displayed.
 */

import { useMutation } from '@apollo/client/react';
import { Field, Formik, FormikProps } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { emitErrorNotification, emitNotification } from '@/lib/helpers';
import { VERIFY_RESET_PASSWORD_SET } from '@/service/graphql/Auth';
import { validateForm } from '@/utils/verifyAuthForm';
import CustomImage from '@/components/Utility/CustomImage';
import Modal from '@/components/Utility/Modal';

interface FormValues {
  password: string;
  confirmPassword: string;
}

function ResetPassword({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifyResetPassword, { error, data }] = useMutation(
    VERIFY_RESET_PASSWORD_SET,
  );

  // Handle mutation completion and errors with useEffect
  useEffect(() => {
    if (data) {
      router.push('/');
      emitNotification('success', 'Reset Password Successful');
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);

  const handleResetPassword = (values: FormValues) => {
    setLoading(true);
    try {
      verifyResetPassword({
        variables: {
          ...values,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } catch {
      emitErrorNotification();
      setLoading(false);
    }
  };

  return (
    <Modal id="SignupDialog" modalClassName="signup-dialog" isVisible={true}>
      <div className="grid grid-cols-12 w-full h-full gap-10 items-center">
        {' '}
        <div className="col-span-6">
          <CustomImage
            src={'/images/signup-img.png'}
            className="w-full"
            width={490}
            height={570}
            alt="SignUp Image"
          />
        </div>
        <div className="col-span-6">
          <div className="text-center mb-4">
            <div className="text-center  mb-4">
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
            <span className="text-center text-gray-700 mt-2 block">
              Please enter your password reset pin and set a new password
            </span>
          </div>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validateOnMount
            onSubmit={handleResetPassword}
          >
            {({ handleSubmit, isValid, values }: FormikProps<FormValues>) => (
              <form className="" onSubmit={handleSubmit}>
                <Field
                  placeholder="Enter Password"
                  name="password"
                  password="true"
                  component={FormInput}
                  validate={validateForm.enforcePassword}
                  className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                />
                <Field
                  name="confirmPassword"
                  component={FormInput}
                  placeholder="Confirm Password"
                  password="true"
                  className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                  validate={(value: string) =>
                    validateForm.confirmPassword(value, values.password)
                  }
                />

                <div className="my-6">
                  <Button
                    type="secondary"
                    block
                    isdisabled={loading || !isValid}
                  >
                    Continue
                  </Button>
                  <div className="flex items-center justify-center">
                    <Text size="sm" color="text-error">
                      {error &&
                        ((error as any).graphQLErrors?.[0]?.message ||
                          'please try again ')}
                    </Text>
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  );
}

export default ResetPassword;
