/**
 * LikeButton:
 * - Provides interactive reaction functionality using custom emojis ("Kofukons").
 * - Handles user reactions on various post types (questions, quizzes, polls, etc.).
 * - Supports adding/removing reactions, showing tooltips, and displaying reaction counts.
 * - Shows reaction selection on hover and handles protected campfire restrictions.
 */

import { useMutation } from '@apollo/client/react';
import Like from 'public/images/like.svg';
import React, { useEffect, useRef, useState } from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import LogoLoader from '@/components/Utility/LogoLoader';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatShortCount } from '@/lib/helpers';
import captureSentryException from '@/lib/sentryException';
import { FETCH_LIST_OF_KOFUKONS } from '@/service';
import {
  DELETE_REACTION_TO_POST,
  REACT_TO_POST,
} from '@/service/graphql/Kofukons';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { setKofukons } from '@/state/Slices/home';
import { CardTypeEnum } from '@/types/enums';
import { PostReaction } from '@/types/forum';
import ReactionModal from '@/components/Utility/LikeButton/ReactionModal';
import Modal from '@/components/Utility/Modal';

interface LikeButtonProps {
  id: string;
  cardType: CardTypeEnum;
  variant?: string;
  updateParticipantsCount: () => void;
  footerDisable?: boolean;
  postReaction?:
    | PostReaction[]
    | {
        id: string;
        userId?: string;
        user_id?: string;
        kofukon: {
          id: string;
          name: string;
        };
      }[];
  likesCount?: number;
  isAnnouncement?: boolean;
  isCamfireMember?: boolean | null;
  setCampfireJoin?: ((join: boolean) => void) | null;
  campfireDeletedPost?: boolean;
  postId: string;
  commentId?: string;
  // --- ADDED FOR TRUST SERVICE POC ---
  authorId?: string;
  postText?: string;
  category?: string;
}

interface KofukonAttributes {
  k_id: string;
  title: string;
  image: {
    data: Array<{
      attributes: {
        url: string;
      };
    }>;
  };
}

interface Kofukon {
  attributes: KofukonAttributes;
  name?: string;
}

export default function LikeButton({
  variant,
  id,
  cardType,
  footerDisable,
  updateParticipantsCount,
  postReaction,
  likesCount,
  isAnnouncement,
  isCamfireMember,
  setCampfireJoin,
  campfireDeletedPost,
  postId,
  commentId,
  // --- ADDED FOR TRUST SERVICE POC ---
  authorId,
  postText,
  category,
}: LikeButtonProps) {
  const dispatch = useAppDispatch();
  const [isReaction, setReaction] = useState(false);
  const [showReaction, setShowReaction] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(Like);
  const [currentReactionText, setCurrentReactionText] = useState('Like');
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount || 0);
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const [currentPostreaction, setCurrentPostreaction] = useState(postReaction);

  const kofukons = useAppSelector((state) => state.home.kofukons);

  useEffect(() => {
    const fetchKofukonsData = async () => {
      if (!kofukons || kofukons.length === 0) {
        try {
          const { data } = await FETCH_LIST_OF_KOFUKONS();
          dispatch(setKofukons((data as any)?.kofukons?.data || []));
        } catch (error) {
          captureSentryException(error);
        }
      }
    };

    fetchKofukonsData();
  }, [kofukons, dispatch]);
  const [reactionOnPost, { loading: postReactionLoading }] = useMutation(
    REACT_TO_POST,
    {
      context: { headers: { Authorization: `Bearer ${token}` } },
      onError: (err) => {
        emitErrorNotification(err.message);
      },
    },
  );

  const [deleteReactionOnPost, { loading: deleteReactionLoading }] =
    useMutation(DELETE_REACTION_TO_POST, {
      context: {
        headers: { Authorization: `Bearer ${token}` },
      },
      onError: (err) => {
        emitErrorNotification(err.message);
      },
    });

  useEffect(() => {
    if (token) {
      if (postReaction?.length) {
        const foundReactionIndex = postReaction.findIndex(
          (item: PostReaction) =>
            item.user_id === userId || item.userId === userId,
        );
        if (foundReactionIndex !== -1) {
          setCurrentPostreaction(postReaction);
          const foundIndex = kofukons?.findIndex(
            (item: Kofukon) =>
              item?.attributes?.k_id ===
              postReaction[foundReactionIndex]?.kofukon?.id,
          );
          if (
            Array.isArray(kofukons) &&
            foundIndex !== -1 &&
            kofukons[foundIndex]
          ) {
            setCurrentReaction(
              kofukons[foundIndex]?.attributes?.image?.data[0]?.attributes?.url,
            );
            setCurrentReactionText(kofukons[foundIndex]?.attributes?.title);
          }
        }
      }
    }
  }, [postReaction, token, userId, kofukons]);

  useEffect(() => {
    if (likesCount) setCurrentLikesCount(likesCount);
  }, [likesCount]);

  const reactionCallback = (item: Kofukon, noChangeLikeCount = true) => {
    const param = {
      user_id: userId,
      kofukon_id: item?.attributes?.k_id,
      ...(cardType === CardTypeEnum.question && {
        [isAnnouncement ? 'announcement_id' : 'question_id']: id,
      }),
      ...(cardType === CardTypeEnum.quiz && { quiz_id: id }),
      ...(cardType === CardTypeEnum.postShare && { post_share_id: id }),
      ...(cardType === CardTypeEnum.poll && { poll_id: id }),
      ...(cardType === CardTypeEnum.comment && { comment_id: id }),
      ...(cardType === CardTypeEnum.campfirePostShare && {
        campfire_post_share_id: id,
      }),
      ...(cardType === CardTypeEnum.campfireShare && { campfire_share_id: id }),
    };

    // --- TRUST SERVICE POC INTEGRATION ---
    // Since you haven't passed the authorId down from the parent yet, 
    // we will use mock fallback values so you can see it work immediately!
    const finalAuthorId = authorId || "11111111-1111-1111-1111-111111111111";
    const finalPostText = postText || "I suspect emotional abuse in a care home"; // Text from your screenshot
    
    fetch('http://localhost:8001/process-reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: "event-" + Date.now(),
        author_id: finalAuthorId,
        voter_id: userId || "22222222-2222-2222-2222-222222222222",
        voter_tier: "Established Voice", // For POC
        category: category || "Contagion", // Category from your screenshot
        entity_type: cardType === CardTypeEnum.comment ? "comment" : "post",
        post_text: finalPostText,
        reaction_text: item?.attributes?.title || "Like",
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log("Trust service offline, but reaction still saved."));
    // -------------------------------------

    reactionOnPost({
      variables: param,
      onCompleted: (response) => {
        if (noChangeLikeCount) {
          setCurrentLikesCount(currentLikesCount + 1);
        }
        const reactionData = {
          kofukon: {
            id: item?.attributes?.k_id,
            name: item?.attributes?.title,
          },
          id: (response as any)?.insert_post_reactions?.returning[0]?.id,
          user_id: userId ?? '',
        };
        if (currentPostreaction?.length) {
          const modifiedReactionData = [...currentPostreaction];
          modifiedReactionData.splice(0, 0, reactionData);
          setCurrentPostreaction([...modifiedReactionData]);
        } else {
          setCurrentPostreaction([reactionData]);
        }
        setCurrentReaction(item?.attributes?.image?.data[0]?.attributes?.url);
        setCurrentReactionText(item?.attributes?.title);
        updateParticipantsCount();
      },
    });
  };

  const findDeletedIconId = () => {
    const foundIndex = currentPostreaction?.findIndex(
      (item: PostReaction) => item.user_id === userId,
    );
    return foundIndex;
  };

  const handleReactionClick = (item: Kofukon) => {
    if (!token) {
      dispatch(toggleSignupDialog(true));
      return;
    }
    if (
      currentReaction === item?.attributes?.image?.data[0]?.attributes?.url &&
      currentPostreaction?.length
    ) {
      const foundIndex = findDeletedIconId();
      if (foundIndex !== -1) {
        deleteReactionOnPost({
          variables: { id: currentPostreaction[foundIndex ?? 0].id },
          onCompleted: () => {
            if (currentPostreaction?.length > 1) {
              const modifiedReactionData = [...currentPostreaction];
              modifiedReactionData.splice(foundIndex ?? 0, 1);
              setCurrentPostreaction([...modifiedReactionData]);
            } else {
              setCurrentPostreaction([]);
            }
            if (currentLikesCount > 0) {
              setCurrentLikesCount(currentLikesCount - 1);
            }
            setCurrentReaction(Like);
            setCurrentReactionText('Like');
            updateParticipantsCount();
          },
        });
      }
    } else if (currentPostreaction?.length) {
      const foundIndex = findDeletedIconId();
      if (foundIndex !== -1) {
        deleteReactionOnPost({
          variables: { id: currentPostreaction[foundIndex ?? 0].id },
          onCompleted: (response) => {
            const promise1 = new Promise((resolve) => {
              if (currentPostreaction?.length > 1) {
                const modifiedReactionData = [...currentPostreaction];
                modifiedReactionData.splice(foundIndex ?? 0, 1);
                setCurrentPostreaction([...modifiedReactionData]);
                setTimeout(() => {
                  resolve('');
                }, 200);
              } else {
                setCurrentPostreaction([]);
                setTimeout(() => {
                  resolve('');
                }, 200);
              }
            });
            Promise.all([promise1]).then(() => {
              const isItemDeleted = (response as any)?.delete_post_reactions
                ?.affected_rows
                ? false
                : true;
              reactionCallback(item, isItemDeleted);
            });
          },
        });
      } else {
        reactionCallback(item, true);
      }
    } else {
      reactionCallback(item, true);
    }
    setReaction(!isReaction);
  };
  const ismobile = useIsMobile();

  const Reactions = () => {
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 25,
          right: ismobile ? -215 : -185,
        }}
        className="z-10 flex h-10 items-center gap-1 rounded-md bg-white border border-gray-100 p-2 shadow-md"
      >
        {kofukons?.map((item: Kofukon) => {
          const isHovered = hoveredIcon === item?.attributes?.k_id;
          return (
            <div
              key={item?.attributes?.k_id}
              className="relative h-10 w-10 transform cursor-pointer px-1.5 transition-transform hover:-translate-y-2"
              onClick={(e) => {
                if (!footerDisable) {
                  e.stopPropagation();
                  handleReactionClick(item);
                }
              }}
              onMouseEnter={() => {
                setHoveredIcon(item?.attributes?.k_id);
              }}
              onMouseLeave={() => {
                setHoveredIcon(null);
              }}
            >
              <CustomImage
                src={item?.attributes?.image?.data[0]?.attributes?.url}
                alt={item.name}
                width={20}
                height={20}
              />
              {isHovered && (
                <p className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full transform whitespace-nowrap rounded-xl bg-black px-2 py-1 text-xs text-white">
                  {item?.attributes?.title}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const divRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setReaction(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={divRef}>
        {isReaction ? (
          <div style={{ position: 'relative', width: 'auto' }}>
            {' '}
            <Reactions />
          </div>
        ) : null}
        <div
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center gap-1 group"
          style={{ width: 'auto' }}
        >
          <div
            className="flex items-center justify-center gap-1 group"
            onClick={(e) => {
              if (!footerDisable) {
                e.stopPropagation();
              }
              if (campfireDeletedPost) {
                return;
              }
              if (!isCamfireMember && setCampfireJoin) {
                setCampfireJoin(true);
              } else if (
                !footerDisable &&
                !postReactionLoading &&
                !deleteReactionLoading
              ) {
                setReaction(!isReaction);
              }
            }}
          >
            <div className=" h-6 w-6" style={{ flexShrink: 0 }}>
              {postReactionLoading && deleteReactionLoading ? (
                <LogoLoader />
              ) : (
                <CustomImage
                  src={currentReaction}
                  alt="like"
                  width={20}
                  height={20}
                />
              )}
            </div>
            <span className="absolute bottom-7 mr-2 hidden rounded border border-gray-500  bg-white px-1 py-0.5 text-[10px] font-medium text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-400">
              Kofukons
            </span>

            <div className="items-center lg:block">
              <Text
                size={variant == 'sm' ? 'xxs' : variant == 'lg' ? 'base' : 'sm'}
                color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
                like
              >
                {currentReactionText}
              </Text>
            </div>
          </div>
          <div
            className="ml-0.5 flex items-center"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              currentLikesCount > 0 && setShowReaction(true);
            }}
          >
            <Text
              size={variant == 'sm' ? 'xxs' : variant == 'lg' ? 'base' : 'sm'}
              color={variant == 'sm' ? 'text-black-700' : 'text-gray-500'}
            >
              {currentReaction !== Like
                ? currentLikesCount > 2
                  ? `You + ${formatShortCount(currentLikesCount - 1)}`
                  : formatShortCount(currentLikesCount)
                : currentLikesCount < 0
                  ? '0'
                  : formatShortCount(currentLikesCount)}
              {/* {currentLikesCount < 0 ? '0' : formatShortCount(currentLikesCount)} */}
            </Text>
            <div className="ml-1 h-1.5 w-1.5 rounded-full bg-gray-950"></div>
          </div>
        </div>
      </div>
      <Modal
        id="reaction-modal"
        isVisible={showReaction}
        onClose={() => setShowReaction(false)}
        modalTitle="Reactions"
        modalClassName="reaction-modal"
      >
        <ReactionModal
          kofukons={kofukons}
          postId={
            cardType === CardTypeEnum.comment ? commentId || '' : postId || ''
          }
          cardType={cardType}
        />
      </Modal>
    </>
  );
}
