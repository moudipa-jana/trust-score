import { capitalize } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import SensitiveContentModal from '@/components/Utility/SensitiveContentModal';
import { getStrapiMedia } from '@/lib/helpers';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';

interface BlogThinCardsProps {
  blog: Blog;
}

function daysAgo(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - d.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

// optional: replace with your real read time field if you have one
function readTime(blog: Blog) {
  // If you already store reading time, use that:
  // return `${blog?.attributes?.readTime ?? 3} min`;

  return '3 min';
}

export default function BlogThinCards({ blog }: BlogThinCardsProps) {
  const router = useRouter();
  const [hushTalksModal, setHushTalksModal] = useState(false);
  const [blogData, setBlogData] = useState<Blog | null>(null);

  const categoryTitle =
    blog?.attributes?.blog_categories?.data?.[0]?.attributes?.title;

  const isSensitive = blog?.attributes?.blog_categories?.data?.some(
    (cat) =>
      cat.attributes.title === 'Hush Talks' ||
      cat.attributes.title === 'She Reads' ||
      cat.attributes.title === 'She Read',
  );

  const href = `/sunrise-club/${router.query.categoryName}/${blog?.attributes?.slug}`;

  return (
    <>
      <SensitiveContentModal
        open={hushTalksModal}
        onClose={() => setHushTalksModal(false)}
        onDeny={() => setHushTalksModal(false)}
        onConfirm={() => {
          setHushTalksModal(false);
          router.push(
            `/sunrise-club/${router.query.categoryName}/${blogData?.attributes?.slug}`,
          );
        }}
      />

      <Link
        href={href}
        onClick={(e) => {
          if (isSensitive) {
            e.preventDefault();
            setBlogData(blog);
            setHushTalksModal(true);
          }
        }}
        className="group block"
      >
        <div className="flex items-center bg-[#F2F2F2] rounded-xl overflow-hidden min-h-[90px]">
          {/* Image */}
          <div className="relative w-[170px] h-[92px] shrink-0 bg-white">
            <img
              src={getStrapiMedia(
                blog?.attributes?.coverImg?.data?.attributes?.url,
              )}
              alt={blog?.attributes?.Title ?? 'Blog cover'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="px-5 py-2.5">
            <h3 className="text-[16px] font-semibold leading-snug text-black line-clamp-2">
              {capitalize(blog?.attributes?.Title)}
            </h3>

            <div className="mt-2 text-[13px] text-[#8A8A8A] flex items-center gap-3">
              <span>{daysAgo(blog?.attributes?.publish_date)}</span>
              <span>{readTime(blog)}</span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
