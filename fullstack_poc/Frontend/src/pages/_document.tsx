import { GoogleTagManager } from '@next/third-parties/google';
import { Head, Html, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#ffffff" />

        {/* <!-- Google Tag Manager --> */}
        {/* <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
           new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
           j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
           'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
           })(window,document,'script','dataLayer','GTM-53ZHNN5'); 
          `,
          }}
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-269677461-1"
        /> */}
        {/* <!-- End Google Tag Manager --> */}
        {/* <!-- Google Analytics --> */}
        {/* <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'UA-269677461-1');

          (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src='https://www.google-analytics.com/analytics.js';
            r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
            
          ga('create','UA-269677461-1','auto');
          ga('send', 'pageview');
        `}
        </Script> */}
      </Head>
      <body className="overflow-x-hidden">
        <Main />
        <NextScript />
        <GoogleTagManager gtmId="GTM-53ZHNN5" />
      </body>
    </Html>
  );
}
