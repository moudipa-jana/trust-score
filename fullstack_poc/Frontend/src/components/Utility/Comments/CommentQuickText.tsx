import React from 'react';

import useIsMobile from '@/Hooks/useIsMobile';

interface CommentQuickTextsProps {
  insertWord: (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    word: string,
  ) => void;
}

export const WORDS: string[] = [
  'Great story',
  'Agreed!',
  'Thank you!',
  'Great experience',
  'Amazing',
  'Nice',
];

function CommentQuickTexts({ insertWord }: CommentQuickTextsProps) {
  const ismobile = useIsMobile();

  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap',
        marginBottom: '5px',
        marginTop: '5px',
      }}
    >
      {WORDS.map((word) => (
        <p
          key={`quick-text-${word}`}
          style={{
            padding: '3px 10px',
            borderRadius: '20px',
            cursor: 'pointer',
            color: '#00B2ED',
            border: '1px solid #00B2ED',
            fontSize: ismobile ? '12px' : '14px',
          }}
          onClick={(e) => insertWord(e, word)}
        >
          {word}
        </p>
      ))}
    </div>
  );
}

export default CommentQuickTexts;
