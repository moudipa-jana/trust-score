import invariant from 'invariant';
import React from 'react';
import { ComponentType } from 'react';
import { Children } from 'react';
import { ReactElement, ReactNode } from 'react';
import useStyles from 'substyle';

import lettersDiacritics from './diacritics';

// placeholders.js
const PLACEHOLDERS = {
  id: '__id__',
  display: '__display__',
};

// combineRegExps.js
export const combineRegExps = (regExps: RegExp[]): RegExp => {
  const serializedRegexParser = /^\/(.+)\/(\w+)?$/;
  return new RegExp(
    regExps
      .map((regex: RegExp) => {
        const match = serializedRegexParser.exec(regex.toString());
        invariant(match !== null, `Invalid RegExp format: ${regex.toString()}`);
        const [, regexString, regexFlags] = match as RegExpExecArray;

        invariant(
          !regexFlags,
          `RegExp flags are not supported. Change /${regexString}/${regexFlags} into /${regexString}/`,
        );

        return `(${regexString})`;
      })
      .join('|'),
    'g',
  );
};

// countPlaceholders.js
export const countPlaceholders = (markup: string): number => {
  let count = 0;
  if (markup.indexOf('__id__') >= 0) count++;
  if (markup.indexOf('__display__') >= 0) count++;
  return count;
};

// countSuggestions.js
export interface SuggestionResults {
  results: unknown[];
  [key: string]: unknown;
}

export type Suggestions = Record<string, SuggestionResults>;

export const countSuggestions = (suggestions: Suggestions): number =>
  Object.values(suggestions).reduce(
    (acc, { results }) => acc + results.length,
    0,
  );

// defaultStyle.js
type DefaultStyle = Record<string, any>;
type Modifiers = Record<string, any>;
type GetModifiers = (props: Record<string, any>) => Modifiers | undefined;

interface EnhancerProps {
  style?: any;
  className?: string;
  classNames?: any;
  [key: string]: any;
}

export function createDefaultStyle(
  defaultStyle: DefaultStyle,
  getModifiers?: GetModifiers,
) {
  return function enhance<P extends object>(
    ComponentToWrap: ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P & EnhancerProps> & React.RefAttributes<any>
  > {
    const DefaultStyleEnhancer = React.forwardRef<any, P & EnhancerProps>(
      ({ style, className, classNames, ...rest }, ref) => {
        const modifiers = getModifiers ? getModifiers(rest) : undefined;
        const styles = useStyles(
          defaultStyle,
          { style, className, classNames },
          modifiers,
        );
        return React.createElement(ComponentToWrap, {
          ...(rest as P),
          style: styles,
          ref,
        });
      },
    );

    const displayName =
      (ComponentToWrap as any).displayName ||
      (ComponentToWrap as any).name ||
      'Component';
    (DefaultStyleEnhancer as any).displayName = `defaultStyle(${displayName})`;

    return DefaultStyleEnhancer;
  };
}

// escapeRegex.js
export const escapeRegex = (str: string) =>
  str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// findPositionOfCapturingGroup.js
export const findPositionOfCapturingGroup = (
  markup: string,
  parameterName: 'id' | 'display',
) => {
  invariant(
    parameterName === 'id' || parameterName === 'display',
    `Second arg must be either "id" or "display", got: "${parameterName}"`,
  );

  // find positions of placeholders in the markup
  let indexDisplay: number | null = markup.indexOf(PLACEHOLDERS.display);
  let indexId: number | null = markup.indexOf(PLACEHOLDERS.id);

  // set indices to null if not found
  if (indexDisplay < 0) indexDisplay = null;
  if (indexId < 0) indexId = null;

  // markup must contain one of the mandatory placeholders
  invariant(
    indexDisplay !== null || indexId !== null,
    `The markup '${markup}' does not contain either of the placeholders '__id__' or '__display__'`,
  );

  if (indexDisplay !== null && indexId !== null) {
    // both placeholders are used, return 0 or 1 depending on the position of the requested parameter
    return (parameterName === 'id' && indexId <= indexDisplay) ||
      (parameterName === 'display' && indexDisplay <= indexId)
      ? 0
      : 1;
  }

  // just one placeholder is being used, we'll use the captured string for both parameters
  return 0;
};

// findStartOfMentionInPlainText.js
export interface MentionConfig {
  markup: string;
  regex: RegExp;
  displayTransform: (id: string, display: string) => string;
}

export type MarkupIteratee = (
  markup: string,
  index: number,
  mentionPlainTextIndex: number,
  id: string,
  display: string,
  childIndex: number,
  lastMentionEndIndex: number,
) => void;

export type TextIteratee = (
  substr: string,
  start: number,
  currentPlainTextIndex: number,
) => void;

export const findStartOfMentionInPlainText = (
  value: string,
  config: MentionConfig[],
  indexInPlainText: number,
): number | undefined => {
  let result = indexInPlainText;
  let foundMention = false;

  let markupIteratee: MarkupIteratee = (
    _markup,
    _index,
    mentionPlainTextIndex,
    _id,
    display,
    _childIndex,
    _lastMentionEndIndex,
  ) => {
    if (
      mentionPlainTextIndex <= indexInPlainText &&
      mentionPlainTextIndex + display.length > indexInPlainText
    ) {
      result = mentionPlainTextIndex;
      foundMention = true;
    }
  };
  iterateMentionsMarkup(value, config, markupIteratee);

  if (foundMention) {
    return result;
  }
};

// iterateMentionsMarkup.js
export const emptyFn: TextIteratee = () => {};

// Finds all occurrences of the markup in the value and calls the `markupIteratee` callback for each of them.
// The optional `textIteratee` callback is called for each plain text ranges in between these markup occurrences.
export const iterateMentionsMarkup = (
  value: string,
  config: MentionConfig[],
  markupIteratee: MarkupIteratee,
  textIteratee: TextIteratee = emptyFn,
): void => {
  const regex = combineRegExps(config.map((c: MentionConfig) => c.regex));

  let accOffset = 2; // first is whole match, second is the for the capturing group of first regexp component
  const captureGroupOffsets = config.map(({ markup }: { markup: string }) => {
    const result = accOffset;
    // + 1 is for the capturing group we add around each regexp component in combineRegExps
    accOffset += countPlaceholders(markup) + 1;
    return result;
  });

  let match: RegExpExecArray | null;
  let start = 0;
  let currentPlainTextIndex = 0;

  // detect all mention markup occurrences in the value and iterate the matches
  while ((match = regex.exec(value)) !== null) {
    const offset = captureGroupOffsets.find((o: number) => !!match![o]);
    const mentionChildIndex = captureGroupOffsets.indexOf(offset as number);
    const { markup, displayTransform } = config[mentionChildIndex];
    const idPos =
      (offset as number) + findPositionOfCapturingGroup(markup, 'id');
    const displayPos =
      (offset as number) + findPositionOfCapturingGroup(markup, 'display');

    const id = match[idPos];
    const display = displayTransform(id, match[displayPos]);

    let substr = value.substring(start, match.index);
    textIteratee(substr, start, currentPlainTextIndex);
    currentPlainTextIndex += substr.length;

    markupIteratee(
      match[0],
      match.index,
      currentPlainTextIndex,
      id,
      display,
      mentionChildIndex,
      start,
    );
    currentPlainTextIndex += display.length;
    start = regex.lastIndex;
  }

  if (start < value.length) {
    textIteratee(value.substring(start), start, currentPlainTextIndex);
  }
};

// getMentions.js
interface Mention {
  id: string;
  display: string;
  childIndex: number;
  index: number;
  plainTextIndex: number;
}

export const getMentions = (
  value: string,
  config: MentionConfig[],
): Mention[] => {
  const mentions: Mention[] = [];
  iterateMentionsMarkup(
    value,
    config,
    (_unused1, index, plainTextIndex, id, display, childIndex) => {
      mentions.push({
        id: id,
        display: display,
        childIndex: childIndex,
        index: index,
        plainTextIndex: plainTextIndex,
      });
    },
  );
  return mentions;
};

// getEndOfLastMention.js
export const getEndOfLastMention = (value: string, config: MentionConfig[]) => {
  const mentions = getMentions(value, config);
  const lastMention = mentions[mentions.length - 1];
  return lastMention
    ? lastMention.plainTextIndex + lastMention.display.length
    : 0;
};

// getPlainText.js
export const getPlainText = (value: string, config: MentionConfig[]) => {
  let result = '';
  iterateMentionsMarkup(
    value,
    config,
    (_match, _index, _plainTextIndex, _id, display) => {
      result += display;
    },
    (plainText) => {
      result += plainText;
    },
  );
  return result;
};

// getSubstringIndex.js
const removeAccents = (str: string): string => {
  let formattedStr = str;

  lettersDiacritics.forEach(
    (letterDiacritics: { letters: RegExp; base: string }) => {
      formattedStr = formattedStr.replace(
        letterDiacritics.letters,
        letterDiacritics.base,
      );
    },
  );

  return formattedStr;
};

export const normalizeString = (str: string): string =>
  removeAccents(str).toLowerCase();

export const getSubstringIndex = (
  str: string,
  substr: string,
  ignoreAccents: boolean,
): number => {
  if (!ignoreAccents) {
    return str.toLowerCase().indexOf(substr.toLowerCase());
  }

  return normalizeString(str).indexOf(normalizeString(substr));
};

// getSuggestionHtmlId.js
export const getSuggestionHtmlId = (prefix: string, id: string): string =>
  `${prefix}-${id}`;

// isIE.js
export const isIE = () => !!(document as any).documentMode;

// isNumber.js
export const isNumber = (val: any): val is number => typeof val === 'number';

// isPlainObject.js
export const isPlainObject = (obj: any): obj is Record<string, any> =>
  !(obj instanceof Date) && obj === Object(obj) && !Array.isArray(obj);

// keys.js
export const keys = (obj: any) => {
  return obj === Object(obj) ? Object.keys(obj) : [];
};

// makeMentionsMarkup.js
export const makeMentionsMarkup = (
  markup: string,
  id: string,
  display: string,
): string => {
  return markup
    .replace(PLACEHOLDERS.id, id)
    .replace(PLACEHOLDERS.display, display);
};

// mapPlainTextIndex.js
export const mapPlainTextIndex = (
  value: string,
  config: MentionConfig[],
  indexInPlainText: number,
  inMarkupCorrection: 'START' | 'END' | 'NULL' = 'START',
): number | null => {
  if (typeof indexInPlainText !== 'number') {
    return indexInPlainText;
  }

  let result: number | null | undefined;
  const textIteratee = (
    substr: string,
    index: number,
    substrPlainTextIndex: number,
  ): void => {
    if (result !== undefined) return;

    if (substrPlainTextIndex + substr.length >= indexInPlainText) {
      // found the corresponding position in the current plain text range
      result = index + indexInPlainText - substrPlainTextIndex;
    }
  };
  const markupIteratee = (
    markup: string,
    index: number,
    mentionPlainTextIndex: number,
    _id: string,
    display: string,
  ): void => {
    if (result !== undefined) return;

    if (mentionPlainTextIndex + display.length > indexInPlainText) {
      // found the corresponding position inside current match,
      // return the index of the first or after the last char of the matching markup
      // depending on whether the `inMarkupCorrection`
      if (inMarkupCorrection === 'NULL') {
        result = null;
      } else {
        result = index + (inMarkupCorrection === 'END' ? markup.length : 0);
      }
    }
  };

  iterateMentionsMarkup(value, config, markupIteratee, textIteratee);

  // when a mention is at the end of the value and we want to get the caret position
  // at the end of the string, result is undefined
  return result === undefined ? value.length : result;
};

// markupToRegex.js
export const markupToRegex = (markup: string) => {
  const escapedMarkup = escapeRegex(markup);

  const charAfterDisplay =
    markup[markup.indexOf(PLACEHOLDERS.display) + PLACEHOLDERS.display.length];

  const charAfterId =
    markup[markup.indexOf(PLACEHOLDERS.id) + PLACEHOLDERS.id.length];

  return new RegExp(
    escapedMarkup
      .replace(
        PLACEHOLDERS.display,
        `([^${escapeRegex(charAfterDisplay || '')}]+?)`,
      )
      .replace(PLACEHOLDERS.id, `([^${escapeRegex(charAfterId || '')}]+?)`),
  );
};

// mergeDeep.js
export const mergeDeep = (target: any, source: any) => {
  let output = Object.assign({}, target);
  if (isPlainObject(target) && isPlainObject(source)) {
    keys(source).forEach((key) => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

// merge.js
export const merge = (target: any, ...sources: any[]): any => {
  return sources.reduce((t, s) => {
    return mergeDeep(t, s);
  }, target);
};

// omit.js
export const omit = <T extends Record<string, any>>(
  obj: T,
  ...rest: (string | string[])[]
): Partial<T> => {
  const keys: string[] = ([] as string[]).concat(...rest);
  return Object.keys(obj).reduce((acc: Partial<T>, k: string) => {
    if (
      Object.prototype.hasOwnProperty.call(obj, k) &&
      !keys.includes(k) &&
      obj[k] !== undefined
    ) {
      (acc as any)[k] = obj[k];
    }
    return acc;
  }, {});
};

// readConfigFromChildren.js
type MentionChildProps = {
  markup: string;
  regex?: RegExp;
  displayTransform?: (id: string, display: string) => string;
};

export const readConfigFromChildren = (children: ReactNode) =>
  Children.toArray(children)
    .map((child) => {
      if (typeof child === 'object' && child !== null && 'props' in child) {
        const { markup, regex, displayTransform } = (
          child as ReactElement<MentionChildProps>
        ).props;
        return {
          markup,
          regex: regex
            ? coerceCapturingGroups(regex, markup)
            : markupToRegex(markup),
          displayTransform:
            displayTransform ||
            ((id: string, display: string) => display || id),
        };
      }
      // fallback for non-ReactElement children
      return null;
    })
    .filter(Boolean);

// make sure that the custom regex defines the correct number of capturing groups
const coerceCapturingGroups = (regex: RegExp, markup: string): RegExp => {
  const execResult = new RegExp(regex.toString() + '|').exec('');
  const numberOfGroups = execResult ? execResult.length - 1 : 0;
  const numberOfPlaceholders = countPlaceholders(markup);

  invariant(
    numberOfGroups === numberOfPlaceholders,
    `Number of capturing groups in RegExp ${regex.toString()} (${numberOfGroups}) does not match the number of placeholders in the markup '${markup}' (${numberOfPlaceholders})`,
  );

  return regex;
};

// spliceString.js
export const spliceString = (
  str: string,
  start: number,
  end: number,
  insert: string,
): string => str.substring(0, start) + insert + str.substring(end);

// applyChangeToValue.js
export interface SelectionChange {
  selectionStartBefore: number;
  selectionEndBefore: number;
  selectionEndAfter: number;
}

export const applyChangeToValue = (
  value: string,
  plainTextValue: string,
  {
    selectionStartBefore,
    selectionEndBefore,
    selectionEndAfter,
  }: SelectionChange,
  config: MentionConfig[],
): string => {
  let oldPlainTextValue = getPlainText(value, config);

  let lengthDelta = oldPlainTextValue.length - plainTextValue.length;
  if (selectionStartBefore === undefined) {
    selectionStartBefore = selectionEndAfter + lengthDelta;
  }

  if (selectionEndBefore === undefined) {
    selectionEndBefore = selectionStartBefore;
  }

  // Fixes an issue with replacing combined characters for complex input. Eg like acented letters on OSX
  if (
    selectionStartBefore === selectionEndBefore &&
    selectionEndBefore === selectionEndAfter &&
    oldPlainTextValue.length === plainTextValue.length
  ) {
    selectionStartBefore = selectionStartBefore - 1;
  }

  // extract the insertion from the new plain text value
  let insert = plainTextValue.slice(selectionStartBefore, selectionEndAfter);

  // handling for Backspace key with no range selection
  let spliceStart = Math.min(selectionStartBefore, selectionEndAfter);

  let spliceEnd = selectionEndBefore;
  if (selectionStartBefore === selectionEndAfter) {
    // handling for Delete key with no range selection
    spliceEnd = Math.max(
      selectionEndBefore,
      selectionStartBefore + lengthDelta,
    );
  }

  let mappedSpliceStart = mapPlainTextIndex(
    value,
    config,
    spliceStart,
    'START',
  );
  let mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'END');

  let controlSpliceStart = mapPlainTextIndex(
    value,
    config,
    spliceStart,
    'NULL',
  );
  let controlSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'NULL');
  let willRemoveMention =
    controlSpliceStart === null || controlSpliceEnd === null;

  // Ensure mappedSpliceStart and mappedSpliceEnd are numbers
  if (mappedSpliceStart === null || mappedSpliceEnd === null) {
    return value;
  }

  let newValue = spliceString(
    value,
    mappedSpliceStart,
    mappedSpliceEnd,
    insert,
  );

  if (!willRemoveMention) {
    // test for auto-completion changes
    let controlPlainTextValue = getPlainText(newValue, config);
    if (controlPlainTextValue !== plainTextValue) {
      // some auto-correction is going on

      // find start of diff
      spliceStart = 0;
      while (plainTextValue[spliceStart] === controlPlainTextValue[spliceStart])
        spliceStart++;

      // extract auto-corrected insertion
      insert = plainTextValue.slice(spliceStart, selectionEndAfter);

      // find index of the unchanged remainder
      spliceEnd = oldPlainTextValue.lastIndexOf(
        plainTextValue.substring(selectionEndAfter),
      );

      // re-map the corrected indices
      mappedSpliceStart = mapPlainTextIndex(
        value,
        config,
        spliceStart,
        'START',
      );
      mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, 'END');

      if (mappedSpliceStart === null || mappedSpliceEnd === null) {
        return value;
      }

      newValue = spliceString(
        value,
        mappedSpliceStart,
        mappedSpliceEnd,
        insert,
      );
    }
  }

  return newValue;
};
