{
  /**
   * Puzzle component displays a quiz or poll question with selectable answer options.
   * Highlights the correct answer (Quiz) or most voted option (Polls) after selection.
   */
}
import { ReactNode, useState } from 'react';

import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { QuizOption } from '@/types/forum';

interface AnswerOption {
  id: number;
  answerText: string;
  isCorrect: boolean;
  value: string;
}

function Puzzle({
  title,
  question,
  answerOptions,
}: {
  question?: QuizOption | string;
  title: string | ReactNode;
  answerOptions?: {
    id: number;
    answerText: string;
    isCorrect: boolean;
    value: string;
  }[];
}) {
  const [selected, setSelected] = useState(false);
  const [elementNo, setElementNo] = useState<string>();

  const objMax = answerOptions?.reduce(
    (max: AnswerOption, current: AnswerOption) =>
      max.value > current.value ? max : current,
  );

  return (
    <div>
      <div className="grid grid-cols-5 divide-x py-4">
        <div className=" py-4 text-center xl:col-span-1 ">
          <Heading priority={2}>{title}</Heading>
        </div>
        <div className="col-span-4 p-4">
          <Text size="md">{question as string}</Text>
          <ul>
            {answerOptions &&
              answerOptions.map(
                (
                  data: {
                    id: number;
                    answerText: string;
                    isCorrect: boolean;
                    value: string;
                  },
                  index: number,
                ) => {
                  return (
                    <li
                      key={data.id}
                      className={`my-2 ${
                        elementNo == data.answerText && title == 'Quiz'
                          ? 'rounded-lg border-[1px]  border-red-600'
                          : ''
                      }`}
                      onClick={() => (
                        setSelected(!selected),
                        setElementNo(data.answerText)
                      )}
                    >
                      <div
                        className={` flex h-10 w-full cursor-pointer  items-center rounded-lg ${
                          !selected ? 'px-4' : ''
                        }  bg-white `}
                      >
                        {!selected && `${index + 1}. ` + data.answerText}
                        {selected && (
                          <div
                            className={` relative flex items-center justify-end rounded-lg py-2 px-4 text-center  ${
                              objMax?.value === data.value && title == 'Polls'
                                ? ' bg-skyBlue-200'
                                : data.isCorrect && title == 'Quiz'
                                  ? 'bg-green-100'
                                  : objMax?.value != data.value &&
                                      title == 'Polls'
                                    ? 'bg-white-500'
                                    : 'bg-pink-100'
                            }  `}
                            style={{ width: `${data.value}` }}
                          >
                            <span className="absolute left-4 flex  justify-end text-center text-sm ">
                              {`${index + 1}. ` + data.answerText}
                            </span>
                            <span className="hidden lg:block">
                              {' '}
                              {data.value >= '25%' ? data.value : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                },
              )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Puzzle;
