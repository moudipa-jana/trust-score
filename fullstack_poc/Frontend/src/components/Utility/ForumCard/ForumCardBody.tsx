import { useLazyQuery } from '@apollo/client/react';
import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import LinkifyText from '@/components/Utility/LinkifyText';
import Modal from '@/components/Utility/Modal';
import TooltipCard from '@/components/Utility/TooltipCard';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { QUERY_GET_EDITED_HISTORY } from '@/service/graphql/Forum';
import { CampfireThreadDetails } from '@/types/forum';
import { getUserToken } from '@/utils/verifyAuthentication';
import CustomImage from '@/components/Utility/CustomImage';
import SamleImg from '@/../public/images/top-read.png'
import ImageViewModal from '@/components/Utility/ForumCard/ImageViewModal';

interface Props {
  title: string | React.ReactNode;
  variant?: string;
  children?: React.ReactNode;
  description?: string;
  isEdited?: boolean;
  cardType?: string;
  showingError?: React.ReactNode;
  blurState?: boolean;
  postId?: string;
  clickableCard?: boolean;
  categoryTag?: string;
  isCampfire?: boolean;
  campfireDetails?: CampfireThreadDetails;
  blurClass: string;
  color?: string;
  media_link?: string;
}

export default function ForumCardBody({
  children,
  title,
  variant,
  description,
  isEdited,
  cardType,
  showingError,
  blurState,
  postId,
  clickableCard,
  categoryTag,
  isCampfire,
  campfireDetails,
  blurClass,
  color,
  media_link,
}: Props) {
  const [showMore, setShowMore] = useState(true);
  const [showMoreTitle, setShowMoreTitle] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const isIpad = useIsipad();
  const token = getUserToken();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutsideTooltip = (event: MouseEvent) => {
      const tooltipEl = tooltipRef.current;
      if (!tooltipEl) return;
      const targetEl = event.target as Node;

      // Close tooltip only if the clicked element is NOT inside the tooltip
      if (!tooltipEl.contains(targetEl)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutsideTooltip, true);

    return () => {
      document.removeEventListener('click', handleClickOutsideTooltip, true);
    };
  }, []);

  const [editedHistory, { loading, data, error }] = useLazyQuery(
    QUERY_GET_EDITED_HISTORY,
    {
      fetchPolicy: 'no-cache',
    },
  );

  // Handle edit history completion
  useEffect(() => {
    if (data) {
      setShowTooltip(!showTooltip);
    }
  }, [data]);

  // Handle edit history error
  useEffect(() => {
    if (error) {
      emitErrorNotification(formatGraphqlError(error));
    }
  }, [error]);

  const handleClick = () => {
    if (!clickableCard) {
      editedHistory({
        variables: {
          id: postId,
        },
      });
    }
  };

  const handleDetailImageOpen = (e: any) => {
    setIsImageViewOpen(true);
  };

  return (
    <>
      {title && (
        <div
          ref={cardRef}
          className={`relative description-text ${blurState ? 'blur-md' : ''}`}
        >
          <div
            className={`${variant === 'sm' ? 'py-2' : 'pt-4 mb-3'} ${isMobile && categoryTag ? 'mt-10' : ''
              } ${color ? `${color}` : ''}`}
          >
            <Text
              customClass={`overflow-auto  !text-md ${blurClass}`}
              size={
                variant == 'vertical' || variant == 'horizontal' ? 'base' : 'md'
              }
              color="text-black-200"
              font={
                variant == 'sm'
                  ? 'font-light'
                  : cardType == 'comment'
                    ? 'font-light'
                    : 'font-semibold'
              }
            >
              {typeof title === 'string' ? (
                title.split(' ').length < 50 ? (
                  <LinkifyText text={title} isTitle />
                ) : (
                  <>
                    {showMoreTitle ? (
                      <LinkifyText
                        text={title
                          .split(' ')
                          .slice(0, isMobile ? 18 : 27)
                          .join(' ')}
                        isTitle
                      />
                    ) : (
                      <LinkifyText text={title} isTitle />
                    )}
                    <span
                      className="cursor-pointer text-gray-700"
                      onClick={() => {
                        if (!clickableCard) {
                          const wasExpanded = !showMoreTitle;
                          setShowMoreTitle(!showMoreTitle);

                          // Scroll only when collapsing (i.e., going from expanded to collapsed)
                          if (wasExpanded && cardRef.current) {
                            setTimeout(() => {
                              const offset = 200;
                              const rect =
                                cardRef.current?.getBoundingClientRect();

                              // Make sure the DOMRect object has a .top value
                              if (typeof rect?.top === 'number') {
                                const elementTop =
                                  rect.top + window.pageYOffset;
                                const scrollPosition = elementTop - offset;

                                window.scrollTo({
                                  top: scrollPosition,
                                  behavior: 'smooth',
                                });
                              }
                            }, 50);
                          }
                        }
                      }}
                    >
                      {showMoreTitle ? ' ...Show More' : ' Show Less'}
                    </span>
                  </>
                )
              ) : (
                title
              )}
            </Text>

            <div>
              {isMobile && (
                <Modal id="TooltipCard" isVisible={showTooltip} bgTransparent>
                  <TooltipCard
                    editedData={get(data, 'questions_by_pk.editPost', [])}
                    dataLoading={loading}
                    tooltipRef={tooltipRef}
                  />
                </Modal>
              )}
              {isEdited && (
                <div className="relative ">
                  <div className="mr-2 inline text-sm lg:text-base">
                    <span className="text-gray-200">(</span>
                    <span
                      className="cursor-pointer text-primary"
                      onClick={handleClick}
                    >
                      edited
                    </span>
                    <span className="text-gray-200">)</span>
                  </div>
                  {(isDesktop || isIpad) && showTooltip && (
                    <TooltipCard
                      editedData={get(data, 'questions_by_pk.editPost', [])}
                      dataLoading={loading}
                      tooltipRef={tooltipRef}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {media_link && <CustomImage src={media_link} alt="Media" height={100} width={100} className='rounded-xl post-img mb-3 cursor-pointer' onClick={(e: any) => handleDetailImageOpen(e)} />}

          {/* <CustomImage src={SamleImg} alt="Media" height={200} width={635} className='rounded-xl post-img mb-3' /> */}

          {description && (
            <div
              className={` ${variant == 'sm' ? 'py-2' : 'pb-0 mt-3'} ${isCampfire && !campfireDetails?.is_public
                ? !campfireDetails?.isMember || !token
                  ? 'blur-sm'
                  : ''
                : ''
                }`}
            >
              <Text
                customClass="whitespace-pre-line"
                size={
                  variant == 'vertical' || variant == 'horizontal'
                    ? 'base'
                    : 'base'
                }
                color="text-[#393E46]"
                font="font-semibold"
              >
                {description.split(' ').length < 50 ? (
                  <LinkifyText text={description} className="text-base inline" />
                ) : (
                  <>
                    {showMore ? (
                      <LinkifyText
                        text={description
                          .split(' ')
                          .slice(0, isMobile ? 18 : 27)
                          .join(' ')}
                      />
                    ) : (
                      <LinkifyText text={description} />
                    )}
                    <span
                      className=" cursor-pointer text-gray-700 text-base"
                      onClick={() => {
                        if (!clickableCard) {
                          const wasExpanded = !showMore;
                          setShowMore(!showMore);

                          // Scroll only when collapsing (i.e., going from expanded to collapsed)
                          if (wasExpanded && cardRef.current) {
                            setTimeout(() => {
                              const offset = 200;
                              const rect =
                                cardRef.current?.getBoundingClientRect();

                              // Make sure the DOMRect object has a .top value
                              if (typeof rect?.top === 'number') {
                                const elementTop =
                                  rect.top + window.pageYOffset;
                                const scrollPosition = elementTop - offset;

                                window.scrollTo({
                                  top: scrollPosition,
                                  behavior: 'smooth',
                                });
                              }
                            }, 50);
                          }
                        }
                      }}
                    >
                      {showMore ? ' ...Show More' : '    Show Less'}
                    </span>
                  </>
                )}
              </Text>
            </div>
          )}
        </div>


      )}

      {isImageViewOpen && media_link && <ImageViewModal src={media_link} isOpen={isImageViewOpen} onClose={() => setIsImageViewOpen(false)} />
      }
      {showingError}
      {children}
    </>
  );
}
