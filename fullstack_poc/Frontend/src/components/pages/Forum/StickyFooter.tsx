import Link from 'next/link';
import React, { useState } from 'react';

import SocialIconList from '@/components/Utility/Icons';
import Text from '@/elements/Text';

interface StickyFooterProps {
  bottomMenus: Array<{
    id: string | number;
    attributes: {
      title: string;
      link?: string;
      slug?: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  initialSocials: Array<{
    id: string | number;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
  disclaimer?: {
    data?: {
      attributes?: {
        title: string;
        description: string;
      };
    };
  };
}

export default function StickyFooter({
  bottomMenus = [],
  initialSocials = [],
  disclaimer,
}: StickyFooterProps) {
  const [bottomMenusState] = useState(bottomMenus);

  const disclaimerDescription =
    disclaimer?.data?.attributes?.description ||
    'While we do our best to provide you information on Health and Wellness to use, we recommend that you seek professional medical advice, diagnosis and treatment. This information provided by us is not to be used for self-cure or diagnosis of your medical ailments and condition.';

  const getIconForTitle = (title: string) => {
    const normalizedTitle = title.toLowerCase();
    switch (normalizedTitle) {
      case 'website':
        return SocialIconList[5]?.icon[1]; // Website 25x25
      case 'facebook':
        return SocialIconList[0]?.icon[1]; // Facebook 25x25
      case 'youtube':
        return SocialIconList[3]?.icon[1]; // YouTube 25x25
      case 'instagram':
        return SocialIconList[2]?.icon[1]; // Instagram 25x25
      // case 'twitter':
      //   return SocialIconList[1]?.icon[1]; // Twitter 25x25
      case 'linkedin':
        return SocialIconList[4]?.icon[1]; // LinkedIn 25x25
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg bg-gradient-to-b from-purple via-purple-100 to-purple-0">
      <div className="py-5">
        <div className="px-30">
          <div className="rounded-lg bg-white py-1.5 text-center">
            <Text size="3xl" color="text-black-200 font-medium">
              Disclaimer
            </Text>
          </div>
        </div>
        <div className="mt-4 px-4 text-center">
          <Text size="sm" color="text-black-200" font="font-light">
            {disclaimerDescription}
          </Text>
        </div>
      </div>

      <div>
        <div className="pageLinks">
          <ul className="flex flex-wrap justify-center space-x-2 px-4">
            {bottomMenusState && bottomMenusState.length > 0 ? (
              bottomMenusState
                .filter((data) => data.attributes.title !== 'FAQs')
                .map((menu, idx) => {
                  return (
                    <li key={menu.id ?? idx}>
                      <Link
                        href={`/${menu.attributes.link || menu.attributes.slug}`}
                      >
                        <div className="mt-2">
                          <Text size="sm" font="font-medium">
                            {menu.attributes.title}
                          </Text>
                        </div>
                      </Link>
                    </li>
                  );
                })
            ) : (
              <li key="no-menu">No menu items available</li>
            )}
          </ul>
        </div>
        <div className="socialIcons py-5">
          <ul className="flex justify-center gap-8">
            {initialSocials?.map((social, idx) => {
              const { title, link } = social.attributes;
              const icon = getIconForTitle(title);

              if (icon) {
                return (
                  <li key={social.id ?? idx}>
                    <a
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl text-gray-1200 filter grayscale hover:grayscale-0"
                    >
                      {icon}
                    </a>
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
