import CategoryDetailsBody from '@/components/pages/Forum/Sphere/CategoryDetailsBody';
import Heading from '@/elements/Heading';
import { TopCategories } from '@/types/topCategories';

interface ICategorydetailsbox {
  category: TopCategories;
  title: string;
}

const colorMap: Record<string, string> = {
  mental: '#B8F2CB',
  fitness: '#FFDFD1',
  lifestyle: '#C9E7F6',
  sheReads: '#FCE4EC',
  wellness: '#D2F4EB',
  parenting: '#818181',
  hush: '#FFF2C9',
  contagion: '#E4E1F9',
};

function CategoryDetailsBox({ category, title }: ICategorydetailsbox) {
  const bgColor = colorMap[category?.gradientColor] || '#E0E0E0';
  const isParenting = category?.gradientColor === 'parenting';

  return (
    <div
      className="categoryDetails"
      style={{ background: bgColor }}
    >
      <div className={`categoryHeading lg:mb-2 mb-0 ${isParenting ? 'text-white' : 'text-[#616161]'}`}>
        <Heading
          priority="5"
          font="font-[800] before:size-4 before:bg-primary flex items-center justify-center !font-headingBold"
        >
          {title}
        </Heading>
      </div>
      <CategoryDetailsBody category={category} title={title} />
    </div>
  );
}

export default CategoryDetailsBox;
