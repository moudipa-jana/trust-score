import { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay, FaForward, FaBackward, FaCompress, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

import unmuteButton from '/public/images/pause.svg';
import muteButton from '/public/images/speaker.svg';
import CustomImage from '@/components/Utility/CustomImage';
import { getStrapiMedia } from '@/lib/helpers';
import iconFullscreen from '/public/images/about/btn-fullscreen.svg';

interface VideoSectionProps {
  video: string;
}

interface FullscreenableElement extends HTMLDivElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

function VideoSection({ video }: VideoSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);
  const [isMute, setIsMute] = useState(true); // Start muted for guaranteed autoplay

  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  // ✅ NEW: Container ref — fullscreen is requested on this div, not the video
  const containerRef = useRef<FullscreenableElement>(null);

  // ✅ FIXED: Listen for fullscreen change on the container (not just the video element)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Vendor-prefixed events for older browsers
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // ✅ FIXED: Request fullscreen on the CONTAINER div so custom controls are included
  const handleFullScreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  };

  // Exit fullscreen handler
  const handleExitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Forward 10 seconds
  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  // Backward 10 seconds
  const handleBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  // Play/pause handler
  const handleVideo = () => {
    setVideoOpen((prev) => {
      const newState = !prev;
      if (videoRef.current) {
        if (newState) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
      return newState;
    });
  };

  // Mute handler
  const handleMuteClick = () => {
    if (videoOpen && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMute(videoRef.current.muted);
    }
  };

  // Ensure video is muted on mount for autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setIsMute(true);
    }
  }, []);

  // Autoplay when section is visible (muted)
  useEffect(() => {
    let playTimeout: NodeJS.Timeout | null = null;
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMute(true);
              playTimeout = setTimeout(() => {
                videoRef.current
                  ?.play()
                  .then(() => setVideoOpen(true))
                  .catch(() => setVideoOpen(false));
              }, 2000);
            }
          } else {
            if (playTimeout) {
              clearTimeout(playTimeout);
              playTimeout = null;
            }
            if (videoRef.current) {
              videoRef.current.pause();
              setVideoOpen(false);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
      if (playTimeout) {
        clearTimeout(playTimeout);
      }
    };
  }, []);

  return (
    <div className="" id="section2" ref={sectionRef}>
      <div className="innerContent">
        <div
          className="video-holder relative"
          id="videoHolder"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center justify-center">

            {/*
              ✅ FIXED: containerRef wraps BOTH the video and custom controls.
              Fullscreen is requested on this div — so the overlay controls are
              promoted into the fullscreen layer along with the video.
            */}
            <div
              ref={containerRef}
              className="relative flex items-center justify-center w-full"
              style={isFullscreen ? { width: '100vw', height: '100vh' } : {}}
            >
              <video
                className={`aboutVideo${!isFullscreen ? ' masked' : ''}`}
                ref={videoRef}
                loop
                // ✅ FIXED: Always false — we handle controls ourselves in both modes
                controls={false}
                muted={isMute}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate"
                src={video ? getStrapiMedia(video) : '/video/Kofuku-about-video.mp4'}
              />

              {/* ✅ Custom controls — rendered inside the container so they show in fullscreen */}
              {isFullscreen && (
                <div className="video-controls absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6 bg-black/60 rounded-lg px-6 py-3 items-center z-20">
                  {/* Backward 10s */}
                  <button
                    onClick={handleBackward}
                    className="text-white text-2xl hover:text-yellow-400 transition-colors"
                    title="Back 10s"
                  >
                    <FaBackward />
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={handleVideo}
                    className="text-white text-2xl hover:text-yellow-400 transition-colors"
                    title={videoOpen ? 'Pause' : 'Play'}
                  >
                    {videoOpen ? <FaPause /> : <FaPlay />}
                  </button>

                  {/* Forward 10s */}
                  <button
                    onClick={handleForward}
                    className="text-white text-2xl hover:text-yellow-400 transition-colors"
                    title="Forward 10s"
                  >
                    <FaForward />
                  </button>

                  {/* Mute / Unmute */}
                  <button
                    onClick={handleMuteClick}
                    className="text-white text-2xl hover:text-yellow-400 transition-colors"
                    title={isMute ? 'Unmute' : 'Mute'}
                  >
                    {isMute ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>

                  {/* Exit Fullscreen */}
                  <button
                    onClick={handleExitFullScreen}
                    className="text-white text-2xl hover:text-yellow-400 transition-colors"
                    title="Exit Fullscreen"
                  >
                    <FaCompress />
                  </button>
                </div>
              )}
            </div>

            {/* Video poster overlay when paused */}
            {!videoOpen && (
              <div className="video-poster absolute top-0 left-0 w-full h-full pointer-events-none">
                <CustomImage
                  alt="Video Poster"
                  width={960}
                  height={472}
                  src={'/video/about-video-cover-img.png'}
                />
              </div>
            )}
          </div>

          {/* Fullscreen button — shown on hover (normal mode only) */}
          {isHovered && !isFullscreen && (
            <div
              className="absolute right-[70px] top-10 cursor-pointer bnt-full-screen transition-all duration-800 ease-in-out"
              onClick={handleFullScreen}
            >
              <CustomImage alt="FullScreen" src={iconFullscreen} width={40} height={40} />
            </div>
          )}

          {/* Mute toggle — shown below video in normal mode */}
          {!isFullscreen && (
            <div className="relative flex justify-between">
              <div
                onClick={handleMuteClick}
                className={`muteHolder ${videoOpen ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {!isMute ? (
                  <CustomImage alt="Mute" src={muteButton} />
                ) : (
                  <CustomImage alt="Unmute" src={unmuteButton} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoSection;
