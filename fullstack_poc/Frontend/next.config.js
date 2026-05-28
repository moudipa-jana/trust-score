/* eslint-disable @typescript-eslint/no-var-requires */
// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

/** @type {import('next').NextConfig} */
const path = require('path');

const moduleExports = {
  eslint: {
    dirs: ['src'],
    // Temporarily ignore ESLint errors during build 
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      'amazonaws.com',
      `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`,
      'kofuku-cms.alpha.geekydev.com',
      '139.84.137.62',
      'kofuku-jobs.s3.amazonaws.com',
      'kofuku-bucket.s3.ap-south-1.amazonaws.com',
      'kofuku-cms-bucket.s3.ap-south-1.amazonaws.com',
      '10.51.1.96',
      'cms.kofuku.com',
      'kofuku-cms.blr0.geekydev.com',
      'kofuku-cms-bucket.s3.amazonaws.com',
      'kofuku-bucket.s3.amazonaws.com',
      'kofuku-production-cms.s3.ap-south-1.amazonaws.com',
      'imgs.search.brave.com',
      'kofuku-production-cms.s3.amazonaws.com',
      'kofuku-staging-cms.s3.ap-south-1.amazonaws.com',
      'drive.google.com',
      'uno-jobs.s3.amazonaws.com',
      'google.com',
      'example.com',
      'dmhoszy1u63u5.cloudfront.net'
    ],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
  experimental: { scrollRestoration: true },
};

module.exports = moduleExports;
