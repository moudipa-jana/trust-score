{
  /**
   * LinkifyText parses and renders text with clickable links, usernames, and hashtags.
   * It handles disabled hashtags, authenticated user routing, and optional query-based highlighting.
   */
}
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import React, { MouseEvent, useCallback } from 'react';

import HighlightText from '@/components/Utility/HighlightText';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { GET_DISABLED_HASHTAGS } from '@/service/graphql/Forum';
import { selectIsAuthenticated } from '@/state/Slices/auth';
import { getBannedData } from '@/state/Slices/campfire';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { UserProfile } from '@/types/authentication';

interface LinkifyTextProps {
  text: string;
  query?: string | string[];
  className?: string;
  isTitle?: boolean;
  isSearch?: boolean;
}

interface DisabledHashtag {
  hashtag_name: string;
}

interface BannedWord {
  id: string;
  word: string;
}

interface BannedDomain {
  id: string;
  domain: string;
}

function LinkifyText({
  text,
  query,
  className,
  isTitle,
  isSearch,
}: LinkifyTextProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const usernameRegex = /<([^>]+)>/g;
  const hashtagRegex = /#(\w+)/g;
  const selectedhashtagRegex = /<#(\w+)\|\w+-\w+-\w+-\w+-\w+>/g;

  const parts = text
    ?.split(/(https?:\/\/[^\s<>]+)|(<[^>]+>)|(#\w+)/g)
    ?.filter((part: string) => !!part);

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  const profile = useAppSelector((state) => state.auth.profile) as UserProfile;
  const { data: disabledHashtags } = useQuery(GET_DISABLED_HASHTAGS);

  // Get banned data from Redux store
  const bannedData = useAppSelector(getBannedData);

  // Check if current route is a campfire route
  const isCampfireRoute = router.pathname.startsWith('/campfire/');

  // Check if text contains banned domains
  const containsBannedDomains = (text: string): boolean => {
    if (isSearch || !isCampfireRoute || !bannedData.bannedDomains?.length)
      return false;

    const bannedDomains = bannedData.bannedDomains.map((item: BannedDomain) =>
      item.domain.toLowerCase(),
    );

    const textLower = text.toLowerCase();
    return bannedDomains.some((domain: string) => {
      // Use word boundaries to match complete domains only
      const domainRegex = new RegExp(
        `\\b${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'i',
      );
      return domainRegex.test(textLower);
    });
  };

  // Function to render text with banned words/domains highlighted and blurred
  const renderTextWithBannedContent = useCallback(
    (text: string) => {
      if (
        isSearch ||
        !isCampfireRoute ||
        ((isTitle
          ? !bannedData.bannedTitleWords?.length
          : !bannedData.bannedBodyWords?.length) &&
          !bannedData.bannedDomains?.length)
      ) {
        return text;
      }

      // Choose banned words based on isTitle prop
      const bannedWords = isTitle
        ? bannedData.bannedTitleWords?.map((item: BannedWord) =>
            item.word.toLowerCase(),
          ) || []
        : bannedData.bannedBodyWords?.map((item: BannedWord) =>
            item.word.toLowerCase(),
          ) || [];

      const bannedDomains =
        bannedData.bannedDomains?.map((item: BannedDomain) =>
          item.domain.toLowerCase(),
        ) || [];

      if (bannedWords.length === 0 && bannedDomains.length === 0) {
        return text;
      }

      // Create regex patterns for banned words and domains with word boundaries
      const bannedWordsRegex =
        bannedWords.length > 0
          ? new RegExp(
              `\\b(${bannedWords
                .map((word: string) =>
                  word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                )
                .join('|')})\\b`,
              'gi',
            )
          : null;

      const bannedDomainsRegex =
        bannedDomains.length > 0
          ? new RegExp(
              `\\b(${bannedDomains
                .map((domain: string) =>
                  domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                )
                .join('|')})\\b`,
              'gi',
            )
          : null;

      // Split text by banned content
      let parts = [text];

      if (bannedWordsRegex) {
        parts = parts.flatMap((part) =>
          typeof part === 'string' ? part.split(bannedWordsRegex) : [part],
        );
      }

      if (bannedDomainsRegex) {
        parts = parts.flatMap((part) =>
          typeof part === 'string' ? part.split(bannedDomainsRegex) : [part],
        );
      }

      return parts.map((part) => {
        if (typeof part !== 'string') return part;

        const isBannedWord =
          bannedWords.length > 0 &&
          bannedWords.some((word: string) => {
            // Use word boundary regex to match complete words only
            const wordRegex = new RegExp(
              `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
              'i',
            );
            return wordRegex.test(part);
          });

        const isBannedDomain =
          bannedDomains.length > 0 &&
          bannedDomains.some((domain: string) => {
            // Use word boundary regex to match complete domains only
            const domainRegex = new RegExp(
              `\\b${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
              'i',
            );
            return domainRegex.test(part);
          });

        if (isBannedWord || isBannedDomain) {
          return (
            <span
              key={part}
              className="cursor-not-allowed blur-sm"
              title={`This ${isBannedWord ? 'word' : 'domain'} has been banned`}
            >
              {part}
            </span>
          );
        }

        return part;
      });
    },
    [
      isSearch,
      isCampfireRoute,
      isTitle,
      bannedData.bannedTitleWords,
      bannedData.bannedBodyWords,
      bannedData.bannedDomains,
    ],
  );

  const handleTagClick = (username: string, e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(toggleSignupDialog(true));
    } else if (username === 'everyone') {
      return;
    } else {
      const loggedInUsername = profile.name;
      if (username === loggedInUsername) {
        router.push('/profile');
      } else {
        router.push(`/user/${username}`);
      }
    }
  };

  const handleHashtagClick = (
    hashtag: string,
    e: MouseEvent<HTMLElement>,
    isDisabled: boolean,
  ) => {
    if (isDisabled) return;
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(toggleSignupDialog(true));
    } else {
      router.push(`/search?query=${hashtag}&viewType=hashtag`);
    }
  };

  const handleCopy = (e: React.ClipboardEvent<HTMLParagraphElement>) => {
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || !isAuthenticated) return;

    // Create a container div to hold the cloned selected content
    const container = document.createElement('div');

    // Clone all selected ranges into the container
    for (let i = 0; i < selection.rangeCount; i++) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }

    // Find all <a> elements with data-username attribute inside the cloned selection
    container.querySelectorAll('a[data-username]').forEach((el) => {
      const username = el.getAttribute('data-username');
      if (username) {
        // Replace the anchor text with <username>
        el.textContent = `<${username}>`;
      }
    });

    // Get plain text from the container after replacements
    const newText = container.textContent || '';

    // Set the modified text to the clipboard
    e.clipboardData.setData('text/plain', newText);
  };

  return (
    <div className={className ?? 'inline'} onCopy={handleCopy}>
      {parts?.map((part: string) => {
        if (part?.match(urlRegex)) {
          let url = part;
          if (!/^https?:\/\//i.test(part)) {
            url = 'http://' + part;
          }
          if (url.endsWith('.')) {
            url = url.replace(/\.$/, '');
          }

          // Check if URL contains banned domains
          const isBlurred = containsBannedDomains(part);

          return (
            <a
              key={part}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm underline underline-offset-2 lg:text-md ${
                isBlurred
                  ? 'cursor-not-allowed blur-sm'
                  : 'cursor-pointer text-primary hover:text-blue-200'
              }`}
              title={isBlurred ? 'This URL contains a banned domain' : ''}
              onClick={isBlurred ? (e) => e.preventDefault() : undefined}
            >
              {part}
            </a>
          );
        } else if (part.match(selectedhashtagRegex)) {
          const matches = part.match(/[^<>|]+/g);
          if (matches && matches.length) {
            const username = matches[0];
            const hashtag = username.startsWith('#')
              ? username.substring(1)
              : username;

            const isDisabled = (disabledHashtags as any)?.hashtags?.some(
              (item: DisabledHashtag) => item.hashtag_name === hashtag,
            );
            return (
              <a
                key={part}
                target="_blank"
                data-username={`#${hashtag}|${matches[1]}`}
                className={`cursor-pointer text-primary ${
                  isDisabled ? 'cursor-not-allowed blur' : ''
                }`}
                onClick={(e: MouseEvent<HTMLElement>) => {
                  if (isDisabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleHashtagClick(hashtag, e, isDisabled);
                }}
              >
                {username}{' '}
              </a>
            );
          }
        } else if (part.match(usernameRegex)) {
          const matches = part.match(/[^<>]+/g);
          if (matches && matches.length) {
            const username = matches[0]?.split('|')?.[0];
            return (
              <a
                key={part}
                target="_blank"
                data-username={matches[0]}
                className={`${
                  username === 'everyone'
                    ? ' text-pink-600'
                    : 'cursor-pointer text-primary '
                } ${!isAuthenticated ? 'blur-sm' : ''} `}
                onClick={(e: MouseEvent<HTMLElement>) =>
                  handleTagClick(username, e)
                }
              >
                {!isAuthenticated
                  ? `@${username.slice(0, 2) + '******'}`
                  : `@${username} `}
              </a>
            );
          }
        } else if (part.match(hashtagRegex)) {
          const hashtag = part.startsWith('#') ? part.substring(1) : part;

          const isDisabled = (disabledHashtags as any)?.hashtags?.some(
            (item: DisabledHashtag) => item.hashtag_name === hashtag,
          );

          return (
            <a
              key={part}
              target="_blank"
              className={`cursor-pointer text-primary ${
                isDisabled ? 'cursor-not-allowed blur' : ''
              }`}
              onClick={(e: MouseEvent<HTMLElement>) => {
                if (isDisabled) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                handleHashtagClick(hashtag, e, isDisabled);
              }}
              {...(isDisabled && { title: 'This hashtag has been disabled' })}
            >
              {part}
            </a>
          );
        } else if (query) {
          return <HighlightText key={part} title={part} highlight={query} />;
        } else {
          // Render text with banned content highlighted and blurred
          return renderTextWithBannedContent(part);
        }
        return null;
      })}
    </div>
  );
}

export default LinkifyText;
