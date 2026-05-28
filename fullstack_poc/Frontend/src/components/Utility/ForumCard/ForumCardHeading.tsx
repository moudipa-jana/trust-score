import { startCase } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent, ReactNode } from 'react';

import Duration from '@/components/Card/Duration';
import Tag from '@/components/Utility/Tag';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';

interface HeadingProps {
  userName: string;
  userTag?: string;
  detailsColor?: string;
  variant?: string;
  duration: string;
  headingChildren?: ReactNode;
  handleUserNavigation: (e: MouseEvent<HTMLElement>) => void;
  handleCampfireNavigation: (e: MouseEvent<HTMLElement>) => void;
  relatedCard?: boolean;
  isCampfire?: boolean;
  campfireName?: string;
  campfireCategoryName?: string;
  isProfilePage?: boolean;
  isAnnouncement?: boolean;
  isCategoryEnabled?: boolean;
  blurClass: string;
  trustScore?: number | null;
}
export default function ForumCardHeading({
  userName,
  userTag,
  detailsColor,
  variant,
  duration,
  headingChildren,
  handleUserNavigation,
  handleCampfireNavigation,
  relatedCard,
  isCampfire,
  campfireName,
  campfireCategoryName,
  isProfilePage,
  isAnnouncement,
  isCategoryEnabled,
  blurClass,
  trustScore,
}: HeadingProps) {
  const child1 = false;
  const child2 = false;
  const toName = 'Karan';
  const admin = true;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isMobile = useIsMobile();
  const router = useRouter();
  const profileRoute =
    router.pathname.startsWith('/profile') ||
    router.pathname.startsWith('/profile') ||
    router.pathname.startsWith('/user');

  const getTrustBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    
    // Base styles for the badge
    const baseStyle = "inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full shadow-sm whitespace-nowrap transition-all duration-300";
    
    if (score >= 85.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 text-yellow-900 border border-yellow-400/50 shadow-[0_0_8px_rgba(251,191,36,0.4)]`}>
          <span className="mr-1">🌟</span> Legendary Voice
        </span>
      );
    }
    if (score >= 65.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300`}>
          <span className="mr-1">✓</span> Trusted
        </span>
      );
    }
    if (score >= 55.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-blue-50 to-sky-100 text-blue-700 border border-blue-200`}>
          Positive
        </span>
      );
    }
    // Neutral zone: 35 to 55 (New voices are exactly 50.0)
    if (score >= 35.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300`}>
          New Voice
        </span>
      );
    }
    
    if (score >= 20.0) {
      return (
        <span className={`${baseStyle} bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200`}>
          ⚠️ Warning
        </span>
      );
    }
    return (
      <span className={`${baseStyle} bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 opacity-80`}>
        🚫 Toxic
      </span>
    );
  };

  const renderUserName = () => {
    return (
      <div
        className={`nameDuration mr-2 block lg:mr-2  ${
          relatedCard ? 'flex flex-col' : 'flex-wrap items-center lg:flex'
        }`}
      >
        {isCampfire ? (
          <div
            className={`flex items-center gap-2 ${
              userName !== 'kōfuku' && !relatedCard && blurClass !== 'blur-sm'
                ? 'cursor-pointer'
                : ''
            }`}
            onClick={(e) => {
              if (
                userName !== 'kōfuku' &&
                !relatedCard &&
                blurClass !== 'blur-sm'
              ) {
                handleUserNavigation(e);
              }
            }}
          >
            <Text
              customClass={`break-all ${
                !isAuthenticated ? 'inline-block blur-sm' : ''
              } ${blurClass}`}
              size={`${isMobile ? 'sm' : '18px'}`}
              font="font-bold"
            >
              {userName}
            </Text>
            {getTrustBadge(trustScore)}
          </div>
        ) : (
          <Heading
            variant={variant}
            priority={`${
              variant == 'vertical' || variant == 'horizontal' ? '2' : '5'
            }`}
            font={`${variant == 'sm' ? 'font-normal' : 'font-black'}`}
          >
            <div className="inline">
              {!isAuthenticated ? (
                <span
                  className={`inline-block w-24 font-bold  blur-sm ${
                    !profileRoute ? 'lg:w-full' : ''
                  } break-all xl:w-full`}
                >
                  {userName}
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={(e) => {
                      if (
                        !isAnnouncement &&
                        userName !== 'kōfuku' &&
                        !relatedCard &&
                        blurClass !== 'blur-sm'
                      ) {
                        handleUserNavigation(e);
                      }
                    }}
                    className={`inline-block text-nowrap break-all font-bold user-name ${
                      !isAnnouncement &&
                      userName !== 'kōfuku' &&
                      blurClass !== 'blur-sm'
                        ? 'cursor-pointer'
                        : 'cursor-default'
                    } ${relatedCard ? '!max-w-full' : ''} ${blurClass}`}
                  >
                    {userName}
                  </span>
                  {getTrustBadge(trustScore)}
                </div>
              )}
            </div>
          </Heading>
        )}

        {relatedCard ? (
          <Duration noMargin duration={duration} variant={variant} />
        ) : (
          <Duration duration={duration} variant={variant} />
        )}
      </div>
    );
  };

  return (
    <div className={`${headingChildren && 'p-2.5'}`}>
      {isCampfire ? (
        <div className="p-4">
          <Text font="font-bold" size={`${isMobile ? '16px' : '22px'}`}>
            <div className="flex flex-row items-center gap-1 xl:gap-4">
              {!isAuthenticated ? (
                <div
                  className={`inline-block  w-24 ${
                    !profileRoute ? 'lg:w-full' : ''
                  } break-all blur-sm xl:w-full`}
                >
                  {campfireName}
                </div>
              ) : (
                <div
                  onClick={handleCampfireNavigation}
                  className={`inline-block  w-24 ${
                    !profileRoute ? 'lg:w-full' : ''
                  } shri cursor-pointer break-all xl:w-full ${
                    relatedCard ? '!max-w-full' : ''
                  }`}
                >
                  {campfireName}
                </div>
              )}
              {isCampfire && !isMobile && !isAnnouncement && (
                <div
                  className="mobileTag"
                  onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()}
                >
                  <Tag bg="bg-white" type="card" isActive size="xs">
                    {!isProfilePage && isCategoryEnabled ? (
                      <Link
                        href={`/category/${startCase(campfireCategoryName)}`}
                      >
                        {startCase(campfireCategoryName)}
                      </Link>
                    ) : (
                      <>{startCase(campfireCategoryName)}</>
                    )}
                  </Tag>
                </div>
              )}
            </div>
          </Text>
          {renderUserName()}
        </div>
      ) : (
        renderUserName()
      )}
      {headingChildren}
      {userTag && (
        <Text size="base" color={`${detailsColor}`}>
          {child1 && admin
            ? `Replying to ${toName}`
            : child2 && admin
              ? `Commented to ${toName} `
              : userTag}
        </Text>
      )}
    </div>
  );
}
