import React, { Children, ReactNode, Ref, useEffect, useState } from 'react';

import LoadingIndicator from './LoadingIndicator';
import { createDefaultStyle, getSuggestionHtmlId } from './mention_utils';
import Suggestion from './Suggestion';

interface SuggestionResult {
  id?: string | number;
  [key: string]: any;
}

interface QueryInfo {
  childIndex: number;
  query: string;
}

interface SuggestionsOverlayProps {
  id: string;
  suggestions: Record<
    string,
    { results: SuggestionResult[]; queryInfo: QueryInfo }
  >;
  a11ySuggestionsListLabel?: string;
  focusIndex?: number;
  position?: string;
  left?: number;
  right?: number;
  top?: number;
  scrollFocusedIntoView?: boolean;
  isLoading?: boolean;
  isOpened: boolean;
  onSelect?: (suggestion: SuggestionResult, queryInfo: QueryInfo) => void;
  ignoreAccents?: boolean;
  containerRef?: Ref<HTMLDivElement>;
  children: ReactNode;
  style?: any;
  customSuggestionsContainer?: (children: ReactNode) => ReactNode;
  onMouseDown?: React.MouseEventHandler;
  onMouseEnter?: (index: number) => void;
}

const SuggestionsOverlay: React.FC<SuggestionsOverlayProps> = ({
  id,
  suggestions = {},
  a11ySuggestionsListLabel,
  focusIndex = 0,
  position,
  left,
  right,
  top,
  scrollFocusedIntoView,
  isLoading,
  isOpened,
  onSelect = () => null,
  ignoreAccents,
  containerRef,
  children,
  style = () => ({}),
  customSuggestionsContainer,
  onMouseDown,
  onMouseEnter,
}) => {
  const [ulElement, setUlElement] = useState<HTMLUListElement | null>(null);

  useEffect(() => {
    if (
      !ulElement ||
      ulElement.offsetHeight >= ulElement.scrollHeight ||
      !scrollFocusedIntoView
    ) {
      return;
    }
    const scrollTop = ulElement.scrollTop;
    const child = ulElement.children[focusIndex] as HTMLElement;
    if (!child) return;
    let { top: childTop, bottom: childBottom } = child.getBoundingClientRect();
    const { top: topContainer } = ulElement.getBoundingClientRect();
    const top = childTop - topContainer + scrollTop;
    const bottom = childBottom - topContainer + scrollTop;
    if (top < scrollTop) {
      ulElement.scrollTop = top;
    } else if (bottom > ulElement.offsetHeight) {
      ulElement.scrollTop = bottom - ulElement.offsetHeight;
    }
  }, [focusIndex, scrollFocusedIntoView, ulElement]);

  const renderSuggestions = () => {
    const suggestionsToRender = (
      <ul
        ref={setUlElement}
        id={id}
        role="listbox"
        aria-label={a11ySuggestionsListLabel}
        {...(typeof style === 'function' ? style('list') : {})}
      >
        {Object.values(suggestions).reduce<ReactNode[]>(
          (accResults, { results, queryInfo }) => [
            ...accResults,
            ...results.map((result, index) =>
              renderSuggestion(result, queryInfo, accResults.length + index),
            ),
          ],
          [],
        )}
      </ul>
    );
    if (customSuggestionsContainer)
      return customSuggestionsContainer(suggestionsToRender);
    return suggestionsToRender;
  };

  const renderSuggestion = (
    result: SuggestionResult,
    queryInfo: QueryInfo,
    index: number,
  ) => {
    const isFocused = index === focusIndex;
    const { childIndex, query } = queryInfo;
    const childArray = Children.toArray(children);
    const child = childArray[childIndex] as any;
    const renderSuggestionFn = child?.props?.renderSuggestion;
    return (
      <Suggestion
        style={typeof style === 'function' ? style('item') : {}}
        key={`${childIndex}-${getID(result)}`}
        id={getSuggestionHtmlId(id, `${index}`)}
        query={query}
        index={index}
        ignoreAccents={ignoreAccents}
        renderSuggestion={renderSuggestionFn}
        suggestion={result}
        focused={isFocused}
        onClick={() => select(result, queryInfo)}
        onMouseEnter={() => handleMouseEnter(index)}
      />
    );
  };

  const renderLoadingIndicator = () => {
    if (!isLoading) {
      return null;
    }
    return (
      <LoadingIndicator
        style={typeof style === 'function' ? style('loadingIndicator') : {}}
      />
    );
  };

  const handleMouseEnter = (index: number, ev?: React.MouseEvent) => {
    if (onMouseEnter) {
      onMouseEnter(index);
    }
  };

  const select = (suggestion: SuggestionResult, queryInfo: QueryInfo) => {
    if (onSelect) onSelect(suggestion, queryInfo);
  };

  const getID = (suggestion: SuggestionResult) => {
    if (typeof suggestion === 'string') {
      return suggestion;
    }
    return suggestion.id;
  };

  if (!isOpened) {
    return null;
  }

  return (
    <div
      style={{
        position: position || 'absolute',
        left,
        right,
        top,
        zIndex: 11,
        ...(typeof style === 'function' ? style() : style),
      }}
      onMouseDown={onMouseDown}
      ref={containerRef}
    >
      {renderSuggestions()}
      {renderLoadingIndicator()}
    </div>
  );
};

const styled = createDefaultStyle({
  zIndex: 1,
  backgroundColor: 'white',
  marginTop: 14,
  minWidth: 100,
  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

export default styled(SuggestionsOverlay);
