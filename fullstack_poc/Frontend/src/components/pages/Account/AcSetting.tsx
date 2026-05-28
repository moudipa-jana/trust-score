import { useMutation } from '@apollo/client/react';
import { Field, Formik } from 'formik';
import { useRouter } from 'next/router';
import EmailIcon from 'public/images/emailImage.svg';
import React, { useState } from 'react';

import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { UPDATE_EMAIL_MUTATION } from '@/service/graphql/Profile';
import { updateIsVerified } from '@/state/Slices/auth';
import { validateForm } from '@/utils/verifyAuthForm';

interface EmailFormValues {
  currentEmail: string | undefined;
  newEmail: string;
}

function AcSetting() {
  const [emailUpdate, setEmailUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { profile, token } = useAppSelector((state) => ({
    token: state.auth.token,
    profile: state.auth.profile,
  }));

  const [updateEmail] = useMutation(UPDATE_EMAIL_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response, clientOptions) => {
      setNewEmail(clientOptions?.variables?.newEmail);
      setEmailUpdate(!emailUpdate);
      dispatch(updateIsVerified(false));
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleEmailChange = (
    values: {
      currentEmail: string | undefined;
      newEmail: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    updateEmail({
      variables: {
        currentEmail: profile?.email,
        newEmail: values.newEmail,
      },
    });
    setSubmitting(false);
  };
  const handleClose = () => {
    setEmailUpdate(!emailUpdate);
    router.push('/account');
  };
  return (
    <>
      <Modal id="AcSetting" isVisible={emailUpdate}>
        <Success
          src={EmailIcon}
          title="Verify Your E-mail Address"
          message=" We've sent a verification link to "
          name={newEmail}
          buttonComponent={
            <div className="pt-6">
              <Button type="secondary" block onClick={handleClose}>
                Close
              </Button>
            </div>
          }
        />
      </Modal>
      <div className="sm-container">
        <div className="mt-10">
          <div className="xl:mx-auto xl:w-3/5">
            <div className="text-center">
              <Heading
                font="font-medium"
                color="text-black-900"
                variant
                priority={3}
              >
                Account settings Insights
              </Heading>
            </div>
            <div className="pt-3">
              {profile?.isPasswordSet ? (
                <>
                  <Text
                    font="font-medium"
                    variant
                    color="text-black-900"
                    size="lg"
                  >
                    Update your email
                  </Text>
                  <Text color="text-black-900" size="base">
                    Update your email below. There will be a new verification
                    email sent that you will need to use to verify this email
                  </Text>
                </>
              ) : (
                <Text color="text-black-900" size="md">
                  Sorry, you can&apos;t update your email because you have
                  logged in through social login
                </Text>
              )}
              <div>
                <div className="pt-4">
                  <Formik<EmailFormValues>
                    initialValues={{
                      currentEmail: profile?.email,
                      newEmail: '',
                    }}
                    validateOnMount
                    onSubmit={handleEmailChange}
                  >
                    {({ handleSubmit, isSubmitting, isValid }) => (
                      <form onSubmit={handleSubmit}>
                        <div>
                          <Field
                            label="Current Email"
                            placeholder="Email"
                            name="currentEmail"
                            component={FormInput}
                            disabled
                            className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                          />
                          {profile?.isPasswordSet && (
                            <Field
                              label="New Email"
                              placeholder="Email Address"
                              name="newEmail"
                              component={FormInput}
                              type="email"
                              validate={validateForm.email}
                              className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                            />
                          )}
                        </div>
                        {profile?.isPasswordSet && (
                          <div className="fullWidthBtnXs flex items-center justify-center py-4">
                            <Button
                              size="lg"
                              legacyType="submit"
                              isLoading={false}
                              isdisabled={isSubmitting || !isValid}
                            >
                              Change
                            </Button>
                          </div>
                        )}
                      </form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
            <div className=" pb-20 xl:col-span-4 "></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AcSetting;
