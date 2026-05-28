/**
 * AuthPrompter is a user engagement component that conditionally renders a warning prompt
 * for unauthenticated users. It informs users that authentication is required to interact
 * with certain features (e.g., posting content or viewing profiles).
 *
 * If the user is not logged in, it displays a banner with a warning icon and message,
 * along with "Sign In" and "Sign Up" buttons that trigger respective modals via Redux.
 *
 * If the user is already authenticated, it renders nothing.
 */

import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { toggleLoginDialog, toggleSignupDialog } from '@/state/Slices/dialog';

function AuthPrompter() {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="sm-container py-2 lg:py-8">
      <div className="rounded-md bg-warning px-4 py-4">
        <div className="flex flex-wrap items-center justify-between lg:flex-nowrap">
          <div className=" flex items-center">
            <div className="mr-4 text-error lg:mr-2">
              <FaExclamationCircle className="text-2xl" />
            </div>
            <Text size="md" color="text-black-200">
              You will need to login to post something or view the user details.
            </Text>
          </div>
          <div className="dialogBtns flex items-center pl-10 pt-3 lg:basis-5/12  lg:pt-0 lg:pl-0  xl:basis-auto">
            <div onClick={() => dispatch(toggleLoginDialog(true))}>
              <Button size="lg" type="secondary">
                Sign In
              </Button>
            </div>

            <div className="ml-2">
              <div onClick={() => dispatch(toggleSignupDialog(true))}>
                <Button size="lg">Sign Up</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPrompter;
