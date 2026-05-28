import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import Router from 'next/router';
import qs from 'querystring';
import url from 'url';

import { postAuthSuccess } from '@/actions/auth';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import ApiClient from '@/service/graphql/apiClient';
import {
  VERIFY_FACEBOOK_TOKEN_MUTATION,
  VERIFY_GOOGLE_TOKEN_MUTATION,
} from '@/service/graphql/Auth';
import { socialAuthSuccess, toggleAuthLoading } from '@/state/Slices/auth';
import {
  toggleSignupDialog,
  toggleUpdateProfileDialog,
} from '@/state/Slices/dialog';
import { AppDispatch } from '@/state/store';
import { setCookiesToken } from '@/utils/verifyAuthentication';

export enum SocialProvider {
  facebook = 'facebook',
  google = 'google',
  // Remove unused instagram provider
}

export interface ConfigTypes {
  provider: SocialProvider;
  authorizationUrl: string;
  clientId: string;
  height: number;
  postAuthPath?: string;
  redirectUri: string;
  scope: string;
  signupPath?: string;
  width: number;
}

const googleAuthorizationUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
const faceBookAuthorizationUrl = 'https://www.facebook.com/v16.0/dialog/oauth';
const webPort = '3000';
const popupDimensions = { height: 633, width: 452 };

export function getHost() {
  let host = '';
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      host = `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${webPort}` : ''
      }`;
    } else {
      host = `${window.location.protocol}//${window.location.hostname}`;
    }
  }
  return host;
}

interface OAuthPopupOptions extends Record<string, string | number> {
  height: number;
  width: number;
  left: number;
  top: number;
}

interface OAuthData {
  code: string;
  provider: SocialProvider;
  redirectUri: string;
}

interface PopupWindow extends Window {
  closed: boolean;
  document: Document;
  location: Location;
}

interface UserProfile {
  id: string;
  [key: string]: unknown;
}

interface OAuthResponse {
  config: ConfigTypes;
  dispatch: Dispatch;
  URL?: string;
  window?: PopupWindow;
  windowTimer?: NodeJS.Timer;
  oauthData?: OAuthData;
  interval?: NodeJS.Timer;
  token?: string;
  isSignUp?: boolean;
  profile?: UserProfile;
  loginType?: string;
}

/**
 * Wrapper for setting up oauth
 * @param {Object} config
 * @param {Dispatch} dispatch
 * @param {boolean} isSignup - True if the user is signing up for a new account. False if they are logging in.
 */
function oauth2(
  config: ConfigTypes,
  dispatch: Dispatch,
): Promise<OAuthResponse> {
  return new Promise((resolve) => {
    dispatch(toggleAuthLoading(true));
    const params = {
      client_id: config.clientId,
      display: 'popup',

      redirect_uri: config.redirectUri,

      response_type: 'code',
      scope: config.scope,
    };
    // Social login Provider Url
    const URL = `${config.authorizationUrl}?${qs.stringify(params)}`;
    resolve({ config, dispatch, URL });
  });
}

/**
 * Open an oauth popup
 * @param {string} URL
 * @param {Object} config
 * @param {Dispatch} dispatch
 */
function openPopup({
  config,
  dispatch,
  URL,
}: OAuthResponse): Promise<OAuthResponse> {
  return new Promise((resolve) => {
    const width = config.width;
    const height = config.height;
    const options = {
      height,
      left: window.screenX + (window.outerWidth - width) / 2,
      top: window.screenY + (window.outerHeight - height) / 2.5,
      width,
    } as OAuthPopupOptions;

    const popup = window.open(
      URL,
      '_blank',
      qs.stringify(options, ','),
    ) as PopupWindow;

    // Timer to check if the window is closed by user
    const timer = setInterval(() => {
      if (popup.closed) {
        dispatch(toggleAuthLoading(false));
        clearInterval(timer);
        emitErrorNotification('SignIn terminated by user!');
      }
    }, 1000);

    if (URL === 'about:blank') {
      popup.document.body.innerHTML = 'Loading...';
    }

    resolve({
      config,
      dispatch,
      window: popup,
      windowTimer: timer,
    });
  });
}

/**
 * Close the oauth popup
 * @param {Object} window
 * @param {NodeJS.Timer} interval
 */
function closePopup({
  interval,
  window,
}: {
  interval: NodeJS.Timer;
  window: PopupWindow;
}): Promise<boolean> {
  return new Promise((resolve) => {
    clearInterval(interval as ReturnType<typeof setInterval>);
    window.close();
    resolve(true);
  });
}

/**
 * Check the oauth popup for a response from an oauth provider
 * @param {Object} window
 * @param {Object} config
 * @param {Dispatch} dispatch
 */
function pollPopup({
  config,
  dispatch,
  window,
  windowTimer,
}: OAuthResponse): Promise<OAuthResponse> {
  return new Promise((resolve) => {
    const redirectUri = url.parse(config.redirectUri);
    const redirectUriPath = `${redirectUri.host || ''}${
      redirectUri.pathname || ''
    }`;

    const polling = setInterval(() => {
      try {
        const popupLocation = window?.location;
        if (!popupLocation) {
          clearInterval(polling);
          return;
        }

        const popupLocationPath = popupLocation.host + popupLocation.pathname;
        if (popupLocationPath === redirectUriPath) {
          const params = qs.parse(popupLocation.search.replace('?', ''));
          const oauthData: OAuthData = {
            code: params.code as string,
            provider: config.provider,
            redirectUri: config.redirectUri,
          };
          resolve({
            config,
            dispatch,
            interval: windowTimer,
            oauthData,
            window,
          });
          clearInterval(polling);
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in Internet Explorer.
      }
    }, 500);
  });
}

/**
 * Get a token from an oauth provider
 * @param {Object} oauthData
 * @param {Object} config
 * @param {Object} window
 * @param {NodeJS.Timer} interval
 * @param {Dispatch} dispatch
 */
async function exchangeCodeForToken({
  config,
  dispatch,
  interval,
  oauthData,
  window,
}: OAuthResponse): Promise<OAuthResponse> {
  try {
    const { code, provider, redirectUri: redirectTo } = oauthData as OAuthData;
    const responseKey =
      provider === SocialProvider.google
        ? 'getTokenGoogle'
        : 'getTokenFacebook';

    const verifyData: any = await ApiClient.getClient().mutate({
      mutation:
        provider === SocialProvider.google
          ? VERIFY_GOOGLE_TOKEN_MUTATION
          : VERIFY_FACEBOOK_TOKEN_MUTATION,
      variables: { redirectTo, code },
    });

    if (verifyData?.data?.[responseKey]?.success) {
      const {
        accessToken: token,
        isSignUp,
        profile,
        loginType,
      } = verifyData.data[responseKey];
      return {
        config,
        dispatch,
        interval,
        isSignUp,
        profile,
        token,
        loginType,
        window,
      };
    }

    dispatch(toggleAuthLoading(false));
    await closePopup({
      interval: interval as NodeJS.Timer,
      window: window as PopupWindow,
    });
    return {} as OAuthResponse;
  } catch (error) {
    await closePopup({
      interval: interval as NodeJS.Timer,
      window: window as PopupWindow,
    });
    throw new Error(String(error));
  }
}

/**
 * Sign in the user and handle post-auth actions
 */
function signIn({
  config,
  dispatch,
  interval,
  isSignUp,
  profile,
  token,
  loginType,
  window,
}: OAuthResponse): Promise<{ interval: NodeJS.Timer; window: PopupWindow }> {
  return new Promise((resolve) => {
    // Store the token and profile in Redux
    dispatch(socialAuthSuccess({ token, profile, loginType }));
    setCookiesToken(token as string);
    dispatch(
      postAuthSuccess(
        profile?.id as string,
        token as string,
      ) as unknown as AnyAction,
    ); // Type assertion for AnyAction

    // Navigate the user to different router after login
    if (config.postAuthPath) {
      Router.push(config.postAuthPath);
    }

    if (isSignUp) {
      // Pop up onboarding dialog
      dispatch(toggleSignupDialog({ open: true, isSocial: true }));
    }

    resolve({
      interval: interval as NodeJS.Timer,
      window: window as PopupWindow,
    });
  });
}

/**
 * Sign in with Google
 *
 * @param {string} postAuthPath - The page where a user should go after auth
 * @param {string} signupPath - The path from which a user signed up
 */
export function googleLogin(postAuthPath?: string, signupPath?: string) {
  const googleConfig: ConfigTypes = {
    authorizationUrl: googleAuthorizationUrl,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    postAuthPath,
    provider: SocialProvider.google,
    redirectUri: `${getHost()}/callback/google`,
    scope: 'openid profile email',
    signupPath,
    ...popupDimensions,
  };

  return (dispatch: AppDispatch) => {
    oauth2(googleConfig, dispatch)
      .then(openPopup)
      .then(pollPopup)
      .then(exchangeCodeForToken)
      .then(signIn)
      .then(closePopup)
      .catch((error) => {
        captureSentryException(error);
        dispatch(toggleAuthLoading(false));
        emitErrorNotification(formatGraphqlError(error));
      });
  };
}

/**
 * Sign in with Facebook
 *
 * @param {string} postAuthPath - The page where a user should go after auth
 * @param {string} signupPath - The path from which a user signed up
 */
export function facebookLogin(postAuthPath?: string, signupPath?: string) {
  const facebookConfig: ConfigTypes = {
    authorizationUrl: faceBookAuthorizationUrl,
    clientId: process.env.NEXT_PUBLIC_FB_CLIENT_ID ?? '',
    postAuthPath,
    provider: SocialProvider.facebook,
    redirectUri: `${getHost()}/callback/facebook`,
    scope: 'email',
    signupPath,
    ...popupDimensions,
  };

  return (dispatch: AppDispatch) => {
    oauth2(facebookConfig, dispatch)
      .then(openPopup)
      .then(pollPopup)
      .then(exchangeCodeForToken)
      .then(signIn)
      .then(closePopup)
      .catch((error: unknown) => {
        captureSentryException(error);
        dispatch(toggleAuthLoading(false));
        emitErrorNotification(formatGraphqlError(error));
      });
  };
}
