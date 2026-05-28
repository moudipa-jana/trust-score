import SingleBlogProfile from '@/components/pages/Blog/SingleBlog/SingleBlogProfile';
import TableOfContents from '@/components/pages/Blog/SingleBlog/TableOfContents';
import CustomImage from '@/components/Utility/CustomImage';
import { getStrapiMedia } from '@/lib/helpers';

import { BlogDetails } from './SingleBlogBody';

interface SingleBlogHeroSectionProps {
  blogDetails: BlogDetails;
}

export default function SingleBlogHeroSection({
  blogDetails,
}: SingleBlogHeroSectionProps) {
  const categoryTitle =
    blogDetails?.attributes?.blog_categories?.data?.[0]?.attributes?.title ||
    '';

  return (
    <div className="container mt-10">
      <div
        style={{
          width: '1200px',
          maxWidth: '100%',
          borderLeft: '10px solid #00B2ED',
          paddingLeft: '32px',
          opacity: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '16px',
        }}
      >
        {/* Category Tag */}
        {categoryTitle && (
          <div className="inline-block">
            <span
              className="inline-block"
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 700,
                fontSize: '12px',
                lineHeight: '18px',
                letterSpacing: '4%',
                textTransform: 'capitalize',
                color: '#00B2ED',
                backgroundColor: 'rgba(224, 244, 252, 0.9)',
                border: '1px solid #00B2ED',
                borderRadius: '4px',
                padding: '4px 10px',
                backdropFilter: 'blur(50px)',
              }}
            >
              {categoryTitle}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 800,
            fontSize: '48px',
            lineHeight: '72px',
            letterSpacing: '0%',
            color: '#004B74',
            margin: 0,
          }}
        >
          {blogDetails?.attributes?.Title}
        </h1>

        {/* Description */}
        {blogDetails?.attributes?.shortDes && (
          <div
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 400,
              fontSize: '28px',
              lineHeight: '100%',
              letterSpacing: '0%',
              color: '#707070',
              // textDecoration: 'underline',
              textDecorationStyle: 'solid',
              margin: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#707070',
                // textDecoration: 'underline',
                textDecorationStyle: 'solid',
              }}
              dangerouslySetInnerHTML={{
                __html: blogDetails?.attributes?.shortDes as string,
              }}
            />
          </div>
        )}
      </div>

      {/* Spacing between description and author section */}
      <div className="mt-8 mb-6" />

      {/* Reviewed by / Written by and Social Links */}
      <SingleBlogProfile blogDetails={blogDetails} />

      {/* Table of Contents */}
      <TableOfContents blogDetails={blogDetails} />

      {/* Cover Image */}
      {blogDetails?.attributes?.coverImg?.data?.attributes?.url && (
        <div
          className="mt-8 mb-4"
          style={{
            width: '1200px',
            maxWidth: '100%',
            maxHeight: '100%',
            opacity: 1,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <CustomImage
            src={getStrapiMedia(
              blogDetails?.attributes?.coverImg?.data?.attributes?.url,
            )}
            alt={
              blogDetails?.attributes?.altText || blogDetails?.attributes?.Title
            }
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
              transform: 'scaleY(1)',
              transformOrigin: 'center',
              willChange: 'transform',
            }}
          />
        </div>
      )}
    </div>
  );
}
