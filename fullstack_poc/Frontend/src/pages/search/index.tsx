{
  /**
   * `Search` is a React component that manages the search functionality.
   * - Displays a tabbed navigation with options for searching "People", "Posts", "Campfires", and "#hashtags".
   * - On selecting a tab, it dynamically loads the corresponding search component (`PeopleSearch`, `CampfireSearch`, `PostSearch`, or `HashtagSearch`).
   * - The underline of the active tab adjusts its position and width based on the selected tab using the `useRef` hook and dynamic styles.
   * - Utilizes the Next.js `useRouter` hook to handle the query and active tab state.
   **/
}

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { useEffect, useRef, useState } from 'react';

import PageBase from '@/components/layout/PageBase';
import { Blog } from '@/components/pages/Blog/ForumBingeWatch';
import CampfireSearch from '@/components/Utility/SearchPage/CampfireSearch';
import HashtagSearch from '@/components/Utility/SearchPage/HashtagSearch';
import PeopleSearch from '@/components/Utility/SearchPage/PeopleSearch';
import PostSearch from '@/components/Utility/SearchPage/PostSearch';
import Text from '@/elements/Text';
import withCommonData from '@/lib/withCommonData';
import type { MenuItem } from '@/types/menu';

const tabsData = [
  {
    label: 'People',
    type: 'people',
  },
  {
    label: 'Posts',
    type: 'post',
  },
  {
    label: 'Campfires',
    type: 'campfire',
  },
  {
    label: '#hashtags',
    type: 'hashtag',
  },
];

interface SearchProps {
  initialMenus: MenuItem[];
  initialBottomMenus: MenuItem[];
  searchData: Blog[];
  initialSocials: Array<{
    id: string;
    attributes: {
      title: string;
      link: string;
      __typename?: string;
    };
    __typename?: string;
  }>;
}

const Search = ({
  initialMenus,
  initialBottomMenus,
  searchData,
  initialSocials,
}: SearchProps) => {
  const tabsRef = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  const { viewType, query } = router.query;
  const activeTabIndex = tabsData.findIndex((tab) => tab.type === viewType);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[activeTabIndex];
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener('resize', setTabPosition);

    return () => window.removeEventListener('resize', setTabPosition);
  }, [activeTabIndex]);

  return (
    <PageBase
      title="Search"
      description="Search for people, posts, campfires, and hashtags"
      initialMenus={initialMenus}
      initialBottomMenus={initialBottomMenus}
      searchData={searchData}
      initialSocials={initialSocials}
    >
      <div className="sm-container min-h-[50vh]">
        <div className="relative">
          <div className="flex justify-center space-x-14 py-6 md:space-x-10 lg:justify-start lg:space-x-36">
            {tabsData.map((tab, idx) => (
              <div
                key={tab.type}
                ref={(el) => {
                  tabsRef.current[idx] = el;
                }}
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/search?query=${query}&viewType=${tab.type}`);
                }}
              >
                <Text
                  size="md"
                  color={
                    viewType === tab.type ? 'text-primary' : 'text-black-300'
                  }
                >
                  {tab.label}
                </Text>
              </div>
            ))}
          </div>
          <span
            className="absolute bottom-0 block h-1 rounded-lg bg-primary transition-all duration-500"
            style={{
              left: tabUnderlineLeft,
              width: tabUnderlineWidth,
              bottom: '15px',
            }}
          />
        </div>
        {viewType === 'people' ? (
          <PeopleSearch query={query as string} />
        ) : viewType === 'campfire' ? (
          <CampfireSearch query={query as string} />
        ) : viewType === 'post' ? (
          <PostSearch query={query as string} />
        ) : viewType === 'hashtag' ? (
          <HashtagSearch query={query as string} />
        ) : (
          <div></div>
        )}
      </div>
    </PageBase>
  );
};

export default Search;

export const getServerSideProps: GetServerSideProps = withCommonData(
  async () => {
    return {
      props: {
        initialMenus: [],
        initialBottomMenus: [],
        initialSocials: [],
        searchData: [],
      },
    };
  },
);
