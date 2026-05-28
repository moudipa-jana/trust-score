import { useMutation } from '@apollo/client/react';
import { startCase } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { RiErrorWarningLine } from 'react-icons/ri';

import { createHashtags } from '@/actions/forum';
import { PollSubmitDetailsType } from '@/components/pages/Forum/poll';
import Button from '@/components/Utility/Button';
import Tag from '@/components/Utility/Tag';
import Label from '@/elements/Label';
import List from '@/elements/List';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { OPTION_LIMIT, SESSION_EXPIRED_MSG } from '@/lib/constants';
import {
  emitErrorNotification,
  formatGraphqlError,
  normalizeWhitespace,
  toggleModalLoader,
} from '@/lib/helpers';
import validations from '@/lib/validations';
import { MUTATION_ADD_POLL_CAMPFIRE } from '@/service/graphql/Campfire';
import { MUTATION_ADD_POLL } from '@/service/graphql/Forum';
import { increaseActivePostCount, selectGetToken } from '@/state/Slices/auth';
import { forumPostSuccess, getCategories } from '@/state/Slices/necessary';

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

interface PollProps {
  isCampfire?: boolean;
  campfireId?: string;
  bannedBodyData?: BannedData;
  bannedDomainData?: BannedData;
  onOptionsChange?: (options: string[]) => void;
  onCategoryChange?: (categoryId: string) => void;
  title: string;
  handleClose?: () => void;
}

const Poll = ({
  isCampfire,
  campfireId,
  bannedBodyData,
  bannedDomainData,
  onOptionsChange,
  onCategoryChange,
  title,
  handleClose,
}: PollProps) => {
  const token = useAppSelector(selectGetToken);
  const { query, push } = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(getCategories) as Category[];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [options, setOptions] = useState<Array<{ title: string }>>([
    { title: '' },
    { title: '' },
  ]);
  const [optionErrors, setOptionErrors] = useState<Record<number, string>>({});
  const { matchesAnyBannedWord } = useContentControl();
  const [titleError, setTitleError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');

  const [submitNewPoll, { loading }] = useMutation(MUTATION_ADD_POLL, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response) => {
      const responseData = (response as any).insert_polls_one;
      const { id, createdAt, type } = responseData;
      const postData = {
        id,
        createdAt,
        [type]: { ...responseData, comments: [] },
        type,
      };
      dispatch(forumPostSuccess(postData));
      push(`/category/${startCase(responseData.categoryName)}`);
      toggleModalLoader(false);
      handleClose && handleClose();
    },
    onError: (err: any) => {
      emitErrorNotification(formatGraphqlError(err));
      toggleModalLoader(false);
    },
  });

  const [submitNewCampfirePoll, { loading: campfirePollLoading }] = useMutation(
    MUTATION_ADD_POLL_CAMPFIRE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: async (response) => {
        const updatedThread = (response as any).createCampfirePoll.data[0];
        const { id, type } = updatedThread;
        const content = updatedThread[type];
        const createdAt = content?.createdAt;

        const postData = {
          ...updatedThread,
          id,
          createdAt,
          [type]: { ...content, comments: [] },
          type,
        };

        dispatch(increaseActivePostCount());
        const titleForTags = content?.title;
        if (typeof titleForTags === 'string' && titleForTags.trim()) {
          await createHashtags(titleForTags, id, type);
        }
        dispatch(forumPostSuccess(postData));
        toggleModalLoader(false);
        handleClose && handleClose();
      },
      onError: (err: any) => {
        emitErrorNotification(formatGraphqlError(err));
        toggleModalLoader(false);
      },
    });

  const handleOptionChange = (index: number, value: string) => {
    // Limit to 100 characters
    const trimmedValue = value.slice(0, OPTION_LIMIT);
    const newOptions = [...options];
    newOptions[index].title = trimmedValue;
    setOptions(newOptions);

    const errors: Record<number, string> = {};
    newOptions.forEach((opt, idx) => {
      if (opt.title.length < 1) {
        errors[idx] = 'Option must be at least 1 character.';
      } else if (opt.title.length > OPTION_LIMIT) {
        errors[idx] = `Option must be at most ${OPTION_LIMIT} characters.`;
      }
    });
    setOptionErrors(errors);

    if (hasDuplicateOptions(newOptions)) {
      setDuplicateError('Options cannot be repeated.');
    } else {
      setDuplicateError('');
    }

    // Call parent callback if provided
    if (onOptionsChange) {
      onOptionsChange(newOptions.map((opt) => opt.title));
    }
  };

  function handleAddOption() {
    if (options.length < 4) {
      const newOptions: any[] = [...options, { title: '' }];
      setOptions(newOptions);

      // Duplicate check
      if (hasDuplicateOptions(newOptions)) {
        setDuplicateError('Options cannot be repeated.');
      } else {
        setDuplicateError('');
      }

      // Call parent callback if provided
      if (onOptionsChange) {
        onOptionsChange(newOptions.map((opt) => opt.title));
      }
    }
  }

  function hasDuplicateOptions(options: Array<{ title: string }>) {
    const titles = options.map((o) => o.title);
    const unique = new Set(titles);
    return unique.size !== titles.length;
  }

  const handleCategorySelect = (category: any) => {
    setSelectedCategoryId(category.id);
    const title = category?.title?.toLowerCase()?.trim() || '';
    setShowAgePrompt(
      title.includes('hush') ||
      title.includes('she read') ||
      title.includes('she reads'),
    );
    // Call parent callback if provided
    if (onCategoryChange) {
      onCategoryChange(category.id);
    }
  };

  const isMiniumOptionValid = (options: string[]) => {
    // First two required options must be at least 1 character
    if ((options[0]?.length ?? 0) < 1 || (options[1]?.length ?? 0) < 1) {
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
      if (options[i].length > 0 && options[i].length < 1) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (options?.length && isCampfire) {
      let bannedBodyWords: string[] = [];
      let bannedDomains: string[] = [];

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

      const errors: Record<number, string> = {};
      options.forEach((option, index) => {
        if (
          bannedBodyWords.length &&
          matchesAnyBannedWord(option.title, bannedBodyWords, 'body')
        ) {
          errors[index] = 'Please do not include banned words in this field';
          setTitleError('Please do not include banned words in the title');
        } else if (
          bannedDomains.length &&
          matchesAnyBannedWord(option.title, bannedDomains, 'domain')
        ) {
          errors[index] = 'Please do not include blocked domains in this field';
          setTitleError('Please do not include banned words in the title');
        } else {
          setTitleError('');
        }
      });

      setOptionErrors(errors);
    }
  }, [
    options,
    isCampfire,
    bannedBodyData,
    bannedDomainData,
    matchesAnyBannedWord,
  ]);

  const handleSubmit = (values: PollSubmitDetailsType) => {
    if (!token) {
      return emitErrorNotification(SESSION_EXPIRED_MSG);
    }
    toggleModalLoader(true);
    if (!isCampfire) {
      return submitNewPoll({
        variables: {
          ...values,
          title: normalizeWhitespace(values.title),
        },
      });
    } else {
      return submitNewCampfirePoll({
        variables: {
          title: normalizeWhitespace(values.title),
          options: values.pollOptions,
          campfireId: campfireId,
        },
      });
    }
  };

  // Poll Rull List
  const RuleList = [
    'Suggest short and clear options',
    'Title should be min 3 and max 50 words',
    "Options can't be edited after poll creation",
    'Add at least 2, up to 4 options',
    'Options should be min 1 and max 100 characters',
  ];

  return (
    <>
      {/* Options  */}
      <div className="grid grid-cols-2 gap-2 pt-4">
        {options.map((option, index) => (
          <div key={index}>
            <div className="flex items-center">
              <div className="mb-1">
                <Label title={`Option ${index + 1}`} required={index < 2} />
              </div>
              {index > 1 && (
                <Text size="sm" color="text-gray-500">
                  <p className="ml-1">(Optional)</p>
                </Text>
              )}
            </div>
            <div className=" flex justify-between border border-primary  bg-white p-2 text-gray-700 placeholder-gray-700 rounded-lg">
              <label className="relative inline-flex  h-full w-full cursor-pointer items-center ">
                <input
                  type="text"
                  className="h-full w-full outline-none placeholder:text-sm"
                  placeholder={`Option ${index + 1}`}
                  value={option.title}
                  maxLength={OPTION_LIMIT}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </label>
              {options.length > 2 && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={() => {
                    setOptions(options.filter((_, i) => i !== index));
                  }}
                >
                  <rect width="20" height="20" rx="10" fill="#F0F0F0" />
                  <path
                    d="M4.99984 15.8333C4.99984 16.75 5.74984 17.5 6.6665 17.5H13.3332C14.2498 17.5 14.9998 16.75 14.9998 15.8333V5.83333H4.99984V15.8333ZM6.6665 7.5H13.3332V15.8333H6.6665V7.5ZM12.9165 3.33333L12.0832 2.5H7.9165L7.08317 3.33333H4.1665V5H15.8332V3.33333H12.9165Z"
                    fill="#FF5959"
                  />
                </svg>
              )}
            </div>
            {/* Error message section */}
            {(duplicateError || optionErrors[index]) && (
              <Text size="xs" color="text-error">
                {duplicateError ? duplicateError : optionErrors[index]}
              </Text>
            )}
          </div>
        ))}

        {options.length < 4 && (
          <div className="">
            <div className="h-6"></div>
            <Label title={``} required={false} />
            <Button
              type="secondary"
              onClick={handleAddOption}
              size="sm"
              customClassName="h-10"
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

      {/* Category Selection */}
      {!isCampfire && (
        <div className="mt-4">
          <div className="mb-1 flex items-center gap-1">
            <Label title="Category" /> <span className="text-red-600">*</span>
          </div>

          <div className="flex flex-row flex-wrap pt-2 gap-2">
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

      {/* 18+ Content Warning */}
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

      <div className="bottom-1 lg:mt-6 mt-0  flex flex-col">
        <Button
          type="primary"
          block
          customClassName="order-2 lg:order-1 "
          isLoading={loading || campfirePollLoading}
          isdisabled={
            !(
              validations.minWordsOrChars(title, true, 3) && titleError === ''
            ) ||
            (!isCampfire && !validations.isValid(title, selectedCategoryId)) ||
            !isMiniumOptionValid(options.map((o) => o.title)) ||
            (isCampfire && Object.keys(optionErrors).length > 0) ||
            !!duplicateError ||
            options.some((opt) => opt.title.length < 1)
          }
          onClick={() =>
            handleSubmit({
              title,
              pollOptions: options,
              categoryId: selectedCategoryId,
            })
          }
        >
          Create
        </Button>
        <div className="grid lg:grid-cols-2 gap-1 p-2 pt-4 order-1 lg:order-2">
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
    </>
  );
};

export default Poll;
