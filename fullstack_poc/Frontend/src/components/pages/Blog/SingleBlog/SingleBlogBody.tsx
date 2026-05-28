import { useEffect, useState } from 'react';

import BingeWatch from '@/components/pages/Blog/BingeWatch';
import ExploreBy from '@/components/pages/Blog/ExploreBy';
import BlogTakeAway from '@/components/pages/Blog/SingleBlog/BlogTakeAway';
import BlogThinCards from '@/components/pages/Blog/SingleBlog/BlogThinCards';
import DiscussionBar from '@/components/pages/Blog/SingleBlog/DiscussionBar';
import Fold from '@/components/pages/Blog/SingleBlog/Fold';
import SingleBlogBreadcrumb from '@/components/pages/Blog/SingleBlog/SingleBlogBreadcrumb';
import SingleBlogHeroSection from '@/components/pages/Blog/SingleBlog/SingleBlogHeroSection';
// import ExploreBy from '@/components/pages/Blog/SingleBlog/ExploreBy';
import BackToTop from '@/components/Utility/BackToTop';
import PageProgressBar from '@/components/Utility/PageProgressBar';
import { Blog } from '@/pages/sunrise-club-old/search-blogs';
import { BlogCategoryService } from '@/service';
import { BlogFoldProps } from '@/types/blog';
import BingeWatchCard from '@/components/pages/Blog/SingleBlog/BingeWatchCard';

interface Crumb {
  title: string;
  path: string | string[] | undefined;
}

export interface BlogDetails {
  id: string;
  sub_description: string;
  attributes: {
    coverImg: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    blog_authors?: {
      data: Array<{
        attributes: {
          name: string;
          altText?: string;
          image: {
            data: {
              attributes: {
                url: string;
              };
            };
          };
        };
      }>;
    };
    sunrise_club_author?: {
      data: {
        attributes: {
          Name: string;
          Name_Slug: string;
          altText?: string;
          Image: {
            data: {
              attributes: {
                url: string;
              };
            };
          };
        };
      };
    };
    sunrise_doctor?: {
      data: {
        attributes: {
          Name: string;
          Name_Slug: string;
          altText?: string;
          Image: {
            data: {
              attributes: {
                url: string;
              };
            };
          };
        };
      };
    };
    blog_categories?: {
      data: Array<{
        attributes: {
          title: string;
          slug: string;
        };
      }>;
    };
    Title: string;
    altText?: string;
    shortDes?: string;
    sub_description?: string;
    publish_date?: string;
    updatedAt?: string;
    firstFold: BlogFoldProps;
    secondFold?: BlogFoldProps;
    thirdFold?: BlogFoldProps;
    fourthFold?: BlogFoldProps;
    fifthFold?: BlogFoldProps;
    sixthFold?: BlogFoldProps;
    seventhFold?: BlogFoldProps;
    eighthFold?: BlogFoldProps;
    ninthFold?: BlogFoldProps;
    tenthFold?: BlogFoldProps;
    eleventhFold?: BlogFoldProps;
    twelfthFold?: BlogFoldProps;
    thirteenthFold?: BlogFoldProps;
    fourteenthFold?: BlogFoldProps;
    fifteenthFold?: BlogFoldProps;
  };
}

interface SingleBlogBodyProps {
  crumbs: Crumb[];
  blogDetails: BlogDetails;
  randomBlogs: Blog[];
}

export default function SingleBlogBody({
  crumbs,
  blogDetails,
  randomBlogs,
}: SingleBlogBodyProps) {
  const [blogsCat, setBlogsCats] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data }: any = await BlogCategoryService();
        const content = data.blogCategories?.data || [];
        setBlogsCats(content);
      } catch (error) {
        //captureSentryException(error);
      }
    };

    const bingewatchUrl = '/sunrise-club/binge-watch';

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!randomBlogs || !randomBlogs.length || !blogDetails) {
      setFilteredBlogs([]);
      return;
    }

    const targetSlug =
      blogDetails?.attributes?.blog_categories?.data?.[0]?.attributes?.slug ??
      '';

    const sheReadsBlogs = randomBlogs.filter((item: any) => {
      const blog = item?.attributes;
      if (!blog) return false;

      const matchesCategory = blog.blog_categories?.data?.some(
        (cat: any) => cat?.attributes?.slug === targetSlug,
      );

      const isWatchTrue = blog.watch === true;

      return Boolean(matchesCategory && isWatchTrue);
    });

    setFilteredBlogs(sheReadsBlogs);
  }, [blogDetails, randomBlogs]);

  return (
    <div className="blog-single">
      <div
        className="blogSinglePage copy-disable sm-container relative pt-10"
        id="singleBlogBody"
      >
        <PageProgressBar />
        <SingleBlogBreadcrumb crumbs={crumbs} />
        {/* Section - 1 */}
        {blogDetails && <SingleBlogHeroSection blogDetails={blogDetails} />}

        {/* Section - 2 */}
        {/* <div className="container">
          <div className="my-12 ">
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div>
                  {blogDetails?.attributes?.firstFold && (
                    <Fold
                      foldData={blogDetails.attributes.firstFold}
                      className="leftBlogArticles my-10"
                      foldId="fold-1"
                    />
                  )}
                  {blogDetails?.attributes?.secondFold && (
                    <Fold
                      foldData={blogDetails.attributes.secondFold}
                      className="my-10"
                      foldId="fold-2"
                    />
                  )}
                </div>
                <div>
                  {' '}
                  {randomBlogs && <BlogSmallCards randomBlogs={randomBlogs} />}
                </div>
              </div>
            </div>
          </div>
        </div> */}
        {/* <div className="sm-container"> */}
        {blogDetails?.attributes?.firstFold && (
          <Fold
            foldData={blogDetails.attributes.firstFold}
            // className="leftBlogArticles"
            foldId="fold-1"
          />
        )}
        {blogDetails?.attributes?.secondFold && (
          <Fold
            foldData={blogDetails.attributes.secondFold}
            // className="my-10"
            foldId="fold-2"
          />
        )}
        {/* </div> */}
        {/* Section - 3 */}
        {blogDetails?.attributes?.thirdFold && (
          <Fold foldData={blogDetails.attributes.thirdFold} foldId="fold-3" />
        )}

        {/* Section - 4 */}
        {/* {randomBlogs && <BlogHighlights randomBlogs={randomBlogs} />} */}

        {/* Section - 5 */}
        {blogDetails?.attributes?.fourthFold && (
          <Fold foldData={blogDetails.attributes.fourthFold} foldId="fold-4" />
        )}

        {/* Section - 6 */}
        {blogDetails?.attributes?.fifthFold && (
          <Fold
            foldData={blogDetails.attributes.fifthFold}
            className="my-5"
            foldId="fold-5"
          />
        )}
        {/* <div className="container">
          <div className=" my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              {blogDetails?.attributes?.fifthFold && (
                <Fold
                  foldData={blogDetails.attributes.fifthFold}
                  className="my-5"
                  foldId="fold-5"
                />
              )}
            </div>
            {randomBlogs && randomBlogs.length > 0 && (
              <div className="">
                <TextBorder text="People Reading Now " />

                <div className="pt-4">
                  {randomBlogs.slice(0, 5).map((data: Blog) => (
                    <BlogBigCards key={`blog-${data.id}`} blogsList={[data]} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> */}

        {/* Section - 7 */}
        {blogDetails?.attributes?.sixthFold && (
          <Fold foldData={blogDetails.attributes.sixthFold} foldId="fold-6" />
        )}

        {/* Section - 9 */}
        {blogDetails?.attributes?.eighthFold && (
          <Fold foldData={blogDetails.attributes.eighthFold} foldId="fold-8" />
        )}

        {/* Section - 10 */}
        {blogDetails?.attributes?.ninthFold && (
          <Fold foldData={blogDetails.attributes.ninthFold} foldId="fold-9" />
        )}

        {/* Section - 11 */}
        {blogDetails?.attributes?.tenthFold && (
          <Fold foldData={blogDetails.attributes.tenthFold} foldId="fold-10" />
        )}

        {/* Section - 12 */}
        {blogDetails?.attributes?.eleventhFold && (
          <Fold
            foldData={blogDetails.attributes.eleventhFold}
            foldId="fold-11"
          />
        )}

        {/* Section - 13 */}
        {blogDetails?.attributes?.twelfthFold && (
          <Fold
            foldData={blogDetails.attributes.twelfthFold}
            foldId="fold-12"
          />
        )}

        {/* Section - 14 */}
        {blogDetails?.attributes?.thirteenthFold && (
          <Fold
            foldData={blogDetails.attributes.thirteenthFold}
            foldId="fold-13"
          />
        )}

        {/* Section - 15 */}
        {blogDetails?.attributes?.fourteenthFold && (
          <Fold
            foldData={blogDetails.attributes.fourteenthFold}
            foldId="fold-14"
          />
        )}

        {/* Section - 16 */}
        {blogDetails?.attributes?.fifteenthFold && (
          <Fold
            foldData={blogDetails.attributes.fifteenthFold}
            foldId="fold-15"
          />
        )}

        {/* Section - 8 */}
        {blogDetails?.attributes?.seventhFold && (
          <div data-fold-id="fold-7">
            <BlogTakeAway seventhFold={blogDetails.attributes.seventhFold} />
          </div>
        )}

        <DiscussionBar />
        {/* {randomBlogs && randomBlogs.length > 0 && (
          <div className="">
            <TextBorder text="Here's what people are reading" />

            <div className="pt-4">
              {randomBlogs.slice(0, 5).map((data: Blog) => (
                <BlogBigCards key={`blog-${data.id}`} blogsList={[data]} />
              ))}
            </div>
          </div>
        )} */}
        {randomBlogs && randomBlogs.length > 0 && (
          <div>
            {/* <TextBorder text="Here's what people are reading" /> */}
            {/* <h1>Here's what people are reading</h1> */}
            <h1
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 800,
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '0%',
                color: 'black',
                margin: 0,
              }}
            >
              Here's what people are reading
            </h1>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {randomBlogs.slice(0, 6).map((data: Blog) => (
                <BlogThinCards key={`blog-${data.id}`} blog={data} />
              ))}
            </div>
          </div>
        )}
        {filteredBlogs.length > 0 && <BingeWatch bingeWatch={randomBlogs} />}
      </div>

      <ExploreBy blogsCategories={blogsCat} />
      <BackToTop to="singleBlogBody" />
    </div>
  );
}
