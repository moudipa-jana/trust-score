/**
 * CardBody Component
 *
 * This component renders the content body of a card.
 * It conditionally shows descriptions, tags, and metadata (like reading time),
 * depending on the layout variant and source context (e.g., forum blogs).
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BlogCategory } from '@/components/pages/Blog/ForumBingeWatch';
import Tag from '@/components/Utility/Tag';
import Text from '@/elements/Text';

interface CardBodyProps {
  children?: React.ReactNode;
  description?: string | JSX.Element;
  variant?: 'sm' | 'vertical' | 'horizontal' | string;
  cardTag?: React.ReactNode;
  inline?: boolean;
  blogtags?: BlogCategory;
  small?: boolean;
  forumBlogs?: boolean;
  textAlign?: boolean;
  readingTime?: JSX.Element | null;
}

function CardBody({
  children,
  description,
  variant,
  cardTag,
  inline,
  blogtags,
  small,
  forumBlogs,
  textAlign,
  readingTime,
}: CardBodyProps) {
  const tagsData = blogtags?.data;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {forumBlogs && description && (
        <div className="">
          <div
            className={`${variant == 'sm' ? 'py-2' : 'py-4'} ${
              textAlign && 'text-start'
            }`}
          >
            <Text
              size={
                variant == 'vertical' || variant == 'horizontal' ? 'base' : 'md'
              }
              color="text-black-1100"
              font={variant == 'sm' ? 'font-light' : 'font-regular'}
            >
              <span className="description">{description}</span>
            </Text>
          </div>
        </div>
      )}

      <div
        className={` flex-1 ${
          forumBlogs && 'relative mt-2  flex justify-between '
        }`}
      >
        {tagsData ? (
          <div className="flex flex-wrap" onClick={(e) => e.stopPropagation()}>
            {tagsData.slice(0, 2).map(
              (tag: {
                attributes: {
                  title: string;
                  slug: string;
                };
              }) => (
                <div className="mr-2 " key={tag?.attributes?.title}>
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
                  size="xxs"
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
                    className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent absolute left-0 top-full z-11 mt-1 max-h-[150px] w-48 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                  >
                    {tagsData.slice(2).map(
                      (tag: {
                        attributes: {
                          title: string;
                          slug: string;
                        };
                      }) => (
                        <div
                          key={tag?.attributes?.title}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
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
        ) : (
          cardTag && (
            <span
              className={`${
                inline
                  ? 'card-tag text-sm text-primary'
                  : small
                    ? 'card-tag text-xs text-primary'
                    : 'card-tag pl-3 text-xs text-primary'
              }`}
            >
              {cardTag}
            </span>
          )
        )}
        {forumBlogs && (
          <Text size="xs" color="text-black-1100  flex justify-end ">
            {readingTime}
          </Text>
        )}
      </div>

      {!forumBlogs && description && (
        <div className="">
          <div
            className={`${variant == 'sm' ? 'py-2' : 'py-4'} ${
              textAlign && 'text-start'
            }`}
          >
            <Text
              size={
                variant == 'vertical' || variant == 'horizontal' ? 'base' : 'md'
              }
              color="text-black"
              font={variant == 'sm' ? 'font-light' : 'font-regular'}
            >
              <span className="description">{description}</span>
            </Text>
          </div>
        </div>
      )}

      {children}
    </>
  );
}

export default CardBody;
