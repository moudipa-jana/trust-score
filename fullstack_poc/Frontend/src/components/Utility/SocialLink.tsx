{
  /**
   * A component that renders a social media link with an icon.
   * It uses the provided href, icon, color, and size for the link's appearance.
   */
}
import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaGoogle  } from 'react-icons/fa';

interface ISocial {
  href: string;
  icon: string | JSX.Element;
  color?: string;
  size?: string;
}

function SocialLink({
  href,
  icon,
  color = 'text-gray-600',
  size = 'text-xl',
}: ISocial) {
  const getIcon = () => {
    if (typeof icon === 'string') {
      switch (icon.toLowerCase()) {
        case 'website':
          return <FaGoogle />;
        case 'facebook':
          return <FaFacebook />;
        case 'youtube':
          return <FaYoutube />;
        case 'instagram':
          return <FaInstagram />;
        case 'twitter':
          return <FaTwitter />;
        default:
          return <FaFacebook />;
      }
    }
    return icon;
  };

  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${color} ${size} hover:opacity-80`}
    >
      {getIcon()}
    </a>
  );
}

export default SocialLink;
