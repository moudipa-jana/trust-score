import * as Sentry from '@sentry/nextjs';

export default function captureSentryException(error: unknown) {
  Sentry.captureException(error);
}
