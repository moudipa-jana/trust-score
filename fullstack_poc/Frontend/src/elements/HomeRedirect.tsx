import Link, { LinkProps } from 'next/link';
import React, { ReactNode } from 'react';

interface HomeRedirectProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

function HomeRedirect({ href, ...props }: HomeRedirectProps) {
  return <Link href={href || '/'} {...props} />;
}

HomeRedirect.defaultProps = {
  href: '/',
};

export default HomeRedirect;
