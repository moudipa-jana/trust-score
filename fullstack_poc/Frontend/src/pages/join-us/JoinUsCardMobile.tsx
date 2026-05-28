import CustomImage from '@/components/Utility/CustomImage';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';

interface JoinUsCardMobileProps {
  imageSrc: string;
  imageAlt: string;
  cardTitle: string;
  description: string;
}

const JoinUsCardMobile = ({
  imageSrc,
  imageAlt,
  cardTitle,
  description,
}: JoinUsCardMobileProps) => {
  return (
    <>
      <div className="bg-[#ECECEC] rounded-3xl p-4 mb-20">
        <div className="flex justify-between mb-3">
          <div className="w-31 -mt-10">
            <CustomImage src={imageSrc} alt={imageAlt} width={300} height={300} />
          </div>
          <div className="bg-white w-13 h-8 rounded-full"></div>
        </div>
        <Heading priority={2} variant="md" color="text-[#AEAEAE] mb-3">
          {cardTitle}
        </Heading>
        <Text size="sm" customClass="text-[#515151]">
          {description}
        </Text>
      </div>
    </>
  );
};

export default JoinUsCardMobile;
