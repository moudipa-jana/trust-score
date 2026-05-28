import CustomImage from '@/components/Utility/CustomImage';
import Text from '@/elements/Text';

interface JoinUsCardProps {
  imageSrc: string;
  imageAlt: string;
  cardTitle: string;
  description: string;
  index: number;
  totalCards: number;
}

const JoinUsCard = ({
  imageSrc,
  imageAlt,
  cardTitle,
  description,
  index,
  totalCards,
}: JoinUsCardProps) => {
  const baseLayout = {
    container:
      'lg:flex lg:bg-transparent bg-[#ECECEC] lg:mb-0 mb-15 lg:rounded-none rounded-[28px] lg:p-0 p-5',
    imgWrapper: 'lg:w-[100%]',
    imgCard: 'bg-[#ECECEC] rounded-[28px] p-4 joinus-img-card',
    imgInner: 'lg:w-[327px]',
    imgCircle: '',
    textWrapper: 'lg:w-[90%] ml-auto joinus-card-text',
    textCard: 'rounded-xl lg:pl-20 lg:pr-[120px]',
  };

  const isEven = index % 2 === 0;
  const isLast = index === totalCards - 1;
  const isFirst = index === 0;

  const layout = {
    ...baseLayout,
    imgWrapper: isEven
      ? baseLayout.imgWrapper
      : `lg:w-[100%] ml-auto lg:order-last order-first`,
    textWrapper: isEven
      ? baseLayout.textWrapper
      : `${baseLayout.textWrapper} lg:order-first order-last`,
    imgCard: isLast
      ? `${baseLayout.imgCard} corner-top-right`
      : isFirst
        ? `${baseLayout.imgCard} corner-bottom-right`
        : isEven
          ? `${baseLayout.imgCard} corner-top-right corner-bottom-right`
          : `${baseLayout.imgCard} corner-top-left corner-bottom-left`,
    imgInner: isEven
      ? `${baseLayout.imgInner} lg:mt-[-60px] mt-[-40px]`
      : `${baseLayout.imgInner} ml-auto lg:mt-[-90px]`,
    imgCircleEven: isEven
      ? 'bg-white w-19 h-12 rounded-full absolute lg:top-5 top-10 lg:right-5 right-0'
      : '',
    imgCircle: isEven
      ? 'bg-white w-19 h-12 rounded-full absolute lg:top-5 top-10 lg:right-5 right-0'
      : 'bg-white w-12 h-12 rounded-full absolute bottom-5 left-16',
    textCard: isEven
      ? baseLayout.textCard
      : 'rounded-xl lg:pl-20 lg:pr-[150px]',
  };

  return (
    <div className={layout.container}>
      {/* Image Section */}
      <div className={layout.imgWrapper}>
        <div className={layout.imgCard}>
          <div className={layout.imgInner}>
            <CustomImage src={imageSrc} alt={imageAlt} width={300} height={300} />
          </div>
          {layout.imgCircle && <div className={layout.imgCircle}></div>}
        </div>
      </div>
      {/* Text Section */}
      <div className={layout.textWrapper}>
        <div className={layout.textCard}>
          <Text customClass="text-[#AEAEAE] font-bold lg:text-[32px] text-xl mb-2">
            {cardTitle}
          </Text>
          <Text size="sm" customClass="text-[#6E6E6E] leading-6">
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default JoinUsCard;
