import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import Gmail from '/public/images/gmail.svg';
import Telegram from '/public/images/telegram.svg';
import XTwitter from '/public/images/XTwitter.svg';
import { createHashtags, getPostById } from '@/actions/forum';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import TagInput from '@/components/Utility/TagInput';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  getWordCount,
} from '@/lib/helpers';
import validations from '@/lib/validations';
import { SHARE_POST_TO_FEED_MUTATION } from '@/service/graphql/Campfire';
import { MUTATION_SHARE_POST } from '@/service/graphql/Forum';
import { toggleShareDialog, toggleSignupDialog } from '@/state/Slices/dialog';
import { setRefreshHomeFeed } from '@/state/Slices/home';
import { fetchPostPageSuccess } from '@/state/Slices/necessary';
import { PostTypeEnum } from '@/types/enums';
import TextArea from '@/elements/TextArea';

function SharePost() {
  const { postId, token, campfireName, threadId, postShareData } =
    useAppSelector((state) => ({
      token: state.auth.token,
      postId: state.dialog.sharablePostId,
      campfireName: state.dialog.campfireName,
      threadId: state.dialog.threadId,
      postShareData: state.dialog.postShareData,
    }));
  const dispatch = useDispatch();
  const { pathname, query } = useRouter();
  const isCampfirePost = pathname.includes('/campfire/');
  const [campfirePostName, setCampfirePostName] = useState(campfireName);
  const [userThoughts, setUserThoughts] = useState(
    isCampfirePost ? 'This post is too good to be missed! Check it out.' : '',
  );
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);

  let link: string;
  if (isCampfirePost) {
    link = encodeURI(
      `${window.location.origin}/campfire/${campfirePostName}?postId=${postId}`,
    );
  } else if (campfireName) {
    link = encodeURI(`${window.location.origin}/campfire/${campfireName}`);
  } else {
    link = encodeURI(`${window.location.origin}/post/${postId}`);
  }

  const setCampfireName = Array.isArray(query?.name)
    ? decodeURIComponent(query?.name[0])
    : decodeURIComponent(query?.name as string);

  useEffect(() => {
    if (!campfireName) {
      setCampfirePostName(setCampfireName);
    }
  }, [campfireName, setCampfireName, setCampfirePostName]);

  const handleCopiedData = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${link}`);
      emitNotification('success', 'Text copied to clipboard!');
    }
  };

  const refetchPostIfOnDetailsPage = async () => {
    // If on post details page, refetch the post to update share count
    if (pathname.includes('/post/') && postId) {
      try {
        const updatedPost = await getPostById(postId);
        if (updatedPost) {
          dispatch(fetchPostPageSuccess(updatedPost));
        }
      } catch (error) {
        console.error('Error refetching post:', error);
      }
    }
  };

  const [shareCampfirePostToFeed] = useMutation(SHARE_POST_TO_FEED_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: async (data) => {
      if ((data as any)?.sharePostToFeed?.success) {
        emitNotification('success', 'Your post got shared successfully');
        dispatch(setRefreshHomeFeed(true));
        await refetchPostIfOnDetailsPage();
      } else {
        emitErrorNotification((data as any)?.sharePostToFeed?.message);
      }
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [sharePostToFeed] = useMutation(MUTATION_SHARE_POST, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: async (res) => {
      const postData = (res as any)?.insert_post_shares_one;
      await createHashtags(postData?.title, postData?.id, 'postShare');
      emitNotification('success', 'Your post got shared successfully');
      dispatch(setRefreshHomeFeed(true));
      await refetchPostIfOnDetailsPage();
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleClose = () => {
    dispatch(
      toggleShareDialog({
        open: false,
        postId: undefined,
        campfireName: undefined,
        postShareData: {
          categoryId: undefined,
          postId: undefined,
          type: undefined,
        },
      }),
    );
  };
  const handleCampfirePostShare = () => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      handleClose();
      return;
    }
    shareCampfirePostToFeed({
      variables: {
        campfireThreadId: threadId,
        message: userThoughts,
      },
    });
    handleClose();
  };

  const handlePostShare = () => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      handleClose();
      return;
    }
    if (postShareData.postId) {
      sharePostToFeed({
        variables: {
          title: userThoughts,
          [`${
            postShareData.type === PostTypeEnum.campfirePostShare
              ? 'campfire_post_share_id'
              : postShareData.type + 'Id'
          }`]: postShareData.postId,
          categoryId: postShareData.categoryId,
        },
      });
    }
    handleClose();
  };

  return (
    <div>
      <Text size="lg">Share Post</Text>
      {isCampfirePost ? (
        <>
          <div className="mt-6">
            <TextArea
              placeholder="Come, let us help you"
              value={userThoughts}
              className="rounded-lg border-offwhite-100"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                validations.checkWordLimit(e.target.value, 500) &&
                setUserThoughts(e.target.value)
              }
            />
          </div>

          <div className="mt-5">
            <Button size="lg" block onClick={handleCampfirePostShare}>
              Share
            </Button>
          </div>
        </>
      ) : postShareData?.postId ? (
        <>
          <div className="mt-5">
            <Text size="sm" color="text-gray-50" font="font-semibold">
              Share on your Kofuku Social feed
            </Text>
          </div>
          <div className="py-4">
            <div className="overflow-y-hidden text-base text-gray-700">
              <TagInput
                placeholder="write your thoughts"
                value={userThoughts}
                onChange={(e) =>
                  validations.checkWordLimit(e, 500) && setUserThoughts(e)
                }
                setHasInvalidHashtag={setHasInvalidHashtag}
                multiLine
              />
            </div>
            <div className="flex w-full items-center justify-between">
              {hasInvalidHashtag && (
                <Text size="xs" color="text-error">
                  This hashtag is disabled.
                </Text>
              )}
              <div className="ml-auto">
                <Text
                  size="xs"
                  variant
                  color="text-gray-700"
                  font="font-medium"
                >
                  {getWordCount(userThoughts)}/500 words max
                </Text>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Button
              isdisabled={!(!hasInvalidHashtag && userThoughts)}
              size="lg"
              block
              onClick={handlePostShare}
            >
              Share
            </Button>
          </div>
        </>
      ) : null}
      <div className="py-4">
        <div className="py-8">
          <Text size="sm">Share via</Text>
          <div className="flex items-center justify-evenly p-2">
            <div>
              <Link
                target="_blank"
                href={encodeURI(
                  `https://mail.google.com/mail/u/0/?tf=cm&to=%22+++emailTo)+:+%22%22)(%22&su=Checkout Kofuku Social&body=${link}`,
                )}
              >
                <div className="h-10 w-14 ">
                  <CustomImage src={Gmail} />
                  <div className="py-2">
                    <Text size="xs">Gmail</Text>
                  </div>
                </div>
              </Link>
            </div>
            <div>
              <Link
                target="_blank"
                href={encodeURI(
                  `https://twitter.com/intent/tweet?text=Hey, Checkout the post I found on Kofuku Social.&url=${link}`,
                )}
              >
                <div className="h-10 w-10">
                  <CustomImage src={XTwitter} />
                  <div className="py-2">
                    <Text size="xs">Twitter</Text>
                  </div>
                </div>
              </Link>
            </div>
            <div>
              <Link
                target="_blank"
                href={encodeURI(
                  `https://telegram.me/share/url?url=${link}&text=Hey, Checkout the post I found on Kofuku Social.`,
                )}
              >
                <div className="h-10 w-14 ">
                  <CustomImage src={Telegram} />
                  <div className="py-2">
                    <Text size="xs">Telegram</Text>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <Text size="sm">Copy Link</Text>
          <div className="py-4">
            <Input value={`${link}`} isIcon onCopy={handleCopiedData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharePost;
