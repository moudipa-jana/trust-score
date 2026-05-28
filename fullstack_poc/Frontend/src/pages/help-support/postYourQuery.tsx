import { useState } from 'react';
import { IoMdArrowForward } from 'react-icons/io';

import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';

import { emitNotification } from '@/lib/helpers';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import { StaticImageData } from 'next/dist/shared/lib/image-external';

interface PostYourQueryProps {
  title: string;
  description: string;
  image: string | StaticImageData;
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
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="searchScroll relative my-10 flex lg:flex-row flex-col items-center justify-between rounded-2xl bg-[#8A9BFF]">
      <div className="p-4 lg:w-[501px] lg:p-8 xl:w-[647px] lg:order-first order-last">
        <Text color="text-white" font="semibold">
          <span className='lg:text-5xl block lg:mb-10'>{title ?? 'Still not able to find answers?'}</span>
        </Text>
        <div className="mt-3">
          <Text size="md" variant color="text-[#E5E5E5]" font="medium">
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
                className="rounded-lg border-offwhite-100 text-base h-12 rounded-xl"
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setInputValue(event.target.value);
                }}
              />
            </div>

            <div className="mt-4 lg:mt-0">
              <Button
                type="submit"
                isdisabled={!inputValue}
                customClassName='font-medium w-full text-center'
                color='transparent'
                textColor='text-white lg:py-2 py-3 rouned-xl text-center'
                
              >
                <div className="flex items-center space-x-20 justify-center">
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
      <div className="p-7 lg:order-last order-first">
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
