import { BlogFoldProps } from '@/types/blog';

import BlogArticle from './BlogArticle';

interface FoldProps {
  foldData: BlogFoldProps | null | undefined;
  className?: string;
  foldId?: string;
}

export default function Fold({
  foldData,
  className = 'container my-10',
  foldId,
}: FoldProps) {
  if (!foldData) {
    return null;
  }

  return (
    <div className={className} data-fold-id={foldId}>
      <BlogArticle blogDetails={foldData} />
    </div>
  );
}

