'use client';
import React, { useRef, useState, useEffect } from 'react';
import Button from '@/components/Utility/Button';
import Text from '@/elements/Text';
import Heading from '@/elements/Heading';
import { useMutation } from '@apollo/client/react';
import {
  SEND_EMAIL_OTP_MUTATION,
  SEND_PHONE_OTP_MUTATION,
  VALIDATE_OTP_MUTATION,
  VALIDATE_PHONE_OTP_MUTATION,
} from '@/service/graphql/Auth';
import { emit } from 'process';
import {
  formatGraphqlError,
  emitErrorNotification,
  emitNotification,
} from '@/lib/helpers';
import Link from 'next/link';
import SignupHeader from './SignupHeader';

interface OTPInputProps {
  nextStep: () => void;
  data?: any;
  onComplete?: (otp: string) => void;
  onResend?: () => void;
}

interface SendOtpResponse {
  socialotp: {
    success: boolean;
    message: string;
  };
}

export default function Otp({
  nextStep,
  onComplete,
  onResend,
  data,
}: OTPInputProps) {
  const OTPTime = Number(process.env.NEXT_PUBLIC_OTP_EXPIRATION_TIME) || 120;
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [timer, setTimer] = useState(OTPTime); // 5 minutes = 300 seconds
  const inputsRef = useRef<any>([]);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const [ValidateEmailOTP, { error, loading: otpLoading }] = useMutation(
    VALIDATE_OTP_MUTATION,
  );
  const [ValidatePhoneOTP, { error: phoneOtpError, loading: otpPhoneLoading }] =
    useMutation(VALIDATE_PHONE_OTP_MUTATION);

  const [sendEmailOtpMutation, { loading: sendOtpLoading }] =
    useMutation<SendOtpResponse>(SEND_EMAIL_OTP_MUTATION);

  const [sendPhoneOtpMutation, { loading: otpLoading1 }] =
    useMutation<SendOtpResponse>(SEND_PHONE_OTP_MUTATION);

  const length = 4;

  useEffect(() => {
    if (data === 1) {
      inputsRef.current[0]?.focus();
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setIsResendDisabled(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value.replace(/\D/, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index] !== '') {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const prevOtp = [...otp];
        prevOtp[index - 1] = '';
        setOtp(prevOtp);
      }
    }
    if (e.key === 'Enter') {
      const otpValue = otp.join('');
      if (otpValue.length === length) {
        handleSubmit();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData('Text')
      .slice(0, length)
      .replace(/\D/g, '');
    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    if (newOtp.every((digit) => digit !== '')) {
      onComplete?.(newOtp.join(''));
    }

    const lastIndex = pasteData.length - 1;
    if (lastIndex < length) inputsRef.current[lastIndex]?.focus();
  };

  const handleResend = () => {
    setOtp(Array(length).fill(''));
    setTimer(OTPTime); // reset 5 minutes
    setIsResendDisabled(true);
    inputsRef.current[0]?.focus();
    onResend?.();

    if (data?.signupType === 'email') {
      handleSendOtp({
        type: 'email',
        email: data.email,
      });
    } else {
      handleSendOtp({
        type: 'phone',
        phone: data.phoneNumber,
      });
    }
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleSubmit = () => {
    const otpValue = otp.join('');
    validateOTP(otpValue);
  };

  const validateOTP = async (otpValue: string) => {
    try {
      let response;

      if (data?.signupType === 'email') {
        response = await ValidateEmailOTP({
          variables: {
            email: data.email,
            otp: Number(otpValue),
          },
        });
      } else {
        response = await ValidatePhoneOTP({
          variables: {
            phoneNumber: data.phoneNumber,
            otp: Number(otpValue),
          },
        });
      }

      const isValid = (response?.data as any)?.validateOtp?.success;

      if (isValid) {
        onComplete?.(otpValue);
        emitNotification(
          'success',
          (response?.data as any)?.validateOtp?.message ||
            'OTP validated successfully',
        );
        nextStep();
      } else {
        emitErrorNotification(
          (response?.data as any)?.validateOtp?.message ||
            'Invalid OTP. Please try again.',
        );
      }
    } catch (err: any) {
      emitErrorNotification(formatGraphqlError(err));
    }
  };

  const handleSendOtp = async ({
    type,
    email,
    phone,
  }: {
    type: any;
    email?: string;
    phone?: string;
  }) => {
    try {
      if (type === 'email' && email) {
        const { data } = await sendEmailOtpMutation({
          variables: { email },
        });

        if (data?.socialotp?.success) {
          emitNotification('success', 'OTP sent to your email');
        } else {
          emitErrorNotification(data?.socialotp?.message);
        }
      }

      if (type === 'phone' && phone) {
        const { data } = await sendPhoneOtpMutation({
          variables: {
            phoneNumber: phone,
          },
        });
        1;

        if (data?.socialotp?.success) {
          emitNotification('success', 'OTP sent to your Mobile Number');
        } else {
          emitErrorNotification(
            data?.socialotp?.message || 'OTP sending failed',
          );
        }
      }
    } catch (error: any) {
      const msg =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        'OTP sending failed';
      emitErrorNotification(formatGraphqlError(error));
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');
  return (
    <div className="h-full  p-3">
      <div className={`text-center 'mb-1'}`}>
        <SignupHeader type="signup" />
        <Text size="sm" color="text-gray-700 mt-2 mb-3">
          Please Enter your 4 digit OTP send in your{' '}
          {data?.signupType === 'phone' ? 'Mobile' : 'Email'}
        </Text>
      </div>

      <div className="flex gap-2 justify-center mb-4 mt-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el: any) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            maxLength={1}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-15 h-12 border border-gray-500 rounded-md text-center text-xl focus:outline-none focus:border-gray-700 focus:ring-0 "
          />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <p
          className={
            isResendDisabled
              ? 'hover:underline-none'
              : 'text-primary hover:underline cursor-pointer'
          }
          onClick={() => {
            if (!isResendDisabled) handleResend();
          }}
        >
          Resend OTP
        </p>

        <span className="text-sm text-gray-500">{formatTime(timer)}</span>
      </div>

      <div className="mt-4">
        <div className=" w-full">
          <Button
            block
            isLoading={otpLoading || otpPhoneLoading}
            isdisabled={!isOtpComplete}
            onClick={handleSubmit}
          >
            Next
          </Button>
        </div>
      </div>
      {/* <div className="m-auto max-w-lg justify-center px-4 text-center text-xs font-normal text-gray-700 md:text-sm mt-3">
        By continuing, you agree to Kofuku&apos;s&nbsp;{'  '}
        <Link
          href="/terms"
          target="_blank"
          className="cursor-pointer text-primary"
        >
          Terms of Use
        </Link>
        &nbsp;and&nbsp;{' '}
        <Link
          href="/privacy-policy"
          target="_blank"
          className="cursor-pointer text-primary"
        >
          Privacy Policy
        </Link>
      </div>
      <div
        className="m-auto max-w-lg justify-center px-4 text-center text-sm font-normal text-offwhite-650">
        (Our website uses cookies to provide you a better user
        experience)
      </div> */}
    </div>
  );
}
