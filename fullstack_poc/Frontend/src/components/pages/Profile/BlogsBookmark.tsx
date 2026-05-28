import { get } from 'lodash';
import React from 'react';

import TabletLoader from '@/components/Utility/LogoLoader/TabletLoader';
import Heading from '@/elements/Heading';
import useIsMobile from '@/Hooks/useIsMobile';

import OtherBlogBookmark, { OtherBlogBookmarkType } from './OtherBlogBookmark';
import VideoBlogBookmark, { VideoBlogBookmarkType } from './VideoBlogBookmark';
import { ProfileActivityErrorComponent } from '@/components/pages/Profile/ProfileActivities';

export interface Blog {
  id: string;
  attributes: {
    sunrise_blog?: {
      data: {
        id: string;
        attributes: {
          Title: string;
          shortDes: string;
          publish_date: string;
          views: number;
          videoViews: number;
          slug: string;
          blog_authors: {
            data: Array<{
              attributes: {
                name: string;
                image?: { data?: { attributes: { url: string } } };
              };
            }>;
          };
          blog_categories: {
            data: Array<{ attributes: { title: string; slug: string } }>;
          };
          coverImg?: { data?: { attributes: { url: string } } };
          video?: {
            coverImg?: {
              image?: { data?: { attributes: { url: string } } };
            };
            video?: { data?: { attributes: { url: string } } };
          } | null;
        };
      };
    };
  };
}

interface BlogsBookmarkProps {
  bookmarkLoading: boolean;
  bookmarkBlogsList: Blog[];
  selectedOption: string;
}

function BlogsBookmark({
  bookmarkLoading,
  bookmarkBlogsList,
  selectedOption,
}: BlogsBookmarkProps) {
  const isMobile = useIsMobile();
  if (bookmarkLoading) {
    return (
      <div>
        <TabletLoader style={{ marginTop: 90, height: isMobile ? 140 : 200 }} />
      </div>
    );
  }

  return (
    <div>
      {selectedOption === 'Blogs' && bookmarkBlogsList && (
        <div className="">
          <div className="my-2 pt-4">
            <Heading priority="4">
              All Bookmarked Blogs
            </Heading>
          </div>
          {bookmarkBlogsList.filter((blog) =>
            get(blog, 'attributes.sunrise_blog.data'),
          ).length > 0 ? (
            <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-2">
              {bookmarkBlogsList
                .filter((blog) => get(blog, 'attributes.sunrise_blog.data'))
                .map((data) => {
                  return (
                    <OtherBlogBookmark
                      otherBookmarkBlog={data as OtherBlogBookmarkType}
                      key={data?.id}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
              <p className='text-sm font-bold text-gray-500'>
                {`To see updates, have to bookmark ${selectedOption.toLowerCase()}`}
              </p>
            </div>
          )}
        </div>
      )}
      {selectedOption === 'Videos' && bookmarkBlogsList && (
        <div className="">
          <div className="my-2 pt-4">
            <Heading priority="4">
              All Bookmarked Videos
            </Heading>
          </div>

          {bookmarkBlogsList.filter(
            (b) =>
              get(b, 'attributes.sunrise_blog.data.attributes.video') ||
              get(b, 'attributes.youtubes.data'),
          ).length > 0 ? (
            <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2 xl:grid-cols-2">
              {bookmarkBlogsList
                .filter(
                  (b) =>
                    get(b, 'attributes.sunrise_blog.data.attributes.video') ||
                    get(b, 'attributes.youtubes.data'),
                )
                .map((row) => (
                  <VideoBlogBookmark
                    key={row.id}
                    videoBookmarkBlog={row as unknown as VideoBlogBookmarkType}
                  />
                ))}
            </div>
          ) : (
            <div className="layout flex flex-col items-center justify-center gap-3 text-center">
              <ProfileActivityErrorComponent errorMessage="Oops something went wrong" />
              <p className='text-sm font-bold text-gray-500'>
                {`To see updates, have to bookmark ${selectedOption.toLowerCase()}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogsBookmark;
