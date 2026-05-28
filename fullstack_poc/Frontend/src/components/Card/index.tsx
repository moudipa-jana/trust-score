import React, { useEffect, useRef, useState } from 'react';

import DeleteNotification from '/public/images/DeleteNotification.svg';
import epsilonIcon from '/public/images/epsilonIcon.svg';
import InsideCampfire from '/public/images/InsideCampfire.svg';
import MuteNotification from '/public/images/MuteNotification.svg';
import PinnedIcon from '/public/images/NewPin.svg';
import OutsideCampfire from '/public/images/OutsideCampfire.svg';
import Request from '/public/images/Request.svg';
import Bookmark from '@/components/Card/Bookmark';
import Cover from '@/components/Card/Cover';
import VideoComponent from '@/components/Card/VideoComponent';
import { BlogCategory } from '@/components/pages/Blog/ForumBingeWatch';
import CustomImage from '@/components/Utility/CustomImage';
import FollowButton from '@/components/Utility/FollowButton';
import Puzzle from '@/components/Utility/Puzzle';
import ReadMore from '@/elements/ReadMore';
import Text from '@/elements/Text';
import UserImage from '@/elements/UserImage';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import appDayjs from '@/lib/appDayjs';
import clsxm from '@/lib/clsxm';

import Actions from '../pages/Forum/chat/Actions';
import CommentBox from '../pages/Forum/chat/CommentBox';
import Tag from '../Utility/Tag';
import CardBody from './CardBody';
import CardContainer from './CardContainer';
import CardDate from './CardDate';
import CardFooter from './CardFooter';
import CardHeading from './CardHeading';

interface CardProps {
  follow?: boolean;
  category?: string;
  description?: string | JSX.Element;
  details?: string;
  duration?: string;
  type?: string;
  footer?: boolean;
  value?: number | string;
  unvalue?: number | string;
  comment?: number | string;
  participants?: number | string;
  share?: boolean;
  bookmark?: boolean;
  children?: React.ReactNode;
  action?: boolean;
  commentReply?: boolean;
  puzzle?: boolean;
  title?: React.ReactNode;
  question?: string;
  shareModalPost?: () => void;
  followers?: number;
  admin?: boolean;
  color?: string;
  rounded?: boolean;
  variant?: 'horizontal' | 'vertical' | string;
  altText?: string;
  campfireCoverImg?: string;
  profileImg?: string;
  link?: string;
  linkColor?: string;
  detailsColor?: string;
  onValueFuntion?: () => void;
  valued?: boolean;
  onUnValueFuntion?: () => void;
  unValued?: boolean;
  onBookMarkFuction?: () => void;
  isBookMarkClick?: boolean;
  coverImg?: string;
  videoSrc?: string;
  cardTag?: React.ReactNode;
  date?: string;
  count?: string | number | JSX.Element;
  alertTitle?: string;
  alert?: boolean;
  alertIcon?: boolean;
  alertType?: string;
  headingChildren?: React.ReactNode;
  uploadImg?: string | JSX.Element;
  size?: string;
  isBorder?: boolean;
  isFourm?: boolean;
  isVideo?: boolean;
  join?: boolean;
  imgHeight?: number;
  imgWidth?: number;
  handleTimeUpdate?: () => void;
  userId?: string;
  isFollowing?: boolean;
  showButton?: boolean;
  blogId?: string | number;
  authorName?: string;
  authorImg?: string;
  roundBorder?: string;
  otherBlogCard?: boolean;
  videoCard?: boolean;
  inlineBookmark?: boolean;
  fallbackSrc?: string;
  sunrise?: boolean;
  blogtags?: BlogCategory;
  bookmarkHead?: boolean;
  flow?: string;
  readTime?: string | JSX.Element | null;
  bingeCard?: boolean;
  smallCard?: boolean;
  trend?: boolean;
  searchCard?: boolean;
  isBingeWatch?: boolean;
  playIconSrc?: string;
  forumBlogs?: boolean;
  isBorderRadius?: boolean;
  textAlign?: boolean;
  readingTime?: JSX.Element | null;
  isFullHeight?: boolean;
  hovered?: boolean;
  notificationCard?: boolean;
  notificationSeen?: boolean;
  notificationMuted?: boolean;
  handleDeleteNotification?: () => void;
  handleMuteNotification?: () => void;
  notificationType?: string;
  notificationInCampfire?: boolean;
  isNotificationPage?: boolean;
  profileImgClass?: string;
  cardContainerClassName?: string;
  titleContainerClassName?: string;
  message?: string;
  isDisabled?: boolean;
}

function Card({
  follow,
  category,
  description,
  details,
  duration,
  type,
  footer,
  value,
  unvalue,
  comment,
  participants,
  share,
  bookmark,
  children,
  action,
  commentReply,
  puzzle,
  title,
  question,
  shareModalPost,
  followers,
  admin,
  color,
  rounded,
  variant,
  altText,
  campfireCoverImg,
  profileImg,
  link,
  linkColor,
  detailsColor,
  onValueFuntion,
  valued,
  onUnValueFuntion,
  unValued,
  onBookMarkFuction,
  isBookMarkClick = false,
  coverImg,
  videoSrc,
  cardTag,
  date,
  count,
  alertTitle,
  alert,
  alertIcon,
  alertType,
  headingChildren,
  uploadImg,
  size,
  isBorder,
  isFourm,
  isVideo,
  join,
  imgHeight,
  imgWidth,
  handleTimeUpdate,
  userId,
  isFollowing,
  showButton,
  blogId,
  authorName,
  authorImg,
  roundBorder,
  otherBlogCard,
  videoCard,
  inlineBookmark,
  fallbackSrc,
  sunrise,
  blogtags,
  bookmarkHead,
  flow,
  readTime,
  bingeCard,
  smallCard,
  trend,
  searchCard,
  isBingeWatch,
  playIconSrc,
  forumBlogs,
  isBorderRadius,
  textAlign,
  readingTime,
  isFullHeight,
  hovered,
  notificationCard,
  notificationSeen,
  notificationMuted,
  handleDeleteNotification,
  handleMuteNotification,
  notificationType,
  notificationInCampfire,
  isNotificationPage,
  profileImgClass,
  cardContainerClassName,
  titleContainerClassName,
  message,
  isDisabled,
}: CardProps) {
  const [commentToggle, setCommentToggle] = useState(false);
  const isipad = useIsipad();
  const ismobile = useIsMobile();

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const epsilonIconRef = useRef<HTMLDivElement | null>(null);

  const handleOptionClick = (option: string) => {
    if (option === 'delete' && handleDeleteNotification) {
      handleDeleteNotification();
    } else if (option === 'mute' && handleMuteNotification) {
      handleMuteNotification();
    }
    setShowOptions(false);
  };

  const handleMouseLeave = () => {
    setShowOptions(false);
  };

  const toggleOptions = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        epsilonIconRef.current &&
        !epsilonIconRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cardClasses = clsxm(
    'card-container',
    rounded && 'rounded-lg',
    hovered && 'hover:shadow-lg transition-shadow duration-200',
    cardContainerClassName,
  );

  return smallCard ? (
    <CardContainer
      alert={alert}
      alertTitle={alertTitle}
      color={color}
      variant={variant}
      alertIcon={alertIcon}
      alertType={alertType}
      isBorder={isBorder}
      isBorderRadius={isBorderRadius}
      roundBorder={roundBorder}
      flow={flow}
      height="xl:min-h-29.5 lg:min-h-26 min-h-24 h-full"
    >
      <div className="flex h-full">
        <div>
          {authorImg && (
            <UserImage size="xl" src={authorImg} alt={authorName} />
          )}
        </div>
        <div className="flex max-w-900 flex-col">
          <div className="flex flex-wrap text-sm">
            <i>Written By</i>{' '}
            <span className="ml-2 font-bold">{authorName}</span>
          </div>

          <CardHeading smallTitle title={title} variant={variant} />

          <div className="mb-0 flex flex-wrap gap-3">
            <CardBody small cardTag={cardTag} blogtags={blogtags}>
              {children}
            </CardBody>
            <div>
              <Text
                customClass={trend ? 'mr-20  xlg:mr-0' : ''}
                size="xs"
                color="text-gray-200"
              >
                {readTime}
              </Text>
            </div>
          </div>
        </div>
      </div>
      {trend && (
        <div className="absolute bottom-0 right-0">
          <CustomImage fill src="/images/sunrise/trend.svg" />
        </div>
      )}
    </CardContainer>
  ) : (
    <CardContainer
      alert={alert}
      alertTitle={alertTitle}
      color={color}
      variant={variant}
      alertIcon={alertIcon}
      alertType={alertType}
      isBorder={isBorder}
      isBorderRadius={isBorderRadius}
      roundBorder={roundBorder}
      flow={flow}
      className={cardClasses}
    >
      {!videoCard && bookmarkHead && (
        <div
          className={`flex min-h-0 flex-wrap items-center gap-3 lg:min-h-16 
                ${sunrise
              ? 'px-3 pb-0 pt-3'
              : searchCard
                ? 'px-3 pb-0 pt-3 lg:pt-6 xl:px-10'
                : 'px-3 py-3 lg:px-3 lg:pt-6 lg:pb-4 xl:px-4 xl:pt-3'
            }`}
        >
          {authorName &&
            (isipad ? (
              <div className="flex">
                <div>
                  <UserImage
                    size={size ? size : variant == 'lg' || admin ? '' : 'sm'}
                    src={authorImg as string}
                    alt={authorName}
                  />
                </div>
                <div>
                  <i>Written By</i>{' '}
                  <span className="ml-2 font-bold">{authorName}</span>
                  {date && !appDayjs(date).fromNow().toLowerCase().includes('invalid') && (
                    <Text size="base" color="text-gray-850">
                      {appDayjs(date).fromNow()}
                    </Text>
                  )}
                </div>
              </div>
            ) : ismobile ? (
              <div className="flex">
                <div>
                  <UserImage
                    size={size}
                    src={authorImg as string}
                    alt={authorName}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-xs">
                    <i>Written By</i>
                  </div>
                  <div className="">
                    <span className="text-sm font-bold ">{authorName}</span>
                  </div>
                  <div>
                    {date && (
                      <Text size="xs" color="text-gray-850">
                        {appDayjs(date).fromNow()}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ) : sunrise ? (
              <div className="flex items-center">
                <div>
                  <UserImage
                    size="xs"
                    src={authorImg as string}
                    alt={authorName}
                  />
                </div>
                <div className="max-w-[275px]">
                  <div className="flex flex-col">
                    <div className="text-sm">
                      <i>Written By</i>
                    </div>
                    <div className="flex gap-5">
                      <div className="leading-none truncate">
                        <p className="text-sm font-bold truncate block">
                          {authorName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {date && (
                      <Text size="xs" color="text-gray-850">
                        {appDayjs(date).fromNow()}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ) : searchCard ? (
              <div className="flex items-center">
                <div>
                  <UserImage
                    size="xs"
                    src={authorImg as string}
                    alt={authorName}
                  />
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className="text-xs lg:text-md">
                    <i>Written By</i>
                  </div>
                  <div className="flex flex-wrap gap-5">
                    <div className="">
                      <span className="text-sm font-bold lg:text-md">
                        {authorName}
                      </span>
                    </div>
                    <div>
                      {date && !appDayjs(date).fromNow().toLowerCase().includes('invalid') && (
                        <Text size="xs" variant color="text-gray-850">
                          {appDayjs(date).fromNow()}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center text-sm">
                  <UserImage
                    size={size ? size : variant == 'lg' || admin ? '' : 'sm'}
                    src={authorImg as string}
                    alt={authorName}
                  />
                  <div>
                    <div className="flex">
                      <i>Written By</i>{' '}
                      <p className="ml-2 font-bold truncate w-[145px]">
                        {authorName}
                      </p>
                    </div>
                    <div className="text-xs">
                      {date && !appDayjs(date).fromNow().toLowerCase().includes('invalid') && (
                        <Text size="xs" color="text-gray-850">
                          {appDayjs(date).fromNow()}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ))}
          <div className="ml-auto">
            <Bookmark blogId={blogId} />
          </div>
        </div>
      )}

      <div
        className={`${variant == 'horizontal' &&
            !videoCard &&
            !inlineBookmark &&
            !sunrise &&
            !searchCard
            ? 'grid grid-cols-2 items-center justify-center lg:grid-cols-6'
            : variant == 'horizontal' && videoCard
              ? 'grid grid-cols-2 items-start lg:grid-cols-6'
              : variant == 'horizontal' && inlineBookmark
                ? 'grid grid-cols-2 items-start lg:grid-cols-6'
                : variant == 'horizontal' && sunrise
                  ? 'grid grid-cols-4 items-start'
                  : variant == 'horizontal' && searchCard
                    ? 'grid grid-cols-1 items-start lg:grid-cols-5'
                    : variant == 'vertical' && sunrise
                      ? 'flex-auto'
                      : ''
          }`}
      >
        <div
          className={`${variant == 'horizontal' && !videoCard && !sunrise && !searchCard
              ? 'col-span-2 h-full pb-2 lg:pb-0'
              : otherBlogCard
                ? ''
                : videoCard
                  ? 'h-full px-0 lg:col-span-3 xl:col-span-2'
                  : sunrise
                    ? 'h-auto px-0 pb-3 lg:col-span-2'
                    : searchCard
                      ? 'h-auto px-0 pb-3 lg:col-span-2 lg:pb-6'
                      : ''
            }`}
        >
          {coverImg && !sunrise && !searchCard && (
            <div className="relative">
              <Cover
                variant={variant}
                coverImg={coverImg}
                hoverVideoSrc={videoSrc}
                type={type}
                playIcon={isVideo}
                playIconSrc={playIconSrc}
                height={imgHeight}
                width={imgWidth}
                isBorderRadius={isBorderRadius}
                isFullHeight={isFullHeight}
                fallbackSrc={fallbackSrc}
              />
              {authorName && (
                <div className="absolute top-0 right-0">
                  <span
                    className="inline-block rounded-bl px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.24)',
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {authorName}
                  </span>
                </div>
              )}
            </div>
          )}

          {coverImg && sunrise && (
            <Cover
              coverImg={coverImg}
              hoverVideoSrc={videoSrc}
              type="coverImgmd"
              playIcon={isVideo}
              playIconSrc={playIconSrc}
              height={imgHeight}
              width={imgWidth}
              space
              isBorderRadius={isBorderRadius}
              isFullHeight={isFullHeight}
            />
          )}
          {coverImg && searchCard && (
            <Cover
              coverImg={coverImg}
              hoverVideoSrc={videoSrc}
              type="coverImgxl"
              playIcon={isVideo}
              playIconSrc={playIconSrc}
              height={imgHeight}
              width={imgWidth}
              searchSpace
              isBorderRadius={isBorderRadius}
              isFullHeight={isFullHeight}
            />
          )}

          {!coverImg && videoSrc && (
            <VideoComponent
              src={videoSrc}
              handleTimeUpdate={handleTimeUpdate}
            />
          )}
        </div>
        {sunrise ? (
          <div
            className={`pt-2 pb-3 ${variant == 'horizontal' ? 'col-span-2 pl-1 pr-4' : 'px-3'
              }`}
          >
            <div className="pb-2 xl:pb-4">
              <CardHeading clubTitle title={title} variant={variant} />
            </div>

            <div className="block pb-4 xl:hidden">
              <Text
                size={variant == 'horizontal' ? 'base' : 'sm'}
                color="text-black"
                font={variant == 'sm' ? 'font-light' : 'font-regular'}
              >
                <span className="description">{description}</span>
              </Text>
            </div>

            {isipad && (
              <div className="flex flex-wrap gap-5">
                <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                  {children}
                </CardBody>
                <div>
                  <Text size="xs" color="text-gray-850">
                    {readTime}
                  </Text>
                </div>
              </div>
            )}
          </div>
        ) : searchCard ? (
          <div className="col-span-3 pt-0 pb-3 pl-4 pr-4 lg:pt-2 lg:pl-1">
            {!ismobile && (
              <div className="flex flex-col">
                <div className="mb-4 mt-2 flex flex-wrap gap-5">
                  <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                    {children}
                  </CardBody>
                  <div>
                    <Text size="sm" color="text-gray-850">
                      {readTime}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            <div className="pb-2 xl:pb-4">
              <CardHeading blogTitle title={title} variant={variant} />
            </div>

            <div className="block pb-4">
              <Text
                size={variant == 'horizontal' ? '2xl' : 'sm'}
                color="text-black"
                font={variant == 'sm' ? 'font-light' : 'font-regular'}
              >
                <span className="description">{description}</span>
              </Text>
            </div>

            {ismobile && (
              <div className="flex flex-col">
                <div className=" mt-2 flex flex-wrap gap-5">
                  <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                    {children}
                  </CardBody>
                  <div>
                    <Text size="sm" color="text-gray-850">
                      {readTime}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${variant == 'vertical' || variant == 'horizontal'
                ? `${forumBlogs ? 'mb-2' : ''} p-4`
                : otherBlogCard
                  ? 'py-2 pl-3 lg:py-6 lg:pr-4 lg:pl-3 lg:pt-0 lg:pb-6 xl:py-3'
                  : ''
              } ${link ? 'pb-4' : ''}
          ${variant == 'horizontal' && !videoCard
                ? 'col-span-2 pt-0 pl-2 lg:col-span-4 lg:pt-2 lg:pl-8'
                : videoCard
                  ? 'py-6 px-4 lg:col-span-3 lg:px-4 lg:py-6 xl:col-span-4'
                  : ''
              }`}
          >
            {variant === 'vertical' && title && (
              <div className="mb-3 h-[48px]">
                <CardHeading
                  title={title}
                  variant={variant}
                  clamp="line-clamp-2  mb-2 text-md"
                />
              </div>
            )}
            {date && !otherBlogCard && !videoCard ? (
              <CardDate
                date={date}
                count={count}
                isVideoCard={videoSrc}
                blogId={blogId}
              />
            ) : (
              videoCard && (
                <CardDate
                  video
                  date={date}
                  count={count}
                  isVideoCard={videoSrc}
                  blogId={blogId}
                />
              )
            )}
            {variant === 'vertical' &&
              trend &&
              blogtags?.data &&
              blogtags.data.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  {blogtags.data.slice(0, 2).map((tag: any, index: number) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '0.5px solid #00B2ED',
                        background: '#FFFFFF',
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                        fontSize: '10px',
                        lineHeight: '16px',
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        color: '#00B2ED',
                      }}
                    >
                      {tag.attributes?.title}
                    </span>
                  ))}
                  {blogtags.data.length > 2 && (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '0.5px solid #00B2ED',
                        background: '#FFFFFF',
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 500,
                        fontSize: '10px',
                        lineHeight: '16px',
                        textAlign: 'center',
                        color: '#00B2ED',
                      }}
                    >
                      +{blogtags.data.length - 2}
                    </span>
                  )}
                </div>
              )}
            {otherBlogCard && !ismobile && sunrise && (
              <div className="mb-4 flex flex-wrap gap-5">
                <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                  {children}
                </CardBody>
                <div>
                  <Text size="sm" color="text-gray-850">
                    {readTime}
                  </Text>
                </div>
              </div>
            )}
            {otherBlogCard && !ismobile && (
              <div className="mb-4 flex flex-wrap gap-5">
                <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                  {children}
                </CardBody>
                <div>
                  <Text size="sm" color="text-gray-850">
                    {readTime}
                  </Text>
                </div>
              </div>
            )}
            {videoCard && !ismobile && (
              <div className="mb-4 flex flex-wrap gap-5">
                <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                  {children}
                </CardBody>
              </div>
            )}
            <div
              className={`flex ${textAlign && 'text-start'} ${title ? 'justify-between' : 'justify-center'
                } `}
            >
              <div
                className={clsxm(
                  `${title ? 'flex w-full items-start' : 'inline'}`,
                  titleContainerClassName,
                )}
              >
                {campfireCoverImg && profileImg ? (
                  <div className="relative">
                    <div
                      className={`${ismobile ? 'h-15 w-15' : 'h-20 w-20'
                        } relative rounded-full`}
                    >
                      <CustomImage
                        src={campfireCoverImg}
                        alt={altText}
                        height={300}
                        width={300}
                        fallbackSrc={fallbackSrc}
                      />
                    </div>
                    <div
                      className={`absolute z-1 ${ismobile ? 'left-6 top-6' : 'left-8 top-8'
                        }`}
                    >
                      <UserImage size="xs" src={profileImg} alt={altText} />
                    </div>
                  </div>
                ) : notificationCard ? (
                  <>
                    {notificationSeen ? null : (
                      <div
                        className="absolute top-0 left-0 h-3 w-3 rounded-full bg-red-500"
                        style={{ border: '2px solid white' }}
                      ></div>
                    )}
                    <div className="relative">
                      <UserImage
                        size={
                          size ? size : variant == 'lg' || admin ? '' : 'sm'
                        }
                        src={profileImg as string}
                        alt={altText}
                      />
                      {uploadImg}
                    </div>
                  </>
                ) : profileImg ? (
                  <div className="relative camfire-profile-image ">
                    <UserImage
                      size={size ? size : variant == 'xl' || admin ? '' : 'sm'}
                      src={profileImg}
                      alt={altText}
                      containerClassName={profileImgClass}
                      width={190}
                      height={144}
                    />
                    {uploadImg}
                  </div>
                ) : null}

                {title &&
                  variant !== 'vertical' &&
                  (otherBlogCard ? (
                    <CardHeading blogTitle title={title} variant={variant} />
                  ) : videoCard ? (
                    <CardHeading videoTitle title={title} variant={variant} />
                  ) : bingeCard ? (
                    <CardHeading bingeTitle title={title} variant={variant} />
                  ) : inlineBookmark ? (
                    <div className="flex w-full justify-between gap-2">
                      <CardHeading title={title} variant={variant} />
                      <div className="relative top-[13px]">
                        <Bookmark blogId={blogId} />
                      </div>
                    </div>
                  ) : notificationCard ? (
                    <div className="flex w-full flex-row items-center justify-between">
                      <CardHeading
                        notificationTitle
                        isFourm={isFourm}
                        title={title}
                        message={message}
                        details={details}
                        variant={variant}
                        detailsColor={detailsColor}
                        duration={duration}
                        headingChildren={headingChildren}
                        isFollowing={isFollowing}
                        userId={userId}
                        showButton={showButton}
                      />

                      <div>
                        <div
                          className="relative ml-auto mb-1 h-5 w-5 px-2"
                          onClick={toggleOptions}
                          ref={epsilonIconRef}
                        >
                          <CustomImage src={epsilonIcon} />

                          {showOptions && (
                            <div
                              ref={optionsRef}
                              className="absolute right-0 z-10 mt-2 w-32 rounded-md bg-white shadow-lg"
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100">
                                <div className="h-5 w-5">
                                  <CustomImage src={DeleteNotification} />
                                </div>
                                <div
                                  className="cursor-pointer px-1 pt-1 text-red-500 "
                                  onClick={() => handleOptionClick('delete')}
                                >
                                  Delete
                                </div>
                              </div>

                              <div className="border-t border-gray-100"></div>
                              <div className="flex flex-row items-center py-2 pl-2 hover:bg-gray-100">
                                <div className="h-5 w-5">
                                  <CustomImage src={MuteNotification} />
                                </div>
                                <div
                                  className="cursor-pointer px-1 pt-1 text-skyBlue-200 "
                                  onClick={() => handleOptionClick('mute')}
                                >
                                  {notificationMuted ? 'Unmute' : 'Mute'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          {isNotificationPage && (
                            <div className="h-5 w-5">
                              {notificationType === 'commentPinned' ? (
                                <CustomImage src={PinnedIcon} />
                              ) : notificationType === 'campfireUserRequest' ||
                                notificationType === 'campfireAdminRequest' ? (
                                <CustomImage src={Request} />
                              ) : (
                                <div className="h-5 w-5">
                                  {notificationInCampfire ? (
                                    <CustomImage src={InsideCampfire} />
                                  ) : (
                                    <CustomImage src={OutsideCampfire} />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CardHeading
                      isFourm={isFourm}
                      title={title}
                      details={details}
                      variant={variant}
                      detailsColor={detailsColor}
                      duration={duration}
                      headingChildren={headingChildren}
                      isFollowing={isFollowing}
                      userId={userId}
                      showButton={showButton}
                      type={type}
                      isDisabled={isDisabled}
                    />
                  ))}

                {follow && <FollowButton postUserId="" />}
              </div>

              {category && (
                <Tag bg="bg-white" type="card" isActive size="xs">
                  {category}
                </Tag>
              )}

              {action && (
                <div>
                  <Actions variant={variant} admin={admin} />
                </div>
              )}
            </div>
            {puzzle && <Puzzle question={question} title={title} />}
            {otherBlogCard ? (
              <>
                <CardBody description={description} variant={variant}>
                  {children}
                </CardBody>
                {ismobile && (
                  <div className="mb-0 flex flex-wrap gap-5">
                    <CardBody inline cardTag={cardTag} blogtags={blogtags}>
                      {children}
                    </CardBody>
                    <div>
                      <Text size="sm" color="text-gray-850">
                        {readTime}
                      </Text>
                    </div>
                  </div>
                )}
              </>
            ) : videoCard ? null : isBingeWatch ? null : notificationCard ? (
              <CardBody
                description={description}
                variant={variant}
                cardTag={cardTag}
                blogtags={blogtags}
                forumBlogs={forumBlogs}
                textAlign={textAlign}
                readingTime={readingTime}
              >
                {children}
              </CardBody>
            ) : variant === 'vertical' ? null : (
              <CardBody
                description={description}
                variant={variant}
                cardTag={cardTag}
                blogtags={blogtags}
                forumBlogs={forumBlogs}
                textAlign={textAlign}
                readingTime={readingTime}
              >
                {children}
              </CardBody>
            )}

            {link && variant !== 'vertical' && (
              <div className="absolute bottom-4 right-3 ">
                <ReadMore
                  link={link}
                  color={linkColor ? linkColor : 'primary'}
                />
              </div>
            )}
          </div>
        )}
        {footer && (
          <>
            <div className="line"></div>

            <CardFooter
              admin={admin}
              variant={variant}
              value={value}
              unvalue={unvalue}
              comment={comment}
              participants={participants}
              share={share}
              bookmark={bookmark}
              setCommentToggle={setCommentToggle}
              commentToggle={commentToggle}
              followers={followers}
              join={join}
              onValueFuntion={onValueFuntion}
              valued={valued}
              onUnValueFuntion={onUnValueFuntion}
              unValued={unValued}
              onBookMarkFuction={onBookMarkFuction}
              isBookMarkClick={isBookMarkClick}
            />
          </>
        )}
        {commentReply && commentToggle ? <CommentBox /> : ''}
      </div>

      {sunrise &&
        !isipad &&
        (searchCard ? null : (
          <div
            className={`flex  gap-5 pb-3 ${variant == 'horizontal' ? 'pl-1 pr-4' : 'px-3'
              }`}
          >
            <CardBody inline cardTag={cardTag} blogtags={blogtags}>
              {children}
            </CardBody>
            <div className=" flex  items-end justify-end">
              <Text size="xs" color="text-gray-850">
                {readTime}
              </Text>
            </div>
          </div>
        ))}

      {share && shareModalPost && (
        <div
          className="absolute right-4 top-4 cursor-pointer"
          onClick={shareModalPost}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.59 13.51L15.42 17.49"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.41 6.51L8.59 10.49"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </CardContainer>
  );
}

export default Card;
