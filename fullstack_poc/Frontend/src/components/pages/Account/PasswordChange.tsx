import { useMutation } from '@apollo/client/react';
import { Field, Formik, FormikProps } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import Heading from '@/elements/Heading';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
} from '@/lib/helpers';
import {
  SET_PASSWORD_MUTATION,
  UPDATE_PASSWORD_MUTATION,
} from '@/service/graphql/Profile';
import { toggleForgotPasswordDialog } from '@/state/Slices/dialog';
import { validateForm } from '@/utils/verifyAuthForm';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormProps extends FormikProps<PasswordFormValues> {
  values: PasswordFormValues;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export default function PasswordChange() {
  const [passwordUpdate, setPasswordUpdate] = useState(false);
  const dispatch = useAppDispatch();
  const { profile, token } = useAppSelector((state) => ({
    token: state.auth.token,
    profile: state.auth.profile,
  }));
  const router = useRouter();
  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      setPasswordUpdate(!passwordUpdate);
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [setPassword, { loading: loadingSetPassword }] = useMutation(
    SET_PASSWORD_MUTATION,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: () => {
        setPasswordUpdate(!passwordUpdate);
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleFormSubmit = (
    values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (values.currentPassword === values.confirmPassword) {
      emitNotification(
        'error',
        'Sorry, Current password and New password cannot be same!',
      );
      setSubmitting(false);
    } else {
      if (profile?.isPasswordSet) {
        updatePassword({
          variables: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
        });
        setSubmitting(false);
      } else {
        setPassword({
          variables: {
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
        });
        setSubmitting(false);
      }
    }
  };

  const handleDisable = (props: FormProps) => {
    if (profile?.isPasswordSet) {
      return (
        props.isSubmitting || !props.isValid || !props.values.currentPassword
      );
    }
    return props.isSubmitting || !props.isValid;
  };

  const handleForgotPass = () => {
    dispatch(toggleForgotPasswordDialog(true));
  };

  return (
    <>
      <Modal id="PasswordChange" isVisible={passwordUpdate}>
        <Success
          isActive={passwordUpdate}
          title="Password changed successfully"
          autoClose={() => {
            setPasswordUpdate(!passwordUpdate);
            router.push('/account');
          }}
        />
      </Modal>
      <div className="sm-container">
        <div className="mt-10">
          <div className=" xl:mx-auto xl:w-3/5">
            <div className="text-center">
              {profile?.isPasswordSet ? (
                <Heading
                  font="font-medium"
                  color="text-black-900"
                  variant
                  priority={3}
                >
                  <span className="text-2xl xl:text-4xl">
                    Update your password
                  </span>
                </Heading>
              ) : (
                <Heading
                  font="font-medium"
                  color="text-black-900"
                  variant
                  priority={3}
                >
                  <span className="text-2xl xl:text-4xl">
                    Add your password
                  </span>
                </Heading>
              )}
            </div>
            <div className="pt-2 xl:pt-4">
              <Formik<PasswordFormValues>
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validateOnMount
                onSubmit={handleFormSubmit}
              >
                {(props: FormProps) => {
                  const { values, handleSubmit, isSubmitting } = props;
                  return (
                    <form onSubmit={handleSubmit}>
                      <div>
                        {profile?.isPasswordSet && (
                          <div className="relative">
                            <Field
                              label="Current Password"
                              name="currentPassword"
                              password="true"
                              component={FormInput}
                              placeholder="Current Password"
                              className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                            />
                            <div className="absolute -bottom-2.5 right-0 flex justify-end">
                              <p
                                className="cursor-pointer text-xs text-gray-700"
                                onClick={handleForgotPass}
                              >
                                Forgot password ?
                              </p>
                            </div>
                          </div>
                        )}
                        <Field
                          label="New Password"
                          placeholder="New Password"
                          name="newPassword"
                          password="true"
                          component={FormInput}
                          validate={validateForm.enforcePassword}
                          className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                          type="password"
                        />
                        <Field
                          label="Confirm Password"
                          name="confirmPassword"
                          component={FormInput}
                          placeholder="Confirm Password"
                          password="true"
                          className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                          validate={(value: string) =>
                            validateForm.confirmPassword(
                              value,
                              values.newPassword,
                            )
                          }
                        />
                      </div>

                      <div className="fullWidthBtnXs flex items-center justify-center  py-4 pb-20">
                        <Button
                          size="lg"
                          legacyType="submit"
                          isLoading={
                            isSubmitting || loading || loadingSetPassword
                          }
                          isdisabled={handleDisable(props)}
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
          <div className=" xl:col-span-4"></div>
        </div>
      </div>
    </>
  );
}
