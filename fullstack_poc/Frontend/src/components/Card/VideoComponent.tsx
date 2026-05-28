/**
 * VideoComponent renders a video player with optional modal functionality.
 * It shows a cover video/image with a play button, which opens a modal with a larger video player.
 * Supports mobile responsiveness and time update handling.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import CustomImage from '@/components/Utility/CustomImage';
import useIsMobile from '@/Hooks/useIsMobile';

interface VideoComponentProps {
  src?: string;
  coversrc?: string;
  bingeBanner?: boolean;
  children?: React.ReactNode;
  handleTimeUpdate?: () => void;
}

export default function VideoComponent({
  src,
  coversrc,
  bingeBanner,
  children,
  handleTimeUpdate,
}: VideoComponentProps) {
  const ismobile = useIsMobile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (
      modalRef.current &&
      e.target &&
      !modalRef.current.contains(e.target as Node)
    ) {
      closeModal();
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen, handleOutsideClick]);

  return bingeBanner ? (
    <div className="relative">
      <video
        id="videoPlayer"
        className="max-h-44.25 min-h-44.25 w-full rounded-lg bg-offwhite-850 object-cover lg:max-h-83 lg:min-h-83"
        autoPlay
        muted
        loop
        src={coversrc}
        onTimeUpdate={handleTimeUpdate}
      ></video>
      <div
        className="absolute top-1/2 left-1/2 z-10 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
        ref={modalRef}
        onClick={openModal}
      >
        <CustomImage
          src="/images/sunrise/play-icon.svg"
          fill
          className="!h-9 !w-9 lg:!h-15 lg:!w-15 xl:!h-full xl:!w-full"
        />
      </div>

      {isModalOpen && (
        <div
          className="modal z-160 bg-offwhite-150 bg-opacity-90"
          ref={modalRef}
        >
          <div className="modal-content">
            <video
              id="videoPlayerModal"
              className="max-h-480"
              controls
              muted
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              autoPlay
              src={src}
            ></video>

            <button
              onClick={closeModal}
              className="modal-back-close modal-back-btn right-4 top-20 lg:right-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
              >
                <path
                  d="M12 9.977L4.22222 2.19922L2 4.42144L9.77778 12.1992L2 19.977L4.22222 22.1992L12 14.4214L19.7778 22.1992L22 19.977L14.2222 12.1992L22 4.42144L19.7778 2.19922L12 9.977Z"
                  fill="#737373"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`gradient-overlay z-0 ${ismobile ? 'grad-mob' : 'grad-lg'}`}
      ></div>
      {children}
    </div>
  ) : (
    <video
      id="videoPlayer"
      className=" max-h-16.5 min-h-16.5 bg-black"
      controls
      disablePictureInPicture
      controlsList="nodownload noplaybackrate"
      autoPlay
      src={src}
      onTimeUpdate={handleTimeUpdate}
    ></video>
  );
}
