/**
 * CardFooter Component
 *
 * Displays interactive footer elements for a card: value/unvalue buttons, comments, share, participants, followers, and bookmark.
 * Adapts styles based on `variant` and `admin` props.
 */

import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

import Down from '/public/images/down.svg';
import FillDown from '/public/images/fillDown.svg';
import Share from '/public/images/share.svg';
import Text from '@/elements/Text';

import Button from '../Utility/Button';
import CustomImage from '../Utility/CustomImage';

interface CardFooterProps {
  value?: number | string;
  unvalue?: number | string;
  comment?: number | string;
  participants?: number | string;
  share?: boolean;
  bookmark?: boolean;
  setCommentToggle?: (value: boolean) => void;
  commentToggle?: boolean;
  followers?: number;
  variant?: 'lg' | 'sm' | string;
  admin?: boolean;
  join?: boolean;
  onValueFuntion?: () => void;
  valued?: boolean;
  onUnValueFuntion?: () => void;
  unValued?: boolean;
  onBookMarkFuction?: () => void;
  isBookMarkClick?: boolean;
}

function CardFooter({
  value,
  unvalue,
  comment,
  participants,
  share,
  bookmark,
  setCommentToggle,
  commentToggle,
  followers,
  variant,
  admin,
  join,
  onValueFuntion,
  valued,
  onUnValueFuntion,
  unValued,
  onBookMarkFuction,
  isBookMarkClick,
}: CardFooterProps) {
  return (
    <>
      <div
        className={`flex justify-between ${variant == 'lg' ? 'pt-2' : 'pt-0'}`}
      >
        <div
          className={`flex items-center gap-4 
            `}
        >
          {value && (
            <div
              className="flex cursor-pointer items-center lg:min-w-[100px]"
              onClick={onValueFuntion}
            >
              <div className="iconUpHolder mr-1 h-4 w-4">
                {!valued ? (
                  <span className="icon-up"></span>
                ) : (
                  <span className="icon-fillUp"></span>
                )}
              </div>
              <div className=" hidden lg:block">
                <Text size={`${variant == 'sm' ? 'xs' : 'sm'}`}>
                  {valued ? 'Valued' : 'Value'}
                </Text>
              </div>
              <div className="ml-2 flex items-center">
                <Text
                  size={variant == 'sm' ? 'xs' : 'sm'}
                  color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                >
                  {value}
                </Text>
                <div className="ml-1 h-1 w-1 rounded-full bg-primary"></div>
              </div>
            </div>
          )}
          {unvalue && (
            <div
              className="flex cursor-pointer items-center lg:min-w-[120px]"
              onClick={onUnValueFuntion}
            >
              <div className="mr-1 h-4 w-4">
                <CustomImage src={!unValued ? Down : FillDown} alt="unvalue" />
              </div>
              <div
                className=" hidden lg:block
             "
              >
                {' '}
                <Text size={variant == 'sm' ? 'xs' : 'sm'}>
                  {!unValued ? 'Unvalue' : 'Unvalued'}
                </Text>
              </div>
              <div className="ml-2 flex items-center">
                <Text
                  size={variant == 'sm' ? 'xs' : 'sm'}
                  color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                >
                  {unvalue}
                </Text>
                <div className="ml-1 h-1 w-1 rounded-full bg-error"></div>
              </div>
            </div>
          )}
          {comment &&
            (admin || variant == 'sm' ? (
              <div
                className="arrow-bottom relative cursor-pointer rounded-md bg-primary px-2 py-1"
                onClick={() => {
                  if (setCommentToggle) setCommentToggle(!commentToggle);
                }}
              >
                <Text
                  size={
                    variant == 'sm' || variant == 'lg' || admin ? 'xxs' : 'sm'
                  }
                  color="text-white"
                >
                  {comment}
                </Text>
              </div>
            ) : (
              <div
                className=" cursor-pointer"
                onClick={() => {
                  if (setCommentToggle) setCommentToggle(!commentToggle);
                }}
              >
                <Text size="sm" color="text-gray-700">
                  Reply
                </Text>
              </div>
            ))}
          <div>
            {followers && (
              <Text size={variant == 'sm' ? 'xxs' : 'sm'} color="text-gray-500">
                {followers} Followers
              </Text>
            )}
            {participants && (
              <div className=" hidden lg:block ">
                <Text
                  size={
                    variant == 'sm' ? 'xxs' : variant == 'lg' ? 'base' : 'sm'
                  }
                  color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                >
                  {participants} Participants
                </Text>
              </div>
            )}
          </div>
          {share && (
            <div className="group relative h-5 w-5 cursor-pointer">
              <CustomImage src={Share} />
              <span className="shareIconBtn">Share</span>
            </div>
          )}
        </div>
        {/* BookMark is a Function */}
        {bookmark && (
          <div>
            <div
              className="bookmark-icon h-5 w-4 cursor-pointer"
              onClick={onBookMarkFuction}
            >
              {isBookMarkClick ? (
                <BsBookmarkFill size={20} color="#00B2ED" />
              ) : (
                <BsBookmark size={20} />
              )}
            </div>
          </div>
        )}
      </div>
      {join && <Button>Join</Button>}
    </>
  );
}

export default CardFooter;
