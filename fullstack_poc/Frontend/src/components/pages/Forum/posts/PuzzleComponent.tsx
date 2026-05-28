import { capitalize } from 'lodash';
import { useRouter } from 'next/router';
import { MouseEvent, useState } from 'react';

import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import LinkifyText from '@/components/Utility/LinkifyText';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { getUserId, selectIsAuthenticated } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { CampfireDetails } from '@/types/campfire';
import {
  PollOptionType,
  PollType,
  QuizOptionType,
  QuizType,
} from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';

interface QuizComponentProps {
  type: 'quiz' | 'poll';
  title: string;
  options: QuizOptionType[] | PollOptionType[];
  handleOptionSelect: (_c: string) => void;
  postData: PollType | QuizType;
  searchedPost?: boolean;
  clickableCard?: boolean;
  isCampfire?: boolean;
  campfireDetails?: CampfireDetails;
  campfireName?: string;
  campfireDeletedPost?: boolean;
  blurClass?: string;
}
export default function PuzzleComponent({
  title,
  type,
  options,
  handleOptionSelect,
  postData,
  searchedPost,
  clickableCard,
  isCampfire,
  campfireDetails,
  campfireName,
  campfireDeletedPost,
  blurClass,
}: QuizComponentProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [selectedOption, setSelectedOption] = useState<string>();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(getUserId);
  const [camfireJoin, setCampfireJoin] = useState(false);
  const isSelectedPost = (postData && postData?.isAnalytics) || false;
  const router = useRouter();
  const { query } = router.query;
  const ismobile = useIsMobile();
  const token = getUserToken();
  const currentCampfireData = campfireDetails
    ? { ...campfireDetails, title: campfireName }
    : null;

  const handleSubmit = (data: QuizOptionType | PollOptionType) => {
    if (!isAuthenticated) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (campfireDeletedPost) {
      return;
    }
    if (isCampfire && !currentCampfireData?.isMember) {
      setCampfireJoin(true);
    } else {
      if (!isSelectedPost && postData) {
        handleOptionSelect(data.id);
        setSelectedOption(data.id);
      }
    }
  };

  const setOptionBg = (data: QuizOptionType | PollOptionType) => {
    const isChecked = type === 'poll' ? data.isSelected : data.isAnswer;
    if (isChecked && type === 'poll' && data.answerPercentage) {
      return ' bg-skyBlue-200 text-white rounded-rigjt-0 border-[#00B2ED] ';
    } 
    else if (data.isSelected && isChecked && type === 'quiz') 
      {
      return 'bg-[#E0F4FC] border-[#00B2ED] border-2'; //blue bg for correct answer in quiz
      }
    else if (isChecked && type === 'quiz') 
      {
      return 'bg-[#E0F4FC] border-[#00B2ED] border-1'; //blue bg for correct answer in quiz
      }
       
    else if (!isChecked && data.answerPercentage && type === 'poll') 
      {
      return 'bg-white-500 ';
      } 
    else if (data.answerPercentage == 0) 
      {
      return 'bg-white ';
      } 
    else {
      if (data.isSelected && type === 'quiz')
        return 'bg-[#FFECF0] border-2 border-[#FF5959]'; //red bg for wrong answer in quiz
       
      if (type == 'poll') {
        return '';
      }
      return 'bg-[#FFECF0] border-[#FF5959]';
    }
    
  };

  return (
    <div className={ismobile && !isCampfire ? 'mt-9' : ''}>
      <JoinModal
        data={currentCampfireData}
        toggleJoin={camfireJoin}
        setToggleJoin={setCampfireJoin}
        isHide
      />
      <div className={`flex flex-col  ${searchedPost ? '' : '  '}`}>
        <div
          className={`w-fit text-center xl:col-span-1 ${searchedPost ? '' : 'pt-4'
            } ${blurClass}`}
        >
          <Heading priority={2}>{capitalize(type)}</Heading>
        </div>
        <div
          className={`col-span-4 flex flex-wrap ${searchedPost ? 'py-1 pl-3 lg:py-3 lg:pl-4' : 'pt-2'
            }`}
        >
          <div className={`${blurClass}`}>
            <Text size="md" font="font-bold">
              <LinkifyText
                text={title}
                query={query}
                isTitle
                className="text-md"
              />
            </Text>
          </div>
          {!searchedPost && (
            <ul className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2 mt-3 lg:pe-4 lg:mb-2 mb-8">
              {options &&
                options.map((data, index: number) => {
                  return (
                    <li
                      key={data.id}
                      className={`relative flex-1 cursor-pointer rounded-lg !bg-white p-2.5 py-2 font-medium ${isCampfire && !campfireDetails?.is_public && postData?.user?.id !== userId
                        ? !campfireDetails?.isMember || !token
                          ? 'blur-sm'
                          : ''
                        : ''
                        } ${selectedOption === data.id && title == 'Quiz'
                          ? 'rounded-lg border-1  border-red-600'
                          : ''
                        } ${type == 'poll' ? `border ${setOptionBg(data)}` : ''}
                      `}
                      onClick={(e: MouseEvent<HTMLElement>) => {
                        if (!clickableCard) {
                          e.stopPropagation();
                          handleSubmit(data);
                        }
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="relative z-10 ml-2 w-full text-sm">
                          {index + 1}. {data.title}
                        </span>
                        {/* )} */}

                        {isSelectedPost && (
                          <div className="">
                            <div
                              className={`absolute top-0 bottom-0 left-0 right-0 flex items-center justify-end rounded-lg border-1 ${type == 'poll' ? '' : 'border'} ${setOptionBg(data,)}  `}
                              style={{
                                width: `${type == 'poll'
                                  ? `${data.answerPercentage}% `
                                  : '100%'
                                  }`,
                              }}
                            ></div>
                            <div className="relative flex basis-3 items-center justify-center">
                              <div className="itmes-center  absolute right-1 -top-5  flex  justify-center text-xs text-black">
                                {data.answerPercentage &&
                                  data?.answerPercentage > 5
                                  ? `${data.answerPercentage}%`
                                  : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
