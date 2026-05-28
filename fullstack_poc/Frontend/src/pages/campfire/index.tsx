{
  /**
   * This component manages the main Campfire page where users can:
   * - View and browse all campfires
   * - Join campfires
   * - Create new campfires
   * - Handle authentication and access control
   **/
}

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import CampfireModals from '@/components/pages/Forum/campfire';
import Logo from '@/components/Utility/Logo';
import Modal from '@/components/Utility/Modal';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch } from '@/Hooks/useRedux';
import { toggleCampfirePage } from '@/state/Slices/dialog';

export default function CampfireIndex() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [formSteps, setFormSteps] = useState(0);
  const [swipeableIndex, setSwipeableIndex] = useState(0);

  const nextStep = () => setSwipeableIndex((prevIndex) => prevIndex + 1);

  const onBack = () => {
    if (formSteps === 1) {
      if (swipeableIndex > 0) {
        setSwipeableIndex((prev) => prev - 1);
      } else {
        setFormSteps(0);
      }
    } else {
      setFormSteps(0);
    }
  };
  const router = useRouter();
  const onClose = () => {
    const handleRouteChange = () => {
      setFormSteps(0);
      setSwipeableIndex(0);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
  };

  useEffect(() => {
    // Set campfire page state
    dispatch(toggleCampfirePage(true));

    return () => {
      dispatch(toggleCampfirePage(false));
    };
  }, [dispatch]);

  // Auto-open modal when page loads
  useEffect(() => {
    // Set initial form steps to trigger modal display
    setFormSteps(0);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Modal
        campModal
        id="CampfireModal"
        isVisible
        noCloseIcon
        isOverlayWhite={formSteps === 1}
        isWelcomeModal={formSteps === 0}
      >
        <div>
          {formSteps === 1 && isMobile ? (
            <div className="px-5">
              <div className="flex flex-row justify-between px-2">
                <button
                  className="left-2 lg:left-5 xlg:left-10"
                  onClick={() => onBack()}
                >
                  <FaArrowLeft className="text-md text-gray-700" />
                </button>

                <button
                  onClick={() => {
                    if (router.pathname === '/campfire') {
                      router.back();
                      onClose();
                    }
                  }}
                  className="right-4 z-40 lg:right-10 lg:top-8"
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

              <div className="h-8.2 w-38 pt-2">
                <Logo />
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-row justify-between ${
                formSteps === 0 ? 'pt-8' : ''
              }  ${formSteps === 0 && isDesktop ? 'pl-16' : ''}`}
            >
              <div className="flex flex-row">
                {formSteps > 0 && (
                  <button
                    className="left-2 lg:left-5 xlg:left-10"
                    onClick={() => onBack()}
                  >
                    <FaArrowLeft className="text-md text-gray-700" />
                  </button>
                )}
                <div className="h-8.2 w-38">
                  <Logo />
                </div>
              </div>

              <button
                onClick={() => {
                  if (router.pathname === '/campfire') {
                    router.back();
                    onClose();
                  }
                }}
                className="right-4 z-40 lg:right-10 lg:top-8"
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
          )}
          <div className={`${formSteps > 0 ? 'px-7' : 'px-2'}`}>
            <CampfireModals
              formSteps={formSteps}
              setFormSteps={setFormSteps}
              swipeableIndex={swipeableIndex}
              nextStep={nextStep}
              onClose={onClose}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
