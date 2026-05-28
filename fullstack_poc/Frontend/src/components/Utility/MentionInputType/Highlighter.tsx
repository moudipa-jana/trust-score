import React, { Children, ReactNode, Ref, useEffect, useState } from 'react';

// If you have a real createDefaultStyle, import it. Otherwise, use this fallback:
// const createDefaultStyle = () => (Component: any) => Component;
import {
  createDefaultStyle,
  isNumber,
  iterateMentionsMarkup,
  mapPlainTextIndex,
  readConfigFromChildren,
} from './mention_utils';

const _generateComponentKey = (
  usedKeys: Record<string, number>,
  id: string,
) => {
  if (!Object.prototype.hasOwnProperty.call(usedKeys, id)) {
    usedKeys[id] = 0;
  } else {
    usedKeys[id]++;
  }
  return id + '_' + usedKeys[id];
};

interface HighlighterProps {
  selectionStart: number;
  selectionEnd: number;
  value: string;
  onCaretPositionChange: (pos: { left: number; top: number }) => void;
  containerRef?: Ref<HTMLDivElement>;
  children: ReactNode;
  singleLine?: boolean;
  style?: any;
}

function Highlighter({
  selectionStart,
  selectionEnd,
  value = '',
  onCaretPositionChange,
  containerRef,
  children,
  singleLine,
  style,
}: HighlighterProps) {
  const [position, setPosition] = useState<{ left?: number; top?: number }>({
    left: undefined,
    top: undefined,
  });
  const [caretElement, setCaretElement] = useState<
    HTMLSpanElement | undefined
  >();

  useEffect(() => {
    notifyCaretPosition();
  });

  const notifyCaretPosition = () => {
    if (!caretElement) {
      return;
    }
    const { offsetLeft, offsetTop } = caretElement;
    if (position.left === offsetLeft && position.top === offsetTop) {
      return;
    }
    const newPosition = { left: offsetLeft, top: offsetTop };
    setPosition(newPosition);
    onCaretPositionChange(newPosition);
  };

  const config: any = readConfigFromChildren(children);
  let caretPositionInMarkup: any;

  if (selectionEnd === selectionStart) {
    caretPositionInMarkup = mapPlainTextIndex(
      value,
      config,
      selectionStart,
      'START',
    );
  }

  const resultComponents: ReactNode[] = [];
  const componentKeys: Record<string, number> = {};
  let components: ReactNode[] = resultComponents;
  let substringComponentKey = 0;

  const textIteratee = (
    substr: string,
    index: number,
    indexInPlainText: number,
  ) => {
    // check whether the caret element has to be inserted inside the current plain substring
    if (
      isNumber(caretPositionInMarkup) &&
      caretPositionInMarkup >= index &&
      caretPositionInMarkup <= index + substr.length
    ) {
      // if yes, split substr at the caret position and insert the caret component
      const splitIndex = caretPositionInMarkup - index;
      components.push(
        renderSubstring(substr.substring(0, splitIndex), substringComponentKey),
      );
      // add all following substrings and mention components as children of the caret component
      components = [
        renderSubstring(substr.substring(splitIndex), substringComponentKey),
      ];
    } else {
      components.push(renderSubstring(substr, substringComponentKey));
    }

    substringComponentKey++;
  };

  const mentionIteratee = (
    markup: string,
    index: number,
    indexInPlainText: number,
    id: string,
    display: string,
    mentionChildIndex: number,
    lastMentionEndIndex: number,
  ) => {
    const key = _generateComponentKey(componentKeys, id);
    components.push(
      getMentionComponentForMatch(id, display, mentionChildIndex, key),
    );
  };

  const renderSubstring = (string: string, key: number) => {
    // set substring span to hidden, so that Emojis are not shown double in Mobile Safari
    return (
      <span
        {...(style && typeof style === 'function' ? style('substring') : {})}
        key={key}
      >
        {string}
      </span>
    );
  };

  const getMentionComponentForMatch = (
    id: string,
    display: string,
    mentionChildIndex: number,
    key: string,
  ) => {
    const props = { id, display, key };
    const child = Children.toArray(children)[mentionChildIndex];
    return React.isValidElement(child)
      ? React.cloneElement(child, props)
      : null;
  };

  const renderHighlighterCaret = (children: ReactNode[]) => {
    return (
      <span
        {...(style && typeof style === 'function' ? style('caret') : {})}
        ref={setCaretElement}
        key="caret"
      >
        {children}
      </span>
    );
  };

  iterateMentionsMarkup(value, config, mentionIteratee, textIteratee);

  // append a span containing a space, to ensure the last text line has the correct height
  components.push(' ');

  if (components !== resultComponents) {
    // if a caret component is to be rendered, add all components that followed as its children
    resultComponents.push(renderHighlighterCaret(components));
  }

  return (
    <div
      {...(style && typeof style === 'object' ? style : {})}
      ref={containerRef}
    >
      {resultComponents}
    </div>
  );
}

const styled = createDefaultStyle(
  {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    color: 'transparent',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    border: '1px solid transparent',
    textAlign: 'start',
    '&singleLine': {
      whiteSpace: 'pre',
      wordWrap: null,
    },
    substring: {
      visibility: 'hidden',
    },
  },
  (props: any) => ({
    '&singleLine': props.singleLine,
  }),
);

export default styled(Highlighter);
