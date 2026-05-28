import React from 'react';

import Breadcrumb from '@/components/Utility/Breadcrumb';

interface Crumb {
  title: string;
  path: string | string[] | undefined;
}

interface SingleBlogBreadcrumbProps {
  crumbs: Crumb[];
}

export default function SingleBlogBreadcrumb({
  crumbs,
}: SingleBlogBreadcrumbProps) {
  return (
    <div className="sm-container">
      <Breadcrumb size="lg" crumbs={crumbs} />
    </div>
  );
}
