import CustomImage from '@/components/Utility/CustomImage';
import { PostTypeEnum } from '@/types/enums';

interface ForumIconProps {
  postType: PostTypeEnum;
}

const ForumIcon = ({ postType }: ForumIconProps) => {
  const getIconSrc = () => {
    switch (postType) {
      case PostTypeEnum.question:
        return '/images/question-icon.svg';
      case PostTypeEnum.quiz:
        return '/images/icon-quiz.svg';
      case PostTypeEnum.poll:
        return '/images/icon-poll.svg';
      default:
        return '/images/question-icon.svg'; // Default fallback
    }
  };

  return (
    <>
      <div className="card-icon h-12 w-12 bg-white rounded-full p-2 flex justify-center items-center ">
        <CustomImage
          src={getIconSrc()}
          alt="forum-icon"
          style={{ width: '91%' }}
          width={20}
          height={20}
        />
      </div>
    </>
  );
};

export default ForumIcon;
