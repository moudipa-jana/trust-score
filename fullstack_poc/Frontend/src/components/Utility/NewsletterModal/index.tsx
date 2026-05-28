import { ErrorLike } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';

import NewsletterClose from '/public/images/NewsletterClose.svg';
import newsletterMobileModal from '/public/images/newsletterMobileModal.svg';
import newsletterModal from '/public/images/newsletterModal.svg';
import toastError from '/public/images/toastSvg/toastError.svg';
import toastSuccess from '/public/images/toastSvg/toastSuccess.svg';
import toastWarning from '/public/images/toastSvg/toastWarning.svg';
import { subscribedNewsletter } from '@/actions/profile';
import Button from '@/components/Utility/Button';
import CustomImage from '@/components/Utility/CustomImage';
import Modal from '@/components/Utility/Modal';
import Success from '@/components/Utility/Success';
import Input from '@/elements/Input';
import Text from '@/elements/Text';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { emitNewsLetterErrorNotification } from '@/lib/helpers';
import { validateForm } from '@/utils/verifyAuthForm';

interface NewsletterModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SubscriptionData {
  data: {
    subscriptionEmail: string;
  };
}

function NewsletterModal({ showModal, setShowModal }: NewsletterModalProps) {
  const [email, setEmail] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEmail(e.target.value);
    setEmailError(validateForm.email(e.target.value) as string);
  };

  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subscriptionData: SubscriptionData = {
      data: {
        subscriptionEmail: email,
      },
    };

    try {
      if (email) {
        const newsLetterResponse = await subscribedNewsletter(email);

        if (newsLetterResponse instanceof Error) {
          if (
            (newsLetterResponse as ErrorLike)?.message?.includes(
              'Uniqueness violation',
            )
          ) {
            emitNewsLetterErrorNotification(
              'You have already subscribed to the newsletter.',
              <CustomImage src={toastWarning} />,
              'warning',
            );
          } else {
            emitNewsLetterErrorNotification(
              'Something went wrong please try again after sometime',
              <CustomImage src={toastError} />,
            );
            return;
          }
        }
        if ((newsLetterResponse as any).insert_subscriptions_one) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/subscriptions`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriptionData),
            },
          );

          if (response.ok) {
            await response.json();
            emitNewsLetterErrorNotification(
              'You subscribe the newsletter successfully',
              <CustomImage src={toastSuccess} />,
              'success',
            );
            setEmail('');
            setEmailSuccess(true);
          } else {
            emitNewsLetterErrorNotification(
              'Something went wrong please try again after sometime',
              <CustomImage src={toastError} />,
            );
          }
        }
      }
    } catch (error) {
      emitNewsLetterErrorNotification(
        'Something went wrong please try again after sometime',
        <CustomImage src={toastError} />,
      );
    }
  };

  const ismobile = useIsMobile();
  const isipad = useIsipad();

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <Modal id="" isVisible={emailSuccess}>
        <Success
          isActive
          autoClose={() => {
            setEmailSuccess(false);
            setShowModal(false);
          }}
          delay={2000}
          title={
            isAlreadySubscribed
              ? 'You Have Already Subscribed To The Newsletter'
              : 'You Subscribed The Newsletter Successfully'
          }
        />
      </Modal>

      <Modal
        id=""
        isVisible={showModal}
        isBackgroundYellow={ismobile ? false : true}
        onClose={handleClose}
        bgTransparent={ismobile ? true : false}
        noCloseIcon={ismobile ? true : false}
      >
        <div className="relative h-full w-full">
          <div id="newsLetter" style={{ height: '100%', width: '100%' }}>
            <div className="relative h-full w-full">
              <div className="absolute inset-0 flex items-center justify-center lg:left-20">
                <div
                  className={`${
                    ismobile ? 'mt-12 h-full w-full' : 'w-3/6'
                  } mx-15`}
                >
                  <div className="mb-1">
                    <div className="flex flex-row items-center justify-between">
                      <Text
                        color={
                          ismobile || isipad ? 'text-sky-400' : 'text-black-200'
                        }
                        size={ismobile ? 'sm' : isipad ? 'lg' : 'xl'}
                        font="font-extrabold"
                        customClass="leading-none"
                      >
                        Join the Kofuku family!
                      </Text>

                      {ismobile && (
                        <div onClick={handleClose} className="h-4 w-4">
                          <CustomImage src={NewsletterClose}></CustomImage>
                        </div>
                      )}
                    </div>

                    <div className="mt-1">
                      <Text size="sm">
                        Hey fam! Want to read our informative blogs and watch
                        our exciting videos?
                      </Text>
                    </div>
                  </div>
                  <div className="sm:mt-1.5">
                    <Text
                      size={ismobile ? 'sm' : 'sm'}
                      font={ismobile ? 'font-semibold' : 'font-bold'}
                    >
                      Subscribe to our Newsletter
                    </Text>
                    <form
                      onSubmit={handleClick}
                      className="emailIconInput relative mt-1"
                    >
                      <Input
                        ref={inputRef}
                        placeholder="Your email address"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        outline
                      />
                      <div className="emailIcon">
                        <Button
                          type="submit"
                          isdisabled={
                            !email || (emailError as unknown as boolean)
                          }
                        >
                          <IoSendSharp
                            className={`${
                              ismobile ? 'text-md' : 'text-xl'
                            } !text-pimary`}
                          />
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {!ismobile ? (
                <div className="hidden lg:block">
                  <CustomImage
                    src={newsletterModal}
                    alt="Newsletter"
                  ></CustomImage>
                </div>
              ) : (
                <div>
                  <CustomImage
                    src={newsletterMobileModal}
                    height={227}
                    width={271}
                    alt="Newsletter"
                  ></CustomImage>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default NewsletterModal;
