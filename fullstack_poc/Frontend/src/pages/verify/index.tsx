//  The `VerifySignup` component is responsible for handling the verification process
//  of a user's signup or email update using a token sent via email.

import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import { postAuthSuccess } from '@/actions/auth';
import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import HomeRedirect from '@/elements/HomeRedirect';
import Text from '@/elements/Text';
import { useAppDispatch } from '@/Hooks/useRedux';
import { formatGraphqlError } from '@/lib/helpers';
import withCommonData from '@/lib/withCommonData';
import {
  UPDATE_EMAIL_TOKEN_MUTATION,
  VERIFY_SIGNUP_TOKEN_MUTATION,
} from '@/service/graphql/Auth';
import { singupSuccess, updateEmailSuccess } from '@/state/Slices/auth';
import type { MenuItem } from '@/types/menu';

interface VerifyProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  searchData: Blog[];
}

const VerifySignup = ({
  initialMenus,
  initialBottomMenus,
  initialSocials,
  searchData,
}: VerifyProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifySignupToken] = useMutation(VERIFY_SIGNUP_TOKEN_MUTATION);
  const [updateEmailToken] = useMutation(UPDATE_EMAIL_TOKEN_MUTATION);

  const verifySignup = useCallback(
    async (token: string) => {
      try {
        const verifyData = await verifySignupToken({
          variables: { token },
        });
        if ((verifyData.data as any).verifyWithLink.success) {
          const { accessToken, profile } = (verifyData.data as any)
            .verifyWithLink;
          setSuccess(true);
          dispatch(
            singupSuccess({
              token: accessToken,
              profile,
            }),
          );
          dispatch(postAuthSuccess(profile.id, accessToken));
          setTimeout(() => {
            router.push('/');
          }, 500);
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
        } else if (msg.includes('user already verified')) {
          setErrorMsg(
            'Your account has already been verified.\nPlease login to your account',
          );
        } else {
          setErrorMsg(
            'Oops! something went wrong. Please try again.\nPlease try with forgot password',
          );
        }
      }
    },
    [verifySignupToken, dispatch, router],
  );

  const verifyupdatedEmail = useCallback(
    async (token: string) => {
      try {
        const verifyEmail = await updateEmailToken({
          variables: { token },
        });
        if ((verifyEmail.data as any).confirmMagicToken.success) {
          // TODO: Once the API is ready get the token and Profile.
          const { accessToken, profile } = (verifyEmail.data as any)
            .confirmMagicToken;
          setSuccess(true);
          if (accessToken && profile) {
            dispatch(
              updateEmailSuccess({
                token: accessToken,
                profile,
              }),
            );
          }
          setTimeout(() => {
            router.push('/');
          }, 500);
        } else {
          setErrorMsg('Oops! something went wrong. Please try again.');
        }
      } catch (err) {
        const msg = formatGraphqlError(err);
        if (msg.includes('token not found') || msg === 'token is expired.') {
          setErrorMsg(
            'Oops! Looks like the link is expired.\nPlease try with forgot password',
          );
        } else if (msg.includes('user already verified')) {
          setErrorMsg(
            'Your account has already been verified.\nPlease login to your account',
          );
        } else {
          setErrorMsg(
            'Oops! something went wrong. Please try again.\nPlease try with forgot password',
          );
        }
      }
    },
    [updateEmailToken, dispatch, router],
  );

  useEffect(() => {
    if (!router.query?.token) {
      return;
    }
    if (router.query?.confirmEmail === 'true') {
      verifyupdatedEmail(router.query?.token as string);
    } else {
      verifySignup(router.query?.token as string);
    }
  }, [router.query, verifySignup, verifyupdatedEmail]);

  return (
    <PageBase
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      initialSocials={initialSocials}
      searchData={searchData}
    >
      <div
        className="container mt-12 mb-12 flex flex-col items-center justify-center"
        style={{ minHeight: '70vh' }}
      >
        {errorMsg ? (
          <h2 className="whitespace-pre-line text-center text-2xl font-bold">
            {errorMsg}
          </h2>
        ) : (
          <>
            <TabletLoader />
            {success ? (
              <>
                <Text color="text-green">Email verified successfully..</Text>
                <div onClick={() => router.push('/')} className="m-2">
                  You will be redirected to home page. If not,
                  <HomeRedirect className="text-blue-500 underline">
                    Click here
                  </HomeRedirect>
                </div>
              </>
            ) : (
              <h2 className="text-2xl font-bold">
                Please wait while we validate your account...
              </h2>
            )}
          </>
        )}
      </div>
    </PageBase>
  );
};

export default VerifySignup;
export const getStaticProps = withCommonData(async () => {
  return {
    props: {
      initialMenus: [],
      initialBottomMenus: [],
      initialSocials: [],
    },
  };
});
