{
  /**
   * `ResetPasswordPage` handles the reset password process for a user.
   * - The component verifies the password reset token passed via the URL query using the `VERIFY_RESET_PASSWORD_TOKEN` mutation.
   * - If the token is valid, the user is authenticated, and their profile is stored in the Redux state.
   * - The component displays a loading spinner (`LogoLoader`) while validating the token.
   * - If the token is invalid or expired, an error message is shown to the user.
   * - If the token is valid, the `ResetPassword` component is rendered to allow the user to reset their password.
   **/
}

import { useMutation } from '@apollo/client/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import ResetPassword from '@/components/Signin/ResetPassword';
import LogoLoader from '@/components/Utility/LogoLoader';
import { formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import { VERIFY_RESET_PASSWORD_TOKEN } from '@/service/graphql/Auth';
import type { MenuItem } from '@/types/menu';

interface ResetPasswordPageProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

const ResetPasswordPage = ({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: ResetPasswordPageProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState('');
  const [token, setToken] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifyResetPasswordToken, { loading }] = useMutation(
    VERIFY_RESET_PASSWORD_TOKEN,
  );

  useEffect(() => {
    const verifyResetPassword = async (tokenQuery: string) => {
      try {
        const verifyData = await verifyResetPasswordToken({
          variables: { token: tokenQuery },
        });
        if ((verifyData.data as any).validateToken.success) {
          const { accessToken } = (verifyData.data as any).validateToken;
          setToken(accessToken);
          setSuccess(true);
        } else {
          setErrorMsg(
            'Oops! something went wrong. Please try again.\nPlease try with forgot password',
          );
        }
      } catch (err) {
        const msg = formatGraphqlError(err);
        if (msg.includes('token not found') || msg === 'token is expired.') {
          setErrorMsg(
            'Oops! Looks like the link is expired.\nPlease try with forgot password',
          );
        } else if (msg.includes('tuser already verified.')) {
          setErrorMsg(
            'Your account has already been verified.\nPlease login to your account',
          );
        } else {
          setErrorMsg(
            'Oops! something went wrong. Please try again.\nPlease try with forgot password',
          );
        }
      }
    };

    if (router.query?.token) {
      verifyResetPassword(router.query?.token as string);
    }
  }, [router.query?.token, verifyResetPasswordToken, dispatch]);

  return (
    <PageBase
      title="Reset Password"
      description="Reset your password"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div
        className="container mt-12 mb-12 flex flex-col items-center justify-center"
        style={{ minHeight: 400 }}
      >
        {loading ? (
          <>
            <LogoLoader style={{ height: 300 }} />
            <h2 className="text-2xl font-bold">
              Please wait while we validate your account...
            </h2>
          </>
        ) : errorMsg ? (
          <h2 className="whitespace-pre-line text-center text-2xl font-bold">
            {errorMsg}
          </h2>
        ) : success ? (
          <ResetPassword token={token} />
        ) : (
          <h2 className="text-2xl font-bold">
            Please wait while we validate your account...
          </h2>
        )}
      </div>
    </PageBase>
  );
};

export default ResetPasswordPage;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    return {
      props: {
        initialMenus: [],
        initialBottomMenus: [],
        searchData: [],
        initialSocials: [],
      },
    };
  },
);
