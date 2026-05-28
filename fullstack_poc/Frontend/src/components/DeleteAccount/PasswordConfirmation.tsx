/**
 * PasswordConfirmation component handles the confirmation of account deletion or deactivation by asking the user to enter their password.
 * It uses GraphQL mutations to either deactivate or delete the account based on the user's selection and performs form validation.
 * The component displays a loading state while awaiting the response and notifies the user of success or failure.
 */
import { Field, Formik, FormikProps } from 'formik';
import React, { useState } from 'react';

import logoImage from '/public/images/logo-icon.svg';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import SocialDeleteAuth from './SocialDeleteAuth';
import { useMutation } from '@apollo/client/react';
import { SET_PASSWORD_MUTATION } from '@/service/graphql/Profile';
import { useAppSelector } from '@/Hooks/useRedux';
import { selectGetToken, selectGetUserProfile, selectLoginType } from '@/state/Slices/auth';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { validateForm } from '@/utils/verifyAuthForm';

interface IProps {
  nextStep: (password: string) => void;
  onClose?: () => void;
  userSelection?: 'delete' | 'deactivate' | null;
}

interface FormValues {
  password: string;
}

const PasswordConfirmation = ({ nextStep, onClose, userSelection }: IProps) => {
  const token = useAppSelector(selectGetToken);
  const [setPassword] = useMutation(SET_PASSWORD_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const currentUser = useAppSelector(selectGetUserProfile);
  const loginType = useAppSelector(selectLoginType);

  const handleFormSubmit = (values: FormValues) => {
    nextStep(values.password);
  };

  const handleSocialSuccess = async (provider: 'google' | 'facebook') => {
    // 1. Cross-provider check: Ensure the user is using the same social account they signed in with
    if (loginType && loginType.toLowerCase() !== provider.toLowerCase()) {
      emitErrorNotification(
        `You signed in using ${loginType}, so try to ${userSelection === 'deactivate' ? 'deactivate' : 'delete'} using ${loginType} only`,
      );
      return;
    }

    // Generate Password: Satisfies policy (Uppercase, Special Char, Number) + Unique ID
    const password = `Kofuku_Pass1!${currentUser?.id}`;

    if (!currentUser?.id) {
      emitErrorNotification('Authentication session expired. Please log in again.');
      return;
    }

    try {
      const { data } = (await setPassword({
        variables: {
          newPassword: password,
          confirmPassword: password,
        },
      })) as { data: { setPassword: { success: boolean; message: string } } };

      if (
        data?.setPassword?.success ||
        data?.setPassword?.message?.includes('already has a password')
      ) {
        // Advance to the next step
        nextStep(password);
      } else {
        emitErrorNotification(
          data?.setPassword?.message || 'Failed to sync authentication',
        );
      }
    } catch (error: any) {
      const errorMessage = formatGraphqlError(error);
      if (errorMessage?.includes('already has a password')) {
        nextStep(password);
      } else {
        emitErrorNotification(errorMessage);
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="mb-4 h-12 w-12">
        <CustomImage src={logoImage} alt="Kofuku Logo" />
      </div>
      <div className="text-center">
        <div className="text-[28px] leading-tight">
          <Heading priority={3} variant font="font-semibold" color="text-black-900">
            Account settings
          </Heading>
        </div>
        <div className="mt-1">
          <Text size="md" color="text-[#8F8F8F]" font="font-normal" customClass="opacity-40 text-[16px]">
            {userSelection === 'deactivate' ? 'Deactivate' : 'Delete'} Your Account
          </Text>
        </div>
      </div>

      <div className="mt-6 w-full px-2 lg:px-8">
        <div className="mb-2">
          <div className="text-sm">
            <Text size="sm" color="text-black-900" font="font-semibold">
              Password <span className="text-[#A9A9A9] font-normal font-display"> (When you sign up through your email or phone no )</span>
            </Text>
          </div>
        </div>
        <Formik
          initialValues={{
            password: '',
          }}
          validateOnMount
          onSubmit={handleFormSubmit}
        >
          {({ handleSubmit, isValid }: FormikProps<FormValues>) => {
            return (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Field
                    placeholder="Enter password"
                    name="password"
                    password={true}
                    component={FormInput}
                    validate={validateForm.enforcePassword}
                    type="password"
                    className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <div className="w-full px-1">
                    <Button
                      type={isValid ? 'primary' : 'light'}
                      size="lg"
                      block
                      roundedlg
                      isdisabled={!isValid}
                      customClassName="!py-4 !rounded-xl"
                      textColor={isValid ? 'text-white' : 'text-[#838B8D]'}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </form>
            );
          }}
        </Formik>

        <div className="my-2 flex items-center px-12">
          <div className="flex-1 border-t border-[#DDE4F0]"></div>
          <div className="px-4">
            <Text size="sm" color="text-black-400" font="font-normal">
              or
            </Text>
          </div>
          <div className="flex-1 border-t border-[#DDE4F0]"></div>
        </div>

        <div className="mb-4 text-center px-6">
          <div className="leading-relaxed text-[#838B8D] opacity-80">
            <Text size="sm" font="font-normal">
              To {userSelection === 'deactivate' ? 'deactivate' : 'delete'} your Kofuku account, please authenticate using the same < br />
              platform you used during sign up
            </Text>
          </div>
        </div>

        <SocialDeleteAuth onSuccess={handleSocialSuccess} />
      </div>
    </div>
  );
};

export default PasswordConfirmation;
