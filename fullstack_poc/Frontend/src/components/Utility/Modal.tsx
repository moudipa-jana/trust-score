{
  /**
   * Modal component renders a portal-based overlay with flexible layout options,
   * supporting various modal types such as search, welcome, and campfire modals.
   * Handles close and back navigation, mobile responsiveness, and scroll locking.
   */
}
import { useEffect } from 'react';

import ReactPortal from '@/components/Utility/ReactPortal';
import { useIsipad } from '@/Hooks/useIsIpad';
import { useIsMobile } from '@/Hooks/useIsMobile';

interface Imodal {
  id: string;
  isVisible?: boolean;
  onClose?: (() => void) | null;
  onBack?: () => void;
  backIcon?: boolean;
  children?: React.ReactNode;
  bgTransparent?: boolean;
  searchModal?: boolean;
  isOpen?: boolean;
  campModal?: boolean;
  isBackgroundYellow?: boolean;
  noCloseIcon?: boolean;
  isOverlayWhite?: boolean;
  isFollowingList?: boolean;
  isWelcomeModal?: boolean;
  closeIconClass?: string;
  modalTitle?: string;
  modalClassName?: string;
  isDeleteAccountModal?: boolean;
}

const Modal = ({
  id,
  isVisible,
  closeIconClass,
  onClose,
  onBack,
  backIcon,
  children,
  bgTransparent,
  searchModal,
  isOpen,
  campModal,
  isBackgroundYellow = false,
  noCloseIcon = false,
  isOverlayWhite = false,
  isWelcomeModal = false,
  isFollowingList,
  modalTitle,
  modalClassName,
  isDeleteAccountModal,
}: Imodal) => {
  const ismobile = useIsMobile();
  const isIpad = useIsipad();

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflowY = 'unset';
      document.body.style.overflowX = 'hidden';
    };
  }, [isVisible]);

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).id === 'wrapper' ||
      (e.target as HTMLElement).id === 'campmodal' ||
      (e.target as HTMLElement).classList.contains('search-modal-container')
    ) {
      if (onClose) {
        e.stopPropagation();
        onClose();
        if (isVisible) {
          document.body.classList.remove('modal-open');
        }
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <ReactPortal wrapperId={id}>
      <div
        className={`animated fadeIn faster modal modalOverlay
          ${modalClassName}
        ${isOverlayWhite && ismobile
            ? 'z-150 bg-white'
            : searchModal && !ismobile
              ? 'z-150 lg:bg-offwhite-150 lg:bg-opacity-60'
              : searchModal && ismobile
                ? 'top-12 z-115 bg-white bg-opacity-100'
                : 'z-150 bg-offwhite-150 bg-opacity-60'
          }`}
        id={`${isOverlayWhite && ismobile
          ? 'ismobile'
          : campModal
            ? 'campmodal'
            : 'wrapper'
          }`}
        onClick={handleClose}
      >
        <div
          className={` ${bgTransparent
            ? 'relative'
            : isWelcomeModal && ismobile
              ? 'welcome-container-mobile relative mx-2 bg-white lg:mx-0 lg:px-20 lg:py-15'
              : isWelcomeModal && isIpad
                ? 'welcome-container-tablet relative mx-2 bg-white lg:mx-0 lg:px-20 lg:py-15'
                : isWelcomeModal
                  ? 'welcome-container-desktop relative mx-2 bg-white lg:mx-0 lg:px-20 lg:py-15'
                  : isOverlayWhite && ismobile
                    ? 'overlay-white-container container relative bg-white'
                    : searchModal
                      ? 'search-modal-container container relative lg:pt-28 xl:pt-22.5'
                      : isBackgroundYellow
                        ? 'modal-container relative mx-2 bg-yellow-20 lg:mx-0'
                        : isFollowingList
                          ? 'modal-container hide-scrollbar-list relative mx-2 bg-white lg:mx-0 lg:px-20 lg:py-15'
                          : isDeleteAccountModal
                            ? 'modal-container relative mx-2 bg-white lg:mx-0 lg:max-w-screen-lg lg:px-20 lg:py-15 !overflow-hidden !py-10'
                            : 'modal-container relative mx-2 bg-white lg:mx-0 lg:px-20 lg:py-15'
            }`}
          onClick={handleClose}
        >
          <div
            className={`modal-content relative ${!isIpad && !ismobile && !isOpen && searchModal ? 'relative' : ''
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {backIcon && onBack && (
                  <button className="modal-back-close modal-back-btn" onClick={() => onBack()}>
                    <svg
                      width="18"
                      height="17"
                      viewBox="0 0 18 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.29546 0.783953C7.68887 0.396332 8.32202 0.40102 8.70964 0.794426C9.09726 1.18783 9.09257 1.82098 8.69917 2.2086L3.32881 7.5H17C17.5523 7.5 18 7.94772 18 8.5C18 9.05229 17.5523 9.5 17 9.5H3.33542L8.69917 14.7849C9.09257 15.1725 9.09726 15.8057 8.70964 16.1991C8.32202 16.5925 7.68887 16.5972 7.29546 16.2095L0.371273 9.38715C-0.125641 8.89754 -0.125641 8.09595 0.371273 7.60634L7.29546 0.783953Z"
                        fill="#737373"
                      />
                    </svg>
                  </button>
                )}
                <div>
                  <h4 className="lg:text-2xl font-semibold">{modalTitle}</h4>
                </div>
              </div>
              {onClose && !noCloseIcon && (
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className={`modal-back-close modal-close-btn right-4 z-40 ${isBackgroundYellow ? 'lg:right-6 lg:top-4' : ''
                    } ${searchModal ? 'hidden' : ''} ${closeIconClass} `}
                >
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
                      fill="#121212"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className={`${searchModal || campModal ? '' : ' '}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default Modal;
