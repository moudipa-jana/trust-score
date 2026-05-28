import 'dayjs/locale/en';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tailwind.css';
import '../styles/globals.scss';

import { ApolloProvider } from '@apollo/client/react';
import { useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';

import { fetchCategories } from '@/actions/forum';
import { fetchSubscribedUsers } from '@/actions/profile';
import NewsletterModal from '@/components/Utility/NewsletterModal';
import useLogoutSync from '@/Hooks/useLogoutSync';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { manrope, montserrat } from '@/lib/fonts';
import { emitErrorNotification } from '@/lib/helpers';
import track from '@/lib/track';
import ApiClient from '@/service/graphql/apiClient';
import APPEND_TIME_SPENT from '@/service/graphql/timeSpend';
import { selectGetUserProfile } from '@/state/Slices/auth';
import {
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
} from '@/state/Slices/dialog';
import { persistor } from '@/state/store';
import store from '@/state/store';
import { getUserToken } from '@/utils/verifyAuthentication';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Kolkata');

function InApp({ Component, pageProps }: AppProps) {
  useLogoutSync();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [modalDisplayed, setModalDisplayed] = useState(false);
  const profile = useAppSelector(selectGetUserProfile);

  const [isUserSubscribed, setIsUserSubscribed] = useState<boolean | null>(
    false,
  );

  const token = getUserToken();
  const timeout = 1000 * 60;

  const lastestActiveTimeStampRef = useRef<Date>(new Date());

  const [appendTimeSpent] = useMutation(APPEND_TIME_SPENT, {
    context: {
      headers: { Authorization: `Bearer ${token}` },
    },
    onError: (error) => {
      emitErrorNotification('Failed to update time spent');
      track.pageView(`error/time_spent_mutation/${error.message}`);
    },
  });

  const updateTime = useCallback(() => {
    const currentTimeStamp = new Date();
    const timeSpentBeforeIdle =
      currentTimeStamp.getTime() - lastestActiveTimeStampRef?.current.getTime();

    const timeSpentBeforeIdleInSeconds = Math.max(
      0,
      Math.ceil(timeSpentBeforeIdle / 1000),
    );

    appendTimeSpent({
      variables: {
        userId: profile?.id,
        timeSpentInSecs: timeSpentBeforeIdleInSeconds,
      },
    });
  }, [appendTimeSpent, profile?.id]);

  const onIdle = useCallback(() => {
    if (token && profile?.id) {
      updateTime();
    }
  }, [token, profile?.id, updateTime]);

  const onActive = useCallback(() => {
    lastestActiveTimeStampRef.current = new Date();
  }, []);

  const { reset } = useIdleTimer({
    onIdle,
    onActive,
    timeout: timeout,
  });

  const fetchUsersList = useCallback(async () => {
    const userData = await fetchSubscribedUsers(profile?.email || '');
    console.log('userData', userData);

    if (Array.isArray(userData) && userData.length > 0) {
      setIsUserSubscribed(true);
    } else {
      setIsUserSubscribed(false);
    }
  }, [profile?.email]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onIdle();
      } else {
        onActive();
        reset();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onIdle, onActive, reset]);

  useEffect(() => {
    dispatch(fetchCategories());
    fetchUsersList();
    setModalDisplayed(false);
  }, [token, dispatch, fetchUsersList]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      track.pageView(url);
      dispatch(toggleSearchSocialDialog(false));
      dispatch(toggleSearchCampfireDialog(false));
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchCategories());
      await fetchUsersList();
      setModalDisplayed(false);
    };

    fetchData();
  }, [token, dispatch, fetchUsersList]);

  useEffect(() => {
    let modalTimeout: NodeJS.Timeout;
    if (!modalDisplayed) {
      if (router.pathname === '/sunrise-club/[categoryName]') {
        modalTimeout = setTimeout(() => {
          setShowModal(true);
          setModalDisplayed(true);
        }, 5000);
      } else if (router.pathname === '/sunrise-club/[categoryName]/[slug]') {
        modalTimeout = setTimeout(() => {
          setShowModal(true);
          setModalDisplayed(true);
        }, 8000);
      }
    }

    return () => clearTimeout(modalTimeout);
  }, [modalDisplayed, router.pathname]);

  if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    const originalError = console.error;

    const blockedPatterns = [
      'Content-Security-Policy',
      'Partitioned cookie',
      'Ignoring unsupported entryTypes',
      'preloaded with link preload',
      'legacy prop "layout"',
      'Invalid message: {"action":"isrManifest"',
      'recaptcha',
    ];

    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' &&
        blockedPatterns.some((p) => args[0].includes(p))
      ) {
        return;
      }
      originalWarn(...args);
    };

    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        blockedPatterns.some((p) => args[0].includes(p))
      ) {
        return;
      }
      originalError(...args);
    };
  }
  console.log('isUserSubscribed', isUserSubscribed);

  return (
    <>
      <Component {...pageProps} />
      {showModal &&
        !router?.route.includes('/sunrise-club/search-results') &&
        !isUserSubscribed && (
          <NewsletterModal showModal={showModal} setShowModal={setShowModal} />
        )}

      <ToastContainer
        position="bottom-left"
        hideProgressBar
        theme="colored"
        closeButton={false}
        autoClose={2000}
        style={{ minWidth: 340, fontSize: 14 }}
      />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=yes"
          />
        </Head>
        <div
          className={`${manrope.variable} ${montserrat.variable} font-display`}
        >
          <ApolloProvider client={ApiClient.initializeApollo()}>
            <InApp {...props} />
          </ApolloProvider>
        </div>
      </PersistGate>
    </Provider>
  );
}
