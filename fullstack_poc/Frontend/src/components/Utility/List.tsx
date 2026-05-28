{
  /**
   * List component renders a flexible user or item row with optional avatar, title,
   * buttons, icons, and description. It adapts layout based on `type` prop and handles
   * navigation or interaction events like follow, invite, or checkbox selection.
   */
}
import { useRouter } from 'next/router';
import { AiFillStar } from 'react-icons/ai';

import Category from '@/components/pages/Forum/Category';
import Button from '@/components/Utility/Button';
import Input from '@/elements/Input';
import UserImage from '@/elements/UserImage';

import Text from '../../elements/Text';

interface ListProps {
  name?: string;
  title?: string;
  btnText?: string;
  tag?: string;
  onClick?: () => void;
  isIcon?: boolean;
  type?: 'checkbox' | 'following' | 'followers' | 'textWithButton' | 'invite';
  user?: boolean;
  src?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

function List({
  name,
  title,
  btnText,
  tag,
  onClick,
  isIcon,
  type,
  user,
  src,
  isActive,
  isDisabled,
}: ListProps) {
  const router = useRouter();

  const description =
    'Health, a science-based community to discuss health related things all over the world wherever we go !!';
  return (
    <div className="flex items-center space-x-1 bg-white">
      {type == 'checkbox' && (
        <div className="p-2">
          <Input type="checkbox" />
        </div>
      )}
      <div
        className="flex flex-1 cursor-pointer items-center "
        onClick={() => router.push(`/user/${name}`)}
      >
        {type == 'following' ||
          (user && (
            <div className="flex-shrink-0">
              <UserImage
                size={type == 'checkbox' ? 'sm' : ''}
                src={src ?? ''}
                alt="user avatar"
              />
            </div>
          ))}
        {title && (
          <Text size="md" color="text-black-500" font="font-medium">
            {title}
          </Text>
        )}
        <div className="flex-1">
          <Text font="font-bold">{name}</Text>
          <Text
            size={type == 'invite' ? 'base' : 'sm'}
            color="text-gray-1050"
            customClass="truncate w-31 lg:w-67.5 xl:w-95"
          >
            {description}
          </Text>
        </div>
      </div>
      {isIcon && (
        <div className="flex-1">
          <AiFillStar className="text-xl text-yellow-500" />
        </div>
      )}
      {type == 'following' ||
        type == 'followers' ||
        (type == 'textWithButton' && (tag || btnText) && (
          <div className=" inline-flex items-start">
            <Button
              size={`${type != 'textWithButton' ? 'md' : 'sm'}`}
              type={!isActive ? 'secondary' : ''}
              textColor="text-black-400"
              onClick={onClick}
              width="w-max"
              isdisabled={isDisabled || false}
            >
              {tag || btnText}
            </Button>
          </div>
        ))}
      {type == 'invite' && <Category />}
    </div>
  );
}

export default List;
