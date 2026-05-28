import React from 'react';

interface HighlightMatchProps {
  text: string;
  query: string;
}

/**
 * Highlights all occurrences of `query` within `text` by wrapping
 * matched portions in a yellow-highlighted <span>.
 */
const HighlightMatch: React.FC<HighlightMatchProps> = ({ text, query }) => {
  if (!query || !text) {
    return <>{text}</>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={index}
            style={{
              backgroundColor: '#FFEB3B',
              borderRadius: '2px',
              padding: '0 1px',
            }}
          >
            {part}
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

export default HighlightMatch;
