import { useRouter } from 'next/router';
import { useState } from 'react';

import Image from '/public/images/userImage.svg';
import CustomImage from '@/components/Utility/CustomImage';
import LinkifyText from '@/components/Utility/LinkifyText';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { formatShortCount } from '@/lib/helpers';
import {
  Poll,
  Question,
  Quiz,
  Thread,
  TopCategories,
} from '@/types/topCategories';

interface ICategorydetailsbody {
  category: TopCategories;
  title: string;
}

function CategoryDetailsBody({ category, title }: ICategorydetailsbody) {
  const router = useRouter();
  const typeIconMap: any = {
    question: '/images/chat-bubble-question.svg',
    quiz: '/images/Icon_Quiz.svg',
    poll: '/images/Icon_Poll.svg',
  };
  const handleredirection = (event: any, postData: any) => {
    event.stopPropagation();
    router.push(`/post/${postData?.id}`);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {category?.threads &&
        category?.threads.length > 0 &&
        category?.threads?.[0]?.type !== null && (
          <div className="cardsHolder flex flex-col gap-2 pb-2">
            {category?.threads.slice(0, 3).map((post) => {
              const postType = post.type as keyof Thread;
              const postData = post[postType] as Poll | Question | Quiz;

              return (
                <div
                  key={postData?.id}
                  className="sphereCard flex gap-3 cursor-pointer items-end"
                  onClick={(event) => handleredirection(event, postData)}
                >
                  <div className="w-full overflow-hidden">
                    <div className="card bg-white p-2">
                      <div className="flex gap-3 pr-3 items-center">
                        <div className="lg:w-[62px] lg:min-w-[62px] w-[50px] ">
                          {/* <img src={postData?.user?.profilePicture || Image} alt="user" width={68} height={68} className='rounded-full h-[68px] min-w-[68px] object-cover' /> */}
                          <CustomImage
                            src={postData?.user?.profilePicture || Image}
                            alt="user"
                            width={68}
                            height={68}
                            className="rounded-full lg:h-[68px] !lg:min-w-[68px] h-[50px] object-contain"
                          />
                        </div>
                        <div className="w-full">
                          <p className="text-gray-50 mb-1 text-sm description-text">
                            <LinkifyText text={postData?.title} />
                          </p>
                          <div className="flex items-center gap-2">
                            {/* <div className='text-gray-1050 text-sm'>{appDayjs(postData?.createdAt).fromNow()}</div> */}
                            <div className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M5.99984 3.92016L6.6665 6.66683H2.77984C2.57284 6.66683 2.36869 6.71502 2.18355 6.80759C1.99841 6.90016 1.83737 7.03457 1.71317 7.20016C1.58898 7.36576 1.50504 7.55799 1.46801 7.76165C1.43098 7.9653 1.44188 8.17478 1.49984 8.3735L3.05317 13.7068C3.13395 13.9838 3.30238 14.2271 3.53317 14.4002C3.76397 14.5733 4.04468 14.6668 4.33317 14.6668H13.3332C13.6868 14.6668 14.0259 14.5264 14.276 14.2763C14.526 14.0263 14.6665 13.6871 14.6665 13.3335V8.00016C14.6665 7.64654 14.526 7.3074 14.276 7.05735C14.0259 6.80731 13.6868 6.66683 13.3332 6.66683H11.4932C11.2451 6.6667 11.002 6.59737 10.7912 6.46664C10.5804 6.33592 10.4102 6.14897 10.2998 5.92683L7.99984 1.3335C7.68545 1.33739 7.37601 1.41228 7.09463 1.55256C6.81326 1.69284 6.56722 1.8949 6.3749 2.14363C6.18258 2.39236 6.04896 2.68134 5.98401 2.98896C5.91907 3.29659 5.92448 3.61492 5.99984 3.92016Z"
                                  stroke="#979797"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] font-bold text-[#979797]">
                                {formatShortCount(postData?.noUpValues) || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <path
                                  d="M4.62036 13.905C4.87659 13.8181 5.15559 13.8424 5.40391 13.9498C6.67577 14.5 8.09531 14.6266 9.45076 14.3041C10.9438 13.9489 12.261 13.0721 13.1648 11.8317C14.0686 10.5913 14.4997 9.06883 14.3803 7.53871C14.2609 6.00859 13.599 4.57142 12.5137 3.48618C11.4285 2.40093 9.99131 1.73898 8.46119 1.61961C6.93108 1.50024 5.40864 1.9313 4.16822 2.83512C2.9278 3.73893 2.05098 5.05605 1.69576 6.54915C1.37329 7.90459 1.49993 9.32413 2.0501 10.596C2.15752 10.8443 2.18177 11.1233 2.09491 11.3795L1.45012 13.2817C1.18406 14.0665 1.93336 14.8158 2.71822 14.5498L4.62036 13.905Z"
                                  stroke="#979797"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] font-bold text-[#979797]">
                                {formatShortCount(postData?.noComments) || 0}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M15.4768 3.05159C13.4236 2.25391 11.1585 2.1866 9.06145 2.86096C6.96446 3.53531 5.16315 4.9103 3.95972 6.75527C2.75629 8.60024 2.22395 10.8029 2.45199 12.9939C2.68003 15.1848 3.65459 17.2306 5.21218 18.7882C6.76977 20.3458 8.81562 21.3204 11.0065 21.5484C13.1975 21.7765 15.4002 21.2441 17.2451 20.0407C19.0901 18.8373 20.4651 17.036 21.1395 14.939C21.8138 12.842 21.7465 10.5768 20.9488 8.52359M13.3647 10.6356L18.7407 5.25963M13.9408 11.9796C13.9408 13.04 13.0812 13.8996 12.0208 13.8996C10.9604 13.8996 10.1008 13.04 10.1008 11.9796C10.1008 10.9192 10.9604 10.0596 12.0208 10.0596C13.0812 10.0596 13.9408 10.9192 13.9408 11.9796Z"
                                  stroke="#979797"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] font-bold text-[#979797]">
                                {formatShortCount(postData?.noParticipants) ||
                                  0}
                              </span>
                            </div>
                            {/* <img
                              alt="question"
                              src="/images/chat-bubble-question.svg"
                              width="22"
                              height="22"
                              loading="lazy"
                              className="ml-auto mr-4"
                            /> */}
                            {typeIconMap[postType] && (
                              <img
                                alt={postType}
                                src={typeIconMap[postType]}
                                width="22"
                                height="22"
                                loading="lazy"
                                className="ml-auto mr-4"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <Card
                      cardContainerClassName="!rounded-xl min-[360px]:!rounded-full"
                      titleContainerClassName="items-center justify-between"
                      type={postType}
                      variant="semibold"
                      profileImg={postData?.user?.profilePicture || Image}
                      title={postData?.title}
                      details={appDayjs(postData?.createdAt).fromNow()}
                      detailsColor="text-gray-200"
                      profileImgClass="sm:!h-17 sm:!w-17 mr-0"
                    /> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {(!category?.threads ||
        category?.threads.length === 0 ||
        category?.threads?.[0]?.type === null) && (
        <div className="pb-4 text-center text-sm text-black-200">
          No posts found
        </div>
      )}
    </div>
  );
}

export default CategoryDetailsBody;
