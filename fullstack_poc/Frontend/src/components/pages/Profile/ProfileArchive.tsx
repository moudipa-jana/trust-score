import { NetworkStatus } from '@apollo/client';
import React, { useEffect, useState } from 'react';

import {
  ProfileActivityErrorComponent,
  ProfileActivityHeader,
} from '@/components/pages/Profile/ProfileActivities';
import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import Dropdown, { DropdownOptionType } from '@/components/Utility/Dropdown';
import LoadMore from '@/components/Utility/LoadMore';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Heading from '@/elements/Heading';
import { useAppSelector } from '@/Hooks/useRedux';
import { PostTypeEnum } from '@/types/enums';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';

function headerJSX() {
  return <Heading priority="3">Archived Post</Heading>;
}

interface ProfileArchiveProps {
  footerDisable?: boolean;
  error: Error | null;
  refetch: (params: {
    sort: {
      archivedAt: string;
    };
    limit: number;
    offset: number;
  }) => void;
  networkStatus: NetworkStatus;
  loadMoreStatus: boolean;
  setIsSortApplied: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DropdownOption {
  value: string;
  label: string;
}

export interface ArchivedPost {
  id: string;
  type: 'question' | 'poll' | 'quiz' | 'postShare';
  question?: QuestionType;
  poll?: PollType;
  quiz?: QuizType;
  postShare?: PostShare & {
    type: string;
  };
}

function ProfileArchive({
  footerDisable,
  error,
  refetch,
  networkStatus,
  loadMoreStatus,
  setIsSortApplied,
}: ProfileArchiveProps) {
  const options: DropdownOption[] = [
    { value: '1', label: 'All' },
    { value: '2', label: 'Recent' },
  ];

  const [selectVal, setSelectVal] = useState<DropdownOption>(options[0]);
  const [sort, setSort] = useState(false);

  const { archiveData, archivePostsCount } = useAppSelector((state) => ({
    archiveData: state.profile.archivePosts,
    archivePostsCount: state.profile.archivePostsCount,
  }));

  const handleChange = (val: DropdownOptionType | DropdownOptionType[]) => {
    setSelectVal(val as { value: string; label: string });
    if ((val as { value: string; label: string }).value == '6') {
      setSort(!sort);
    }
    setIsSortApplied(true);
    refetch({
      sort: {
        archivedAt: `${
          (val as { value: string; label: string }).value === '2'
            ? 'desc'
            : 'desc'
        }_nulls_last`,
      },
      limit: 3,
      offset: 0,
    });
  };

  useEffect(() => {
    if (archiveData.length < 3) {
      refetch({
        sort: {
          archivedAt: selectVal
            ? `${selectVal.value === '2' ? 'desc' : 'desc'}_nulls_last`
            : 'desc_nulls_last',
        },
        limit: 3,
        offset: 0,
      });
    }
  }, [archiveData.length, refetch, selectVal]);

  if (networkStatus === NetworkStatus.loading)
    return (
      <>
        {headerJSX()}
        <TabletLoader />
      </>
    );

  if (error)
    return (
      <>
        {headerJSX()}
        <div className="layout flex flex-col items-center justify-center gap-3 text-center">
          <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
          <p className='text-sm font-bold text-gray-500'>
            To see updates, have to archive post
          </p>
        </div>
      </>
    );

  return (
    <div className="lg:sm-container">
      {!sort && (
        <div className="relative  max-w-[230px] cursor-pointer">
          <Dropdown
            options={options}
            isLabel
            onChange={(val) => handleChange(val)}
            color="border-primary"
            rounded
            defaultOption={selectVal}
          />
        </div>
      )}
      <div className="my-2 pt-4">
        <Heading priority={selectVal ? '4' : '3'}>
          {selectVal ? `${selectVal.label} Archived Posts` : headerJSX()}
        </Heading>
      </div>

      <div className="mt-2 gap-4 rounded-md ">
        <div className="relative flex flex-col gap-4">
          <div className="relative">
            {Array.isArray(archiveData) &&
            archiveData.length &&
            archiveData !== null ? (
              archiveData.map((post: ArchivedPost) => {
                const postType = post.type;
                const postData = post[postType] as
                  | PollType
                  | QuestionType
                  | QuizType
                  | PostShare;

                if (post.question) {
                  return (
                    <ForumQuestionCard
                      key={post.id}
                      postData={postData as QuestionType}
                      isArchived
                      footerDisable={footerDisable}
                      clickableCard={
                        !post?.question?.is_disabled_by_admin &&
                        !post?.question?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.question?.is_disabled_by_admin ||
                        post?.question?.user?.is_disabled_by_admin
                      }
                    />
                  );
                }
                if (post.poll) {
                  return (
                    <ForumPollCard
                      key={post.id}
                      postData={postData as PollType}
                      isArchived
                      footerDisable={footerDisable}
                      clickableCard={
                        !post?.poll?.is_disabled_by_admin &&
                        !post?.poll?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.poll?.is_disabled_by_admin ||
                        post?.poll?.user?.is_disabled_by_admin
                      }
                    />
                  );
                }
                if (post.quiz) {
                  return (
                    <ForumQuizCard
                      key={post.id}
                      postData={postData as QuizType}
                      isArchived
                      footerDisable={footerDisable}
                      clickableCard={
                        !post?.quiz?.is_disabled_by_admin &&
                        !post?.quiz?.user?.is_disabled_by_admin
                      }
                      isDisable={
                        post?.quiz?.is_disabled_by_admin ||
                        post?.quiz?.user?.is_disabled_by_admin
                      }
                    />
                  );
                }
                if (post.postShare) {
                  const postShareInnerType = post?.postShare?.type;
                  return (
                    <SharedPostCard
                      noPadd
                      key={post.id}
                      postData={postData as PostShare}
                      isArchived
                      clickableCard={
                        !post?.postShare?.is_disabled_by_admin &&
                        !post?.postShare?.user?.is_disabled_by_admin &&
                        !post?.postShare?.[
                          postShareInnerType as
                            | PostTypeEnum.question
                            | PostTypeEnum.poll
                            | PostTypeEnum.quiz
                        ]?.is_disabled_by_admin &&
                        !post?.postShare?.[
                          postShareInnerType as
                            | PostTypeEnum.question
                            | PostTypeEnum.poll
                            | PostTypeEnum.quiz
                        ]?.user?.is_disabled_by_admin
                      }
                      footerDisable={footerDisable}
                      isDisable={
                        post?.postShare?.is_disabled_by_admin ||
                        post?.postShare?.user?.is_disabled_by_admin ||
                        post?.postShare?.[
                          postShareInnerType as
                            | PostTypeEnum.question
                            | PostTypeEnum.poll
                            | PostTypeEnum.quiz
                        ]?.is_disabled_by_admin ||
                        post?.postShare?.[
                          postShareInnerType as
                            | PostTypeEnum.question
                            | PostTypeEnum.poll
                            | PostTypeEnum.quiz
                        ]?.user?.is_disabled_by_admin
                      }
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className="layout flex flex-col items-center justify-center gap-3 text-center">
                <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                <p className='text-sm font-bold text-gray-500'>
                  To see updates, have to archive post
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {archivePostsCount > archiveData.length && loadMoreStatus && (
        <div className="ml-auto mr-auto mt-4 mb-4 flex items-center justify-center">
          <LoadMore
            onClick={() => {
              refetch({
                sort: {
                  archivedAt: selectVal
                    ? `${selectVal.value === '2' ? 'desc' : 'desc'}_nulls_last`
                    : 'desc_nulls_last',
                },
                limit: 3,
                offset: archiveData.length,
              });
            }}
          >
            Load More Post
          </LoadMore>
        </div>
      )}
    </div>
  );
}

export default ProfileArchive;
