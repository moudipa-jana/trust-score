import { useMutation, useQuery } from '@apollo/client/react';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Checkbox from 'react-custom-checkbox';
import * as Icon from 'react-icons/fi';

import ArrowFillDown from '/public/images/ArrowFillDown.svg';
import Location from '/public/images/Location.svg';
import PrivateCampfire from '/public/images/privateCampfire.svg';
import PublicCampfire from '/public/images/publicCampfire.svg';
import CustomImage from '@/components/Utility/CustomImage';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import TextArea from '@/elements/TextArea';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  normalizeWhitespace,
} from '@/lib/helpers';
import validations from '@/lib/validations';
import {
  ADD_CAMPFIRE_GENERAL_SETTINGS,
  GET_CAMPFIRE_GENERAL_SETTINGS,
  GET_LANGUAGES,
  UPDATE_CAMPFIRE_DETAILS_SETTINGS,
  UPDATE_CAMPFIRE_GENERAL_SETTINGS,
} from '@/service/graphql/Campfire';
import { getUserId } from '@/state/Slices/auth';
import { getUserToken } from '@/utils/verifyAuthentication';

interface ICampfireSettings {
  campfireId: string;
}

interface generalDataType {
  campfire_settings: {
    id: string;
    send_welcome_message: string;
    welcome_message: string;
    language: {
      id: string;
      language: string;
    };
    location: string;
  }[];
  description: string;
  id: string;
  is_public: boolean;
  title: string;
}

export default function GeneralSettings({ campfireId }: ICampfireSettings) {
  const isMobile = useIsMobile();
  const token = getUserToken();
  const userId = useAppSelector(getUserId);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [languageData, setLanguageData] = useState([]);
  const [generalData, setGeneralData] = useState<generalDataType>({
    campfire_settings: [],
    description: '',
    id: '',
    is_public: false,
    title: '',
  });
  const [isCampfireSettingsEmpty, setCampfireSettingsEmpty] =
    useState<boolean>(false);
  const router = useRouter();
  const [welcomeMsg, setWelcomeMsg] = useState('Welcome to the campfire!');
  const [getWelcomeMsg, setGetWelcomeMsg] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState({
    language: 'English',
    id: '6c9dc0d4-d3eb-4468-a142-e3fbcc95229d',
  });
  const [location, setLocation] = useState('');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCheckboxChange = () => {
    setGeneralData({ ...generalData, is_public: !generalData.is_public });
  };

  const { error: languagesError, data: languagesData } = useQuery(
    GET_LANGUAGES,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(() => {
    if ((languagesData as any)?.languages) {
      setLanguageData((languagesData as any).languages);
    }
  }, [languagesData]);

  useEffect(() => {
    if (languagesError) {
      emitErrorNotification(formatGraphqlError(languagesError));
    }
  }, [languagesError]);

  const { error: generalError, data: generalQueryData } = useQuery(
    GET_CAMPFIRE_GENERAL_SETTINGS,
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

  useEffect(() => {
    if ((generalQueryData as any)?.campfires_by_pk) {
      const responseData = (generalQueryData as any).campfires_by_pk;
      setGeneralData(responseData);
      if (isEmpty(responseData?.campfire_settings)) {
        setCampfireSettingsEmpty(true);
      } else {
        if (responseData?.campfire_settings[0]?.language) {
          setSelectedLanguage(responseData?.campfire_settings[0]?.language);
        }
        if (responseData?.campfire_settings[0]?.location) {
          setLocation(responseData?.campfire_settings[0]?.location);
        }
        setGetWelcomeMsg(
          responseData?.campfire_settings[0]?.send_welcome_message,
        );
        if (responseData?.campfire_settings[0]?.welcome_message) {
          setWelcomeMsg(responseData?.campfire_settings[0]?.welcome_message);
        }
        setCampfireSettingsEmpty(false);
      }
    }
  }, [generalQueryData]);

  useEffect(() => {
    if (generalError) {
      emitErrorNotification(formatGraphqlError(generalError));
    }
  }, [generalError]);

  const [addCampfireGeneralSettings] = useMutation(
    ADD_CAMPFIRE_GENERAL_SETTINGS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      onCompleted: () => {
        emitNotification('success', 'Saved successfully!');
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [updateCampfireGeneralSettings] = useMutation(
    UPDATE_CAMPFIRE_GENERAL_SETTINGS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      onCompleted: () => {
        emitNotification('success', 'Saved successfully!');
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const [updateCampfireDetailsSettings] = useMutation(
    UPDATE_CAMPFIRE_DETAILS_SETTINGS,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: 'no-cache',
      onCompleted: () => {
        if (isCampfireSettingsEmpty) {
          addCampfireGeneralSettings({
            variables: {
              send_welcome_message: getWelcomeMsg,
              welcome_message: welcomeMsg,
              language_id: selectedLanguage?.id,
              location: location,
              campfire_id: campfireId,
              user_id: userId,
            },
          });
        } else {
          updateCampfireGeneralSettings({
            variables: {
              id: generalData?.campfire_settings[0]?.id,
              send_welcome_message: getWelcomeMsg,
              welcome_message: welcomeMsg,
              language_id: selectedLanguage?.id,
              location: location,
            },
          });
        }
        router.push(`/campfire/${encodeURIComponent(generalData?.title)}`);
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    },
  );

  const handleSaveChanges = () => {
    updateCampfireDetailsSettings({
      variables: {
        id: generalData.id,
        title: normalizeWhitespace(generalData.title),
        description: normalizeWhitespace(generalData.description),
        is_public: generalData.is_public,
      },
    });
  };

  const isDisabledSaveChanges = isEmpty(generalData?.title);
  const handleDescriptionChange = (name: string) => {
    const trimmedInput = name.trim();
    const inputLength = trimmedInput.length;
    const charCount = validations.getRemainingCharOrWordCount(
      trimmedInput,
      500,
    );
    if (charCount >= 0) {
      if (inputLength === 0) {
        setGeneralData({ ...generalData, description: '' });
      } else if (inputLength > 500) {
        setGeneralData({
          ...generalData,
          description: trimmedInput.slice(0, 500),
        });
      } else {
        setGeneralData({ ...generalData, description: name });
      }
    }
  };

  return (
    <div className="p-2">
      <div className="mb-5 flex flex-row justify-between">
        <Text size="md" customClass='mb-1'>General settings</Text>

        <button
          className={`rounded-full border ${isDisabledSaveChanges
            ? 'border-gray bg-gray-300'
            : 'border-blue-100 bg-sky-400'
            } px-4 py-1 text-white`}
          onClick={handleSaveChanges}
          disabled={isDisabledSaveChanges}
        >
          Save changes
        </button>
      </div>

      {/* CAMPFIRE NAME */}
      <div className="mb-5">
        <Text customClass='mb-1'>Campfire name</Text>
        <Input
          autoFocus
          placeholder="Campfire name"
          required
          disabled
          type="text"
          name="campfireName"
          rounded
          outline
          value={generalData?.title}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => setGeneralData({ ...generalData, title: e.target.value })}
        />
      </div>

      {/* CAMPFIRE DETAILS */}
      <div className="mb-5">
        <Text customClass='mb-1'>Campfire details</Text>
        <TextArea
          placeholder="Why don't you tell everyone what we are cooking here?"
          value={generalData?.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleDescriptionChange(e.target.value)
          }
          style={{
            height: 80,
            borderColor: 'skyBlue',
            borderRadius: 10,
          }}
        />
      </div>

      {/* WELCOME MESSAGE */}
      <div className="mb-5">
        <div className="flex flex-row justify-between">
          <div className="mb-2">
            <Text customClass='mb-1'>Welcome message to a new member</Text>
            <Text size="sm" color="text-gray-500">
              Create a custom welcome message to greet people the instant they
              join your campfire. New campfire members will get a notification.
            </Text>
          </div>

          <label className="mx-2 inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={getWelcomeMsg}
              onChange={() => setGetWelcomeMsg(!getWelcomeMsg)}
            />
            <div className="peer relative h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-skyBlue-200 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>

        <TextArea
          placeholder="Looks like we have a guest! Welcome them to your campfire with a message and BE NICE!"
          value={welcomeMsg}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setWelcomeMsg(e.target.value)
          }
          style={{
            height: 80,
            borderColor: 'skyBlue',
            borderRadius: 10,
          }}
        />
      </div>

      {/* LANGUAGE */}
      <div className="mb-5">
        <Text customClass='mb-1'>Language </Text>

        <div className="w-full bg-gray-100">
          <div>
            <div className="relative z-120 text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex w-full justify-between rounded-md border border-sky-500 bg-white px-4 py-2 text-sm font-medium   focus:outline-none hover:bg-gray-100"
                  id="options-menu"
                  aria-haspopup="true"
                  aria-expanded="true"
                  onClick={toggleDropdown}
                >
                  {selectedLanguage?.language}
                  <span className="mx-2 h-3 w-3">
                    {/* <CustomImage src={ArrowFillDown} /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </button>
              </div>

              {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <div className="py-1" role="none">
                    {languageData.map(
                      (option: { id: string; language: string }) => (
                        <a
                          key={option?.id}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => {
                            setSelectedLanguage(option);
                            setIsOpen(false);
                          }}
                        >
                          {option?.language}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className="mb-5">
        <Text>Location</Text>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
            <div className="mx-2 h-4 w-4">
              <CustomImage src={Location} />
            </div>
          </div>
          <input
            autoFocus
            placeholder=""
            required
            type="text"
            name="campfireDetails"
            className="w-full rounded-md border border-sky-500 py-2 pl-10 outline-none"
            value={location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocation(e.target.value)
            }
          />
        </div>
      </div>

      {/* As discussed with bishal campfire type is not required for now, campfire will be private by default */}
      {/* CAMPFIRE TYPE
      <div className="mt-1 mb-5 w-full">
        <Text font="font-regular">Choose the campfire type</Text>
        <div>
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={generalData?.is_public}
                onChange={handleCheckboxChange}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />

              <div className="mx-2 h-4 w-4">
                <CustomImage src={PublicCampfire} />
              </div>
              <span className="mr-2 text-sm">Public</span>
              <Text size="xs" color="text-gray-500">
                Anyone can view, post, and comment to this community
              </Text>
            </label>
          </div>
          <div className={`${isMobile ? 'min-h-6 max-h-15' : 'h-6'} block `}>
            <label className="inline-flex items-center">
              <Checkbox
                icon={<Icon.FiCheck color="#01B3EC" size={14} />}
                name="my-input"
                checked={!generalData?.is_public}
                onChange={handleCheckboxChange}
                borderColor="#A19EFE"
                style={{ cursor: 'pointer', height: '20px', width: '20px' }}
                labelStyle={{ marginLeft: 5, userSelect: 'none' }}
              />
              <div className="mx-2 h-4 w-4">
                <CustomImage src={PrivateCampfire} />
              </div>
              <span className="mr-2 text-sm">Private</span>
              <Text size="xs" color="text-gray-500">
                Only approved users can view and submit to this community
              </Text>
            </label>
          </div>
        </div>
        <div className="my-2 flex pb-10">
          <Text size="sm" color="text-red-600">
            *
          </Text>
          <Text size="xs" color="text-gray-500">
            any interaction or conversation occurring within a private Campfire
            group will not be accessible outside the given group, the link or
            crossposting of the link elsewhere will not be functional whatsoever
            other than the origin Campfire itself
          </Text>
        </div>
      </div> */}

    </div>
  );
}