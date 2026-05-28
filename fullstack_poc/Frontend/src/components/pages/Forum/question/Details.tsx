import { trim } from 'lodash';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@/components/Utility/Button';
import ProgressBar from '@/components/Utility/ProgressBar';
import RadioButton from '@/components/Utility/RadioButton';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import useContentControl from '@/Hooks/useContentControl';
import validations from '@/lib/validations';
import { questionSubmitDetailsType } from '@/types/question';
import Link from 'next/link';
import ApiClient from '@/service/graphql/apiClient';
import UPLOAD_FILE_MUTATION from '@/service/graphql/uploadFile';
import { getUserToken } from '@/utils/verifyAuthentication';
import { toast } from 'react-toastify';
import { removeS3DomainFromImageUrl, validateImageUrl } from '@/lib/helpers';

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

interface DetailsProps {
  nextStep: () => void;
  setQuestionSubmitDetails: Dispatch<SetStateAction<questionSubmitDetailsType>>;
  questionSubmitDetails: questionSubmitDetailsType;
  handleSubmit: () => void;
  isCampfire: boolean;
  campfireId?: string;
  bannedbodyData?: BannedData;
  bannedDomainData?: BannedData;
  currentContentControl?: string;
  loading?: boolean;
}

function Details({
  nextStep,
  setQuestionSubmitDetails,
  questionSubmitDetails,
  handleSubmit,
  isCampfire,
  campfireId,
  bannedbodyData,
  bannedDomainData,
  currentContentControl,
  loading,
}: DetailsProps) {
  const [title, setTitle] = useState(questionSubmitDetails.title);
  const [descriptionError, setDescriptionError] = useState('');
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);
  const [description, setDescription] = useState(
    questionSubmitDetails.description,
  );
  const [mediaLink, setMediaLink] = useState(questionSubmitDetails.media_link);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    name: string;
    visibility: string;
  } | null>(null);
  const contentControlOptions = ['optional', 'mandatory', 'not_allowed'];
  const { matchesAnyBannedWord } = useContentControl();
  const [isContentError, setIsContentError] = useState(false);
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // bytes

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setIsContentError(false);

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.warn('Only JPEG and PNG images are allowed');
        event.target.value = '';
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.warn(`File size should not exceed ${MAX_FILE_SIZE_MB}MB`);
        event.target.value = '';
        return;
      }

      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        setIsUploading(true);
        setUploadProgress(0);

        // Read file as base64 for moderation
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];

          // Call moderation API
          try {
            const res = await fetch('/api/moderate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: base64 }),
            });
            const result = await res.json();

            if (result?.allowed) {
              const token = getUserToken();

              const response: any = await ApiClient.getClient().mutate({
                mutation: UPLOAD_FILE_MUTATION,
                variables: {
                  path: 'join-us-files',
                  fileName: file?.name,
                  fileType: file?.type,
                },
                context: token
                  ? { headers: { Authorization: `Bearer ${token}` } }
                  : {},
              });

              const CDN = process.env.NEXT_PUBLIC_AWS_S3_CDN_BASE_URL || '';
              const S3_BASE = process.env.NEXT_PUBLIC_AWS_S3_BASE_URL || '';
              const S3_REGION =
                process.env.NEXT_PUBLIC_AWS_S3_BASE_URL_WITH_REGION || '';

              const signedUrl: string | undefined =
                response?.data?.uploadFile?.signedUrl;
              const finalPath: string | undefined = response?.data?.uploadFile
                ?.finalPath
                ? removeS3DomainFromImageUrl(
                  response?.data?.uploadFile?.finalPath,
                )
                : undefined;

              if (!signedUrl || !finalPath) {
                throw new Error('Upload URL not returned');
              }

              // Upload to S3 using signed URL (real PUT) and show progress
              await axios.put(signedUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                  if (progressEvent.total) {
                    const percent = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    setUploadProgress(percent);
                    setIsUploading(false);
                    setUploadProgress(0);
                  }
                },
              });

              // set preview and save final public path (finalPath)
              const fileURL = URL.createObjectURL(file);
              setUploadedImage({
                url: fileURL,
                name: file.name,
                visibility: 'public',
              });
              setMediaLink(finalPath);
              setQuestionSubmitDetails((prevState) => ({
                ...prevState,
                title,
                description,
                media_link: finalPath,
              }));
            } else {
              setIsUploading(false);
              setUploadProgress(0);
              setIsContentError(true);
            }
          } catch (error) {
            setIsUploading(false);
            setUploadProgress(0);
            setIsContentError(true);
          }
        };
      } else {
        alert('Please select an image file');
      }
    }
  };

  const handleVisibilityChange = (visibility: string) => {
    if (uploadedImage) {
      setUploadedImage({
        ...uploadedImage,
        visibility,
      });
    }
  };

  const handlePublicClick = () => handleVisibilityChange('public');
  const handleFollowersClick = () => handleVisibilityChange('followers');

  const removeImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url);
      setUploadedImage(null);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  };

  function handleNext() {
    if (validations.minWordsOrChars(title, true)) {
      if (isCampfire) {
        handleSubmit();
      } else {
        nextStep();
      }
    }
  }

  const handleDescriptionChange = (name: string) => {
    let input = trim(name); // remove extra spaces at the end
    const words = input.split(/\s+/); // split the input by space to count words
    if (words.length > 500) {
      input = words.slice(0, 500).join(' ');
      return;
    } else {
      setDescription(name);
      setQuestionSubmitDetails((prevState) => ({
        ...prevState,
        description: name,
      }));
    }
  };

  // useEffect(() => {
  //   setTitle(questionSubmitDetails.title);
  // }, [questionSubmitDetails.title]);

  useEffect(() => {
    if (description && isCampfire) {
      let bannedWords: string[] = [];
      let bannedDomains: string[] = [];

      if (bannedbodyData?.campfire_banned_words?.length) {
        bannedWords = bannedbodyData.campfire_banned_words.map(
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
    isCampfire,
    bannedbodyData?.campfire_banned_words,
    bannedDomainData?.campfire_blocked_domains,
    matchesAnyBannedWord,
  ]);

  return (
    <div className="ask-question-modal-body">
      <div className="">
        <Label title="Title" />
        <div className="mt-2 mb-6">
          <TagInput
            placeholder="Title"
            required="required"
            type="text"
            name="title"
            value={title}
            disabled
            dark
            singleLine
            setHasInvalidHashtag={setHasInvalidHashtag}
          />
        </div>
      </div>
      {currentContentControl !== contentControlOptions[2] ? (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label title="Description" />
              <Text size="sm" color="text-gray-500">
                {currentContentControl === contentControlOptions[0]
                  ? '(Optional)'
                  : null}
              </Text>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="file"
                id="file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div
                className={`flex items-center gap-1 uploadi-file-btn ${uploadedImage ? 'disabled' : ''} active`}
                onClick={triggerFileInput}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="hover:stroke-primary"
                >
                  <path
                    d="M8.58333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V12.5L14.9167 9.91667C14.6031 9.60931 14.1809 9.43813 13.7418 9.44032C13.3027 9.4425 12.8822 9.61788 12.5717 9.92833L5 17.5"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.6665 16.25L14.1665 13.75L16.6665 16.25"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.1665 18.3333V13.75"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.50016 9.16665C8.42064 9.16665 9.16683 8.42045 9.16683 7.49998C9.16683 6.57951 8.42064 5.83331 7.50016 5.83331C6.57969 5.83331 5.8335 6.57951 5.8335 7.49998C5.8335 8.42045 6.57969 9.16665 7.50016 9.16665Z"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm label">Upload Image</span>
              </div>
            </div>
          </div>
          <div className="mt-2 question-description">
            <TagInput
              placeholder={
                currentContentControl === contentControlOptions[0]
                  ? 'Optional'
                  : 'Enter Description'
              }
              value={description}
              onChange={handleDescriptionChange}
              setHasInvalidHashtag={setHasInvalidHashtag}
              multiLine
              className="text-area"
              mentionCampfireId={campfireId || undefined}
              restrictMentionsToCampfire={Boolean(campfireId)}
            />
            <div className="flex justify-between mt-1 items-end">
              {/* image uploading progress */}
              {isUploading && (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex gap-3 items-center flex-1">
                    <div className="w-38">
                      <ProgressBar width={`${uploadProgress}%`} />
                    </div>
                    <span className="text-xs text-gray-500">
                      Uploading... {uploadProgress}%
                    </span>
                  </div>
                </div>
              )}

              {uploadedImage && !isUploading && (
                <div className="lg:flex items-end gap-3 w-full justify-between">
                  <div className="flex items-end gap-3 lg:mb-0 mb-3">
                    <div className="relative">
                      <Image
                        src={validateImageUrl(uploadedImage.url)}
                        unoptimized
                        alt="Uploaded"
                        width={60}
                        height={60}
                        className="rounded object-cover h-15 w-15"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 ">
                      {uploadedImage.name}
                    </span>
                  </div>

                  <div className="flex gap-3 items-center lg:justify-end ">
                    <RadioButton
                      id="btn_public"
                      name="fileOption"
                      label="Public"
                      checked={uploadedImage.visibility === 'public'}
                    />
                    <RadioButton
                      id="btn_followers"
                      name="fileOption"
                      label="Followers"
                      checked={uploadedImage.visibility === 'followers'}
                    />
                  </div>
                </div>
              )}

              {!isUploading && !uploadedImage && (
                <div className="w-full">
                  {/* Empty state - no image uploaded */}
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full justify-between items-center">
            <div>
              <Text size="xs" color="text-error">
                {descriptionError}
              </Text>
              {hasInvalidHashtag && (
                <Text size="xs" color="text-error">
                  This hashtag is disabled.
                </Text>
              )}
              <span className="text-xs text-gray-500">
                @ tag people to your post
              </span>
            </div>
            <div className="text-right">

              <Text size="xs" color="text-gray-700">
                Max {description.trim().split(/\s+/).filter(Boolean).length}/500
                words
              </Text>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 h-48" />
      )}
      {isContentError && (
        <div className="flex align-items-center gap-1">
          <p className="pt-1 text-xs text-error">
            Inappropriate content detected
          </p>
          <Link
            href="/content-policy"
            target="_blank"
            className="text-xs font-medium text-blue-400 pt-1 text-decoration-underline"
          >
            Learn more...
          </Link>
        </div>
      )}
      <div className="relative z-1 mt-6">
        <Button
          type="primary"
          block
          isLoading={loading}
          isdisabled={
            !(
              validations.minWordsOrChars(title, true) &&
              descriptionError === ''
            ) ||
            (currentContentControl === contentControlOptions[1] &&
              !validations.minWordsOrChars(description, true, 1)) ||
            hasInvalidHashtag
          }
          onClick={handleNext}
        >
          {isCampfire ? 'Submit' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
export default Details;
