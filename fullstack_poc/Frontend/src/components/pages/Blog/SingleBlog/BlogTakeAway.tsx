import { capitalize } from 'lodash';

import CustomImage from '@/components/Utility/CustomImage';
import SectionHeading from '@/elements/SectionHeading';
import Text from '@/elements/Text';
import { getStrapiMedia } from '@/lib/helpers';
import { BlogFoldProps } from '@/types/blog';

interface BlogTakeAwayProps {
  seventhFold: BlogFoldProps;
}

export default function BlogTakeAway({ seventhFold }: BlogTakeAwayProps) {
  return (
    <div className="prose container">
      <SectionHeading>{capitalize(seventhFold?.Title)}</SectionHeading>
      <Text>
        <p
          className="prose max-w-none pt-4"
          dangerouslySetInnerHTML={{
            __html: seventhFold?.description as string,
          }}
        ></p>
      </Text>
      <div className="fullImage blog-full-img relative  mt-10 w-full">
        <CustomImage
          src={getStrapiMedia(
            seventhFold?.coverImg?.image?.data?.attributes?.url,
          )}
          alt={seventhFold?.coverImg?.altText}
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
}
