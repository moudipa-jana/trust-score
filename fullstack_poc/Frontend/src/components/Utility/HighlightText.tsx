{
  /**
   * HighlightText highlights matching substrings within a given title based on the highlight term.
   * It wraps matched parts with a styled span and renders unmatched text as plain.
   */
}
import React from 'react';

interface HighlightTextProps {
  title: string;
  highlight: string | string[];
}

const HighlightText = ({ title, highlight }: HighlightTextProps) => {
  if (!title) {
    return null;
  }
  if (!highlight) {
    return <span>{title}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const matches = title.match(regex);

  if (!matches) {
    return <span>{title}</span>;
  }

  const indices: number[] = [];
  let match = regex.exec(title);
  while (match !== null) {
    indices.push(match.index);
    match = regex.exec(title);
  }

  let lastIndex = 0;

  return (
    <>
      {indices.map((index: number) => {
        const beforeHighlight = title.substring(lastIndex, index);
        const highlightedPart = title.substr(index, highlight.length);

        lastIndex = index + highlight.length;

        return (
          <>
            {beforeHighlight && <span>{beforeHighlight}</span>}
            <span style={{ backgroundColor: '#FFEB3B', borderRadius: '2px', padding: '0 1px' }}>{highlightedPart}</span>
          </>
        );
      })}
      {lastIndex < title.length && <span>{title.substring(lastIndex)}</span>}
    </>
  );
};

export default HighlightText;
