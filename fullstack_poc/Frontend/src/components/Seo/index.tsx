import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  BASE_URL,
  METADATA_DESCRIPTION,
  METADATA_TITLE,
} from '@/lib/constants';

const defaultMeta = {
  title: METADATA_TITLE,
  siteName: 'Kofuku Social',
  description: METADATA_DESCRIPTION,
  url: BASE_URL,
  type: 'website',
  robots: 'follow, index',
  image: 'http://localhost:3000/images/logo.png',
};

const favicons: Array<React.ComponentPropsWithoutRef<'link'>> = [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/favicon/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon/favicon-16x16.png',
  },
  { rel: 'manifest', href: '/favicon/site.webmanifest' },
  { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
];

export interface SeoProps extends Partial<typeof defaultMeta> {
  title?: string;
  description?: string;
  sharingDescription?: string;
}

export default function Seo(props: SeoProps) {
  const router = useRouter();
  const { title, sharingDescription, ...restProps } = props;

  const meta = {
    ...defaultMeta,
    ...restProps,
  };

  meta['title'] = title ? `${title} | ${meta.siteName}` : meta.title;

  // Use custom sharing description if provided, otherwise use default description
  const ogDescription = sharingDescription || meta.description;

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="robots" content="nosnippet" />

      <meta content={meta.description} name="description" />
      <meta property="og:url" content={`${meta.url}${router.asPath}`} />
      <link rel="canonical" href={`${meta.url}${router.asPath}`} />
      {/* Open Graph */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={meta.siteName} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:title" content={meta.title} />
      <meta name="image" property="og:image" content={meta.image} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={meta.image} />
      {/* Favicons */}
      {favicons.map((linkProps) => (
        <link key={linkProps.href} {...linkProps} />
      ))}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=yes"
      />
      <meta name="theme-color" content="#ffffff" />
    </Head>
  );
}
