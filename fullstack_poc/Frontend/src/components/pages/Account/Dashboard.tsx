import { useMutation } from '@apollo/client/react';
import { capitalize } from 'lodash';
import React from 'react';

import { postAuthSuccess } from '@/actions/auth';
import Button from '@/components/Utility/Button';
import Dropdown, {
  DropdownOptionType as DropdownOption,
} from '@/components/Utility/Dropdown';
import Heading from '@/elements/Heading';
import Text from '@/elements/Text';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { COUNTRIES_OPTIONS, GENDER_OPTIONS } from '@/lib/constants';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import {
  UPDATE_COUNTRY_MUTATION,
  UPDATE_GENDER_MUTATION,
} from '@/service/graphql/Profile';
import { countryUpdateSuccess, genderUpdateSuccess } from '@/state/Slices/auth';
import { toggleDeleteAccountDialog } from '@/state/Slices/dialog';

const ACCOUNT_OPTIONS: {
  id: number;
  title: string;
  btnText: string;
  subTitle?: string;
  verified?: string;
}[] = [
  {
    id: 1,
    title: 'Email address',
    subTitle: 'healthqueen@gmail.com',
    verified: 'true',
    btnText: 'Change',
  },
  {
    id: 2,
    title: 'Change password',
    subTitle: 'Password must be at least 8 characters',
    verified: 'false',
    btnText: 'Change',
  },
  {
    id: 3,
    title: 'Gender',
    subTitle:
      'This information may be used to improve your recommendations and ads.',
    verified: 'false',
    btnText: 'Male',
  },
  {
    id: 4,
    title: 'Country',
    subTitle: 'This is your primary location',
    btnText: 'Select Country',
  },
  {
    id: 5,
    title: 'Deactivate account',
    subTitle: 'Temporarily hide your account and all your activities',
    btnText: 'Deactivate',
  },
  {
    id: 6,
    title: 'Delete account',
    subTitle: 'Permanently delete your account and all your data',
    btnText: 'Delete',
  },
];

function Dashboard() {
  const dispatch = useAppDispatch();
  const { profile, token } = useAppSelector((state) => ({
    profile: state.auth.profile,
    token: state.auth.token,
  }));
  const [updateGender] = useMutation(UPDATE_GENDER_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (_, clientOptions) => {
      dispatch(genderUpdateSuccess(clientOptions?.variables?.gender));
      dispatch(postAuthSuccess(profile?.id as string, token));
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const [updateCountry] = useMutation(UPDATE_COUNTRY_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: (_, clientOptions) => {
      dispatch(countryUpdateSuccess(clientOptions?.variables?.country));
      dispatch(postAuthSuccess(profile?.id as string, token));
    },
    onError: (err) => emitErrorNotification(formatGraphqlError(err)),
  });

  const handleGenderChange = (data: string) => {
    updateGender({
      variables: {
        userId: profile?.id,
        gender: data,
      },
    });
  };

  const handleCountryChange = (data: string) => {
    updateCountry({
      variables: {
        userId: profile?.id,
        country: data,
      },
    });
  };

  const handleActionClick = () => {
    return dispatch(toggleDeleteAccountDialog(true));
  };

  const handleDeactivateClick = () => {
    return dispatch(
      toggleDeleteAccountDialog({ open: true, actionType: 'deactivate' }),
    );
  };

  const handleDeleteClick = () => {
    return dispatch(
      toggleDeleteAccountDialog({ open: true, actionType: 'delete' }),
    );
  };

  function handleButtonRender(
    index: number,
    data: {
      id: number;
      title: string;
      btnText: string;
      subTitle?: string;
      verified?: string;
    },
  ) {
    if ([0, 1].includes(index)) {
      return (
        <Button
          size="md"
          type="outline"
          link={`${
            index === 0 ? 'account/account-setting' : 'account/change-password'
          }`}
          width="min-w-180"
        >
          {data.btnText}
        </Button>
      );
    }
    if (index === 2) {
      return (
        <Dropdown
          rounded
          placeHolder={
            profile?.gender ? capitalize(profile?.gender) : data.btnText
          }
          options={GENDER_OPTIONS}
          onChange={(e) =>
            handleGenderChange(
              ((e as DropdownOption).value as string).toLowerCase(),
            )
          }
          type="md"
          width="min-w-180 w-24"
          textCenter
        />
      );
    }
    if (index === 3) {
      return (
        <Dropdown
          rounded
          placeHolder={
            profile?.country ? capitalize(profile?.country) : data.btnText
          }
          options={COUNTRIES_OPTIONS}
          onChange={(e) =>
            handleCountryChange(
              ((e as DropdownOption).value as string).toLowerCase(),
            )
          }
          type="md"
          width="min-w-180 w-24"
          textCenter
        />
      );
    }
    if (index === 4) {
      return (
        <Button
          size="md"
          type="outline"
          width="min-w-180"
          onClick={() => handleDeactivateClick()}
        >
          {data.btnText}
        </Button>
      );
    }
    if (index === 5) {
      return (
        <Button
          size="md"
          type="outline"
          width="min-w-180"
          onClick={() => handleDeleteClick()}
        >
          {data.btnText}
        </Button>
      );
    }
    return <div></div>;
  }

  return (
    <div className="sm-container pb-20">
      <Heading font="font-medium" color="text-black-900" variant priority={3}>
        <span className="text-2xl xl:text-4xl">Account settings</span>
      </Heading>
      <div className="mt-4 rounded-md bg-skyBlue-300 p-4 lg:p-8">
        <ul>
          {ACCOUNT_OPTIONS.map((data, index: number) => {
            return (
              <li
                key={data.id}
                className=" my-4 cursor-pointer rounded-md bg-white py-2.5 px-4"
              >
                <div className="items-center justify-between lg:flex">
                  <div className="lg:settingsLeft">
                    <Text size="md">
                      {data.title}
                      {index === 0 && (
                        <span
                          className={` ${
                            profile?.isVerified
                              ? 'dotBeforeTextSuccess'
                              : 'dotBeforeText'
                          } text-sm text-white-900`}
                        >
                          {profile?.isVerified
                            ? 'Verification Success'
                            : 'Verification Pending'}
                        </span>
                      )}
                    </Text>
                    {index === 0 ? (
                      <Text size="sm" color="text-gray-200">
                        {profile?.email}
                      </Text>
                    ) : (
                      <Text size="sm" color="text-gray-200">
                        {data.subTitle}
                      </Text>
                    )}
                  </div>
                  <div className="my-2 lg:my-0">
                    {handleButtonRender(index, data)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
