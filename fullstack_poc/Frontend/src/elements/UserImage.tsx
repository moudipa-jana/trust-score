import CustomImage from '@/components/Utility/CustomImage';
import clsxm from '@/lib/clsxm';
import { FALLBACK_PROFILE_PIC } from '@/lib/constants';

interface Props {
  size?: string;
  alt: string;
  src: string | { src: string };
  gap?: string;
  height: number;
  width: number;
  containerClassName?: string;
}
function UserImage({
  size,
  alt,
  src,
  gap,
  height,
  width,
  containerClassName,
}: Props) {
  let imageToUse = FALLBACK_PROFILE_PIC;
  if (src && typeof src === 'string') {
    imageToUse = src || FALLBACK_PROFILE_PIC;
  }
  if (src && typeof src === 'object') {
    imageToUse = src.src || FALLBACK_PROFILE_PIC;
  }
  return (
    <div
      className={clsxm(
        `userPhoto ${gap === '0' ? 'mr-0' : 'mr-2'} ${
          size === 'sm'
            ? 'h-7 w-7 lg:h-10 lg:w-10'
            : size === 'xs'
              ? 'h-7 w-7 lg:h-12 lg:w-12'
              : size === 'md'
                ? 'h-7 w-7 lg:h-20 lg:w-20'
                : size === 'base'
                  ? 'h-12 w-12 lg:h-[80.5px] lg:w-[80.5px]'
                  : size === 'lg'
                    ? 'h-20 w-20 lg:h-27.5 lg:w-27.5'
                    : size === 'xl'
                      ? 'mr-3 h-9 w-9 xl:h-10 xl:w-10'
                      : size === 'xxl'
                        ? 'h-20 w-20'
                        : 'h-8 w-8 lg:h-12 lg:w-12'
        } rounded-full`,
        containerClassName,
      )}
    >
      <CustomImage
        src={
          imageToUse.includes('DummyImage') ? FALLBACK_PROFILE_PIC : imageToUse
        }
        alt={alt}
        height={height}
        width={width}
        fallbackSrc="/images/user_200.svg"
        onError={(e) => {
          e.currentTarget.src = '/images/userImage.svg';
        }}
        className="rounded-full xx"
      />
    </div>
  );
}

UserImage.defaultProps = {
  height: 72,
  width: 72,
  alt: 'user avatar',
};

export default UserImage;
