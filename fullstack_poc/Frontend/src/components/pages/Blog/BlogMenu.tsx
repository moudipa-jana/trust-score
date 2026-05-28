import Link from 'next/link';
import { lowerCase } from 'lodash';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { BlogCategory } from '@/pages/sunrise-club-old';
import { set } from 'lodash';

interface BlogMenuProps {
  blogsCategories: BlogCategory[];
  onTabClick: () => void;
}

interface MouseEvent {
  target: EventTarget | null;
}

export default function BlogMenu({
  blogsCategories,
  onTabClick,
}: BlogMenuProps) {
  const router = useRouter();
  const startingPath = router.pathname.split('/')[1];
  const [slug, setSlug] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [hushTalksModal, setHushTalksModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<any>(null);

  const [visibleCategories, setVisibleCategories] = useState<BlogCategory[]>(
    [],
  );
  const [hiddenCategories, setHiddenCategories] = useState<BlogCategory[]>([]);

  useEffect(() => {
    const slugName = router.query.categoryName as string;
    setSlug(slugName);
    onTabClick();
  }, [router.query.categoryName, onTabClick]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMore(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownRef]);

  useEffect(() => {
    setShowMore(false);
  }, [router.asPath]);

  const updateCategories = useCallback(() => {
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    let updatedVisibleCategories: BlogCategory[] = [];
    let updatedHiddenCategories: BlogCategory[] = [];

    if (screenWidth < 768) {
      // Mobile: show all tabs with horizontal scroll
      updatedVisibleCategories = blogsCategories;
      updatedHiddenCategories = [];
    } else if (screenWidth < 1280) {
      // Tablet: show 5 tabs + More dropdown
      updatedVisibleCategories = blogsCategories.slice(0, 5);
      updatedHiddenCategories = blogsCategories.slice(5);
    } else {
      // Desktop: show 8 tabs (up to Hush Talks) + More dropdown for rest
      updatedVisibleCategories = blogsCategories.slice(0, 8);
      updatedHiddenCategories = blogsCategories.slice(8);
    }

    setVisibleCategories(updatedVisibleCategories);
    setHiddenCategories(updatedHiddenCategories);
  }, [blogsCategories]);

  useEffect(() => {
    updateCategories();
    window.addEventListener('resize', updateCategories);
    return () => {
      window.removeEventListener('resize', updateCategories);
    };
  }, [slug, blogsCategories, updateCategories]);

  return (
    <div className="menu pt-4 pb-2" id="blogMenuSection">
      <div className="flex items-center justify-start border-b border-[#C4C4C4]">
        <ul className="sunriseMenu flex items-center gap-0 text-sm overflow-x-auto md:overflow-visible">
          {visibleCategories.map((data: BlogCategory) => {
            const isActive = data?.attributes?.slug == slug;
            return (
              <li
                key={data?.attributes?.slug}
                className={`relative px-3 py-1.5 text-sm font-medium transition-all md:px-4 ${
                  isActive ? 'rounded-t bg-[#F5F5F5]' : ''
                }`}
                style={{
                  color: isActive ? '#00B2ED' : '#9D9D9D',
                  marginBottom: '-1px',
                  borderBottom: isActive
                    ? '1px solid #00B2ED'
                    : '1px solid transparent',
                }}
              >
                <Link
                  href={data?.attributes?.slug}
                  onClick={(e) => {
                    if (
                      data?.attributes?.slug
                        ?.toLowerCase()
                        .includes('hush-talks') ||
                      data?.attributes?.slug
                        ?.toLowerCase()
                        .includes('she-reads')
                    ) {
                      e.preventDefault();
                      setSelectedSlug(data?.attributes.slug);
                      setHushTalksModal(true);
                    }
                  }}
                >
                  {data?.attributes?.title}
                </Link>
              </li>
            );
          })}
          {hiddenCategories && hiddenCategories.length > 0 && (
            <li
              className="relative px-3 py-1.5 text-sm font-medium md:px-4"
              style={{ color: '#9D9D9D', marginBottom: '-1px' }}
              ref={dropdownRef}
            >
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (hiddenCategories && hiddenCategories.length > 0) {
                    setShowMore(!showMore);
                  }
                }}
                className="flex cursor-pointer items-center gap-1"
              >
                More {showMore ? <FaAngleUp /> : <FaAngleDown />}
              </span>
              {showMore && hiddenCategories && hiddenCategories.length > 0 && (
                <ul className="absolute left-0 top-full z-50 max-h-[300px] w-[#200px] min-w-[200px] overflow-y-auto rounded-md bg-white px-4 py-2 shadow-lg border border-gray-100">
                  {hiddenCategories.map((data: BlogCategory) => {
                    const isActive = data?.attributes?.slug == slug;
                    return (
                      <li
                        key={data?.attributes?.slug}
                        className="py-2 text-sm font-medium transition-colors"
                        style={{ color: isActive ? '#00B2ED' : '#9D9D9D' }}
                      >
                        <Link
                          href={data?.attributes?.slug}
                          onClick={(e) => {
                            if (
                              data?.attributes?.slug
                                ?.toLowerCase()
                                .includes('hush-talks') ||
                              data?.attributes?.slug
                                ?.toLowerCase()
                                .includes('she-reads')
                            ) {
                              e.preventDefault();
                              setHushTalksModal(true);
                              setSelectedSlug(
                                lowerCase(data?.attributes?.slug),
                              );
                            }
                          }}
                        >
                          {data?.attributes?.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
      <SensitiveContentModal
        open={hushTalksModal}
        onClose={() => setHushTalksModal(!hushTalksModal)}
        onDeny={() => setHushTalksModal(false)}
        onConfirm={() => {
          router.push(`/${startingPath}/${selectedSlug}`);
          setHushTalksModal(false);
        }}
      />
    </div>
  );
}
