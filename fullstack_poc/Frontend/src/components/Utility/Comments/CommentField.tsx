import { useLazyQuery } from '@apollo/client/react';
import { isEmpty, trim } from 'lodash';
import { useRouter } from 'next/router';
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AiOutlineSend } from 'react-icons/ai';

import { addNewComment, createHashtags, getPostById } from '@/actions/forum';
import { ThreadPost } from '@/components/pages/Profile/ProfileActivitiesPost';
import Button from '@/components/Utility/Button';
import CommentQuickTexts from '@/components/Utility/Comments/CommentQuickText';
import TagInput from '@/components/Utility/TagInput';
import UserImage from '@/elements/UserImage';
import useContentControl from '@/Hooks/useContentControl';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { FALLBACK_PROFILE_PIC, MAX_WORD_LIMIT } from '@/lib/constants';
import { emitErrorNotification } from '@/lib/helpers';
import {
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
} from '@/service/graphql/Campfire';
import { selectGetToken, selectGetUserProfile } from '@/state/Slices/auth';
import { getCampfireId, setPostCampfireId } from '@/state/Slices/campfire';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { PostTypeEnum } from '@/types/enums';

interface ICommentBoxProps {
  firstScrollRef: MutableRefObject<boolean>;
  postType: PostTypeEnum;
  postId: string;
  commentId: string;
  parentCommentId?: string;
  closeCommentInput: () => void;
  userName?: string;
  parentReplyId?: string;
  index?: number;
  isAnnouncement?: boolean;
  refetchActivityByPostId?: (() => void) | null;
  handleUpdatePostById?: (threadData: ThreadPost) => void;
}

interface BannedDomainItem {
  domain: string;
}

interface BannedWordItem {
  word: string;
}
type CommentEvent =
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLInputElement>;

function CommentField({
  firstScrollRef,
  commentId,
  postType,
  postId,
  parentCommentId,
  closeCommentInput,
  userName,
  parentReplyId,
  index,
  isAnnouncement,
  refetchActivityByPostId,
  handleUpdatePostById,
}: ICommentBoxProps) {
  const router = useRouter();
  const [comment, setComment] = useState(userName ? `${userName}` : '');
  const [loading, setLoading] = useState(false);
  const profile = useAppSelector(selectGetUserProfile);
  const token = useAppSelector(selectGetToken);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isMobile = useIsMobile();
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);

  const campfireId = useAppSelector(getCampfireId);
  const [isCommentBanned, setIsCommentBanned] = useState(false);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [bannedDomains, setBannedDomains] = useState<string[]>([]);
  const [campfirePostId, setCampfirePostId] = useState<string | undefined>();

  const { matchesAnyBannedWord } = useContentControl();

  const [fetchBannedBody, { data: bodyData }] = useLazyQuery(
    FETCH_BANNED_WORDS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const [fetchBannedDomains, { data: domainsData }] = useLazyQuery(
    FETCH_BANNED_DOMAINS,
    {
      fetchPolicy: 'no-cache',
    },
  );

  const getPostData = async () => {
    const threadData = await getPostById(postId);
    if (handleUpdatePostById) {
      handleUpdatePostById(threadData as unknown as ThreadPost);
    }

    if (threadData?.type === 'question') {
      const questionCampfireId =
        threadData?.question?.campfire_threads?.[0]?.campfire?.id;
      setCampfirePostId(questionCampfireId);
    } else if (threadData?.type === 'quiz') {
      const quizCampfireId =
        threadData?.quiz?.campfire_threads?.[0]?.campfire?.id;
      setCampfirePostId(quizCampfireId);
    } else if (threadData?.type === 'poll') {
      const pollCampfireId =
        threadData?.poll?.campfire_threads?.[0]?.campfire?.id;
      setCampfirePostId(pollCampfireId);
    } else if (threadData?.type === 'postShare') {
      type PostShareTypes = 'question' | 'quiz' | 'poll';
      const postShareType = threadData?.postShare?.type as PostShareTypes;
      const postShareCampfireId =
        threadData?.postShare?.[postShareType]?.campfire_threads?.[0]?.campfire
          ?.id;
      setCampfirePostId(postShareCampfireId);
    } else if (threadData?.type === 'campfirePostShare') {
      const postCampfireId = threadData?.campfirePostShare?.id;
      setCampfirePostId(postCampfireId);
    } else if (threadData?.type === 'campfireShare') {
      const postCampfireId = threadData?.campfireShare?.campfireData?.id;
      setCampfirePostId(postCampfireId);
    }
  };

  useEffect(() => {
    if ((bodyData as any)?.campfire_banned_words?.length) {
      setBannedWords(
        (bodyData as any)?.campfire_banned_words.map(
          (item: BannedWordItem) => item.word,
        ),
      );
    }
  }, [bodyData]);

  useEffect(() => {
    if ((domainsData as any)?.campfire_blocked_domains?.length) {
      setBannedDomains(
        (domainsData as any)?.campfire_blocked_domains.map(
          (item: BannedDomainItem) => item.domain,
        ),
      );
    }
  }, [domainsData]);

  const fetchBannedContent = useCallback(() => {
    if (campfireId && token !== '') {
      fetchBannedBody({
        variables: { campfireId, postPart: 'body' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      fetchBannedDomains({
        variables: { campfireId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [campfireId, token, fetchBannedBody, fetchBannedDomains]);

  const fetchBannedContentForPost = useCallback(() => {
    if (campfirePostId && token !== '') {
      fetchBannedBody({
        variables: { campfireId: campfirePostId, postPart: 'body' },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      fetchBannedDomains({
        variables: { campfireId: campfirePostId },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [campfirePostId, token, fetchBannedBody, fetchBannedDomains]);

  useEffect(() => {
    fetchBannedContent();
  }, [fetchBannedContent]);

  useEffect(() => {
    fetchBannedContentForPost();
  }, [fetchBannedContentForPost]);

  const insertWord = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    word: string,
  ) => {
    e.stopPropagation();
    setComment((prevComment) => {
      return prevComment + `${prevComment ? ' ' : ''}` + word;
    });
  };

  const handleSubmitComment = (e: CommentEvent) => {
    e.stopPropagation();
    if (loading) {
      return;
    }
    if (!token || isEmpty(profile)) {
      dispatch(toggleSignupDialog(true));
      return;
    }

    const payload = parentCommentId
      ? {
        userId: profile.id,
        message: comment,
        parentId: parentReplyId ? parentReplyId : parentCommentId,
      }
      : {
        userId: profile.id,
        message: comment,
        [`${postType === PostTypeEnum.campfirePostShare
          ? 'campfire_post_share_id'
          : (isAnnouncement ? 'announcement' : postType) + 'Id'
          }`]: postId,
      };
    const skipDispatchFeedByPost = refetchActivityByPostId ? true : false;
    setLoading(true);
    dispatch(
      addNewComment(
        payload,
        postId,
        async (ok: boolean, newCommentId?: string) => {
          setLoading(false);
          if (ok && newCommentId) {
            
            // --- TRUST SERVICE POC: COMMENT EVALUATION ---
            try {
              const threadData = await getPostById(postId);
              let postTitle = "I suspect emotional abuse in a care home";
              let postCategory = "General";
              let postDesc = "";
              let postAuthorId = postId;
              
              if (threadData?.type === 'question') {
                postTitle = threadData?.question?.title || postTitle;
                postCategory = threadData?.question?.categoryName || postCategory;
                postDesc = threadData?.question?.description || postDesc;
                postAuthorId = threadData?.question?.user?.id || postAuthorId;
              }
              if (threadData?.type === 'poll') {
                postTitle = threadData?.poll?.title || postTitle;
                postCategory = threadData?.poll?.categoryName || postCategory;
                postDesc = threadData?.poll?.description || postDesc;
                postAuthorId = threadData?.poll?.user?.id || postAuthorId;
              }
              if (threadData?.type === 'quiz') {
                postTitle = threadData?.quiz?.title || postTitle;
                postCategory = threadData?.quiz?.categoryName || postCategory;
                postDesc = threadData?.quiz?.description || postDesc;
                postAuthorId = threadData?.quiz?.user?.id || postAuthorId;
              }
              
              fetch('http://localhost:8001/process-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  author_id: postAuthorId, // The post author takes the penalty
                  commenter_id: profile.id, // The commenter is the voter
                  category: postCategory,
                  post_text: postTitle,
                  post_description: postDesc,
                  post_type: postType,
                  comment_text: comment
                })
              });
            } catch (err) {
              console.error("Trust service error", err);
            }
            // ---------------------------------------------

            const type = isAnnouncement ? 'announcement' : postType;
            await createHashtags(comment, postId, type, newCommentId);
            if (refetchActivityByPostId) {
              await refetchActivityByPostId();
            }
            closeCommentInput();
            setComment('');
          }
        },
        isAnnouncement,
        skipDispatchFeedByPost,
        handleUpdatePostById,
      ),
    );
  };

  const handleFocusOrBlur = (focus = true) => {
    if (!commentId) {
      return;
    }
    if (focus) {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.classList.add('increase-zIndex');
        const parentCommentElement =
          element.parentElement?.parentElement?.parentElement;
        if (
          parentCommentElement &&
          parentCommentElement.classList.contains('child-thread')
        ) {
          parentCommentElement.classList.add('increase-zIndex');
        }
      }
    } else {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.classList.remove('increase-zIndex');
        const parentCommentElement =
          element.parentElement?.parentElement?.parentElement;
        if (
          parentCommentElement &&
          parentCommentElement.classList.contains('child-thread')
        ) {
          parentCommentElement.classList.remove('increase-zIndex');
        }
      }
    }
  };

  useEffect(() => {
    if (hasInvalidHashtag) {
      emitErrorNotification('This hashtag is disabled');
    }
  }, [hasInvalidHashtag]);

  useEffect(() => {
    if (index === 0 && inputRef?.current && firstScrollRef.current) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const scrollThreshold = 710;

        if (scrollPosition > scrollThreshold) {
          inputRef?.current?.focus({ preventScroll: true });
          firstScrollRef.current = false;
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return undefined;
  }, [index, firstScrollRef]);

  useEffect(() => {
    const handleScroll = () => {
      const firstPostElement = document.querySelector('.post:first-of-type');
      const scrollPosition = window.scrollY;
      const scrollThreshold = 730;

      const startBlinking = () => {
        cursorIntervalRef.current = setInterval(() => {
          inputRef.current?.classList.toggle('blink');
        }, 500);
      };

      if (firstPostElement && scrollPosition > scrollThreshold) {
        inputRef.current?.focus(); // Focus on input
        startBlinking(); // Start blinking cursor
        window.removeEventListener('scroll', handleScroll); // Remove scroll listener
      }
    };

    window.addEventListener('scroll', handleScroll); // Listen for scroll events

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(cursorIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!comment) return;
    if (
      bannedWords.length &&
      matchesAnyBannedWord(comment, bannedWords, 'body')
    ) {
      emitErrorNotification('Please do not include banned words in comment');
      setIsCommentBanned(true);
    } else if (
      bannedDomains.length &&
      matchesAnyBannedWord(comment, bannedDomains, 'domain')
    ) {
      emitErrorNotification('Please do not include blocked domains in comment');
      setIsCommentBanned(true);
    } else {
      setIsCommentBanned(false);
    }
  }, [
    comment,
    bannedWords,
    bannedDomains,
    dispatch,
    campfirePostId,
    matchesAnyBannedWord,
  ]);

  useEffect(() => {
    if (campfirePostId) {
      dispatch(setPostCampfireId(campfirePostId));
    }
  }, [campfirePostId, dispatch]);

  const handleCommentChange = (name: string) => {
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length >= MAX_WORD_LIMIT) {
      input = words.slice(0, MAX_WORD_LIMIT).join(' ');
      setComment(input);
    } else {
      setComment(name);
    }
  };
  return (
    <>
      <CommentQuickTexts insertWord={insertWord} />
      <div className="flex items-center justify-between py-2"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}>
        <div className="relative mr-2 h-10 w-10 rounded-full">
          <UserImage
            src={profile?.profilePicture || FALLBACK_PROFILE_PIC}
            alt={profile?.name || ''}
            size={isMobile ? 'xl' : 'sm'}
          />
        </div>
        <TagInput
          placeholder="Add comment"
          value={comment}
          inputRef={inputRef}
          onChange={(e: any) => {
            handleCommentChange(e);
          }}
          rounded
          type="text"
          name="name"
          dark
          isCommentField
          mentionCampfireId={
            campfirePostId ||
            (router?.pathname?.includes('/campfire/') ? campfireId : undefined)
          }
          restrictMentionsToCampfire={Boolean(
            campfirePostId || (router?.pathname?.includes('/campfire/') && campfireId),
          )}
          multiLine
          onFocus={() => {
            handleFocusOrBlur(true);
            getPostData();
          }}
          onBlur={(e) => handleFocusOrBlur(false)}
          setHasInvalidHashtag={setHasInvalidHashtag}
        />
        <div className="flex px-2">
          <Button
            type={comment.length > 0 ? '' : 'light'}
            onClick={(e) => handleSubmitComment(e)}
            isdisabled={
              loading || !comment.trim() || hasInvalidHashtag || isCommentBanned
            }
            isLoading={loading}
          >
            <AiOutlineSend className="text-xl text-white" />
          </Button>
        </div>
      </div>
    </>
  );
}

export default CommentField;
