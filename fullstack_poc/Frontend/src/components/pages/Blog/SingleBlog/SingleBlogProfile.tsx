'use client';

import { useRouter } from 'next/router';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { FacebookShareButton } from 'react-share';

import CopyShare from '/public/images/copyshare.png';
import FacebookShare from '/public/images/facebookshare.png';
import WhatsAppShare from '/public/images/whatsappshare.png';
import XShare from '/public/images/xshare.png';
import { BlogDetails } from '@/components/pages/Blog/SingleBlog/SingleBlogBody';
import CustomImage from '@/components/Utility/CustomImage';
import { formatTitleCaseName, getStrapiMedia } from '@/lib/helpers';

export default function SingleBlogProfile({
  blogDetails,
}: {
  blogDetails: BlogDetails;
}) {
  const router = useRouter();

  const [currentUrl, setCurrentUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl || '');
        setIsCopied(true);
      }
    } catch {
      setIsCopied(false);
    }
  };

  const shareOnTwitter = (title: string) => {
    const url = 'https://twitter.com/intent/tweet';
    const params = { text: title, url: currentUrl };
    const shareUrl = `${url}?${queryString.stringify(params)}`;
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=300');
    }
  };

  const author = blogDetails?.attributes?.sunrise_club_author?.data?.attributes;
  const authorNameTxt = author?.Name;
  const authorNameSlug = author?.Name_Slug;
  const authorImgUrl = author?.Image?.data?.attributes?.url;
  const authorAlt = author?.altText || author?.Name || 'Author';

  const doctor = blogDetails?.attributes?.sunrise_doctor?.data?.attributes;
  const doctorNameTxt = doctor?.Name;
  const doctorNameSlug = doctor?.Name_Slug;
  const doctorImgUrl = doctor?.Image?.data?.attributes?.url;
  const doctorAlt = doctor?.altText || doctor?.Name || 'Doctor';

  const hasAuthor = Boolean(authorNameTxt);
  const hasDoctor = Boolean(doctorNameTxt);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `Published at ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const updatedDate = formatDate(blogDetails?.attributes?.publish_date);

  return (
    <div className="mb-6">
      {/* <div className="flex items-center gap-6 flex-wrap"> */}
      <div className="flex items-center flex-nowrap">
        {/* Left side - Profile Picture and Author Info */}
        <div className="flex items-center gap-5">
          {/* Profile Picture */}
          {hasDoctor && (
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '61px',
              }}
            >
              <CustomImage
                src={getStrapiMedia(doctorImgUrl)}
                alt={doctorAlt}
                fill
                className="object-cover"
              />
            </div>
          )}
          {!hasDoctor && hasAuthor && (
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '61px',
              }}
            >
              <CustomImage
                src={getStrapiMedia(authorImgUrl)}
                alt={authorAlt}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Author/Doctor Info */}
          <div className="flex flex-col gap-1">
            {hasDoctor && (
              <div
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '20px',
                  lineHeight: '24px',
                  letterSpacing: '0%',
                }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    color: '#8F8F8F',
                  }}
                >
                  Reviewed by{' '}
                </span>
                <button
                  onClick={() => {
                    if (doctorNameSlug)
                      router.push(`/doctor/${doctorNameSlug}`);
                  }}
                  className="hover:underline transition-colors text-left"
                  style={{
                    fontWeight: 400,
                    color: '#00B2ED',
                  }}
                >
                  {/* Dr. {capitalize(doctorNameTxt || '')} */}
                  Dr. {formatTitleCaseName(doctorNameTxt || '')}
                </button>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#8F8F8F',
                  }}
                >
                  , MD
                </span>
              </div>
            )}

            {hasAuthor && (
              <div
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    color: '#8F8F8F',
                  }}
                >
                  Written by{' '}
                </span>
                <button
                  onClick={() => {
                    if (authorNameSlug)
                      router.push(`/author/${authorNameSlug}`);
                  }}
                  className="hover:underline transition-colors text-left"
                  style={{
                    fontWeight: 400,
                    color: '#00B2ED',
                  }}
                >
                  {formatTitleCaseName(authorNameTxt || '')}
                </button>
              </div>
            )}

            {updatedDate && (
              <div
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '0%',
                  color: '#8F8F8F',
                }}
              >
                {updatedDate}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Social Icons (aligned horizontally beside author section) */}
        <div
          className="flex items-center flex-shrink-0"
          style={{ paddingLeft: '1cm' }}
        >
          <div className="socialIcons">
            <ul
              className="flex items-center gap-4 text-xl"
              style={{ gap: '36px' }}
            >
              <li className="shareButton" data-title="Share on Facebook">
                <FacebookShareButton url={currentUrl}>
                  <div
                    style={{
                      width: '32px',
                      height: '31.88px',
                      opacity: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <CustomImage
                      src={FacebookShare}
                      alt="Share on Facebook"
                      width={32}
                      height={32}
                    />
                  </div>
                </FacebookShareButton>
              </li>

              <li
                className="shareButton cursor-pointer"
                data-title="Share on WhatsApp"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${blogDetails?.attributes?.Title} - ${currentUrl}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '32px',
                    height: '31.88px',
                    opacity: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CustomImage
                    src={WhatsAppShare}
                    alt="Share on WhatsApp"
                    width={32}
                    height={32}
                  />
                </a>
              </li>

              <li
                className="shareButton cursor-pointer"
                data-title="Share on Twitter"
                onClick={() => shareOnTwitter(blogDetails?.attributes?.Title)}
                style={{
                  width: '32px',
                  height: '31.88px',
                  opacity: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomImage
                  src={XShare}
                  alt="Share on Twitter"
                  width={32}
                  height={32}
                />
              </li>

              <li
                className={`shareButton cursor-pointer ${
                  isCopied ? 'text-primary' : 'text-black'
                }`}
                onClick={handleCopy}
                data-title={`${isCopied ? 'Copied link' : 'copy link'}`}
                style={{
                  width: '32px',
                  height: '31.88px',
                  opacity: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomImage
                  src={CopyShare}
                  alt="Copy link"
                  width={32}
                  height={32}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
