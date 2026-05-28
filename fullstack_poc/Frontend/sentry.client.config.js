// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment =
  process.env.KOFUKU_ENV || process.env.NEXT_PUBLIC_KOFUKU_ENV || 'development';
const enabled = process.env.NEXT_PUBLIC_KOFUKU_ENV === 'development'; // disable sentry in local mode

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://b676fffb1f6d46238479e40c6078964b@o4504881071521792.ingest.sentry.io/4504881074798593',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  environment,
  ignoreErrors: ['Resource blocked by content blocker'],
  enabled,
});
