import { upperFirst } from 'lodash';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import MarkdownComponents from '@/components/pages/Blog/SingleBlog/MarkDownImage';
import CustomImage from '@/components/Utility/CustomImage';
import SectionHeading from '@/elements/SectionHeading';
import { getStrapiMedia } from '@/lib/helpers';
import { BlogFoldProps } from '@/types/blog';

// Normalise CMS HTML so ReactMarkdown + our components can style it
// - convert <b> to <strong> so it uses our strong styling
// - keep <u> tags so they render through the custom "u" component
const normalizeCmsContent = (value?: string | null) => {
  if (!value) return '';
  let cleaned = value;

  // Convert <b> to <strong>
  cleaned = cleaned.replace(/<b(\s[^>]*)?>/gi, '<strong$1>');
  cleaned = cleaned.replace(/<\/b>/gi, '</strong>');

  // 🔥 Convert **text** to <strong>text</strong>
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  return cleaned;
};

export default function BlogArticle({
  blogDetails,
}: {
  blogDetails: BlogFoldProps;
}) {
  if (!blogDetails) {
    return null;
  }

  // Check if we have any content to render
  const hasTitle = blogDetails.Title && blogDetails.Title.trim() !== '';
  const hasDescription =
    blogDetails.description && blogDetails.description.trim() !== '';
  const hasImage = blogDetails?.coverImg?.image?.data?.attributes?.url;

  if (!hasTitle && !hasDescription && !hasImage) {
    return null;
  }

  return (
    <div className="articleSection">
      {blogDetails?.Title && (
        <SectionHeading>{upperFirst(blogDetails.Title)}</SectionHeading>
      )}

      {blogDetails?.description && (
        <ReactMarkdown
          // className="prose prose-invert max-w-none "
          components={MarkdownComponents}
          remarkPlugins={[remarkGfm as unknown as never]}
          rehypePlugins={[rehypeRaw as unknown as never]}
          skipHtml={false}
        // linkTarget="_blank"
        >
          {normalizeCmsContent(blogDetails.description)}
        </ReactMarkdown>
      )}
      {blogDetails?.coverImg?.image?.data?.attributes?.url && (
        <div className="imageHolder relative">
          <CustomImage
            className="!max-h-480"
            src={getStrapiMedia(blogDetails.coverImg.image.data.attributes.url)}
            alt={blogDetails?.coverImg?.altText}
            fill
          ></CustomImage>
        </div>
      )}

      <style jsx global>{`
        .blog-markdown ul {
          list-style-type: disc;
          list-style-image: none;
          padding-left: 2rem;
        }
        .blog-markdown ol {
          list-style-type: decimal;
          list-style-image: none;
          padding-left: 2rem;
        }
        .blog-markdown li::before {
          content: none !important;
        }
        .blog-markdown li {
          list-style-type: inherit;
        }
      `}</style>
    </div>
  );
}
