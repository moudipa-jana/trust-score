// ...existing code...
/**
 * Footer component displays the footer section for the website:
 * - Includes the logo with a redirect to the homepage.
 * - Displays the company's sub-title or the current year along with the company name.
 * - Shows a disclaimer with health-related advice.
 * - Displays social media icons that link to external social platforms.
 * - Tracks and updates progress based on the page scroll position.
 */

import { ErrorLike } from '@apollo/client';
import React, { useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import DownloadIconOne from '/public/images/footer/download-icon-1.png';
import DownloadIconTwo from '/public/images/footer/download-icon-2.png';

import FacebookWhite from '/public/images/icon-fb-white.svg';
import InstagramWhite from '/public/images/icon-insta-white.svg';
import LinkedInWhite from '/public/images/icon-linkedin-white.svg';
import YoutubeWhite from '/public/images/icon-youtube-white.svg';
import Logo from '/public/images/logo-white.svg';
import toastError from '/public/images/toastSvg/toastError.svg';
import toastSuccess from '/public/images/toastSvg/toastSuccess.svg';
import toastWarning from '/public/images/toastSvg/toastWarning.svg';
import { subscribedNewsletter } from '@/actions/profile';
import CustomImage from '@/components/Utility/CustomImage';
import HomeRedirect from '@/elements/HomeRedirect';
import Text from '@/elements/Text';
import { emitNewsLetterErrorNotification } from '@/lib/helpers';
import { validateForm } from '@/utils/verifyAuthForm';

interface SubscriptionData {
  data: {
    subscriptionEmail: string;
  };
}

interface FooterProps {
  disclaimer?: {
    data?: {
      attributes?: {
        title: string;
        description: string;
      };
    };
  };
  subTitle: string;
  initialSocials?: Array<{
    id: string | number;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

function Footer({ disclaimer, subTitle, initialSocials = [] }: FooterProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>('');
  const iosAppLink = 'https://apps.apple.com/in/app/kofuku-social/id6748451540';
  const playStoreLink =
    'https://play.google.com/store/search?q=kofuku%20social&c=apps';

  const disclaimerText =
    disclaimer?.data?.attributes?.description ||
    'While we do our best to provide you information on Health and Wellness to use, we recommend that you seek professional medical advice, diagnosis and treatment. This information provided by us is not to be used for self-cure or diagnosis of your medical ailments and condition.';

  const getIconForTitle = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    switch (normalizedTitle) {
      case 'facebook':
        return (
          <div style={{ height: '32px', width: '32px' }}>
            <CustomImage src={FacebookWhite} alt="facebook" />
          </div>
        );
      case 'youtube':
        return (
          <div style={{ height: '32px', width: '32px' }}>
            <CustomImage src={YoutubeWhite} alt="youtube" />
          </div>
        );
      case 'instagram':
        return (
          <div style={{ height: '32px', width: '32px' }}>
            <CustomImage src={InstagramWhite} alt="instagram" />
          </div>
        );
      case 'linkedin':
        return (
          <div style={{ height: '32px', width: '32px' }}>
            <CustomImage src={LinkedInWhite} alt="linkedin" />
          </div>
        );

      default:
        return null;
    }
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEmail(e.target.value);
    setEmailError(validateForm.email(e.target.value));
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const subscriptionData: SubscriptionData = {
      data: {
        subscriptionEmail: email,
      },
    };
    e.preventDefault();
    if (!email || emailError) return;

    try {
      const newsLetterResponse = await subscribedNewsletter(email);

      if (newsLetterResponse instanceof Error) {
        if (
          (newsLetterResponse as ErrorLike)?.message?.includes(
            'Uniqueness violation',
          )
        ) {
          emitNewsLetterErrorNotification(
            'You have already subscribed to the newsletter.',
            <CustomImage src={toastWarning} />,
            'warning',
          );

          return;
        }
        emitNewsLetterErrorNotification(
          'Something went wrong please try again after sometime',
          <CustomImage src={toastError} />,
        );
        return;
      }

      if ((newsLetterResponse as any).insert_subscriptions_one) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscriptions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          },
        );

        if (response.ok) {
          await response.json();
          emitNewsLetterErrorNotification(
            'You subscribe the newsletter successfully',
            <CustomImage src={toastSuccess} />,
            'success',
          );
          setEmail('');
        } else {
          emitNewsLetterErrorNotification(
            'Something went wrong please try again after sometime',
            <CustomImage src={toastError} />,
          );
        }
      }
    } catch {
      emitNewsLetterErrorNotification(
        'Something went wrong please try again after sometime',
        <CustomImage src={toastError} />,
      );
    }
  };

  // const websiteSocial = initialSocials.find(
  //   (social) => social.attributes.title.toLowerCase() === 'website',
  // );

  const orderedSocials = [...initialSocials]
    .filter(
      (social) =>
        !['twitter', 'website'].includes(social.attributes.title.toLowerCase()),
    )
    .sort((a, b) => {
      const order = ['facebook', 'instagram', 'linkedin', 'youtube', 'x'];
      return (
        order.indexOf(a.attributes.title.toLowerCase()) -
        order.indexOf(b.attributes.title.toLowerCase())
      );
    });

  return (
    <footer className="bg-[#02a4e6] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-7 lg:px-8 lg:py-6">
        <div className="flex items-center justify-center lg:justify-between">
          <HomeRedirect>
            <div className="relative h-[48px] w-[132.9870147705078px]">
              <CustomImage src={Logo} alt="kofuku" />
            </div>
          </HomeRedirect>
          <div className="hidden lg:block pr-60">
            <ul className="flex items-center gap-8 pr-26">
              {orderedSocials.map((social) => {
                const icon = getIconForTitle(social.attributes.title);
                return (
                  icon && (
                    <li key={social.id}>
                      <a
                        href={social.attributes.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity duration-200 hover:opacity-80"
                      >
                        {icon}
                      </a>
                    </li>
                  )
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-20">
          <div>
            <h3 className="text-[24px] font-bold leading-none lg:text-[24px]">
              Disclaimer
            </h3>
            <p className="mt-3 max-w-[560px] text-[15px] leading-[1.45] text-white/90 lg:text-[14px]">
              {disclaimerText}
            </p>
            <div className="mt-6">
              <p className="text-[19px] font-bold lg:text-[24px]">
                Download the app now
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={iosAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download on iOS App Store"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#66c7ef] transition-opacity duration-200 hover:opacity-85 lg:h-12 lg:w-12"
                >
                  <div className="h-[18px] w-[18px] lg:h-[24px] lg:w-[24px]">
                    <CustomImage src={DownloadIconOne} alt="iOS app icon" />
                  </div>
                </a>
                <a
                  href={playStoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download on Google Play Store"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#66c7ef] pl-[1px] transition-opacity duration-200 hover:opacity-85 lg:h-12 lg:w-12"
                >
                  <div className="h-[18px] w-[18px] lg:h-[24px] lg:w-[24px]">
                    <CustomImage src={DownloadIconTwo} alt="Google Play icon" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full text-center lg:mt-0 lg:text-left">
            <h3 className="text-[24px] font-headingBold leading-tight lg:text-[24px]">
              Join the Kofuku family !
            </h3>

            <p className="mt-2 text-[15px] leading-[1.45] text-white/85 lg:text-[13px]">
              Hey fam! Want to read our informative blogs and watch our exciting
              videos?
            </p>

            <p className="mt-7 text-[14px] font-semibold lg:text-[20px]">
              Subscribe to our Newsletter
            </p>

            <form
              onSubmit={handleEmailSubmit}
              className="relative mt-3 flex h-12 w-full overflow-hidden rounded-[5px] bg-white lg:h-14"
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={handleEmailChange}
                className="h-full flex-1 bg-transparent px-4 pr-12 text-[16px] text-[#7b7b7b] outline-none lg:text-[13px] lg:pr-14"
              />

              <button
                type="submit"
                disabled={!email || !!emailError}
                className={`absolute right-1 top-1 bottom-1 flex w-10 items-center justify-center rounded-[5px] transition-all duration-300 lg:w-12 ${
                  !email || emailError
                    ? 'bg-gray-400 grayscale cursor-not-allowed'
                    : 'bg-[#02a4e6] hover:bg-[#028cc4] cursor-pointer'
                }`}
                aria-label="Subscribe"
              >
                <IoSendSharp className="text-[18px] lg:text-[22px]" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center lg:hidden">
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {orderedSocials.map((social) => {
              const icon = getIconForTitle(social.attributes.title);
              return (
                icon && (
                  <li key={social.id}>
                    <a
                      href={social.attributes.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity duration-200 hover:opacity-80"
                    >
                      {icon}
                    </a>
                  </li>
                )
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bg-[#0396d4]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-4 text-center lg:flex-row lg:px-8 lg:py-5">
          <Text>
            <p className="text-[13px] font-medium text-white/95 lg:text-[17px]">
              @ Kofuku Technologies
            </p>
          </Text>

          <div className="flex flex-wrap justify-center gap-8 text-[15px] font-medium lg:gap-10 lg:text-[16px]">
            <a href="/about-us" className="hover:opacity-80">
              About us
            </a>
            <a href="/terms" className="hover:opacity-80">
              Terms & Conditions
            </a>
            <a href="/privacy-policy" className="hover:opacity-80">
              Privacy Policies
            </a>
          </div>

          <p className="text-[13px] font-medium text-white/95 lg:text-[17px]">
            v1.0.1
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
// ...existing code...
