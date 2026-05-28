import Link from 'next/link';
import { MouseEvent } from 'react';

import contagionLine from '/public/images/blog/exploreBy/contagion1.svg';
import fitnessLine from '/public/images/blog/exploreBy/Fitness1.svg';
import hushTalksLine from '/public/images/blog/exploreBy/hushTalk1.svg';
import lifestyleLine from '/public/images/blog/exploreBy/Lifestyle01.svg';
import mentalHealthLine from '/public/images/blog/exploreBy/mentalHealth01.svg';
import parentingLine from '/public/images/blog/exploreBy/parenting1.svg';
import sheReadsLine from '/public/images/blog/exploreBy/sheReads1.svg';
import wellnessLine from '/public/images/blog/exploreBy/wellness01.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';

type ExploreCircleProps = {
  type: string;
  variant?: string;
  link: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export default function ExploreCircle({
  type,
  variant,
  link,
  onClick,
}: ExploreCircleProps) {
  return (
    <div className="">
      <div
        className={` ${
          variant == 'secondary' ? 'categorySquare' : 'categoryCircle'
        } relative `}
      >
        <Link
          onClick={onClick}
          href={`${link}`}
          className="block h-full w-full rounded-full"
        >
          <div>
              <CustomImage
                src={
                  type == 'fitness'
                    ? fitnessLine
                    : type == 'mental health'
                      ? mentalHealthLine
                      : type == 'hush talks'
                        ? hushTalksLine
                        : type == 'contagion'
                          ? contagionLine
                          : type == 'wellness corner'
                            ? wellnessLine
                            : type == 'parenting'
                              ? parentingLine
                              : type == 'lifestyle diseases'
                                ? lifestyleLine
                                : type == 'she reads'
                                  ? sheReadsLine
                                  : ''
                }
                alt={
                  type == 'fitness'
                    ? 'Fitness'
                    : type == 'mental health'
                      ? 'Mental Health'
                      : type == 'hush talks'
                        ? 'Hush Talks'
                        : type == 'contagion'
                          ? 'Contagion'
                          : type == 'wellness corner'
                            ? 'Wellness Corner'
                            : type == 'parenting'
                              ? 'Parenting'
                              : type == 'lifestyle diseases'
                                ? 'Lifestyle Diseases'
                                : type == 'she reads'
                                  ? 'She Reads'
                                  : ''
                }
              />
            </div>
        </Link>
      </div>
      <div className="text-inline mt-2 text-center lg:m-4">
        <Link onClick={onClick} href={`${link}`}>
          <Text
            variant={variant == 'secondary' ? true : false}
            color={variant == 'secondary' ? 'text-black' : 'text-white'}
            size={variant == 'secondary' ? 'lg' : 'sm'}
          >
            {type == 'fitness'
              ? 'Fitness'
              : type == 'mental health'
                ? 'Mental Health'
                : type == 'hush talks'
                  ? 'Hush Talks'
                  : type == 'contagion'
                    ? 'Contagion'
                    : type == 'wellness corner'
                      ? 'Wellness Corner'
                      : type == 'parenting'
                        ? 'Parenting'
                        : type == 'lifestyle diseases'
                          ? 'Lifestyle Diseases'
                          : type == 'she reads'
                            ? 'She Reads'
                            : ''}
          </Text>
        </Link>
      </div>
    </div>
  );
}
