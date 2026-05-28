import { useLazyQuery } from '@apollo/client/react';
import { debounce, trim } from 'lodash';
import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Button from '@/components/Utility/Button';
import LinkifyText from '@/components/Utility/LinkifyText';
import SwitchButton from '@/components/Utility/SwitchButton';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import validations from '@/lib/validations';
import { QUERY_GET_SIMILAR_QUESTION } from '@/service/graphql/Forum';
import { questionSubmitDetailsType } from '@/types/question';
import Poll from './Poll';
import Link from 'next/link';
import { TITLE_WORD_LIMIT } from '@/lib/constants';

interface SimilarQuestion {
  id: string;
  title: string;
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

interface QuestionProps {
  nextStep: () => void;
  setQuestionSubmitDetails: Dispatch<SetStateAction<questionSubmitDetailsType>>;
  questionSubmitDetails: questionSubmitDetailsType;
  handleClose: () => void;
  isCampfire?: boolean;
  campfireId?: string;
  bannedTitleData?: BannedData;
  bannedDomainData?: BannedData;
  togglePollSection: (show: boolean) => void;
  toggleStatus?: boolean;
  currentContentControl?: string;
  handleSubmit: (title?: string) => void;
}

function Question({
  nextStep,
  setQuestionSubmitDetails,
  questionSubmitDetails,
  handleClose,
  isCampfire,
  campfireId,
  bannedTitleData,
  bannedDomainData,
  togglePollSection,
  toggleStatus,
  currentContentControl,
  handleSubmit,
}: QuestionProps) {
  const router = useRouter();
  const { matchesAnyBannedWord } = useContentControl();
  const [titleError, setTitleError] = useState('');
  const [showPollSection, setShowPollSection] = useState(false);
  const [title, setTitle] = useState(questionSubmitDetails.title);
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);
  const [getSimilarQuestions, { data }] = useLazyQuery(
    QUERY_GET_SIMILAR_QUESTION,
  );
  const [titleSentimentError, setTitleSentimentError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // const maxWordLimit = showPollSection ? 20 : 50;
  useEffect(() => {
    setShowPollSection(toggleStatus || false);
  }, [toggleStatus]);

  const handleNext = async () => {
    if (
      validations.minWordsOrChars(title, true, 3) &&
      validations.checkWordLimit(title, TITLE_WORD_LIMIT, false)
    ) {
      setLoading(true);
      try {
        await fetch(process.env.NEXT_PUBLIC_AWS_LAMBDA_URL || '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: title.trim().replace(/<([^|>]+)\|[^>]+>/g, '$1 '),
          }),
        }).then(async (res: any) => {
          const lama_res = await res.json();
          if (lama_res.answer == 'DENIED') {
            setTitleSentimentError(
              'Please avoid using negative language and profanity words  in the title.',
            );
          } else {
            setQuestionSubmitDetails((prev) => ({
              ...prev,
              title: title.trim(),
            }));
            currentContentControl !== 'not_allowed'
              ? nextStep()
              : handleSubmit(title.trim());
          }
        });
      } catch (error) {
        setLoading(false);
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchSimilarQuestion = useCallback(
    async (name: string) => {
      try {
        await getSimilarQuestions({ variables: { title: name } });
      } catch (err) {
        return;
      }
    },
    [getSimilarQuestions],
  );

  const fetchSimilarTitleDebouncer = useMemo(() => {
    return debounce(fetchSimilarQuestion, 400);
  }, [fetchSimilarQuestion]);

  const handleTitleChange = (name: string) => {
    if (titleSentimentError && name && name.trim() !== title.trim()) {
      setTitleSentimentError('');
    }
    let input = trim(name); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length >= TITLE_WORD_LIMIT + 1) {
      return;
    } else {
      setTitle(name);
    }
    if (name && validations.minWordsOrChars(input, true, 2)) {
      fetchSimilarTitleDebouncer(input);
    }
  };

  useEffect(() => {
    if (title && isCampfire) {
      let bannedWords: string[] = [];
      let bannedDomains: string[] = [];

      if (bannedTitleData?.campfire_banned_words?.length) {
        bannedWords = bannedTitleData.campfire_banned_words.map(
          (item) => item.word,
        );
      }
      if (bannedDomainData?.campfire_blocked_domains?.length) {
        bannedDomains = bannedDomainData.campfire_blocked_domains.map(
          (item) => item.domain,
        );
      }

      if (
        bannedWords?.length &&
        matchesAnyBannedWord(title, bannedWords, 'title')
      ) {
        setTitleError('Please do not include banned words in the title');
      } else if (
        bannedDomains?.length &&
        matchesAnyBannedWord(title, bannedDomains, 'domain')
      ) {
        setTitleError('Please do not include blocked domains in the title');
      } else {
        setTitleError('');
      }
    }
  }, [
    title,
    isCampfire,
    bannedTitleData?.campfire_banned_words,
    bannedDomainData?.campfire_blocked_domains,
    matchesAnyBannedWord,
  ]);

  return (
    <>
      {/* Question section  */}
      <div className="">
        <Label title="Title" required />
        <div className="mt-2">
          <TagInput
            autoFocus
            placeholder="Title"
            required="required"
            type="text"
            name="title"
            value={title}
            onChange={handleTitleChange}
            singleLine
            setHasInvalidHashtag={setHasInvalidHashtag}
            mentionCampfireId={campfireId || undefined}
            restrictMentionsToCampfire={Boolean(campfireId)}
          />
          {hasInvalidHashtag && (
            <p className="pt-1 text-xs text-error">This hashtag is disabled.</p>
          )}
          <p className="pt-1 text-xs text-error">{titleError}</p>
          {titleSentimentError && (
            <div className="flex align-items-center gap-1">
              <p className="pt-1 text-xs text-error">{titleSentimentError}</p>
              <Link
                href="/content-policy"
                target="_blank"
                className="text-xs font-medium text-blue-400 pt-1 text-decoration-underline"
              >
                Learn more...
              </Link>
            </div>
          )}

          <div className="lg:flex justify-between items-center">
            <div className="flex items-center gap-4 lg:justify-start justify-between">
              <div className="flex items-center gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99951 2.26166C14.2732 2.26166 17.7377 5.72624 17.7378 9.99994C17.7378 14.2737 14.2733 17.7382 9.99951 17.7382H9.99854C8.73361 17.7401 7.48907 17.4299 6.37451 16.8378C6.04648 16.6636 5.65434 16.5883 5.2583 16.662L2.89795 17.1015L3.3374 14.7411C3.4111 14.345 3.33599 13.953 3.16162 13.6249C2.58758 12.5451 2.26123 11.3112 2.26123 9.99994C2.2613 5.72629 5.72586 2.26173 9.99951 2.26166Z"
                    stroke="#434343"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 7.8049C8 5.39837 12 5.39837 12 7.8049C12 9.52385 10.1818 9.18006 10.1818 11.2428M10.1818 14L10.1891 13.9924"
                    stroke="#434343"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#666363] text-sm font-medium">
                  Switch to Question
                </span>
              </div>
              <div className="pt-2">
                <SwitchButton
                  checked={showPollSection}
                  onChange={(e: boolean) => {
                    setShowPollSection(e);
                    togglePollSection(e);

                    if (e) {
                      setTitleError('');
                      setTitleSentimentError('');
                      setHasInvalidHashtag(false);
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-1 ">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 16.6666V8.33331"
                    stroke="#666363"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 16.6666V3.33331"
                    stroke="#666363"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 16.6667V11.6667"
                    stroke="#666363"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>{' '}
                <span className="text-gray-1000 text-sm">Switch to poll</span>
              </div>
            </div>
            <div className="text-right">
              <Text size="xs" color="text-gray-700">
                Max {title.trim().split(/\s+/).filter(Boolean).length}/
                {TITLE_WORD_LIMIT} words
              </Text>
            </div>
          </div>

          {/* <div className={isWindows ? 'h-24' : 'h-36 '}> */}
          <div>
            {(data as any)?.questions.length > 0 && (
              <ul className="pt-4">
                <Text size="md">We Found Similar</Text>
                <div className="max-h-28 overflow-y-auto break-all pt-2">
                  {(data as any).questions.map((question: SimilarQuestion) => {
                    const onClick = (e: React.MouseEvent) => {
                      e.preventDefault();
                      handleClose();
                      router.push(`/post/${question.id}`);
                    };
                    return (
                      <div key={question.id} onClick={onClick}>
                        <Text size="base" color="text-primary cursor-pointer">
                          <LinkifyText text={question.title} />
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </ul>
            )}
          </div>
        </div>
      </div>

      {!showPollSection && (
        <div className="bottom-1 mt-6 ">
          <Button
            type="primary"
            block
            customClassName=""
            onClick={() => handleNext()}
            isLoading={loading}
            isdisabled={
              !(
                validations.minWordsOrChars(title, true) &&
                titleError === '' &&
                !hasInvalidHashtag &&
                !titleSentimentError &&
                !loading
              )
            }
          >
            {currentContentControl !== 'not_allowed' ? 'Continue' : 'Submit'}
          </Button>
        </div>
      )}

      {/* Poll section  */}
      {showPollSection && (
        <Poll
          title={title}
          isCampfire={isCampfire}
          campfireId={campfireId}
          handleClose={handleClose}
        />
      )}
    </>
  );
}
export default Question;
