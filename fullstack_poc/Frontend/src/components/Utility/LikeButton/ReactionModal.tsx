/**
 * LikeButton:
 * - Provides interactive reaction functionality using custom emojis ("Kofukons").
 * - Handles user reactions on various post types (questions, quizzes, polls, etc.).
 * - Supports adding/removing reactions, showing tooltips, and displaying reaction counts.
 * - Shows reaction selection on hover and handles protected campfire restrictions.
 */

import { useMutation, useQuery } from '@apollo/client/react';
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
  QUERY_COMMENT_REACTIONS_BY_ID,
  QUERY_POST_REACTION_BY_ID,
  REACT_TO_POST,
} from '@/service/graphql/Kofukons';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { setKofukons } from '@/state/Slices/home';
import { CardTypeEnum } from '@/types/enums';
import { PostReaction } from '@/types/forum';
import FollowButton from '@/components/Utility/FollowButton';
import { capitalize } from 'lodash';
import ApiClient from '@/service/graphql/apiClient';
import Loader from '@/components/Utility/Loader';
import { useRouter } from 'next/router';

interface LikeButtonProps {
  id?: string;
  kofukons: Kofukon[];
  postId: string;
  cardType: CardTypeEnum;
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

export default function ReactionModal({
  kofukons,
  postId,
  cardType,
}: LikeButtonProps) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [allReactions, setAllReactions] = useState<PostReaction[]>([]);
  const router = useRouter();

  // Filter kofukuns by reaction if not 'all'
  const filteredKofukuns =
    activeTab === 'all'
      ? kofukons
      : kofukons.filter((k: any) => k.reaction === activeTab);

  useEffect(() => {
    if (postId && cardType) {
      setIsLoading(true);
      (async () => {
        if (cardType === CardTypeEnum.comment) {
          const { data }: any = await ApiClient.getClient().query({
            query: QUERY_COMMENT_REACTIONS_BY_ID,
            fetchPolicy: 'no-cache',
            variables: { id: postId },
            context: { headers: { Authorization: `Bearer ${token}` } },
          });
          const postReactions = data?.comments_by_pk
            ? data.comments_by_pk.post_reactions
            : [];
          setAllReactions(postReactions);
          setReactions(postReactions);
          setIsLoading(false);
        } else {
          try {
            const { data }: any = await ApiClient.getClient().query({
              query: QUERY_POST_REACTION_BY_ID,
              fetchPolicy: 'no-cache',
              variables: { id: postId },
              context: { headers: { Authorization: `Bearer ${token}` } },
            });
            const postReactions =
              data?.threads && data.threads.length > 0
                ? data.threads[0][cardType]?.post_reactions
                : [];
            setAllReactions(postReactions);
            setReactions(postReactions);
            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
            emitErrorNotification('Failed to fetch reactions');
            captureSentryException(error);
          }
        }
      })();
    }
  }, [postId, cardType]);

  const onClickTab = (key: string) => {
    setActiveTab(key);
    if (key === 'all') {
      setReactions(allReactions);
    } else {
      setReactions(allReactions.filter((r: any) => r.kofukon?.id === key));
    }
  };

  return (
    <div className="bg-white rounded-lg  max-h-[70vh] flex flex-col ">
      <div className="flex items-center justify-center p-4">
        <div className="flex gap-4 justify-center">
          <button
            key={'all'}
            className={`font-semibold px-2 py-1  ${
              activeTab === 'all'
                ? 'text-primary text-blue-700 border-b-2 border-primary '
                : 'text-gray-700'
            }`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onClickTab('all');
            }}
          >
            All {formatShortCount(allReactions.length)}
          </button>
          {kofukons.map((tab: Kofukon) => (
            <button
              key={tab.attributes.k_id}
              className={`flex font-semibold px-2 py-1 ${
                activeTab === tab.attributes.k_id
                  ? 'border-b-2 border-primary'
                  : 'text-gray-700'
              }`}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onClickTab(tab.attributes.k_id);
              }}
            >
              <CustomImage
                src={tab?.attributes?.image?.data[0]?.attributes?.url}
                alt={tab.attributes.title}
                width={20}
                height={20}
                className="!h-[24px] !w-[24px]"
              />{' '}
              {formatShortCount(
                allReactions.filter(
                  (r: any) => r.kofukon?.id === tab.attributes.k_id,
                ).length,
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        {isLoading && <Loader size="100" variant="circle" />}
        {reactions.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No reactions yet.
          </div>
        )}
        <div className="space-y-4 p-0 lg:p-2">
          {reactions &&
            reactions.map((reaction: PostReaction) => (
              <div key={reaction.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 min-w-[35px]">
                      <CustomImage
                        height={20}
                        width={20}
                        src={reaction.user?.profilePicture}
                        fallbackSrc="/images/userImage.svg"
                      />
                    </div>
                    <div
                      className={`ml-2 break-all text-sm cursor-pointer `}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        router.push(`/user/${reaction.user?.name}`);
                      }}
                    >
                      <Text size="base" customClass="font-semibold">
                        {reaction.user?.name}
                      </Text>
                    </div>
                  </div>
                  <div className="flex justify-between gap-10 min-w-[170px]">
                    <CustomImage
                      className="!h-[24px] !w-[24px]"
                      height={20}
                      width={20}
                      src={
                        kofukons.find(
                          (k: any) =>
                            k.attributes.k_id === reaction.kofukon?.id,
                        )?.attributes?.image?.data[0]?.attributes?.url
                      }
                      fallbackSrc="/images/userImage.svg"
                    />
                    {!reaction.user?.isBlocked && (
                      <div>
                        <FollowButton
                          postUserId={reaction.user?.id || ''}
                          isFollowing={reaction.user?.isFollowing}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
