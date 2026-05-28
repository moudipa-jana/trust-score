import { useMutation } from '@apollo/client/react';
import EmailIcon from 'public/images/emailImage.svg';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import CategorySignup from '@/components/Signup/CategorySignup';
import Character from '@/components/Signup/Character';
import Loading from '@/components/Signup/Loading';
import Signup from '@/components/Signup/Singup';
import Button from '@/components/Utility/Button';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import SwipeableViews from '@/components/Utility/SwipeableViews';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import {
  emitErrorNotification,
  emitNotification,
  formatGraphqlError,
  toggleModalLoader,
} from '@/lib/helpers';
import {
  SIGNIN_MUTATION,
  SIGNIN_PHONE_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_USER_PROFILE,
} from '@/service/graphql/Auth';
import { SIGNUP_MUTATION_APP } from '@/service/graphql/Auth';
import { toggleSignupDialog } from '@/state/Slices/dialog';
import { SignupData } from '@/types/authentication';
import Otp from '@/components/Signup/Otp';
import {
  loginSuccess,
  selectGetToken,
  setUserProfile,
} from '@/state/Slices/auth';
import { postAuthSuccess } from '@/actions/auth';
import SuccesIcon from 'public/images/icon-check-circle.svg';
import SignupWith from '@/components/Signup/SignupWith';
import CustomImage from '@/components/Utility/CustomImage';
import AliasDetail from '@/components/Signup/AliasDetail';
import SignupAccount from '@/components/Signup/SignupAccount';
import { Phone } from 'lucide-react';
import { RootState } from '@/state/reducers';
import { get } from 'lodash';

export interface ISignupState {
  email: string;
  // phoneNumber: string;
  password: string;
  confirmPassword: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  about: string;
  profilePicture: string;
}

function SignupDialog() {
  const isSocialOnboarding = useAppSelector(
    (state) => state.dialog.isSocialOnboarding,
  );
  const [index, setIndex] = useState(isSocialOnboarding ? 4 : 0);
  const profile = useAppSelector((state: RootState) => state.auth.profile);
  const token = useAppSelector(selectGetToken);

  const [details, setDetails] = useState<ISignupState>({
    email: profile?.email || '',
    // phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: profile?.name || '',
    gender: profile?.gender || '',
    dateOfBirth: (profile as any)?.dob || '',
    about: profile?.about || '',
    profilePicture: profile?.profilePicture || '',
  });
  const [areaOfInterests, setInterest] = useState<number[]>([]);
  const dialogVisible = useAppSelector(
    (state) => state.dialog.signupDialogOpen,
  );
  const dispatch = useAppDispatch();
  const [singup, { loading }] = useMutation(SIGNUP_MUTATION_APP);
  const [signin, { error, data }] = useMutation(SIGNIN_MUTATION);
  const [phoneSignin, { error: phoneError, data: phoneData }] = useMutation(
    SIGNIN_PHONE_MUTATION,
  );
  const [updateUserProfile, { loading: updateLoading, data: updateData }] =
    useMutation(UPDATE_USER_PROFILE, {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

  const nextStep = () => setIndex((prevIndex) => prevIndex + 1);
  const goBack = () => setIndex((prevIndex) => prevIndex - 1);

  useEffect(() => {
    if (isSocialOnboarding && profile) {
      setDetails((prev) => ({
        ...prev,
        email: profile.email || '',
        name: profile.name || '',
        gender: profile.gender || '',
        dateOfBirth: (profile as any)?.dob || '',
        about: profile.about || '',
        profilePicture: profile.profilePicture || '',
      }));
    }
  }, [isSocialOnboarding, profile]);

  useEffect(() => {
    if (!dialogVisible) {
      setTimeout(() => {
        setIndex(0);
      }, 300);
    } else {
      setIndex(isSocialOnboarding ? 4 : 0);
    }
  }, [dialogVisible, isSocialOnboarding]);

  useEffect(() => {
    if (updateData) {
      const updatedProfile = get(updateData, 'update_users_by_pk');
      if (updatedProfile) {
        dispatch(setUserProfile(updatedProfile));
        nextStep();
      } else {
        emitErrorNotification();
      }
    }
  }, [updateData, dispatch]);

  useEffect(() => {
    if (data || phoneData) {
      const { accessToken, profile } = data
        ? (data as any).login
        : (phoneData as any).phoneLogin;
      dispatch(
        loginSuccess({
          token: accessToken,
          profile,
        }),
      );
      dispatch(postAuthSuccess(profile.id, accessToken));
    }
  }, [data, dispatch, phoneData]);

  const handleClose = () => {
    resetForm();
    dispatch(toggleSignupDialog(false));
  };

  const signupUser = async (userSingupData: SignupData) => {
    try {
      const response = await singup({
        variables: { ...userSingupData },
      });
      toggleModalLoader(false);
      if ((response?.data as any).signUpApp?.success) {
        nextStep();
        emitNotification('success', 'Signup successful! ');
        setInterest([]);
        resetForm();
        setTimeout(() => {
          handleLogin({
            signupType: userSingupData.signupType,
            ...(userSingupData.signupType === 'phone'
              ? { phoneNumber: userSingupData.phoneNumber }
              : { email: userSingupData.email }),
            password: userSingupData.password,
          });
        }, 4000); //
      }
    } catch (err: unknown) {
      toggleModalLoader(false);
      emitErrorNotification(formatGraphqlError(err));
    }
  };

  const handleLogin = (values: any) => {
    if (values.signupType === 'phone') {
      return phoneSignin({
        variables: {
          phone: values.phoneNumber,
          password: values.password,
        },
      });
    } else {
      return signin({
        variables: {
          email: values.email,
          password: values.password,
        },
      });
    }
  };

  const handleSubmit = (skip = false) => {
    const valuesToSubmit = {
      ...details,
      userId: profile?.id,
      dob: details.dateOfBirth,
      isVerified: true,
      areaOfInterests: skip
        ? []
        : areaOfInterests.map((ele: number) => ({ categoryId: ele })),
    };
    toggleModalLoader(true);
    if (isSocialOnboarding) {
      updateUserProfile({ variables: valuesToSubmit })
        .then(() => toggleModalLoader(false))
        .catch((err) => {
          toggleModalLoader(false);
          emitErrorNotification(formatGraphqlError(err));
        });
    } else {
      signupUser(valuesToSubmit as unknown as SignupData);
    }
  };

  const resetForm = () => {
    setDetails({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      gender: '',
      dateOfBirth: '',
      about: '',
      profilePicture: '',
    });
    setInterest([]);
  };

  return (
    <Modal
      id="SignupDialog"
      backIcon={index > 0}
      onBack={goBack}
      isVisible={dialogVisible}
      onClose={handleClose}
      modalClassName="signup-dialog"
    >
      <div className="grid grid-cols-12 w-full h-full gap-15 items-center">
        <div className="col-span-6">
          <CustomImage
            src={'/images/signup-img.png'}
            className="w-full"
            width={490}
            height={570}
            alt="SignUp Image"
          />
        </div>
        <div className="col-span-6 relative">
          {(index > 3 || index === 1) && (
            <button
              className="modal-back-close absolute left-3 -top-3"
              onClick={goBack}
            >
              <svg
                width="18"
                height="17"
                viewBox="0 0 18 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.29546 0.783953C7.68887 0.396332 8.32202 0.40102 8.70964 0.794426C9.09726 1.18783 9.09257 1.82098 8.69917 2.2086L3.32881 7.5H17C17.5523 7.5 18 7.94772 18 8.5C18 9.05229 17.5523 9.5 17 9.5H3.33542L8.69917 14.7849C9.09257 15.1725 9.09726 15.8057 8.70964 16.1991C8.32202 16.5925 7.68887 16.5972 7.29546 16.2095L0.371273 9.38715C-0.125641 8.89754 -0.125641 8.09595 0.371273 7.60634L7.29546 0.783953Z"
                  fill="#737373"
                />
              </svg>
            </button>
          )}
          <SwipeableViews index={index} disabled>
            <SignupWith
              nextStep={nextStep}
              setDetails={setDetails}
              type={{ type: 'signup' }}
            />
            <SignupAccount
              nextStep={nextStep}
              data={details}
              setDetails={setDetails}
              back={goBack}
            />
            <Otp nextStep={nextStep} data={details} />
            <Signup
              nextStep={nextStep}
              setDetails={setDetails}
              data={details}
            />
            <AliasDetail
              nextStep={nextStep}
              setDetails={setDetails}
              SignUpData={details}
              back={goBack}
            />
            <Character
              nextStep={nextStep}
              setDetails={setDetails}
              SignUpData={details}
              back={goBack}
            />
            <CategorySignup
              handleSubmit={handleSubmit}
              interest={areaOfInterests as unknown as string[]}
              setInterest={
                setInterest as unknown as Dispatch<SetStateAction<string[]>>
              }
              back={goBack}
              submitLoading={loading || updateLoading}
            />
            <Loading nextStep={nextStep} isVisible={index === 7} />
            <div className="flex h-full flex-col items-center justify-center p-3">
              <Success
                isActive={false}
                // src={SuccesIcon}
                icon={SuccesIcon}
                title="Successfully Signed-up "
                message="Welcome to Kofuku! We're excited to have you on board."
                name={details.email}
                buttonComponent={
                  <div className="pt-6">
                    <Button type="secondary" block onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                }
              />
            </div>
          </SwipeableViews>
        </div>
      </div>
    </Modal>
  );
}
export default SignupDialog;
