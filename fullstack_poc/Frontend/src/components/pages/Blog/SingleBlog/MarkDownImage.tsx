import React from 'react';
import type { Element } from 'hast';
import Image from 'next/image';
import type { Components } from 'react-markdown';

import { getStrapiMedia } from '@/lib/helpers';

const MarkdownComponents: Components = {
  /* ---------------- HEADINGS ---------------- */
  h1({ children }) {
    return (
      <h1 className="mb-2 font-bold text-2xl md:text-3xl xl:text-4xl text-black">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mb-2 font-bold text-2xl md:text-3xl xl:text-4xl text-black">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mb-2 font-bold text-sm md:text-base xl:text-2xl text-black">
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="mb-2 font-bold text-sm md:text-base xl:text-lg text-black">
        {children}
      </h4>
    );
  },
  h5({ children }) {
    return (
      <h5 className="mb-2 font-bold text-sm md:text-base xl:text-base text-black">
        {children}
      </h5>
    );
  },
  h6({ children }) {
    return (
      <h6 className="mb-2 font-bold text-xs md:text-sm xl:text-base text-black">
        {children}
      </h6>
    );
  },

  /* ---------------- PARAGRAPH ---------------- */
  p({ node, children }) {
    const element = node as Element | undefined;

    if (
      element?.children?.[0]?.type === 'element' &&
      (element.children[0] as Element).tagName === 'img'
    ) {
      const image = element.children[0] as Element;
      const metastring = image.properties?.alt as string | undefined;

      const alt = metastring?.replace(/ *\{[^)]*\} */g, '');
      const metaWidth = metastring?.match(/{([^}]+)x/);
      const metaHeight = metastring?.match(/x([^}]+)}/);

      const width = metaWidth ? Number(metaWidth[1]) : 768;
      const height = metaHeight ? Number(metaHeight[1]) : 432;
      const isPriority = metastring?.toLowerCase().includes('{priority}');

      return (
        <Image
          unoptimized
          src={getStrapiMedia(image.properties?.src as string)}
          width={width}
          height={height}
          className="image-container"
          alt={alt || ''}
          priority={isPriority}
        />
      );
    }

    return (
      <p className="mb-2 leading-7 text-black">
        {children}
      </p>
    );
  },

  /* ---------------- TEXT FORMATTING ---------------- */
  strong({ children }) {
    return (
      <strong className="font-semibold text-black">
        {children}
      </strong>
    );
  },

  em({ children }) {
    return (
      <em className="italic text-black">
        {children}
      </em>
    );
  },

  u({ children }) {
    return (
      <u className="underline decoration-2 text-black">
        {children}
      </u>
    );
  },

  /* ---------------- LINKS ---------------- */
  a({ href, children }) {
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:text-sky-800 focus:text-sky-800 visited:text-sky-800"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },

  /* ---------------- LISTS ---------------- */
  ul({ children }) {
    return (
      <ul className="list-disc list-outside space-y-2 pl-8 text-black marker:text-black">
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol className="list-decimal list-outside space-y-2 pl-8 text-black marker:text-black">
        {children}
      </ol>
    );
  },

  li({ children }) {
    return (
      <li className="text-black leading-7">
        {children}
      </li>
    );
  },

  /* ---------------- BLOCKQUOTE ---------------- */
  blockquote({ children }) {
    return (
      <blockquote className="mx-4 my-4 border-l-4 border-offwhite-700 px-4 py-3 italic text-black">
        {children}
      </blockquote>
    );
  },

  /* ---------------- CODE ---------------- */
  code(props) {
    const { className, children } = props;
    const language = className?.replace('language-', '');

    // react-markdown passes 'inline' as a boolean prop
    const isInline = (props as any).inline;

    if (!isInline) {
      return (
        <pre className="my-4 overflow-x-auto rounded bg-white-300 p-4 text-sm text-black">
          <code
            className={language ? `language-${language}` : undefined}
            {...props}
          >
            {children}
          </code>
        </pre>
      );
    }

    return (
      <code
        className="rounded bg-white-300 px-2 py-1 text-sm text-primary"
        {...props}
      >
        {children}
      </code>
    );
  },

  /* ---------------- HR ---------------- */
  hr() {
    return <hr className="my-6 border-slate-700" />;
  },
};

export default MarkdownComponents;
