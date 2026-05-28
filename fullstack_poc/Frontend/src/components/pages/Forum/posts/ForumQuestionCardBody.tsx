import React, { useRef, useState } from 'react';

import Card from '@/components/Card';
import { getDefaultCampfireImage } from '@/components/layout/Header/Profile/constant';
import IsNotCampfireMember from '@/components/pages/Forum/posts/IsNotCampfireMember';
import Text from '@/elements/Text';
import { CampfireData } from '@/types/campfire';

export default function ForumQuestionCardBody({
  campfireCard,
  postData,
  isCampfireCoverImg = false,
}: {
  campfireCard?: boolean;
  postData: {
    profileImg: string;
    message: string;
    postData: CampfireData;
  };
  isCampfireCoverImg?: boolean;
}) {
  // Add show more state
  const [showMoreMessage, setShowMoreMessage] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleShowMoreToggle = () => {
    const wasExpanded = !showMoreMessage;
    setShowMoreMessage((prev) => !prev);
    // Scroll only when collapsing (i.e., going from expanded to collapsed)
    if (wasExpanded && cardRef.current) {
      setTimeout(() => {
        const offset = 200;
        const rect = cardRef.current?.getBoundingClientRect();
        if (typeof rect?.top === 'number') {
          const elementTop = rect.top + window.pageYOffset;
          const scrollPosition = elementTop - offset;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  };
  return (
    <div className="">
       {campfireCard && (
          <div className="py-3">
            <Text customClass='text-lg font-semibold'>
              {postData.message.split(' ').length < 50 ? (
                postData.message
              ) : (
                <>
                  {showMoreMessage
                    ? postData.message.split(' ').slice(0, 50).join(' ')
                    : postData.message}
                  <span
                    className="cursor-pointer text-gray-700"
                    onClick={handleShowMoreToggle}
                  >
                    {showMoreMessage ? ' ...Show More' : ' Show Less'}
                  </span>
                </>
              )}
            </Text>
          </div>
        )}
      <div className={`${!campfireCard ? 'p-0' : 'pt-3'}`} ref={cardRef}>
        <div className="cursor-pointer camfire-reshare-card">
          <Card
            variant="sm"
            color={!campfireCard ? 'bg-white' : 'bg-white'}
            fallbackSrc="/images/blog/vaccine.svg"
            campfireCoverImg={
              isCampfireCoverImg
                ? getDefaultCampfireImage(postData.profileImg)
                : ''
            }
            profileImg={getDefaultCampfireImage(postData.profileImg)}
            title=" "
            size="base"
            headingChildren={
              <IsNotCampfireMember
                campfireData={postData.postData}
                campfireCard={campfireCard as boolean}
              />
            }
          ></Card>
        </div>
       
        {!campfireCard && !isCampfireCoverImg && <hr className="pb-4" />}
      </div>
    </div>
  );
}
