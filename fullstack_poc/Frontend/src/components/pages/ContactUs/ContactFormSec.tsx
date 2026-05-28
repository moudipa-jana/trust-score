import { useMutation } from '@apollo/client/react';
import { Field, Formik, FormikProps } from 'formik';
import capitalize from 'lodash/capitalize';
import React, { useState } from 'react';

import ContactDropDown from '@/components/pages/ContactUs/ContactDropDown';
import FormSelect from '@/components/pages/ContactUs/FromSelect';
import Button from '@/components/Utility/Button';
import FormInputSecondary from '@/components/Utility/FormInputSecondary';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import Text from '@/elements/Text';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { UPDATE_CONTACT_MUTATION } from '@/service/graphql/contact';
import { getUserId } from '@/state/Slices/auth';
import { validateForm } from '@/utils/verifyContact';

interface FormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  city: string;
  zipCode: string;
  description: string;
}

export default function ContactFormSec() {
  const userId = useAppSelector(getUserId);
  const [toggleSuccess, setToggleSuccess] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedReasonId, setSelectedReasonId] = useState('');

  const [insertContact] = useMutation(UPDATE_CONTACT_MUTATION);
  function onSubmit(values: FormValues, helpers: { resetForm: () => void }) {
    insertContact({
      variables: {
        ...values,
        userId: userId,
        reasonId: selectedReasonId,
      },
      onCompleted() {
        setToggleSuccess(true);
        helpers.resetForm();
        setSelectedReasonId('');
        setSelectedReason('');
      },
      onError: (err) => {
        emitErrorNotification(formatGraphqlError(err));
      },
    });
  }

  const handleReasonReset = () => {
    setSelectedReason('');
    setSelectedReasonId('');
  };

  return (
    <div className="sm-container">
      <Modal
        id="contactSuccess"
        isVisible={toggleSuccess}
        onClose={() => setToggleSuccess(false)}
      >
        <Success
          title="Success"
          autoClose={() => setToggleSuccess(false)}
          isActive
        />
      </Modal>

      <Formik
        initialValues={{
          firstName: '',
          middleName: '',
          lastName: '',
          gender: '',
          email: '',
          countryCode: '+91',
          phoneNumber: '',
          city: '',
          zipCode: '',
          description: '',
        }}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          handleSubmit,
          isSubmitting,
          isValid,
          dirty,
          resetForm,
          values,
          setFieldValue,
        }: FormikProps<FormValues>) => {
          return (
            <>
              {/* Contact DropDown */}
              <ContactDropDown
                selectedReason={selectedReason}
                setSelectedReason={setSelectedReason}
                setSelectedReasonId={setSelectedReasonId}
              />

              <form onSubmit={handleSubmit}>
                <div className=" grid grid-cols-1 gap-6 py-6 xl:grid-cols-3 ">
                  <div className="col-span-3 xl:col-span-1">
                    <Field
                      label="First Name"
                      placeholder="Your first name"
                      required
                      name="firstName"
                      component={FormInputSecondary}
                      type="text"
                      validate={validateForm.name}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3 xl:col-span-1">
                    <Field
                      label="Middle Name"
                      placeholder="Your middle name"
                      name="middleName"
                      component={FormInputSecondary}
                      type="text"
                      validate={validateForm.middleName}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3 xl:col-span-1">
                    <Field
                      label="Last Name"
                      placeholder="Your last name"
                      required
                      name="lastName"
                      component={FormInputSecondary}
                      type="text"
                      validate={validateForm.name}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    />
                  </div>


                  <div className="col-span-3 xl:col-span-1">
                    <Field
                      label="Email Address"
                      required
                      placeholder="Please enter your email"
                      name="email"
                      component={FormInputSecondary}
                      type="email"
                      validate={validateForm.email}
                      className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 xl:col-span-1">
                    <FormSelect
                      label="Gender"
                      options={['Male', 'Female', 'Other']}
                      selectedValue={capitalize(values.gender)}
                      onChange={(value) =>
                        setFieldValue('gender', value.toLowerCase())
                      }
                      required
                    />
                  </div>

                  <div className="col-span-3 flex gap-1 xl:col-span-1">
                    <div className="flex w-[65px] flex-col gap-1">
                      <label className="font-display text-base font-semibold leading-6 text-black-200">
                        Code
                      </label>
                      <select
                        disabled
                        name="countryCode"
                        className="w-full appearance-none rounded border border-gray-600 px-3 py-2 font-display text-base leading-6 placeholder:text-gray-950 "
                      >
                        <option>+91</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <Field
                        label="Contact Number"
                        required
                        maxLength={10}
                        placeholder="Type your contact number"
                        name="phoneNumber"
                        component={FormInputSecondary}
                        type="tel"
                        validate={validateForm.phoneNumber}
                        onInput={(e: { target: { value: string } }) =>
                          (e.target.value = e.target.value.replace(/\D/g, ''))
                        }
                        className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-3 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div>
                      <div className="flex">
                        <label className="mb-1 text-base font-semibold leading-6 text-black-200">
                          City/Town
                        </label>
                        <div className="ml-1">
                          <Text size="sm" color="text-gray-950">
                            (Optional)
                          </Text>
                        </div>
                      </div>
                      <Field
                        placeholder="Please enter your city"
                        name="city"
                        component={FormInputSecondary}
                        type="text"
                        className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex">
                        <label className="mb-1 text-base font-semibold leading-6 text-black-200">
                          Pin Code
                        </label>
                        <div className="ml-1">
                          <Text size="sm" color="text-gray-950">
                            (Optional)
                          </Text>
                        </div>
                      </div>
                      <Field
                        placeholder="Please enter your pin code"
                        name="zipCode"
                        component={FormInputSecondary}
                        validate={validateForm.zipCode}
                        type="text"
                        className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Field
                    label="Description"
                    placeholder="Description"
                    name="description"
                    component={FormInputSecondary}
                    type="text"
                    required
                    validate={validateForm.text}
                    className="block w-full rounded-sm border border-gray-600 bg-white p-2.5 text-sm text-black-200 placeholder-gray-700 focus:outline-none"
                  />
                </div>

                <div className="twoBtnsXs flex items-center justify-end space-x-3 pt-6 pb-12">
                  <Button
                    type="outline"
                    size="lg"
                    legacyType="reset"
                    isLoading={false}
                    onClick={() => {
                      resetForm();
                      handleReasonReset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    legacyType="submit"
                    isLoading={false}
                    isdisabled={
                      isSubmitting ||
                      !isValid ||
                      !dirty ||
                      !selectedReason ||
                      !values.gender
                    }
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </>
          );
        }}
      </Formik>
    </div>
  );
}
