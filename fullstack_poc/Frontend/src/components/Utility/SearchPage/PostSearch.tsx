{
  /**
   * PostSearch fetches and displays forum posts based on a search query,
   * supporting multiple post types (question, quiz, poll, shared post),
   * paginated loading, and rendering related people and campfires on desktop.
   */
}
import { useMutation } from '@apollo/client/react';
import { get, isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import ForumPollCard from '@/components/pages/Forum/posts/ForumPollComponent';
import ForumQuestionCard from '@/components/pages/Forum/posts/ForumQuestionCard';
import ForumQuizCard from '@/components/pages/Forum/posts/ForumQuizCard';
import SharedPostCard from '@/components/pages/Forum/posts/SharedPostCard';
import Button from '@/components/Utility/Button';
import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import CampfireSearch from '@/components/Utility/SearchPage/CampfireSearch';
import PeopleSearch from '@/components/Utility/SearchPage/PeopleSearch';
import Text from '@/elements/Text';
import useIsDesktop from '@/Hooks/useIsDesktop';
import { useAppSelector } from '@/Hooks/useRedux';
import { emitErrorNotification, formatGraphqlError } from '@/lib/helpers';
import { SEARCH_QUERY_TEXT } from '@/service/graphql/Forum';
import { selectGetToken } from '@/state/Slices/auth';
import { PollType, PostShare, QuestionType, QuizType } from '@/types/forum';
import { IPostSearch } from '@/types/search';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

interface IProps {
  query: string;
}

interface PostSearchResponse {
  paginatedSearch: {
    data: {
      posts: IPostSearch[];
    };
  };
}

const PostSearch = ({ query }: IProps) => {
  const isdesktop = useIsDesktop();

  const [postData, setPostData] = useState<IPostSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadMore, setLoadMore] = useState(false);
  const [fetchMoreLoading, setFetchMoreLoading] = useState(false);
  const isFirst = useRef(true);
  const [refetch, setRefetch] = useState(false);
  const token = useAppSelector(selectGetToken);

  const [fetchPeople] = useMutation<PostSearchResponse>(SEARCH_QUERY_TEXT, {
    context: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    onCompleted: (response, clientOptions) => {
      setLoading(false);
      setFetchMoreLoading(false);
      const data = get(response, 'paginatedSearch.data.posts', []);
      if (!data.length || data.length < 5) {
        setLoadMore(false);
      } else {
        setLoadMore(true);
      }
      if (clientOptions?.variables?.offset) {
        setPostData((prevData) => [...prevData, ...data]);
      } else {
        setPostData(data);
      }
    },
    onError: (err) => {
      setLoading(false);
      setLoadMore(false);
      setFetchMoreLoading(false);
      emitErrorNotification(formatGraphqlError(err));
    },
  });

  const handleFetch = React.useCallback(
    (searchQuery: string, offset = 0, limit = 5) => {
      fetchPeople({
        variables: {
          searchQuery,
          searchCategory: 'posts',
          limit,
          offset,
        },
      });
    },
    [fetchPeople],
  );

  useEffect(() => {
    if (query) {
      handleFetch(query, 0, 5);
    } else {
      setLoading(false);
    }
  }, [query, handleFetch]);

  const handleLoadMore = () => {
    setFetchMoreLoading(true);
    handleFetch(query, postData.length);
  };

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false; // Mark as done for next time
      return; //  skip first run
    }
    if (query) {
      handleFetch(query, 0, postData.length);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);
  return (
    <div className="mb-20 flex">
      <div className="w-[730px]">
        {loading ? (
          <div
            className="mt-20 mb-20 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <TabletLoader style={{ height: 150 }} />
          </div>
        ) : isEmpty(postData) ? (
          <div className="layout mb-20 flex flex-col items-center justify-center gap-3 text-center">
                    <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
                    <p className='text-sm font-bold text-gray-500'>
                      No result found
                    </p>
                    <p className='text-sm text-gray-500'>
                      We couldn’t find any results for your search
                    </p>
                  </div>
        ) : (
          <>
            {postData.map((post) => {
              switch (post.type) {
                case 'question':
                  return (
                    <div key={post.id}>
                      <ForumQuestionCard
                        postData={post.question as unknown as QuestionType}
                        footerDisable
                        clickableCard
                        setRefetch={setRefetch}
                        campfireToolsPosts
                      />
                    </div>
                  );
                case 'quiz':
                  return (
                    <div key={post.id}>
                      <ForumQuizCard
                        postData={post.quiz as unknown as QuizType}
                        footerDisable
                        clickableCard
                        setRefetch={setRefetch}
                        campfireToolsPosts
                      />
                    </div>
                  );
                case 'poll':
                  return (
                    <div key={post.id}>
                      <ForumPollCard
                        postData={post.poll as unknown as PollType}
                        footerDisable
                        clickableCard
                        setRefetch={setRefetch}
                        campfireToolsPosts
                      />
                    </div>
                  );
                case 'postShare':
                  return (
                    <div key={post.id}>
                      <SharedPostCard
                        postData={post.postShare as unknown as PostShare}
                        footerDisable
                        clickableCard
                        setRefetch={setRefetch}
                        campfireToolsPosts
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })}
            {showLoadMore && (
              <div className="mt-5 flex justify-center">
                <Button
                  customClassName="w-44"
                  isLoading={fetchMoreLoading}
                  size="lg"
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {isdesktop && !loading && (
        <div className="mt-8 ml-6 w-[370px]">
          <div>
            <Text size="xxl">People</Text>
            <PeopleSearch query={query} postPeople />
          </div>
          <div>
            <Text size="xxl">Campfires</Text>
            <CampfireSearch query={query} postCampfire />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSearch;
