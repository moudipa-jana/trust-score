/**
 * CardDate Component
 *
 * Displays date, view count or video duration, bookmark icon, and tags.
 * Adjusts layout dynamically for video or regular blog cards.
 */

import Link from 'next/link';
import React, { useRef, useState } from 'react';

import countIcon from '/public/images/blog/countIcon.svg';
import Bookmark from '@/components/Card/Bookmark';
import { BlogCategory } from '@/components/pages/Blog/ForumBingeWatch';
import Tag from '@/components/Utility/Tag';
import Text from '@/elements/Text';

import CalculateVideoDuration from '../Utility/CalculateVideoDuration';
import CustomImage from '../Utility/CustomImage';

interface CardDateProps {
  date?: string;
  count?: string | number | JSX.Element;
  isVideoCard?: string;
  blogId?: string | number;
  video?: boolean;
  blogtags?: BlogCategory;
}

function CardDate({
  date,
  count,
  isVideoCard,
  blogId,
  video,
  blogtags,
}: CardDateProps) {
  const tagsData = blogtags?.data;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isValidDate = (dateString?: string) => {
    if (!dateString) return false;
    const lower = dateString.toLowerCase();
    return !lower.includes('invalid') && !lower.includes('nan');
  };

  const showDate = isValidDate(date);

  return video ? (
    <div className="mb-1 flex items-center text-base text-white-400">
      {showDate && (
        <>
          {date}
          <span className="px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="2"
              height="23"
              viewBox="0 0 2 23"
              fill="none"
            >
              <path d="M1 -0.00231934V22.9977" stroke="#7D7D7D" />
            </svg>
          </span>
        </>
      )}
      <Text size="base">
        {isVideoCard ? (
          <CalculateVideoDuration videoUrl={isVideoCard} />
        ) : (
          count
        )}
      </Text>
      <Bookmark blogId={blogId} />
    </div>
  ) : (
    <>
      <div className="flex items-center justify-between text-sm text-white-400">
        <div className="flex items-center gap-2">
          {showDate && (
            <span style={{ color: '#9D9D9D', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '14px' }}>
              {date}
            </span>
          )}
          {count && (
            <>
              {showDate && <span style={{ color: '#9D9D9D' }}>•</span>}
              <span className="flex items-center gap-1" style={{ color: '#9D9D9D', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '14px' }}>
                <img src="/images/basil_clock-outline.png" alt="clock" width={16} height={16} />
                {isVideoCard ? (
                  <CalculateVideoDuration videoUrl={isVideoCard} />
                ) : (
                  <>
                    {count}&nbsp;
                  </>)}
                read
              </span>
            </>
          )}
        </div>
        <Bookmark blogId={blogId} />
      </div>

      {isVideoCard && tagsData && (
        <div
          className="mb-3 flex flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {tagsData.slice(0, 2).map(
            (tag: {
              id?: string | number;
              attributes: {
                title: string;
                slug: string;
              };
            }) => (
              <div className="mr-2" key={tag.id}>
                <Tag type="card" size="xs" isActive bg="bg-white">
                  <Link href={`/sunrise-club/${tag?.attributes?.slug}`}>
                    <Text
                      size="xxs"
                      color="text-primary"
                      customClass="hover:text-skyBlue-900"
                    >
                      {tag?.attributes?.title}
                    </Text>
                  </Link>
                </Tag>
              </div>
            ),
          )}
          {tagsData.length > 2 && (
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
              ref={dropdownRef}
            >
              <Tag
                type="card"
                size="xs"
                isActive
                bg="bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                +{tagsData.length - 2}
              </Tag>
              {isDropdownOpen && (
                <div
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent absolute left-0 top-full z-10 mt-1 max-h-[120px] w-48 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tagsData.slice(2).map(
                    (tag: {
                      id?: string | number;
                      attributes: {
                        title: string;
                        slug: string;
                      };
                    }) => (
                      <div key={tag.id} className="px-4 py-2 hover:bg-gray-100">
                        <Link href={`/sunrise-club/${tag?.attributes?.slug}`}>
                          <Text
                            size="xxs"
                            color="text-primary"
                            customClass="hover:text-skyBlue-900"
                          >
                            {tag?.attributes?.title}
                          </Text>
                        </Link>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default CardDate;
