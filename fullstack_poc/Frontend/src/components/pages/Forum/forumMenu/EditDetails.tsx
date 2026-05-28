import { useLazyQuery } from '@apollo/client/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { editPostDetailsType } from '@/components/pages/Forum/forumMenu/EditPostModal';
import Button from '@/components/Utility/Button';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import { useAppSelector } from '@/Hooks/useRedux';
import { checkInputChangeLimit, getWordCount } from '@/lib/helpers';
import { TITLE_WORD_LIMIT } from '@/lib/constants';
import validations from '@/lib/validations';
import {
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
} from '@/service/graphql/Campfire';
import { selectGetToken } from '@/state/Slices/auth';
import { getCampfireId } from '@/state/Slices/campfire';

interface BannedWord {
  word: string;
}

interface BlockedDomain {
  domain: string;
}

interface IEditDetails {
  setEditPostDetails?: Dispatch<SetStateAction<editPostDetailsType>> | null;
  editPostDetails: editPostDetailsType;
  handleEdit: () => void;
  nextStep: () => void;
  postType?: string;
  isCampfirePage?: boolean;
  isCampfirePost?: boolean;
  isReply?: boolean;
}

function EditDetails({
  editPostDetails,
  handleEdit,
  setEditPostDetails,
  nextStep,
  postType,
  isCampfirePage,
  isCampfirePost,
  isReply,
}: IEditDetails) {
  const [title, setTitle] = useState(editPostDetails.title);
  const [description, setDescription] = useState(editPostDetails.description);
  const [comment, setComment] = useState(editPostDetails.comment || '');
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');
  const [commentError, setCommentError] = useState('');
  const { matchesAnyBannedWord } = useContentControl();

  // Get campfire data and token
  const campfireId = useAppSelector(getCampfireId);
  const token = useAppSelector(selectGetToken);

  // Fetch banned content queries
  const [fetchBannedBody, { data: bannedbodyData }] = useLazyQuery(
    FETCH_BANNED_WORDS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const [fetchBannedDomains, { data: bannedDomainData }] = useLazyQuery(
    FETCH_BANNED_DOMAINS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Trigger queries when conditions are met
  useEffect(() => {
    if ((isCampfirePage || isCampfirePost) && campfireId && token) {
      fetchBannedBody({
        variables: { campfireId: campfireId || '', postPart: 'body' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      fetchBannedDomains({
        variables: { campfireId: campfireId || '' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [
    isCampfirePage,
    isCampfirePost,
    campfireId,
    token,
    fetchBannedBody,
    fetchBannedDomains,
  ]);

  function handleSubmit() {
    if (
      editPostDetails.comment ||
      postType === 'postShare' ||
      isCampfirePage ||
      isCampfirePost
    ) {
      handleEdit();
    } else if (validations.minWordsOrChars(title, true)) {
      nextStep();
    }
  }
  useEffect(() => {
    setEditPostDetails &&
      setEditPostDetails((prev) => ({
        ...prev,
        title,
        description,
        comment,
      }));
  }, [title, description, comment, setEditPostDetails]);

  // Validate description for banned content
  useEffect(() => {
    if (description && (isCampfirePage || isCampfirePost)) {
      let bannedWords: string[] = [];
      let bannedDomains: string[] = [];

      if ((bannedbodyData as any)?.campfire_banned_words?.length) {
        bannedWords = (bannedbodyData as any).campfire_banned_words.map(
          (item: BannedWord) => item.word,
        );
      }
      if ((bannedDomainData as any)?.campfire_blocked_domains?.length) {
        bannedDomains = (bannedDomainData as any).campfire_blocked_domains.map(
          (item: BlockedDomain) => item.domain,
        );
      }

      if (
        bannedWords?.length &&
        matchesAnyBannedWord(description, bannedWords, 'body')
      ) {
        setDescriptionError(
          'Please do not include banned words in description',
        );
      } else if (
        bannedDomains?.length &&
        matchesAnyBannedWord(description, bannedDomains, 'domain')
      ) {
        setDescriptionError(
          'Please do not include blocked domains in description',
        );
      } else {
        setDescriptionError('');
      }
    }
  }, [
    description,
    isCampfirePage,
    isCampfirePost,
    (bannedbodyData as any)?.campfire_banned_words,
    (bannedDomainData as any)?.campfire_blocked_domains,
    matchesAnyBannedWord,
  ]);

  // Validate comment for banned content
  useEffect(() => {
    if (comment && (isCampfirePage || isCampfirePost)) {
      let bannedWords: string[] = [];
      let bannedDomains: string[] = [];

      if ((bannedbodyData as any)?.campfire_banned_words?.length) {
        bannedWords = (bannedbodyData as any).campfire_banned_words.map(
          (item: BannedWord) => item.word,
        );
      }
      if ((bannedDomainData as any)?.campfire_blocked_domains?.length) {
        bannedDomains = (bannedDomainData as any).campfire_blocked_domains.map(
          (item: BlockedDomain) => item.domain,
        );
      }

      if (
        bannedWords?.length &&
        matchesAnyBannedWord(comment, bannedWords, 'body')
      ) {
        setCommentError('Please do not include banned words in comment');
      } else if (
        bannedDomains?.length &&
        matchesAnyBannedWord(comment, bannedDomains, 'domain')
      ) {
        setCommentError('Please do not include blocked domains in comment');
      } else {
        setCommentError('');
      }
    }
  }, [
    comment,
    isCampfirePage,
    isCampfirePost,
    (bannedbodyData as any)?.campfire_banned_words,
    (bannedDomainData as any)?.campfire_blocked_domains,
    matchesAnyBannedWord,
  ]);

  return (
    <div>
      {postType === 'postShare' && !editPostDetails.comment ? (
        <>
          <div>
            <Label title="Title" required />
            <div className="mt-2">
              <TagInput
                placeholder="Title"
                required="required"
                type="text"
                name="title"
                value={title}
                onChange={(e) =>
                  validations.checkWordLimit(e, 50) && setTitle(e)
                }
                singleLine
              />
              <div className="text-right">
                <Text size="xs" color="text-gray-700">
                  {getWordCount(title)}/{TITLE_WORD_LIMIT} words max
                </Text>
              </div>
            </div>
          </div>
          <div className="my-6">
            <Button
              type="secondary"
              block
              isdisabled={
                !validations.minWordsOrChars(title, true) ||
                hasInvalidHashtag ||
                descriptionError !== ''
              }
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </>
      ) : !editPostDetails.comment ? (
        <>
          <div>
            <Label title="Title" required />
            <div className="mt-2">
              <TagInput
                placeholder="Title"
                required="required"
                type="text"
                name="title"
                value={title}
                disabled
                dark
                singleLine
              />
              <div className="text-right">
                <Text size="xs" color="text-gray-700">
                  Max 50 words
                </Text>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <Label title="Description" />
              <Text size="sm" color="text-gray-500">
                (Optional)
              </Text>
            </div>
            <div className="mt-2">
              <TagInput
                placeholder="Optional"
                value={description as string}
                onChange={(e) => {
                  const newDescription = checkInputChangeLimit(e, 500);
                  setDescription(newDescription);
                }}
                multiLine
                fixHt
                setHasInvalidHashtag={setHasInvalidHashtag}
              />
              <div className="flex w-full items-center justify-between">
                <div>
                  <Text size="xs" color="text-error">
                    {descriptionError}
                  </Text>
                  {hasInvalidHashtag && (
                    <Text size="xs" color="text-error">
                      This hashtag is disabled.
                    </Text>
                  )}
                </div>
                <div className="ml-auto">
                  <Text size="xs" color="text-gray-700">
                    {getWordCount(description)}/500 words max
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <div className="my-6">
            <Button
              type="secondary"
              block
              isdisabled={
                !validations.minWordsOrChars(title, true) ||
                hasInvalidHashtag ||
                descriptionError !== ''
              }
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center">
            <Label title={isReply ? 'Reply' : 'Comment'} />
          </div>
          <div className="mt-2 overflow-y-hidden">
            <TagInput
              placeholder={isReply ? 'reply' : 'comment'}
              value={comment}
              onChange={(e) => {
                const newComment = checkInputChangeLimit(e, 500);
                setComment(newComment || '');
              }}
              multiLine
              fixHt
              setHasInvalidHashtag={setHasInvalidHashtag}
            />
            <div className="flex w-full items-center justify-between">
              <div>
                <Text size="xs" color="text-error">
                  {commentError}
                </Text>
                {hasInvalidHashtag && (
                  <Text size="xs" color="text-error">
                    This hashtag is disabled.
                  </Text>
                )}
              </div>
              <div className="ml-auto">
                <Text size="xs" color="text-gray-700">
                  {getWordCount(comment)}/500 words max
                </Text>
              </div>
            </div>
            <div className="relative z-1 mt-6">
              <Button
                type="secondary"
                block
                onClick={handleSubmit}
                isdisabled={
                  hasInvalidHashtag || commentError !== '' || !comment.trim()
                }
              >
                Submit
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default EditDetails;
