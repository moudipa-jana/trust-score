/**
 * Cover Component
 *
 * Displays an image or video thumbnail with optional styling based on type, variant, and layout preferences.
 * Supports hover-to-play for YouTube (iframe) and hosted video (HTML5) when `hoverVideoSrc` is provided.
 */

import React, { useEffect, useRef, useState } from 'react';
import playImage from '../../../public/images/blog/play.svg';
import CustomImage from '../Utility/CustomImage';
import useIsMobile from '@/Hooks/useIsMobile';
import { getYouTubeVideoId } from '@/lib/helpers';

interface CoverProps {
  coverImg: string;
  playIcon?: boolean;
  playIconSrc?: string;
  hoverVideoSrc?: string; // optional preview source (YouTube URL or hosted video)
  type?:
    | 'coverImgSm'
    | 'coverImglg'
    | 'coverImgmd'
    | 'coverImgxl'
    | 'forumCover'
    | string;
  width?: number;
  height?: number;
  space?: boolean;
  video?: boolean;
  variant?: 'horizontal' | 'vertical' | string;
  searchSpace?: boolean;
  isBorderRadius?: boolean;
  isFullHeight?: boolean; // kept for backward compatibility but no longer used
  fallbackSrc?: string;
}
function Cover({
  coverImg,
  playIcon,
  playIconSrc,
  hoverVideoSrc,
  type,
  width,
  height,
  space,
  video,
  variant,
  searchSpace,
  isBorderRadius,
  isFullHeight, // intentionally unused
  fallbackSrc,
}: CoverProps) {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const htmlVideoRef = useRef<HTMLVideoElement | null>(null);

  const isYouTubeHover =
    !!hoverVideoSrc && !!getYouTubeVideoId(hoverVideoSrc || '');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (!hoverVideoSrc) return;

    if (isYouTubeHover) {
      const videoId = getYouTubeVideoId(hoverVideoSrc || '') || '';
      const base = `https://www.youtube.com/embed/${videoId}`;
      if (iframeRef.current) {
        // default (no-autoplay) src
        iframeRef.current.src = `${base}?controls=0&mute=1&enablejsapi=1&origin=${origin}`;
        if (hovered && !isMobile) {
          iframeRef.current.src = `${base}?autoplay=1&controls=0&mute=1&enablejsapi=1&origin=${origin}`;
        } else {
          iframeRef.current.src = `${base}?controls=0&mute=1&enablejsapi=1&origin=${origin}`;
        }
      }
    } else {
      if (htmlVideoRef.current) {
        if (hovered && !isMobile) {
          htmlVideoRef.current.muted = true;
          void htmlVideoRef.current.play();
        } else {
          htmlVideoRef.current.pause();
          try {
            htmlVideoRef.current.currentTime = 0;
          } catch (e) {
            /* no-op */
          }
        }
      }
    }
  }, [hoverVideoSrc, hovered, isYouTubeHover, isMobile, origin]);

  return (
    <div
      className={`imgContainr relative video-cover-img cover-img  
      ${
        space
          ? 'px-3 pt-2'
          : searchSpace
            ? 'px-3 pt-2 xl:pt-4 xl:pl-10 xl:pr-8'
            : ''
      }
      ${variant == 'vertical' ? '' : variant == 'horizontal' ? '' : ''}
      ${
        type == 'coverImgSm'
          ? 'max-h-38 min-h-38'
          : type == 'coverImglg'
            ? 'pb-2 lg:min-h-44 lg:pl-4 xl:min-h-70.75'
            : type == 'coverImgmd'
              ? 'overflow-hidden'
              : type == 'coverImgxl'
                ? 'overflow-hidden'
                : video
                  ? 'h-full'
                  : isFullHeight
                    ? 'h-full'
                    : 'max-h-63.25 min-h-63.25 overflow-hidden'
      } `}
      style={{ height: 'inherit' }}
      onMouseEnter={() => hoverVideoSrc && setHovered(true)}
      onMouseLeave={() => hoverVideoSrc && setHovered(false)}
    >
      {video ? (
        <CustomImage
          src={coverImg}
          width={width || 100}
          height={height || 100}
          className="coverImglg !max-h-16.5 min-h-16.5 object-cover "
          fallbackSrc={fallbackSrc}
        />
      ) : (
        <CustomImage
          src={coverImg}
          width={width || 100}
          height={height || 100}
          fallbackSrc={fallbackSrc}
          className={`object-cover 
          
          ${isBorderRadius ? 'rounded-t-xl' : ''}
          ${variant == 'vertical' ? '' : variant == 'horizontal' ? '' : ''}
           ${
             type == 'coverImgSm'
               ? 'max-h-38 min-h-38'
               : type == 'coverImgmd'
                 ? 'max-h-47.5 min-h-[190px] overflow-hidden rounded-md'
                 : type == 'coverImglg'
                   ? 'rounded-lg'
                   : type == 'coverImgxl'
                     ? 'max-h-47.5 min-h-[190px] overflow-hidden rounded-md lg:max-h-70.75'
                     : type == 'forumCover'
                       ? 'max-h-28'
                       : '!max-h-16.5 min-h-16.5 video-cover-img'
           } `}
        />
      )}

      {/* Hover preview (YouTube iframe or hosted video) - desktop only */}
      {hoverVideoSrc && (
        <>
          {isYouTubeHover ? (
            <iframe
              ref={iframeRef}
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
              src={''}
              title="YouTube preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            <video
              ref={htmlVideoRef}
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
              src={hoverVideoSrc}
              muted
              playsInline
              loop
              preload="metadata"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </>
      )}

      {playIcon && (
        <div className="absolute bottom-4 right-4 h-[50px] w-[50px] z-10">
          <CustomImage
            src={playIconSrc || playImage}
            width={50}
            height={50}
          ></CustomImage>
        </div>
      )}
    </div>
  );
}

export default Cover;
