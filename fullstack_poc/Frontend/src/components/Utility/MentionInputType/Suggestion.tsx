import React from 'react';

import { createDefaultStyle, getSubstringIndex } from './mention_utils';

interface SuggestionProps {
  id: string;
  focused: boolean;
  ignoreAccents?: boolean;
  index: number;
  onClick?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  query: string;
  renderSuggestion?: (
    suggestion: any,
    query: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean,
  ) => React.ReactNode;
  suggestion: string | { id: string | number; display?: string };
  style?: any;
  className?: string;
  classNames?: any;
}

function Suggestion({
  id,
  focused,
  ignoreAccents,
  index,
  onClick,
  onMouseEnter,
  query,
  renderSuggestion,
  suggestion,
  style,
  className,
  classNames,
}: SuggestionProps) {
  const rest = { onClick, onMouseEnter };

  const renderContent = () => {
    let display: any = getDisplay();
    let highlightedDisplay = renderHighlightedDisplay(display, query);

    if (renderSuggestion) {
      return renderSuggestion(
        suggestion,
        query,
        highlightedDisplay,
        index,
        focused,
      );
    }

    return highlightedDisplay;
  };

  const getDisplay = () => {
    if (typeof suggestion === 'string') {
      return suggestion;
    }

    let { id, display } = suggestion;

    if (id === undefined || !display) {
      return id;
    }

    return display;
  };

  const renderHighlightedDisplay = (display: string, query: string) => {
    let i = getSubstringIndex(display, query, ignoreAccents ?? false);

    if (i === -1) {
      return (
        <span
          {...(style && typeof style === 'function' ? style('display') : {})}
        >
          {display}
        </span>
      );
    }

    return (
      <span {...(style && typeof style === 'function' ? style('display') : {})}>
        {display.substring(0, i)}
        <b
          {...(style && typeof style === 'function' ? style('highlight') : {})}
        >
          {display.substring(i, i + query.length)}
        </b>
        {display.substring(i + query.length)}
      </span>
    );
  };

  return (
    <li
      id={id}
      role="option"
      aria-selected={focused}
      {...(style && typeof style === 'object' ? style : {})}
      {...rest}
    >
      {renderContent()}
    </li>
  );
}

const styled = createDefaultStyle(
  {
    cursor: 'pointer',
  },
  (props: any) => ({ '&focused': props.focused }),
);

export default styled(Suggestion);
