/**
 * CardHeading Component
 *
 * Renders the dynamic heading section of a post card. Supports multiple post types (blog, video, club, etc.),
 * displays titles, optional user actions (follow, unblock), durations, status messages (e.g. user blocked),
 * and includes flexible layout based on variant and device type.
 */

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import WarningIcon from '/public/images/Warning.svg';
import ActionsButton from '@/components/Utility/ActionsButton';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import LinkifyText from '@/components/Utility/LinkifyText';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import EventEmitter from '@/lib/eventEmitter';
import useAuthMutation from '@/Hooks/useAuthMutation';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { UNBLOCK_USER_MUTATION } from '@/service/graphql/Profile';
import { getUserId } from '@/state/Slices/auth';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import {
  getGuestUserBlockedStatus,
  setGuestUserBlockedStatus,
} from '@/state/Slices/profile';
import { CardTypeEnum } from '@/types/enums';

import Duration from './Duration';

const postTypeImageSrc: Record<string, string> = {
  question: '/images/chat-bubble-question.svg',
  poll: '/images/Icon_Poll.svg',
  quiz: '/images/Icon_Quiz.svg',
};

interface CardHeadingProps {
  title?: React.ReactNode;
  details?: string;
  detailsColor?: string;
  variant?: 'vertical' | 'horizontal' | 'lg' | 'sm' | 'xl' | string;
  duration?: string;
  headingChildren?: React.ReactNode;
  isFourm?: boolean;
  userId?: string;
  isFollowing?: boolean;
  showButton?: boolean;
  blogTitle?: boolean;
  videoTitle?: boolean;
  clubTitle?: boolean;
  bingeTitle?: boolean;
  smallTitle?: boolean;
  notificationTitle?: boolean;
  type?: 'question' | 'poll' | 'quiz' | string;
  message?: string;
  isDisabled?: boolean;
  clamp?: string;
}

function CardHeading({
  title,
  details,
  detailsColor,
  variant,
  duration,
  headingChildren,
  isFourm,
  userId,
  isFollowing,
  showButton,
  blogTitle,
  videoTitle,
  clubTitle,
  bingeTitle,
  smallTitle,
  notificationTitle,
  type,
  message,
  isDisabled,
  clamp,
}: CardHeadingProps) {
  const child1 = false;
  const child2 = false;
  const toName = 'Karan';
  const admin = true;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userProfileId = useAppSelector(getUserId);
  const isUserBlocked = useAppSelector(getGuestUserBlockedStatus);
  const blockerIds = useUsersWhoBlockedMe();
  const dispatch = useDispatch();

  const { mutationFunction: UnblockUser } = useAuthMutation(
    UNBLOCK_USER_MUTATION,
    () => {
      dispatch(setGuestUserBlockedStatus(false));
    },
  );

  const handleUnblock = () => {
    EventEmitter.emit('account_profile_refetch');
    UnblockUser({
      variables: {
        blockedUserId: userId,
      },
    });
  };

  const router = useRouter();
  const isipad = useIsipad();
  const ismobile = useIsMobile();
  const isGuestUserRoute = router.pathname === '/user/[userName]';
  const postImageSrc = type ? postTypeImageSrc[type as string] : '';

  const titleString = typeof title === 'string' ? title : '';
  const [firstPart, secondPart] = titleString.split('\n');

  return (
    <div
      className={`${headingChildren
        ? 'flex-auto p-0'
        : smallTitle
          ? 'xl:flex-auto'
          : type
            ? 'flex h-full flex-grow flex-col justify-between gap-1  min-[360px]:pr-5'
            : 'p-0'
        }`}
    >
      <div className="flex break-words">
        <div
          className={`${showButton ? 'lg:max-w-6.75 flex-1 lg:mr-2 xl:max-w-none' : 'flex-1'
            }`}
        >
          {blogTitle ? (
            <Heading
              variant={variant}
              priority={`${variant == 'vertical' || variant == 'horizontal' ? '2' : '5'
                }`}
              font="xl:text-4.5xl lg:text-4xl text-lg font-semibold"
              color="text-black-200"
            >
              {title}
            </Heading>
          ) : videoTitle ? (
            <Heading
              variant={variant}
              priority={`${variant == 'vertical' || variant == 'horizontal' ? '2' : '5'
                }`}
              font="lg:text-2xl font-semibold"
              color="text-black-200"
            >
              {title}
            </Heading>
          ) : clubTitle ? (
            <div className="h-[48px]">
              <Heading
                variant={variant}
                priority="2"
                font="xl:text-base lg:text-base text-base font-semibold"
                color="text-black-200"
                clamp="line-clamp-2"
              >
                {title}
              </Heading>
            </div>
          ) : bingeTitle ? (
            <Heading
              variant={variant}
              priority="2"
              font="xl:text-2xl mt-4 lg:mt-5 lg:text-4xl text-lg font-bold"
              color="text-black"
            >
              {title}
            </Heading>
          ) : smallTitle ? (
            <Heading
              priority="4"
              font="xl:text-lg text-base font-normal"
              color="text-black-200"
              clamp="xl:line-clamp-2 line-clamp-1"
            >
              {title}
            </Heading>
          ) : notificationTitle ? (
            <Heading
              priority="4"
              font="xl:text-lg text-base font-normal sm:text-xs"
              color="text-black-200"
            >
              {typeof title === 'string' ? (
                <>
                  <LinkifyText className="line-clamp-2" text={firstPart} />
                  {secondPart && <LinkifyText text={secondPart} />}
                </>
              ) : (
                <>{title}</>
              )}
              {message && <LinkifyText text={message} />}
            </Heading>
          ) : (
            <Heading
              variant={variant}
              priority={`${variant == 'vertical' || variant == 'horizontal' ? '2' : '5'
                }`}
              font={`${variant == 'sm'
                ? 'font-normal'
                : variant == 'vertical' || variant == 'horizontal'
                  ? 'font-bold'
                  : variant == 'semibold'
                    ? 'font-semibold'
                    : 'font-black'
                }`}
              clamp={clamp}
            >
              {isFourm ? (
                !isAuthenticated ? (
                  <span className="blur-sm">{title}</span>
                ) : (
                  `${title}`
                )
              ) : (
                <div className={`${ismobile ? 'mt-2' : 'mt-1'} ${clamp || ''}`}>
                  {typeof title === 'string' ? <LinkifyText text={title} /> : title}
                </div>
              )}
            </Heading>
          )}

          {isUserBlocked && isGuestUserRoute && !isDisabled && (
            <div className="my-2 flex flex-row">
              <div style={{ height: '20px', width: '20px' }}>
                <CustomImage src={WarningIcon} />
              </div>

              <Text size={ismobile ? 'xs' : 'sm'} color="text-orange-400">
                You have blocked this user
              </Text>
            </div>
          )}
        </div>
        {duration && <Duration duration={duration} variant={variant} />}

        {isUserBlocked && isGuestUserRoute && !isDisabled ? (
          <div
            className={`flex flex-row gap-3 ${isipad || ismobile ? 'hidden' : ''
              }`}
          >
            <Button type="secondary" size="xs" onClick={handleUnblock}>
              Unblock
            </Button>
          </div>
        ) : (
          <div className="flex">
            {showButton && userId !== userProfileId && !blockerIds.has(userId as string) && (
              <div className="flex flex-row items-center justify-center">
                {!isipad && (
                  <div className="hidden flex-1 lg:block">
                    <FollowButton
                      postUserId={userId as string}
                      isFollowing={isFollowing}
                    />
                  </div>
                )}

                <div>
                  <ActionsButton
                    postId={userId as string}
                    postUserId={userId as string}
                    cardType={CardTypeEnum.user}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {headingChildren}
      <div className={`${type ? 'flex items-center justify-between' : ''}`}>
        {details && (
          <Text
            size="base"
            color={`${detailsColor}`}
            customClass={`${type ? 'font-semibold flex items-center gap-1' : ''
              }`}
          >
            {type && (
              <Image
                src="/images/broken-clock.svg"
                alt="clock"
                width={24}
                height={24}
                className="size-4"
              />
            )}
            {child1 && admin
              ? `Replying to ${toName}`
              : child2 && admin
                ? `Commented to ${toName} `
                : details}
          </Text>
        )}
        {type && postImageSrc && (
          <Image src={postImageSrc} alt={type} height={24} width={24} />
        )}
      </div>
    </div>
  );
}

export default CardHeading;
