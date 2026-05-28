import { isNumber, startCase, trim } from 'lodash';
import React, { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { RiErrorWarningLine } from 'react-icons/ri';

import Button from '@/components/Utility/Button';
import Tag from '@/components/Utility/Tag';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import List from '@/elements/List';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import { useAppSelector } from '@/Hooks/useRedux';
import { OPTION_LIMIT, TITLE_WORD_LIMIT } from '@/lib/constants';
import { emitErrorNotification } from '@/lib/helpers';
import validations from '@/lib/validations';
import { getCategories } from '@/state/Slices/necessary';
import { getCampfireId } from '@/state/Slices/campfire';

const RuleList = [
  'Title should be min 3 and max 50 words',
  'Add at least 2, up to 4 options',
  'Options should be min 1 and max 100 characters',
  'Right answer is compulsory',
  'Suggest short and clear options',
  'Options can\'t be edited after you post',
];

const isMiniumOptionValid = (options: string[]) => {
  // First two required options must be at least 3 characters after trimming
  if ((trim(options[0])?.length ?? 0) < 1 || (trim(options[1])?.length ?? 0) < 1) {
    return false;
  }

  // All options must be at most OPTION_LIMIT characters
  for (let i = 0; i < options.length; i++) {
    if (options[i].length > OPTION_LIMIT) {
      return false;
    }
  }

  // Any additional option, if provided (non-empty), must be at least 1 char
  for (let i = 2; i < options.length; i++) {
    const trimmedLength = trim(options[i])?.length ?? 0;
    if (trimmedLength > 0 && trimmedLength < 1) {
      return false;
    }
  }

  return true;
};

export interface QuizSubmitDetailsType {
  title: string;
  quizOptions: Array<{ title: string; isAnswer: boolean }>;
  categoryId: string;
}

interface BannedWord {
  word: string;
}

interface BlockedDomain {
  domain: string;
}

interface BannedData {
  campfire_banned_words?: BannedWord[];
  campfire_blocked_domains?: BlockedDomain[];
}

interface Category {
  id: string;
  title: string;
}

interface CreateQuizProps {
  handleSubmit: (values: QuizSubmitDetailsType) => void;
  loading: boolean;
  isCampfire?: boolean;
  bannedTitleData?: BannedData;
  bannedBodyData?: BannedData;
  bannedDomainData?: BannedData;
}

function CreateQuiz({
  handleSubmit,
  loading,
  isCampfire,
  bannedTitleData,
  bannedBodyData,
  bannedDomainData,
}: CreateQuizProps) {
  const categories = useAppSelector(getCategories) as Category[];
  const campfireId = useAppSelector(getCampfireId);
  const [selectedCategoryId, setselectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [toggledOption, setToggledOption] = useState<number | undefined>();
  const [titleError, setTitleError] = useState('');
  const [optionErrors, setOptionErrors] = useState<Record<number, string>>({});
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const { matchesAnyBannedWord } = useContentControl();

  const onAddBtnClick = () => {
    if (options.length < 4) {
      const newOptions = [...options, ''];
      setOptions(newOptions);

      // Duplicate check
      if (hasDuplicateOptions(newOptions)) {
        setDuplicateError('Options cannot be repeated.');
      } else {
        setDuplicateError('');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const trimmedValue = value.slice(0, OPTION_LIMIT);
    const newOptions = [...options];
    newOptions[index] = trimmedValue;
    setOptions(newOptions);

    const errors: Record<number, string> = {};
    newOptions.forEach((opt, idx) => {
      if (opt.length < 1) {
        errors[idx] = 'Option must be at least 1 character.';
      } else if (opt.length > OPTION_LIMIT) {
        errors[idx] = `Option must be at most ${OPTION_LIMIT} characters.`;
      }
    });
    setOptionErrors(errors);

    // Duplicate check
    if (hasDuplicateOptions(newOptions)) {
      setDuplicateError('Options cannot be repeated.');
    } else {
      setDuplicateError('');
    }
  };

  const handleToggleButton = (index: number) => {
    setToggledOption((prevValue) => (prevValue === index ? undefined : index));
  };

  const handleSubmitClick = () => {
    const quizOptions = options.map((val, i) => ({
      title: val,
      isAnswer: i === toggledOption,
    }));
    const valueToSubmit = {
      title: trim(title),
      categoryId: selectedCategoryId,
      quizOptions,
    };
    const hasValidAnswer = quizOptions.find((q) => q.isAnswer === true);
    if (!hasValidAnswer) {
      emitErrorNotification('Please select a valid answer');
      return;
    }
    handleSubmit(valueToSubmit);
  };

  const handleTitleChange = (name: string) => {
    let input = trim(name); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length >= TITLE_WORD_LIMIT + 1) {
      // limit to TITLE_WORD_LIMIT words
      // input = words.slice(0, TITLE_WORD_LIMIT).join(' ');
      // setTitle(input);
    } else {
      setTitle(name);
    }
  };

  const handleContinue = () => {
    if (
      validations.minWordsOrChars(title, true, 3) &&
      titleError === '' &&
      !hasInvalidHashtag
    ) {
      setShowQuizDetails(true);
    }
  };

  useEffect(() => {
    if ((title && isCampfire) || (options?.length && isCampfire)) {
      let bannedWords: string[] = [];
      let bannedBodyWords: string[] = [];
      let bannedDomains: string[] = [];

      if (bannedTitleData?.campfire_banned_words?.length) {
        bannedWords = bannedTitleData.campfire_banned_words.map(
          (item) => item.word,
        );
      }

      if (bannedBodyData?.campfire_banned_words?.length) {
        bannedBodyWords = bannedBodyData.campfire_banned_words.map(
          (item) => item.word,
        );
      }
      if (bannedDomainData?.campfire_blocked_domains?.length) {
        bannedDomains = bannedDomainData.campfire_blocked_domains.map(
          (item) => item.domain,
        );
      }

      if (
        bannedWords.length &&
        matchesAnyBannedWord(title, bannedWords, 'title')
      ) {
        setTitleError('Please do not include banned words in the title');
      } else if (
        bannedDomains.length &&
        matchesAnyBannedWord(title, bannedDomains, 'domain')
      ) {
        setTitleError('Please do not include blocked domains in the title');
      } else {
        setTitleError('');
      }

      const errors: Record<number, string> = {};
      options.forEach((option, index) => {
        if (
          bannedBodyWords.length &&
          matchesAnyBannedWord(option, bannedBodyWords, 'body')
        ) {
          errors[index] = 'Please do not include banned words in this field';
        } else if (
          bannedDomains.length &&
          matchesAnyBannedWord(option, bannedDomains, 'domain')
        ) {
          errors[index] = 'Please do not include blocked domains in this field';
        }
      });

      setOptionErrors(errors);
    }
  }, [
    title,
    options,
    isCampfire,
    bannedTitleData?.campfire_banned_words,
    bannedBodyData?.campfire_banned_words,
    bannedDomainData?.campfire_blocked_domains,
    matchesAnyBannedWord,
  ]);

  const handleCategorySelect = (selectedCategory: any) => {
    setShowAgePrompt(
      selectedCategory?.title?.toLowerCase().includes('hush talk') ||
      selectedCategory?.title?.toLowerCase().includes('she read') ||
      selectedCategory?.title?.toLowerCase().includes('she reads'),
    );
    setselectedCategoryId(selectedCategory.id);
  };

  function hasDuplicateOptions(options: string[]) {
    const unique = new Set(options);
    return unique.size !== options.length;
  }

  return (
    <div>
      <div>
        {/* Title  */}
        <div>
          <Label title="Create a quiz" required />
          <div className="mt-2">
            <TagInput
              autoFocus
              placeholder="Title"
              required="required"
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              setHasInvalidHashtag={setHasInvalidHashtag}
              singleLine
              mentionCampfireId={campfireId || undefined}
              restrictMentionsToCampfire={Boolean(campfireId)}
            />
            <div className="flex w-full justify-between">
              <div>
                <Text size="xs" color="text-error">
                  {titleError}
                </Text>
                {hasInvalidHashtag && (
                  <Text size="xs" color="text-error">
                    This hashtag is disabled.
                  </Text>
                )}
              </div>
              <div className="flex justify-between mt-1 w-full">
                <Text size="xs" color="text-gray-700">
                  * Minimum three words
                </Text>

                <Text size="xs" color="text-gray-700">
                  Max {title.trim().split(/\s+/).filter(Boolean).length}/
                  {TITLE_WORD_LIMIT} words
                </Text>

              </div>
            </div>
          </div>
        </div>

        {!showQuizDetails && (
          <Button
            type="secondary "
            block
            customClassName="mt-2"
            onClick={handleContinue}
            isdisabled={
              !(
                validations.minWordsOrChars(title, true, 3) &&
                titleError === '' &&
                !hasInvalidHashtag
              )
            }
          >
            {' '}
            Continue
          </Button>
        )}

        {/* Quiz details section */}
        {showQuizDetails && (
          <div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              {options?.map((data, i) => {
                return (
                  <div key={i}>
                    <div className="flex items-center mb-1">
                      <Label title={`Option ${i + 1}`} required={i < 2} />
                      {i > 1 && (
                        <Text size="sm" color="text-gray-500">
                          <p className="ml-1 mb-1">(Optional)</p>
                        </Text>
                      )}
                    </div>
                    <div className="flex justify-between border border-primary bg-white p-2 text-gray-700 placeholder-gray-700 rounded-xl">
                      <label className="items-cente relative inline-flex w-full cursor-pointer">
                        <input
                          type="text"
                          className="h-full w-full outline-none"
                          placeholder={`option ${i + 1}`}
                          value={data}
                          maxLength={OPTION_LIMIT}
                          onChange={(e) =>
                            handleOptionChange(i, e.target.value)
                          }
                        />
                        <div className="flex items-center gap-2">
                          <button
                            className={`flex h-2.5 w-8 items-center rounded-full bg-gray-200 p-1 mt-1 ${toggledOption === i ? 'bg-primary' : ''
                              }`}
                            onClick={() => handleToggleButton(i)}
                          >
                            <div
                              className={`h-4 w-4 -ml-1 transform rounded-full bg-white shadow-md border border-gray-100 transition-transform ${toggledOption === i ? 'translate-x-4' : ''
                                }`}
                            />
                          </button>
                          {options.length > 2 && (
                            <a href="javascript:void(0)">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="cursor-pointer"
                                onClick={() => {
                                  setOptions(
                                    options.filter((_, index) => index !== i),
                                  );
                                }}
                              >
                                <rect
                                  width="20"
                                  height="20"
                                  rx="10"
                                  fill="#F0F0F0"
                                ></rect>
                                <path
                                  d="M4.99984 15.8333C4.99984 16.75 5.74984 17.5 6.6665 17.5H13.3332C14.2498 17.5 14.9998 16.75 14.9998 15.8333V5.83333H4.99984V15.8333ZM6.6665 7.5H13.3332V15.8333H6.6665V7.5ZM12.9165 3.33333L12.0832 2.5H7.9165L7.08317 3.33333H4.1665V5H15.8332V3.33333H12.9165Z"
                                  fill="#FF5959"
                                ></path>
                              </svg>
                            </a>
                          )}
                        </div>
                      </label>
                    </div>
                    {/* Error message section */}
                    {optionErrors[i] && (
                      <Text size="xs" color="text-error">
                        {optionErrors[i]}
                      </Text>
                    )}
                  </div>
                );
              })}
              {options.length < 4 && (
                <div className=" ">
                  <div className='h-6'></div>
                  <Button
                    type="secondary"
                    onClick={onAddBtnClick}
                    customClassName="h-12"
                    size="sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1">
                        <AiOutlinePlus className="text-lg" />
                      </div>
                      Add option
                    </div>
                  </Button>
                </div>
              )}
            </div>
            {!isCampfire && (
              <div className="mt-2">
                <div className="py-2 flex items-center gap-1">
                  <Label title="Category" />
                  <span className="text-red-600">*</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories?.map((category: Category) => (
                    <div
                      className="cursor-pointer"
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <Tag
                        size="sm"
                        type="chips"
                        rounded
                        isActive={selectedCategoryId === category.id}
                      >
                        {startCase(category.title)}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showAgePrompt && (
              <div className="mt-4 flex space-x-2">
                <div className="max-w-20">
                  <RiErrorWarningLine color="red" size={22} />
                </div>
                <Text color="text-pink-1050" size="sm">
                  This category contains 18+ content. By clicking Continue, you
                  consent to the content in the category.
                </Text>
              </div>
            )}
          </div>
        )}
      </div>

      {showQuizDetails && (
        <div className="mt-6">
          <Button
            type="secondary "
            block
            isLoading={loading}
            onClick={handleSubmitClick}
            isdisabled={
              !(
                validations.minWordsOrChars(title, true, 3) && titleError === ''
              ) ||
              (!isCampfire &&
                !validations.isValid(
                  title,
                  selectedCategoryId,
                  isMiniumOptionValid(options),
                )) ||
              !validations.isValid(title, isMiniumOptionValid(options)) ||
              !isNumber(toggledOption) ||
              hasInvalidHashtag ||
              (isCampfire && Object.keys(optionErrors).length > 0) ||
              !!duplicateError ||
              options.some((opt) => opt.length < 1) // <-- add this line
            }
          >
            Submit
          </Button>
        </div>
      )}
      {showQuizDetails && (
        <div className="grid grid-cols-2 gap-1 p-2 pt-4">
          {RuleList.map((data: string) => (
            <div key={data}>
              <ul className="ml-2">
                <List type="primary" size="sm">
                  {data}
                </List>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;
