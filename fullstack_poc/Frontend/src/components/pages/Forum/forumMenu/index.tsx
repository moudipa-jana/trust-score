// import { useRouter } from 'next/router';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import campfireIcon from '/public/images/campfire.svg';
import CampfirePoll from '/public/images/CampfirePoll.svg';
import CampfireQuestion from '/public/images/CampfireQuestion.svg';
import CampfireQuiz from '/public/images/CampfireQuiz.svg';
import pollIcon from '/public/images/poll.svg';
import quizIcon from '/public/images/quiz.svg';
import userIcon from '/public/images/userIcon.svg';
import JoinModal from '@/components/pages/Campfire/OtherCampfire/JoinModalFlow';
import CampfireModals from '@/components/pages/Forum/campfire';
import AskQuestionDialog from '@/components/pages/Forum/forumMenu/AskQuestion';
import CreateQuizDialog from '@/components/pages/Forum/forumMenu/CreateQuiz';
import EditPostModal from '@/components/pages/Forum/forumMenu/EditPostModal';
import StartPollDialog from '@/components/pages/Forum/forumMenu/StartPoll';
import Logo from '@/components/Utility/Logo';
import Modal from '@/components/Utility/Modal';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import useIsipad from '@/Hooks/useIsIpad';
import useIsMobile from '@/Hooks/useIsMobile';
import { useAppDispatch, useAppSelector } from '@/Hooks/useRedux';
import { selectIsAuthenticated } from '@/state/Slices/auth';
import { getCampfireData } from '@/state/Slices/campfire';
import {
  toggleAskQuestionDialog,
  toggleAskQuestionPollDialog,
  toggleCampfirePage,
  toggleCreateQuizDialog,
  toggleSearchCampfireDialog,
  toggleSearchSocialDialog,
  toggleSignupDialog,
  toggleStartPollDialog,
} from '@/state/Slices/dialog';
import { ActionTypeEnum } from '@/types/enums';

import Icon from './icon';

interface Props {
  isCampfirePage?: boolean;
  navView?: boolean;
  dropView?: boolean;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  campModal?: boolean;
  campfirePage?: boolean;
  isCampfireSearch?: boolean;
}
function ForumMenu({
  isCampfirePage,
  navView,
  dropView,
  setIsOpen,
  isOpen,
  campModal,
  campfirePage,
  isCampfireSearch,
}: Props) {
  const [formSteps, setFormSteps] = useState(0);
  const [campfireModal, setCampfireModal] = useState(false);
  const [backIcon, setBackIcon] = useState(false);
  const dispatch = useAppDispatch();
  // const router = useRouter();
  const campfireData = useAppSelector(getCampfireData);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [toggleJoin, setToggleJoin] = useState(false);
  const [swipeableIndex, setSwipeableIndex] = useState(0);
  const nextStep = () => setSwipeableIndex((prevIndex) => prevIndex + 1);
  const isipad = useIsipad();
  const ismobile = useIsMobile();
  const isdesktop = useIsDesktop();
  const router = useRouter();

  useEffect(() => {
    if (campfireModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflowY = 'unset';
      document.body.style.overflowX = 'hidden';
    }
  }, [campfireModal]);

  const handleActionClick = (chooseAction: ActionTypeEnum) => {
    if (!isAuthenticated) {
      return dispatch(toggleSignupDialog(true));
    }
    if (campfirePage && !campfireData?.isMember) {
      return setToggleJoin(true);
    }
    if (dropView) {
      if (setIsOpen) setIsOpen(false);
    }
    dispatch(toggleAskQuestionDialog(false));
    dispatch(toggleAskQuestionPollDialog(false));
    dispatch(toggleStartPollDialog(false));
    dispatch(toggleCreateQuizDialog(false));
    if (isCampfireSearch) {
      dispatch(toggleCampfirePage(true));
    } else {
      dispatch(toggleCampfirePage(false));
    }
    switch (chooseAction) {
      case ActionTypeEnum.question:
        return dispatch(toggleAskQuestionDialog(true));
      case ActionTypeEnum.poll:
        return dispatch(toggleAskQuestionPollDialog(true));
      case ActionTypeEnum.quiz:
        return dispatch(toggleCreateQuizDialog(true));
      case ActionTypeEnum.campfire:
        return router.push('/campfire');
      default:
        return null;
    }
  };

  const onBack = () => {
    if (formSteps === 1 && swipeableIndex === 1) {
      setSwipeableIndex(0);
    } else {
      setFormSteps(0);
    }
    setBackIcon(false);
  };
  const onClose = () => {
    setFormSteps(0);
    setSwipeableIndex(0);
    setBackIcon(false);
    setCampfireModal(false);
    dispatch(toggleSearchSocialDialog(false));
    dispatch(toggleSearchCampfireDialog(false));
  };

  return (
    <>
      <div
        className={`${campfirePage
          ? 'ml-6 mr-0 pt-2 lg:ml-4 lg:pt-2 xl:pt-3'
          : 'pt-2 lg:pt-2 xl:ml-2 xl:pt-3'
          }`}
      >
        <div
          className={`flex justify-between
           ${dropView ? 'flex-col gap-2 pb-1.5' : ''}
           ${navView ? 'ml-1 gap-[10px] lg:gap-3 xl:gap-5' : ''}
       `}
        >
          <div
            className={`flex cursor-pointer items-center ${navView ? 'flex-col' : ''
              }`}
            onClick={() => handleActionClick(ActionTypeEnum.question)}
          >
            {navView ? (
              <>
                {isCampfireSearch ? (
                  <Icon noMargin icon={CampfireQuestion} />
                ) : (
                  <Icon noMargin icon={userIcon} />
                )}

                <Text size="xxs" variant color="text-black-300">
                  {ismobile ? (
                    <div style={{ fontSize: '8px', color: '#00B2ED' }}>Ask</div>
                  ) : (
                    <div style={{ color: '#00B2ED' }}>Question</div>
                  )}
                </Text>
              </>
            ) : dropView && isOpen ? (
              <div className="flex items-center gap-2">
                <Icon mobMenu icon={userIcon} />

                <Text size="xxs" variant color="text-black">
                  <div>Ask</div>
                </Text>
              </div>
            ) : (
              <>
                {isipad ? (
                  <div style={{ marginRight: 3, marginBottom: 5 }}>
                    <Icon noMargin icon={userIcon} />
                  </div>
                ) : (
                  <div style={{ marginBottom: ismobile ? 3 : 5 }}>
                    <Icon icon={userIcon} />
                  </div>
                )}

                <Text size="lg" variant color="text-black-300">
                  <div className="hidden lg:block">Ask a question</div>
                  <div className="lg:hidden">Ask</div>
                </Text>
              </>
            )}
          </div>

          <div
            className={`flex cursor-pointer items-center ${navView ? 'flex-col' : ''
              }`}
            onClick={() => handleActionClick(ActionTypeEnum.quiz)}
          >
            {navView ? (
              <>
                {isCampfireSearch ? (
                  <Icon noMargin icon={CampfireQuiz} />
                ) : (
                  <Icon noMargin icon={quizIcon} />
                )}
                <Text size="xxs" variant color="text-black-300">
                  <div
                    style={{
                      fontSize: ismobile ? '8px' : '10px',
                      color: '#00B2ED',
                    }}
                  >
                    Quiz
                  </div>
                </Text>
              </>
            ) : dropView && isOpen ? (
              <div className="flex items-center gap-2">
                <Icon mobMenu icon={quizIcon} />

                <Text variant color="text-black">
                  <div>Quiz</div>
                </Text>
              </div>
            ) : (
              <>
                {isipad ? (
                  <div style={{ marginRight: 3, marginBottom: 5 }}>
                    <Icon noMargin icon={quizIcon} />
                  </div>
                ) : (
                  <div style={{ marginBottom: ismobile ? 3 : 5 }}>
                    <Icon icon={quizIcon} />
                  </div>
                )}

                <Text size="lg" variant color="text-black-300 ">
                  <div className="hidden lg:block"> Create a quiz</div>
                  <div className="lg:hidden"> Quiz</div>
                </Text>
              </>
            )}
          </div>

          <div
            className={`flex cursor-pointer items-center ${navView ? 'flex-col' : ''
              }`}
            onClick={() => handleActionClick(ActionTypeEnum.poll)}
          >
            {navView ? (
              <>
                {isCampfireSearch ? (
                  <Icon noMargin icon={CampfirePoll} />
                ) : (
                  <Icon noMargin icon={pollIcon} />
                )}

                <Text size="xxs" variant color="text-black-300">
                  <div
                    style={{
                      fontSize: ismobile ? '8px' : '10px',
                      color: '#00B2ED',
                    }}
                  >
                    Poll
                  </div>
                </Text>
              </>
            ) : dropView && isOpen ? (
              <div className="flex items-center gap-2">
                <Icon mobMenu icon={pollIcon} />

                <Text size="xxs" variant color="text-black">
                  <div>Poll</div>
                </Text>
              </div>
            ) : (
              <>
                {isipad ? (
                  <div style={{ marginRight: 3, marginBottom: 5 }}>
                    <Icon noMargin icon={pollIcon} />
                  </div>
                ) : (
                  <div style={{ marginBottom: ismobile ? 3 : 5 }}>
                    <Icon icon={pollIcon} />
                  </div>
                )}

                <Text size="lg" variant color="text-black-300">
                  <div className="hidden lg:block"> Start a poll</div>
                  <div className="lg:hidden"> Poll</div>
                </Text>
              </>
            )}
          </div>

          {isCampfirePage ? (
            <>
              <div></div>
              <div></div>
            </>
          ) : (
            ''
          )}
          <div>
            {!isCampfirePage && (
              <div
                className={`flex cursor-pointer items-center ${navView ? 'flex-col' : ''
                  }`}
                onClick={() => handleActionClick(ActionTypeEnum.campfire)}
              >
                {navView ? (
                  <>
                    <Icon noMargin icon={campfireIcon} />

                    <Text size="xxs" variant color="text-black-300">
                      <div
                        style={{
                          fontSize: ismobile ? '8px' : '10px',
                          color: '#00B2ED',
                        }}
                      >
                        Campfire
                      </div>
                    </Text>
                  </>
                ) : dropView && isOpen ? (
                  <div className="flex items-center gap-2">
                    <Icon mobMenu icon={campfireIcon} />

                    <Text size="xxs" variant color="text-black">
                      <div>Campfire</div>
                    </Text>
                  </div>
                ) : (
                  <>
                    {isipad ? (
                      <div style={{ marginRight: 3, marginBottom: 5 }}>
                        <Icon noMargin icon={campfireIcon} />
                      </div>
                    ) : (
                      <div style={{ marginBottom: ismobile ? 3 : 5 }}>
                        <Icon icon={campfireIcon} />
                      </div>
                    )}

                    <Text size="lg" variant color="text-black-300">
                      Campfire
                    </Text>
                  </>
                )}
              </div>
            )}
          </div>

          {campModal ? (
            <Modal
              campModal
              id="CampfireModal"
              isVisible={campfireModal}
              noCloseIcon
              isOverlayWhite={formSteps === 1}
              isWelcomeModal={formSteps === 0}
            >
              <div>
                {formSteps === 1 && ismobile ? (
                  <div className="px-5">
                    <div className="flex flex-row justify-between px-2">
                      <button
                        className=" left-2 lg:left-5 xlg:left-10 "
                        onClick={() => onBack()}
                      >
                        <FaArrowLeft className="text-md text-gray-700" />
                      </button>

                      <button
                        onClick={() => onClose()}
                        className=" right-4 z-40 lg:right-10 lg:top-8"
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
                    className={`flex flex-row justify-between ${formSteps === 0 ? 'pt-8' : ''
                      }  ${formSteps === 0 && isdesktop ? 'pl-16' : ''}`}
                  >
                    <div className="flex flex-row">
                      {formSteps > 0 && (
                        <button
                          className=" left-2 lg:left-5 xlg:left-10 "
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
                      onClick={() => onClose()}
                      className=" right-4 z-40 lg:right-10 lg:top-8"
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
                    setBackIcon={setBackIcon}
                    swipeableIndex={swipeableIndex}
                    nextStep={nextStep}
                    onClose={onClose}
                  />
                </div>
              </div>
            </Modal>
          ) : (
            <Modal
              id="CampfireModal"
              backIcon={backIcon}
              isVisible={campfireModal}
              onBack={() => {
                setFormSteps(0);
                setBackIcon(false);
              }}
              onClose={() => {
                setFormSteps(0);
                setBackIcon(false);
                setCampfireModal(false);
              }}
            >
              <CampfireModals
                formSteps={formSteps}
                setFormSteps={setFormSteps}
                setBackIcon={setBackIcon}
                onClose={onClose}
              />
            </Modal>
          )}
        </div>
      </div>
      {campfirePage && !campfireData?.isMember && (
        <JoinModal
          data={campfireData}
          toggleJoin={toggleJoin}
          setToggleJoin={setToggleJoin}
          isHide
        />
      )}
      <AskQuestionDialog />
      <CreateQuizDialog />
      <StartPollDialog />
      <EditPostModal />
    </>
  );
}

export default ForumMenu;
