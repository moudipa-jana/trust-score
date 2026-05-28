'use client';

import Button from '@/components/Utility/Button';
import { validateImageUrl } from '@/lib/helpers';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import CustomImage from '../CustomImage';

interface ImageZoomModalProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  showControls?: boolean;
  backdropClass?: string;
  imageClass?: string;
}

export default function ImageViewModal({
  src,
  alt = 'Zoomed Image',
  isOpen,
  onClose,
  maxZoom = 5,
  minZoom = 1,
  zoomStep = 0.2,
  showControls = true,
  backdropClass = '',
  imageClass = '',
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // prevent page scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const close = (e: any) => {
    e.stopPropagation();
    reset();
    onClose();
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + zoomStep, maxZoom));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - zoomStep, minZoom));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, minZoom), maxZoom);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/90 ${backdropClass}`}
      onClick={(e) => close(e)}
    >
      <div className="pt-6 top-0 right-10 absolute cursor-pointer" onClick={(e) => close(e)}>
        <svg
          width="14"
          height="15"
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.645 7.5L13.65 2.495C13.8717 2.285 14 1.99333 14 1.66667C14 1.025 13.475 0.5 12.8333 0.5C12.5067 0.5 12.215 0.628333 12.005 0.838333L7 5.855L1.995 0.838333C1.785 0.628333 1.49333 0.5 1.16667 0.5C0.525 0.5 0 1.025 0 1.66667C0 1.99333 0.128333 2.285 0.338333 2.495L5.355 7.5L0.35 12.505C0.128334 12.715 0 13.0067 0 13.3333C0 13.975 0.525 14.5 1.16667 14.5C1.49333 14.5 1.785 14.3717 1.995 14.1617L7 9.145L12.005 14.15C12.215 14.3717 12.5067 14.5 12.8333 14.5C13.475 14.5 14 13.975 14 13.3333C14 13.0067 13.8717 12.715 13.6617 12.505L8.645 7.5Z"
            fill="#fff"
          />
        </svg>
      </div>

      <div className='max-h-[80vh]'>
        {/* Image Container */}
        <div
          className="cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }}
        >
          <div className={`h-[80vh] w-full object-contain ${imageClass}`}> 
            <CustomImage
              src={src}
              alt={alt}
              height={400}
              width={400}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div >
  );
}
