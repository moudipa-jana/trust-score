import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import Checkbox from 'react-custom-checkbox';
import * as Icon from 'react-icons/fi';
import { RxCross1 } from 'react-icons/rx';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Text from '@/elements/Text';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  ADD_BANNED_KEYWORDS_FOR_CAMPFIRE_POST_BODY_OR_TITLE,
  ADD_BLOCKED_DOMAINS,
  DELETE_CAMPFIRE_BANNED_WORDS,
  DELETE_CAMPFIRE_BLOCKED_DOMAINS,
  FETCH_BANNED_DOMAINS,
  FETCH_BANNED_WORDS,
  FETCH_CONTENT_CONTROL_DATA,
  FETCH_CURRENT_CONTENT_CONTROL_SETTING,
  TOGGLE_BANNED_DOMAINS_IN_POST_BODY,
  TOGGLE_BANNED_KEYWORDS_IN_POST_BODY,
  TOGGLE_BANNED_KEYWORDS_IN_POST_TITLE,
  UPDATE_CONTENT_CONTROLS,
} from '@/service/graphql/Campfire';
import { getUserId, selectGetToken } from '@/state/Slices/auth';
import { getBannedData, setBannedData } from '@/state/Slices/campfire';

type ToggleType = 'title' | 'body' | 'domains';

interface IContentControl {
  campfireId: string;
}

interface BannedWord {
  id: string;
  word: string;
}

interface BannedDomain {
  id: string;
  domain: string;
}

interface BannedWordsState {
  title: BannedWord[];
  body: BannedWord[];
  domains: BannedWord[];
}

const useFetchBannedWordsAndDomains = (
  campfireId: string,
  token: string,
  dispatch: (action: { type: string; payload: unknown }) => void,
  bannedData: {
    bannedTitleWords: BannedWord[];
    bannedBodyWords: BannedWord[];
    bannedDomains: BannedDomain[];
  },
) => {
  const [bannedWords, setBannedWords] = useState<BannedWordsState>({
    title: [],
    body: [],
    domains: [],
  });
  const [loading, setLoading] = useState(true);

  const { refetch: refetchTitleBannedWords, data: titleBannedWordsData } =
    useQuery(FETCH_BANNED_WORDS, {
      context: { headers: { Authorization: `Bearer ${token}` } },
      fetchPolicy: 'no-cache',
      variables: { campfireId, postPart: 'title' },
      skip: !token,
    });

  // Handle title banned words completion
  useEffect(() => {
    if ((titleBannedWordsData as any)?.campfire_banned_words) {
      const titleWords =
        (titleBannedWordsData as any)?.campfire_banned_words.map(
          (item: { id: string; word: string }) => ({
            id: item.id,
            word: item.word,
          }),
        ) || [];

      setBannedWords((prev) => ({
        ...prev,
        title: titleWords,
      }));

      // Update Redux store with fresh title words
      dispatch(
        setBannedData({
          ...bannedData,
          bannedTitleWords: titleWords,
        }),
      );

      setLoading(false);
    }
  }, [titleBannedWordsData, dispatch]);

  const { refetch: refetchBodyBannedWords, data: bodyBannedWordsData } =
    useQuery(FETCH_BANNED_WORDS, {
      context: { headers: { Authorization: `Bearer ${token}` } },
      fetchPolicy: 'no-cache',
      variables: { campfireId, postPart: 'body' },
      skip: !token,
    });

  // Handle body banned words completion
  useEffect(() => {
    if ((bodyBannedWordsData as any)?.campfire_banned_words) {
      const bodyWords =
        (bodyBannedWordsData as any)?.campfire_banned_words.map(
          (item: { id: string; word: string }) => ({
            id: item.id,
            word: item.word,
          }),
        ) || [];

      setBannedWords((prev) => ({
        ...prev,
        body: bodyWords,
      }));

      // Update Redux store with fresh body words
      dispatch(
        setBannedData({
          ...bannedData,
          bannedBodyWords: bodyWords,
        }),
      );

      setLoading(false);
    }
  }, [bodyBannedWordsData, dispatch]);

  const { refetch: refetchBannedDomains, data: bannedDomainsData } = useQuery(
    FETCH_BANNED_DOMAINS,
    {
      context: { headers: { Authorization: `Bearer ${token}` } },
      fetchPolicy: 'no-cache',
      variables: { campfireId },
      skip: !token,
    },
  );

  // Handle banned domains completion
  useEffect(() => {
    if ((bannedDomainsData as any)?.campfire_blocked_domains) {
      const domains =
        (bannedDomainsData as any)?.campfire_blocked_domains.map(
          (item: { id: string; domain: string }) => ({
            id: item.id,
            word: item.domain,
          }),
        ) || [];

      setBannedWords((prev) => ({
        ...prev,
        domains: domains,
      }));

      // Update Redux store with fresh domains
      dispatch(
        setBannedData({
          ...bannedData,
          bannedDomains:
            (bannedDomainsData as any)?.campfire_blocked_domains || [],
        }),
      );

      setLoading(false);
    }
  }, [bannedDomainsData, dispatch]);

  const updateBannedWords = (
    newBannedWords: (prev: BannedWordsState) => BannedWordsState,
  ) => {
    setBannedWords(newBannedWords);
  };

  return {
    bannedWords,
    loading,
    updateBannedWords,
    refetchTitleBannedWords,
    refetchBodyBannedWords,
    refetchBannedDomains,
  };
};

export default function ContentControl({ campfireId }: IContentControl) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectGetToken);
  const userId = useAppSelector(getUserId);
  const isMobile = useIsMobile();
  const bannedData = useAppSelector(getBannedData);
  const [inputs, setInputs] = useState({ title: '', body: '', domains: '' });
  const [toggleBannedTitle, setToggleBannedTitle] = useState<boolean>(false);
  const [toggleBannedBody, setToggleBannedBody] = useState<boolean>(false);
  const [toggleBannedDomain, setToggleBannedDomain] = useState<boolean>(false);
  const contentControlOptions = ['optional', 'mandatory', 'not_allowed'];
  const [currentContentControl, setCurrentContentControl] =
    useState('optional');

  const {
    bannedWords,
    loading,
    updateBannedWords,
    refetchTitleBannedWords,
    refetchBodyBannedWords,
    refetchBannedDomains,
  } = useFetchBannedWordsAndDomains(campfireId, token, dispatch, bannedData);

  const { data: contentControlData } = useQuery(FETCH_CONTENT_CONTROL_DATA, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    fetchPolicy: 'no-cache',
    variables: {
      id: campfireId,
    },
    skip: token === '',
  });

  // Handle content control data completion
  useEffect(() => {
    if ((contentControlData as any)?.campfires_by_pk) {
      setToggleBannedTitle(
        (contentControlData as any)?.campfires_by_pk?.iswordsbaninposttitle,
      );
      setToggleBannedBody(
        (contentControlData as any)?.campfires_by_pk?.iswordsbaninpostbody,
      );
      setToggleBannedDomain(
        (contentControlData as any)?.campfires_by_pk?.isDomainBanned,
      );
    }
  }, [contentControlData]);

  const { data: currentContentControlData } = useQuery(
    FETCH_CURRENT_CONTENT_CONTROL_SETTING,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      variables: {
        id: campfireId,
      },
    },
  );

  // Handle current content control setting completion
  useEffect(() => {
    if ((currentContentControlData as any)?.campfires?.length) {
      setCurrentContentControl(
        (currentContentControlData as any)?.campfires[0]?.content_controls,
      );
    }
  }, [currentContentControlData]);

  const [toggleBannedWordsInTitle] = useMutation(
    TOGGLE_BANNED_KEYWORDS_IN_POST_TITLE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        setToggleBannedTitle(
          (response as any)?.update_campfires_by_pk?.iswordsbaninposttitle,
        );
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [toggleBannedWordsInBody] = useMutation(
    TOGGLE_BANNED_KEYWORDS_IN_POST_BODY,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        setToggleBannedBody(
          (response as any)?.update_campfires_by_pk?.iswordsbaninpostbody,
        );
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [updateContentControlSetting] = useMutation(UPDATE_CONTENT_CONTROLS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (response) => {
      if ((response as any)?.update_campfires_by_pk) {
        setCurrentContentControl(
          (response as any)?.update_campfires_by_pk?.content_controls,
        );
      }
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [toggleBannedWordsInDomain] = useMutation(
    TOGGLE_BANNED_DOMAINS_IN_POST_BODY,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: (response) => {
        setToggleBannedDomain(
          (response as any)?.update_campfires_by_pk?.isDomainBanned,
        );
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [addBannedKeywordsForCampfirePostBodyOrTitle] = useMutation(
    ADD_BANNED_KEYWORDS_FOR_CAMPFIRE_POST_BODY_OR_TITLE,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [addBlockedDomains] = useMutation(ADD_BLOCKED_DOMAINS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onError: (err) => {
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const [deleteCampfireBannedWords] = useMutation(
    DELETE_CAMPFIRE_BANNED_WORDS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [deleteCampfireBlockedDomains] = useMutation(
    DELETE_CAMPFIRE_BLOCKED_DOMAINS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleToggleBannedTitle = () => {
    toggleBannedWordsInTitle({
      variables: {
        id: campfireId,
        iswordsbaninposttitle: !toggleBannedTitle,
      },
    });
  };

  const handleToggleBannedBody = () => {
    toggleBannedWordsInBody({
      variables: {
        id: campfireId,
        iswordsbaninpostbody: !toggleBannedBody,
      },
    });
  };

  const handleToggleBannedDomain = () => {
    toggleBannedWordsInDomain({
      variables: {
        id: campfireId,
        isDomainBanned: !toggleBannedDomain,
      },
    });
  };

  const handleInputChange = (type: ToggleType, value: string) => {
    setInputs((prev) => ({ ...prev, [type]: value }));
  };

  const handleKeyPress = (
    type: ToggleType,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newWord = inputs[type].trim();

      const currentBannedWords = bannedWords[type] as BannedWord[];

      const objects = [
        {
          word: newWord,
          post_part: type,
          campfire_id: campfireId,
          user_id: userId,
        },
      ];

      const variables = {
        objects,
      };

      if (newWord && !currentBannedWords.some((w) => w.word === newWord)) {
        addBannedKeywordsForCampfirePostBodyOrTitle({
          variables,
          onCompleted: () => {
            setInputs((prev) => ({ ...prev, [type]: '' }));
            if (type === 'title') {
              refetchTitleBannedWords();
            } else {
              refetchBodyBannedWords();
            }
          },
        });
      }
    }
  };

  const handleDomainKeyPress = (
    type: ToggleType,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newDomain = inputs[type].trim();

      const currentBannedDomains = bannedWords[type] as BannedWord[];

      const objects = [
        {
          campfire_id: campfireId,
          domain: newDomain,
        },
      ];

      const variables = {
        objects,
      };

      if (
        newDomain &&
        !currentBannedDomains.some((w) => w.word === newDomain)
      ) {
        addBlockedDomains({
          variables,
          onCompleted: () => {
            setInputs((prev) => ({ ...prev, [type]: '' }));
            refetchBannedDomains();
          },
        });
      }
    }
  };

  const handleDeleteWord = async (type: ToggleType, id: string) => {
    try {
      updateBannedWords((prev: BannedWordsState) => ({
        ...prev,
        [type]: prev[type].filter((w) => w.id !== id),
      }));

      if (type == 'title' || type == 'body') {
        await deleteCampfireBannedWords({
          variables: {
            ids: [id],
          },
        });
        if (type === 'title') {
          refetchTitleBannedWords();
        } else {
          refetchBodyBannedWords();
        }
      } else {
        await deleteCampfireBlockedDomains({
          variables: {
            ids: [id],
          },
        });
        refetchBannedDomains();
      }
    } catch (deleteWordError) {
      emitErrorNotification(formatGraphqlError(deleteWordError));
    }
  };

  if (loading) {
    return (
      <div>
        <TabletLoader />
      </div>
    );
  }

  const handleCheckboxChange = (index: number) => {
    updateContentControlSetting({
      variables: {
        id: campfireId,
        contentControls: contentControlOptions[index],
      },
    });
  };

  return (
    <div>
      <Text size="md" color="text-black" font="font-semibold">
        Content Control
      </Text>
      <Text size="3xl" color="text-gray-1900">
        Set requirements and restrictions for how people post and comment in
        your Campfire
      </Text>

      <div>
        <div className="mt-6 flex justify-between">
          <div>
            <Text size="3xl" color="text-black-500">
              Ban certain words or phrases from post title
            </Text>
            <Text size="xs" color="text-gray-1900">
              Post with these words can’t be published as a title.
            </Text>
          </div>
          <label className="mx-2 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={toggleBannedTitle}
              onChange={() => {
                handleToggleBannedTitle();
              }}
            />
            <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>
        {toggleBannedTitle && (
          <div className="mt-6 h-full flex-grow rounded-lg border border-primary p-2">
            <Text size="xs" color="text-black-1300">
              Add banned words
            </Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {bannedWords.title.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center space-x-2 rounded-full border border-primary bg-white px-3 text-primary"
                >
                  <Text size="sm" font="font-semibold">
                    {word.word}
                  </Text>
                  <RxCross1
                    onClick={() => handleDeleteWord('title', word.id)}
                    size={10}
                    className="font-semibold"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={inputs.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onKeyDown={(e) => handleKeyPress('title', e)}
              className="mt-2 w-full border border-gray-300 p-2"
              autoFocus
            />
          </div>
        )}
      </div>

      <div>
        <div className="mt-6 flex justify-between">
          <div>
            <Text size="3xl" color="text-black-500">
              Ban certain words or phrases from post body
            </Text>
            <Text size="xs" color="text-gray-1900">
              Post with these words can’t be published as a body.
            </Text>
          </div>
          <label className="mx-2 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={toggleBannedBody}
              onChange={() => {
                handleToggleBannedBody();
              }}
            />
            <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>
        {toggleBannedBody && (
          <div className="mt-6 h-full flex-grow rounded-lg border border-primary p-2">
            <Text size="xs" color="text-black-1300">
              Add banned words
            </Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {bannedWords.body.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center space-x-2 rounded-full border border-primary bg-white px-3 text-primary"
                >
                  <Text size="sm" font="font-semibold">
                    {word.word}
                  </Text>
                  <RxCross1
                    onClick={() => handleDeleteWord('body', word.id)}
                    size={10}
                    className="font-semibold"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={inputs.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              onKeyDown={(e) => handleKeyPress('body', e)}
              className="mt-2 w-full border border-gray-300 p-2"
            />
          </div>
        )}
      </div>

      <div>
        <div className="mt-6 flex justify-between">
          <div>
            <Text size="3xl" color="text-black-500">
              Blocked domains
            </Text>
            <Text size="xs" color="text-gray-1900">
              Posts with links of blocked domains can’t be submitted.
            </Text>
          </div>
          <label className="mx-2 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={toggleBannedDomain}
              onChange={() => {
                handleToggleBannedDomain();
              }}
            />
            <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>
        {toggleBannedDomain && (
          <div className="mt-6 h-full flex-grow rounded-lg border border-primary p-2">
            <Text size="xs" color="text-black-1300">
              Block posts with these link
            </Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {bannedWords.domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center space-x-2 rounded-full border border-primary bg-white px-3 text-primary"
                >
                  <Text size="sm" font="font-semibold">
                    {domain.word}
                  </Text>
                  <RxCross1
                    onClick={() => handleDeleteWord('domains', domain.id)}
                    size={10}
                    className="font-semibold"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={inputs.domains}
              onChange={(e) => handleInputChange('domains', e.target.value)}
              onKeyDown={(e) => handleDomainKeyPress('domains', e)}
              className="mt-2 w-full border border-gray-300 p-2"
            />
          </div>
        )}
      </div>

      <div className="mt-6 w-full ">
        <Text size="3xl" font="font-regular">
          Body text of a question
        </Text>
        <Text size="xs">Allow posts to have body text</Text>
        <div>
          <div
            className={`${isMobile ? 'min-h-6 max-h-15' : 'mt-2 h-6'} block `}
          >
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={currentContentControl === contentControlOptions[0]}
                onChange={() => handleCheckboxChange(0)}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />

              <span className="ml-2 text-sm">
                Text body is optional for all post types
              </span>
            </label>
          </div>
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={currentContentControl === contentControlOptions[1]}
                onChange={() => handleCheckboxChange(1)}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />

              <span className="ml-2 text-sm">
                Text body is required for every posts
              </span>
            </label>
          </div>
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={currentContentControl === contentControlOptions[2]}
                onChange={() => handleCheckboxChange(2)}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />

              <span className="ml-2 text-sm">Text body is not allowed</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
