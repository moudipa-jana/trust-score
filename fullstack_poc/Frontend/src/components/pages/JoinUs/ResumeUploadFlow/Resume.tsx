import axios from 'axios';
import { Field, Formik, FormikProps } from 'formik';
import { trim } from 'lodash';
import React, { Dispatch, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlinePlus } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';

import Button from '@/components/Utility/Button';
import FormInput from '@/components/Utility/FormInput';
import TagInput from '@/components/Utility/TagInput';
import Label from '@/elements/Label';
import Text from '@/elements/Text';
import {
  bytesToMb,
  emitErrorNotification,
  emitNotification,
  getWordCount,
  removeS3DomainFromImageUrl,
} from '@/lib/helpers';
import ApiClient from '@/service/graphql/apiClient';
import { JOIN_US_FILE_UPLOAD_MUTATION } from '@/service/graphql/joinUs';
import UPLOAD_FILE_MUTATION from '@/service/graphql/uploadFile';
import { getUserToken } from '@/utils/verifyAuthentication';
import { validateForm } from '@/utils/verifyAuthForm';
import onReCAPTCHAChange from '@/utils/verifyCaptcha';

const MAX_FILE_SIZE_BYTES = 2000000;

interface ResumeProps {
  setResumeSteps: Dispatch<React.SetStateAction<number>>;
  role: string;
  department: string;
  location: string;
  employmentType: string;
}

interface FormData {
  email: string;
}

export default function Resume({
  setResumeSteps,
  role,
  department,
  location,
  employmentType,
}: ResumeProps) {
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const recaptchaRef = useRef<any>(null);
  const [recaptchaToken, setrecaptchaToken] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [hasInvalidHashtag, setHasInvalidHashtag] = useState(false);

  async function submitApplication({ email }: FormData): Promise<void> {
    const fileType = fileObject?.type;
    const fileNameVal = fileObject?.name;
    const token = getUserToken();
    const config = {
      headers: {
        'Content-Type': fileType,
      },
    };

    try {
      const response: any = await ApiClient.getClient().mutate({
        mutation: UPLOAD_FILE_MUTATION,
        variables: { path: 'join-us-files', fileName, fileType },
        context: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      });

      const signedUrl: string = response.data.uploadFile.signedUrl;
      const cvLink: string = response?.data?.uploadFile?.finalPath
        ? removeS3DomainFromImageUrl(response?.data?.uploadFile?.finalPath)
        : '';
      if (signedUrl) {
        try {
          await axios.put(signedUrl, fileObject, config);

          await ApiClient.getClient().mutate({
            mutation: JOIN_US_FILE_UPLOAD_MUTATION,
            variables: {
              email,
              fileName: fileNameVal,
              fileType,
              role,
              coverLetter,
              department: department || null,
              location: location || null,
              employment: employmentType || null,
              cvLink,
            },
            context: token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : {},
          });
          emitNotification('success', 'Your application was submitted');
          setResumeSteps((prev: number) => prev + 1);
          return;
        } catch (err) {
          emitErrorNotification();
        }
      }
    } catch (error) {
      emitErrorNotification();
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files?.[0];
    setFileName(fileObj?.name ?? '');

    if (!fileObj) {
      return;
    }

    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedFileTypes.includes(fileObj.type)) {
      event.target.value = '';
      setFileObject(null);
      emitNotification(
        'error',
        'Invalid file type. Please upload a .doc or .pdf file.',
      );
      return;
    }

    if (fileObj.size > MAX_FILE_SIZE_BYTES) {
      event.target.value = '';
      setFileObject(null);
      emitNotification(
        'error',
        `File is too large, file size is ${bytesToMb(fileObj.size).toFixed(
          2,
        )} MB, maximum allowed size - 2 MB.`,
      );
      setFileName('');
      return;
    }

    setFileObject(fileObj);
  };

  const handleDescriptionChange = (name: string) => {
    let input = trim(name);
    const words = input.split(/\s+/);
    if (words.length > 500) {
      // input = words.slice(0, 500).join(' ');
      // setCoverLetter(input);
      return;
    } else {
      setCoverLetter(name);
    }
  };

  const handleSubmitForm = (values: FormData) => {
    if (!recaptchaToken) {
      emitErrorNotification('Please verify the captcha to proceed!');
    }
    const email = values.email;
    submitApplication({ email });
  };

  const removeAttachedFile = () => {
    setFileObject(null);
    setFileName('');
  };

  return (
    <div>
      <Formik
        initialValues={{ email: '' }}
        validateOnMount
        onSubmit={handleSubmitForm}
      >
        {({ handleSubmit, isValid }: FormikProps<FormData>) => (
          <form onSubmit={handleSubmit}>
            <Field
              label="Email"
              name="email"
              required
              component={FormInput}
              placeholder="Email id"
              type="email"
              validate={validateForm.email}
              className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
            />
            <div>
              <div className="flex items-center">
                <Label title="Cover Letter" />
              </div>
              <div className="mt-0.5">
                <TagInput
                  placeholder="Description"
                  value={coverLetter}
                  onChange={handleDescriptionChange}
                  setHasInvalidHashtag={setHasInvalidHashtag}
                  multiLine
                  fixHt
                />
                <div className="flex w-full items-center justify-between">
                  {hasInvalidHashtag && (
                    <Text size="xs" color="text-error">
                      This hashtag is disabled.
                    </Text>
                  )}
                  <div className="ml-auto">
                    <Text size="xs" color="text-gray-700">
                      {getWordCount(coverLetter)}/500 words max
                    </Text>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${fileName ? 'flex items-center gap-2' : ''}`}>
              <label className="upload-btn">
                <div className=" flex items-center gap-2 text-[12px] lg:text-sm">
                  <span className="">
                    <AiOutlinePlus className="text-sm text-primary lg:text-md" />
                  </span>
                  Add CV
                  <span className="relative -top-1 left-0.5 text-red-500">
                    *
                  </span>
                </div>
                <input
                  type="file"
                  accept=".doc,.pdf,.docx"
                  id="document"
                  name="document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {fileName && (
                <div className="flex cursor-pointer items-center rounded-sm border border-primary bg-white p-2 text-gray-700">
                  {fileName}
                  <div className="ml-4" onClick={removeAttachedFile}>
                    <RxCross2 />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Text size="sm" color="text-gray-1350">
                * Upload your resume as a doc or PDF with a maximum size of 2 MB
              </Text>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                size="normal"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY as string}
                onChange={(captchaToken: string | null) => {
                  onReCAPTCHAChange(
                    captchaToken,
                    recaptchaRef,
                    setrecaptchaToken,
                  );
                }}
              />
            </div>

            <div className="my-6">
              <Button
                type="secondary"
                legacyType="submit"
                block
                isdisabled={
                  !isValid ||
                  !recaptchaToken ||
                  !fileObject ||
                  hasInvalidHashtag
                }
              >
                Continue
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}
