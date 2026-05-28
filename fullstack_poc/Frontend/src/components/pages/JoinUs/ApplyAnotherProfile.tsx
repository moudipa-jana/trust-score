import axios from 'axios';
import { Field, Formik } from 'formik';
import Image from 'next/image';
import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

import Button from '@/components/Utility/Button';
import Dropdown, {
  DropdownOptionType,
  DropdownValue,
} from '@/components/Utility/Dropdown';
import FormInput from '@/components/Utility/FormInput';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import {
  DEPARTMENT_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from '@/lib/constants';
import {
  bytesToMb,
  emitErrorNotification,
  emitNotification,
  removeS3DomainFromImageUrl,
} from '@/lib/helpers';
import ApiClient from '@/service/graphql/apiClient';
import { JOIN_US_FILE_UPLOAD_MUTATION } from '@/service/graphql/joinUs';
import UPLOAD_FILE_MUTATION from '@/service/graphql/uploadFile';
import { getUserToken } from '@/utils/verifyAuthentication';
import { validateForm } from '@/utils/verifyAuthForm';

import UploadIcon from '../../../../public/images/upload-icon-gif.gif';

const MAX_FILE_SIZE_BYTES = 2000000;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface ApplyAnotherProfileProps {
  setShowApplyForm: (show: boolean) => void;
}

interface FormValues {
  fullName: string;
  email: string;
  department: string;
  employment: string;
  location: string;
}

interface FormikProps<T> {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isValid: boolean;
  values: T;
  setFieldValue: (field: string, value: DropdownValue) => void;
}

export default function ApplyAnotherProfile({
  setShowApplyForm,
}: ApplyAnotherProfileProps) {
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitApplication(
    values: FormValues,
    resetForm: () => void
  ): Promise<void> {
    setLoading(true);
    const fileType = fileObject?.type;
    const fileNameVal = fileObject?.name;
    const token = getUserToken();
    const config = {
      headers: {
        'Content-Type': fileType,
      },
    };
    let response: any;
    try {
      response = await ApiClient.getClient().mutate({
        mutation: UPLOAD_FILE_MUTATION,
        variables: { path: 'join-us-files', fileName, fileType },
        context: token ? { headers: { Authorization: `Bearer ${token}`, }, } : {},
      });

      const signedUrl: string = response?.data?.uploadFile?.signedUrl;
      const cvLink: string = response?.data?.uploadFile?.finalPath ? removeS3DomainFromImageUrl(response?.data?.uploadFile?.finalPath) : "";
      if (signedUrl) {
        try {
          await axios.put(signedUrl, fileObject, config);

          await ApiClient.getClient().mutate({
            mutation: JOIN_US_FILE_UPLOAD_MUTATION,
            variables: {
              email: values.email,
              fileName: fileNameVal,
              fileType,
              role: null,
              coverLetter: null,
              location: values.location,
              department: values.department,
              employment: values.employment,
              cvLink,
            },
            context: token ? { headers: { Authorization: `Bearer ${token}`, }, } : {},
          });
          emitNotification('success', 'Your application was submitted');
          setShowApplyForm(false);
          resetForm();
          setFileObject(null);
          setFileName('');
          setLoading(false);
          return;

        } catch (err) {
          setLoading(false);
          emitErrorNotification();
        }
      }
    } catch (error) {
      setLoading(false);
      emitErrorNotification();
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files?.[0];
    if (!fileObj) {
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(fileObj.type)) {
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
      setFileName('');
      emitNotification(
        'error',
        `File is too large, file size is ${bytesToMb(fileObj.size).toFixed(
          2,
        )} MB, maximum allowed size - 2 MB.`,
      );
      return;
    }
    setFileName(fileObj?.name ?? '');
    setFileObject(fileObj);
  };

  // const handleSubmitForm = (values: FormValues) => {
  //   submitApplication(values);
  // };
  const handleSubmitForm = (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    submitApplication(values, resetForm);
  };

  const removeAttachedFile = () => {
    setFileObject(null);
    setFileName('');
  };

  return (
    <div className="py-10 lg:px-24">
      <div className="pb-6 text-center lg:mb-10 mb-5">
        <Heading
          priority="2"
          font="font-bold"
          variant="xxl"
          color="text-black-200"
        >
          Send your resume
        </Heading>
        <Text size="base" color="text-black-200">
          If your profile is not listed above, you can submit your resume here
        </Text>
      </div>
      <Formik<FormValues>
        initialValues={{
          fullName: '',
          email: '',
          department: '',
          employment: '',
          location: '',
        }}
        validateOnMount
        onSubmit={handleSubmitForm}
      >
        {(formikProps: FormikProps<FormValues>) => {
          const { handleSubmit, isValid, values, setFieldValue } = formikProps;
          return (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-full  lg:col-span-6 lg:mb-4 mb-0 ">
                  <Field
                    name="fullName"
                    required
                    component={FormInput}
                    placeholder="Enter your full name"
                    type="text"
                    className="block w-full rounded-md border border-gray-600 bg-white lg:p-4 p-2 text-md text-black-200 placeholder-gray-700 focus:outline-none lg:h-14"
                  />
                </div>
                <div className="col-span-full  lg:col-span-6">
                  <Field
                    name="email"
                    required
                    component={FormInput}
                    placeholder="Email id"
                    type="email"
                    validate={validateForm.email}
                    className="block w-full rounded-md border border-gray-600 bg-white lg:p-4 p-2 text-md text-black-200 placeholder-gray-700 focus:outline-none lg:h-14"
                  />
                </div>
                <div className="col-span-full space-y-1 lg:col-span-4 lg:mb-0 mb-2">
                  <div className="cursor-pointer">
                    <Dropdown
                      options={DEPARTMENT_OPTIONS}
                      color="text-black-200 lg:h-14 lg:px-2 lg:py-1 rounded-md border-[#B2B2B2]"
                      onChange={(value) =>
                        setFieldValue(
                          'department',
                          (value as DropdownOptionType).value,
                        )
                      }
                      placeHolder="Product"
                      rounded
                    />
                  </div>
                </div>
                <div className="col-span-full space-y-1 lg:col-span-4 lg:mb-0 mb-2">
                  <div className="cursor-pointer">
                    <Dropdown
                      options={EMPLOYMENT_TYPE_OPTIONS}
                      color="text-black-200 lg:h-14 lg:px-2 lg:py-1 rounded-md border-[#B2B2B2]"
                      onChange={(value) =>
                        setFieldValue(
                          'employment',
                          (value as DropdownOptionType).value,
                        )
                      }
                      placeHolder="Select type"
                      rounded
                    />
                  </div>
                </div>
                <div className="col-span-full space-y-1 lg:col-span-4 lg:mb-0 mb-2">
                  <div className="cursor-pointer">
                    <Dropdown
                      options={LOCATION_OPTIONS}
                      color="text-black-200 lg:h-14 lg:px-2 lg:py-1 rounded-md border-[#B2B2B2]"
                      onChange={(value) =>
                        setFieldValue(
                          'location',
                          (value as DropdownOptionType).value,
                        )
                      }
                      placeHolder="Choose place"
                      rounded
                    />
                  </div>
                </div>
              </div>

              <div
                className={`${fileName ? 'flex items-center gap-2 justify-center ' : 'lg:mt-10 mt-4 justify-center flex'}`}
              >
                {!fileName && (
                  <label className="apply-upload-btn rounded-xl lg:w-[600px] w-full">
                    <div className="flex gap-3 text-base items-center text-primary">
                      Upload Resume{' '}
                      <Image
                        src={UploadIcon}
                        alt="Upload Icon"
                        width={40}
                        height={40}
                      />
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
                )}
                {fileName && (
                  <div className="flex cursor-pointer items-center rounded-lg border border-primary bg-white p-2 text-gray-700 mt-3">
                    {fileName}
                    <div className="ml-4" onClick={removeAttachedFile}>
                      <RxCross2 />
                    </div>
                  </div>
                )}
              </div>
              {fileName && (
                <>
                  <div className="my-6 mx-auto xl:w-[558px]">
                    <Button
                      type="primary"
                      isLoading={loading}
                      legacyType="submit"
                      block
                      isdisabled={
                        !isValid ||
                        !fileObject ||
                        Object.values(values).some((value) => !value)
                      }
                    >
                      Submit
                    </Button>
                  </div>
                </>
              )}
              <div className="mt-4 text-center">
                <Text size="sm" color="text-gray-1350">
                  * Upload your resume as a doc or PDF with a maximum size of
                  2 MB
                </Text>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
