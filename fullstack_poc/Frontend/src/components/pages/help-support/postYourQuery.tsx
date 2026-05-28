import { useState } from 'react';
import { IoMdArrowForward } from 'react-icons/io';

import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitNotification } from '@/lib/helpers';

interface PostYourQueryProps {
  title: string;
  description: string;
  image: string;
  onSubmit: (text: string) => void;
}

export default function PostYourQuery({
  title,
  description,
  image,
  onSubmit,
}: PostYourQueryProps) {
  const { isAuthenticated, profile } =
    useAppSelector((state) => state.auth) ?? {};
  const { email } = profile || {};
  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="searchScroll relative my-10 flex justify-between rounded-xl bg-gray-1950">
      <div className="p-4 lg:w-[501px] lg:p-8 xl:w-[647px]">
        <Text size="lg" variant color="text-gray-1900" font="semibold">
          {title ?? 'Still not able to find answers?'}
        </Text>
        <div className="mt-3">
          <Text size="lg" variant color="text-black-1400" font="medium">
            {description ??
              'Write down your concern here and our group of nerds will help you to solve it.'}
          </Text>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isAuthenticated || !email) {
              emitNotification('error', 'Please sign in to submit a query.');
              setInputValue('');
              return;
            }
            onSubmit(inputValue);
            setInputValue('');
          }}
        >
          <div className="mt-8 items-center lg:flex lg:space-x-4">
            <div className="relative z-11 lg:w-[471px]">
              <TextArea
                placeholder="Come, let us help you"
                value={inputValue}
                className="rounded-lg border-offwhite-100"
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setInputValue(event.target.value);
                }}
              />
            </div>

            <div className="mt-4 lg:mt-0">
              <Button
                type="submit"
                size={isMobile ? 'sm' : 'md'}
                isdisabled={!inputValue}
              >
                <div className="flex items-center space-x-20">
                  Submit
                  <div className="min-w-2 ml-1">
                    <IoMdArrowForward color="white" size={16} />
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </form>
      </div>
      <div className="absolute bottom-0 right-0 hidden lg:block lg:h-[140px] lg:w-[209px] xl:h-[242px] xl:w-[362px]">
        <div className="flex justify-center">
          <CustomImage
            src={image || '/images/help-center.png'}
            width={353}
            height={280}
            alt="Help and Support"
          />
        </div>
      </div>
    </div>
  );
}
