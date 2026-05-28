import { startCase, trim } from 'lodash';
import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { RiErrorWarningLine } from 'react-icons/ri';

import { PollSubmitDetailsType } from '@/components/pages/Forum/poll';
import Button from '@/components/Utility/Button';
import Tag from '@/components/Utility/Tag';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import List from '@/elements/List';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import { useAppSelector } from '@/Hooks/useRedux';
import { OPTION_LIMIT, TITLE_WORD_LIMIT } from '@/lib/constants';
import validations from '@/lib/validations';
import { getCategories } from '@/state/Slices/necessary';
import { getCampfireId } from '@/state/Slices/campfire';

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

interface CreatePollProps {
  handleSubmit: (values: PollSubmitDetailsType) => void;
  loading: boolean;
  isCampfire?: boolean;
  bannedTitleData?: BannedData;
  bannedBodyData?: BannedData;
  bannedDomainData?: BannedData;
}

const isMiniumOptionValid = (options: string[]) => {
  // First two required options must be at least 3 characters after trimming
  if (
    (trim(options[0])?.length ?? 0) < 1 ||
    (trim(options[1])?.length ?? 0) < 1
  ) {
    return false;
  }

  // All options must be at most OPTION_LIMIT characters
  for (let i = 0; i < options.length; i++) {
    if (options[i].length > OPTION_LIMIT) {
      return false;
    }
  }

  return true;
};
const RuleList = [
  'Suggest short and clear options',
  'Title should be min 3 and max 50 words',
  'Options can\'t be edited after poll creation',
  'Add at least 2, up to 4 options',
  'Options should be min 1 and max 100 characters',
];

function CreatePoll({
  handleSubmit,
  loading,
  isCampfire,
  bannedTitleData,
  bannedBodyData,
  bannedDomainData,
}: CreatePollProps) {
  const categories = useAppSelector(getCategories) as Category[];
  const campfireId = useAppSelector(getCampfireId);
  const [selectedCategoryId, setselectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [titleError, setTitleError] = useState('');
  const [optionErrors, setOptionErrors] = useState<Record<number, string>>({});
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);
  const { matchesAnyBannedWord } = useContentControl();

  const handleOptionChange = (index: number, value: string) => {
    if (value.length > OPTION_LIMIT) {
      return;
    }
    const newOptions = [...options];
    newOptions[index] = value.slice(0, OPTION_LIMIT);
    setOptions(newOptions);
  };
  function handleAddOption() {
    if (options.length < 4) {
      setOptions((prevOptions) => [...prevOptions, '']);
    }
  }

  const handleSubmitClick = () => {
    const pollOptions = options
      .filter((val) => trim(val))
      .map((val) => ({ title: trim(val) }));

    handleSubmit({
      title: trim(title),
      categoryId: selectedCategoryId,
      pollOptions,
    });
  };

  const handleTitleChange = (name: string) => {
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length >= TITLE_WORD_LIMIT + 1) {
      return;
    } else {
      setTitle(name);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    options,
    isCampfire,
    bannedTitleData,
    bannedBodyData,
    bannedDomainData,
  ]);

  const handleCategorySelect = (selectedCategory: any) => {
    setShowAgePrompt(
      selectedCategory?.title?.toLowerCase().includes('hush talk') ||
      selectedCategory?.title?.toLowerCase().includes('she read') ||
      selectedCategory?.title?.toLowerCase().includes('she reads'),
    );
    setselectedCategoryId(selectedCategory.id);
  };

  return (
    <div>
      <div>
        <Label title="Create a poll" required />
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
            <div className="text-right">
              <Text size="xs" color="text-gray-700">
                3 words min and {TITLE_WORD_LIMIT} words max
              </Text>
            </div>
          </div>
        </div>
        {!isCampfire && (
          <div className="mt-2">
            <Label title="Category" required />
            <div className="py-2">
              <Text size="sm" color="text-black-700" font="font-light">
                You can only choose one category
              </Text>
            </div>

            <div
              className="flex flex-row flex-wrap pt-2"
              style={{ gap: 15 }}
            >
              {categories.map((data: Category) => (
                <div
                  className="cursor-pointer"
                  key={data.id}
                  onClick={() => handleCategorySelect(data)}
                >
                  <Tag
                    size="sm"
                    type="chips"
                    rounded
                    isActive={selectedCategoryId === data.id}
                  >
                    {startCase(data.title)}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        )}
        {showAgePrompt && (
          <div className="mt-3 flex space-x-2">
            <div className="max-w-20">
              <RiErrorWarningLine color="red" size={22} />
            </div>
            <Text color="text-pink-1050" size="sm">
              This category contains 18+ content. By clicking Continue, you
              consent to the content in the category.
            </Text>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-4">
          {options.map((option, index) => (
            <div key={index}>
              <div className="flex items-center">
                <Label title={`Option ${index + 1}`} required={index < 2} />
                {index > 1 && (
                  <Text size="sm" color="text-gray-500">
                    <p className="ml-1">(Optional)</p>
                  </Text>
                )}
              </div>
              <div className=" flex justify-between border border-gray-600  bg-white p-2 text-gray-700 placeholder-gray-700">
                <label className="relative inline-flex  h-full w-full cursor-pointer items-center ">
                  <input
                    type="text"
                    className="h-full w-full outline-none"
                    placeholder="Option"
                    value={option}
                    maxLength={OPTION_LIMIT}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </label>
              </div>
              {/* Error message section */}
              {optionErrors[index] && (
                <Text size="xs" color="text-error">
                  {optionErrors[index]}
                </Text>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <div className="pt-4">
              <Button
                type="secondary"
                textColor="text-gray-700"
                onClick={handleAddOption}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1">
                    <AiOutlinePlus className="text-lg text-primary" />
                  </div>
                  Add option
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <Button
          type="secondary "
          block
          isLoading={loading}
          isdisabled={
            !(
              validations.minWordsOrChars(title, true, 3) && titleError === ''
            ) ||
            (!isCampfire && !validations.isValid(title, selectedCategoryId)) ||
            !isMiniumOptionValid(options) ||
            hasInvalidHashtag ||
            (isCampfire && Object.keys(optionErrors).length > 0)
          }
          onClick={handleSubmitClick}
        >
          Submit
        </Button>
      </div>
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
    </div>
  );
}

export default CreatePoll;
