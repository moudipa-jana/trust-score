import { useLazyQuery } from '@apollo/client/react';
import { debounce } from 'lodash';
import React, { ReactNode, useEffect, useMemo } from 'react';
import CustomImage from '@/components/Utility/CustomImage';
import Mention from '@/components/Utility/MentionInputType/Mention';
import { Hashtag, HashtagResponse, MentionData, SearchResponse, SuggestionDataItem, TagInputProps, User } from '@/components/Utility/MentionInputType/mention-types';
import MentionsInput from '@/components/Utility/MentionInputType/MentionsInput';
import Text from '@/elements/Text';
import useDisabledHashtags from '@/Hooks/useDisabledHashtags';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { GET_SEARCHED_TAG, SEARCH_HASHTAG } from '@/service/graphql/Forum';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { useUsersWhoBlockedMe } from '@/Hooks/useUsersWhoBlockedMe';
import { useUsersIBlocked } from '@/Hooks/useUsersIBlocked';
import {
  GET_BLOCKED_CAMPFIRE_USERS,
  QUERY_GET_CAMPFIRE_MEMBER,
} from '@/service/graphql/Campfire';

function TagInput({
  placeholder,
  rounded,
  required,
  type,
  name,
  dark,
  value,
  onChange,
  isIcon,
  id,
  outline,
  inputRef,
  fixHt,
  commentHt,
  isCommentField,
  setHasInvalidHashtag,
  mentionCampfireId,
  restrictMentionsToCampfire,
  ...props
}: TagInputProps) {
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const requiredProp = Boolean(required);
  useDisabledHashtags({ value, setHasInvalidHashtag });
  const blockerIds = useUsersWhoBlockedMe();
  const iBlockedIds = useUsersIBlocked();
  const [searchTag, { error: searchTagError }] = useLazyQuery<SearchResponse>(GET_SEARCHED_TAG);
  const [searchHashtags, { error: searchHashtagsError }] = useLazyQuery<HashtagResponse>(SEARCH_HASHTAG, { fetchPolicy: 'no-cache' });
  const [searchCampfireMembers] = useLazyQuery(QUERY_GET_CAMPFIRE_MEMBER, { fetchPolicy: 'no-cache' });
  const [fetchBlockedCampfireUsers] = useLazyQuery(GET_BLOCKED_CAMPFIRE_USERS, {
    fetchPolicy: 'no-cache',
  });

  // Handle search tag errors
  useEffect(() => {
    if (searchTagError) {
      emitErrorNotification(formatGraphqlError(searchTagError));
    }
  }, [searchTagError]);

  // Handle search hashtags errors
  useEffect(() => {
    if (searchHashtagsError) {
      emitErrorNotification(formatGraphqlError(searchHashtagsError));
    }
  }, [searchHashtagsError]);

  function handleInputChange(e: {
    target: {
      value: string;
    };
  }) {
    const tagValue = e.target.value;
    let updatedValue = tagValue;

    if (tagValue.toLowerCase().includes('@everyone')) {
      updatedValue = tagValue.replace(
        /@everyone/gi,
        '<everyone|0da184c2-741f-497a-a5e6-41e43057e14f>',
      );
    } else {
      updatedValue = tagValue.replace(
        /<#(\w+)>/g,
        (_match: string, display: string) => display,
      );
    }
    if (onChange) onChange(updatedValue);
  }

  const handleDebounceSearch = React.useCallback(
    (tagQuery: string, callback: (data: MentionData[]) => void) => {
      const shouldRestrictToCampfire = Boolean(restrictMentionsToCampfire && mentionCampfireId);
      if (shouldRestrictToCampfire) {
        Promise.all([
          searchCampfireMembers({
            variables: {
              campfireId: mentionCampfireId,
              search: tagQuery ? `%${tagQuery}%` : '%%',
            },
            context: {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          } as any),
          fetchBlockedCampfireUsers({
            variables: { campfireId: mentionCampfireId },
            context: {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          } as any),
        ]).then(([membersResult, blockedResult]) => {
          const members = (membersResult as any)?.data?.campfire_users ?? [];
          const blockedUsers = (blockedResult as any)?.data?.campfire_users ?? [];
          const campfireBlockedIds = new Set(
            blockedUsers
              .map((b: any) => b?.user?.id)
              .filter(Boolean) as string[],
          );

          const filteredMembers = members.filter((m: any) => {
            const u = m?.user;
            if (!u?.id || !u?.name) return false;
            return (
              u.name.toLowerCase().includes(tagQuery.toLowerCase()) &&
              !blockerIds.has(u.id) &&
              !iBlockedIds.has(u.id) &&
              !campfireBlockedIds.has(u.id)
            );
          });

          const formattedUserData = filteredMembers.map((m: any) => ({
            id: m.user.id,
            display: m.user.name,
            profilePicture: m.user.profilePicture,
          }));

          if (
            tagQuery.toLowerCase() ===
            'everyone'.slice(0, tagQuery.length).toLowerCase()
          ) {
            const everyoneUser = {
              id: '0da184c2-741f-497a-a5e6-41e43057e14f',
              display: 'everyone',
              profilePicture: '/images/userImage.svg',
            };
            formattedUserData.unshift(everyoneUser);
          }

          callback(formattedUserData);
        });
        return;
      }

      searchTag({
        variables: {
          userName: `%${tagQuery}%`,
          loggedInUserId: userId,
        },
        context: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      } as any).then((result: any) => {
        const res = result.data;
        if (res?.users) {
          const filteredUsers = res?.users?.filter((user: User) =>
            user.name.toLowerCase().includes(tagQuery.toLowerCase()) && !blockerIds.has(user.id) && !iBlockedIds.has(user.id)
          );

          const formattedUserData = filteredUsers.map((user: User) => ({
            id: user.id,
            display: user.name,
            profilePicture: user.profilePicture,
          }));

          if (
            tagQuery.toLowerCase() ===
            'everyone'.slice(0, tagQuery.length).toLowerCase()
          ) {
            const everyoneUser = {
              id: '0da184c2-741f-497a-a5e6-41e43057e14f',
              display: 'everyone',
              profilePicture: '/images/userImage.svg',
            };
            formattedUserData.unshift(everyoneUser);
          }

          callback(formattedUserData);
        } else {
          emitErrorNotification('No users found.');
        }
      });
    },
    [
      searchTag,
      userId,
      token,
      blockerIds,
      iBlockedIds,
      searchCampfireMembers,
      fetchBlockedCampfireUsers,
      mentionCampfireId,
      restrictMentionsToCampfire,
    ],
  );

  const handleDebounceHashtagSearch = React.useCallback(
    (tagQuery: string, callback: (data: MentionData[]) => void) => {
      searchHashtags({
        variables: {
          userName: tagQuery,
        },
        context: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      } as any).then((result: any) => {
        const res = result.data;
        const hashtags = res.hashtags;

        if (hashtags) {
          const filteredHashtags = hashtags.filter((hashtag: Hashtag) =>
            hashtag.hashtag_name
              .toLowerCase()
              .startsWith(tagQuery.toLowerCase()),
          );

          const formattedHashtags = filteredHashtags.map(
            (hashtag: Hashtag) => ({
              id: hashtag.id,
              display: `#${hashtag.hashtag_name}`,
              noPosts: hashtag.number_of_posts,
            }),
          );
          callback(formattedHashtags);
        } else {
          emitErrorNotification('Failed to fetch hashtags');
        }
      });
    },
    [searchHashtags],
  );

  const debouncedSearchTag = useMemo(
    () => debounce(handleDebounceSearch, 400),
    [handleDebounceSearch],
  );

  const debouncedHashtagSearchTag = useMemo(
    () => debounce(handleDebounceHashtagSearch, 400),
    [handleDebounceHashtagSearch],
  );

  function fetchUsers(query: string, callback: (data: MentionData[]) => void) {
    if (!query) return;

    if (token) {
      debouncedSearchTag(query, callback);
    }
  }

  function fetchHashtags(
    query: string,
    callback: (data: MentionData[]) => void,
  ) {
    if (!query) return;
    debouncedHashtagSearchTag(query, callback);
  }

  const commonAttributes = {
    inputRef,
    type,
    id,
    name,
    fixHt,
    commentHt,
    className: `p-2 ${dark ? 'border-gray-100 bg-white ' : 'bg-white'} border ${outline ? ' border-primary' : 'border-offwhite-100'
      }   placeholder-gray-700 ${rounded ? 'rounded-lg' : 'rounded'} 
      ${isIcon ? ' pr-10' : ''}
      ${fixHt ? 'h-36 !max-h-40' : ''}
    block w-full text-sm focus:outline-none`,
    placeholder,
    required: requiredProp,
    value,
    onChange: handleInputChange,
    ...props,
    autoComplete: 'false',
  };

  const safeProps = commonAttributes;

  function getStyles() {
    return {
      control: {
        fontWeight: 'normal',
      },
      '&singleLine': {
        display: 'inline-block',
        width: isCommentField ? 'calc(100% - 125px)' : '100%',
        control: {
          minHeight: 18,
        },
        highlighter: {
          color: '#00B2ED',
          // paddingTop: 2,
          substring: {
            color: '#272727',
          },
        },
        input: {
          paddingLeft: 8,
          height: '100%',
          outline: 'none',
        },
      },
      '&multiLine': {
        width: isCommentField ? 'calc(100% - 125px)' : '100%',
        control: {
          minHeight: isCommentField ? 25 : 120,
          maxHeight: isCommentField ? 50 : 0,
        },
        highlighter: {
          maxHeight: 160,
        },
        input: {
          padding: 10,
          outline: 'none',
          height: 'auto',
          overflowY: 'auto' as 'auto' | 'hidden' | 'scroll' | undefined,
        },
      },

      suggestions: {
        top: 48,
        zIndex: 200,
        width: commentHt ? '200px' : '260px',
        list: {
          backgroundColor: 'white',
          border: '1px solid rgba(0,0,0,0.15)',
          maxHeight: '210px',
          overflowY: 'auto' as 'auto' | 'hidden' | 'scroll' | undefined,
        },
        item: {
          padding: commentHt ? '2px 2px' : '5px 5px',
          borderBottom: '1px solid rgba(0,0,0,0.15)',
        },
      },
    };
  }

  const MentionsInputComponent = MentionsInput as React.ElementType;
  const MotionComponent = Mention as React.ElementType;
  return (
    <MentionsInputComponent {...safeProps} style={getStyles()}>
      <MotionComponent
        markup="<__display__|__id__>"
        displayTransform={(_: string, display: string) => `${display?.includes('|') ? display.split('|')[0] : display} `}
        trigger="@"
        data={fetchUsers}
        style={{ marginLeft: -0.4, position: 'relative', zIndex: 2 }}
        renderSuggestion={(
          suggestion: SuggestionDataItem,
          search: string,
          highlightedDisplay: ReactNode,
          index: number,
          focused: boolean,
        ) => {
          const mentionData = suggestion as MentionData;
          return (
            <div
              key={suggestion.id}
              className={`flex cursor-pointer items-center px-4 py-2 ${focused ? 'bg-gray-100' : ''
                }`}
            >
              <div
                className={`${commentHt ? 'h-4 w-4' : 'h-11 w-11'
                  } relative mr-2 h-11 w-11 rounded-full`}
              >
                <CustomImage
                  src={mentionData?.profilePicture ?? '/images/userImage.svg'}
                  width={10}
                  height={10}
                  fallbackSrc="/images/userImage.svg"
                />
              </div>
              {suggestion.display}
            </div>
          );
        }}
      />
      <MotionComponent
        markup="<__display__|__id__>"
        displayTransform={(_: string, display: string) => `${display} `}
        trigger="#"
        data={fetchHashtags}
        style={{
          marginLeft: -0.4,
          position: 'relative',
          zIndex: 2,
        }}
        renderSuggestion={(
          suggestion: SuggestionDataItem,
          search: string,
          highlightedDisplay: ReactNode,
          index: number,
          focused: boolean,
        ) => {
          const mentionData = suggestion as MentionData;
          return (
            <div
              key={suggestion.id}
              className={`flex cursor-pointer justify-between px-4 py-2 ${focused ? 'bg-gray-100' : ''
                }`}
            >
              <Text size="sm" color="text-black">
                {suggestion.display}
              </Text>
              <Text size="xs" color="text-gray-1300">
                {mentionData.noPosts} posts
              </Text>
            </div>
          );
        }}
      />
    </MentionsInputComponent>
  );
}

export default TagInput;
