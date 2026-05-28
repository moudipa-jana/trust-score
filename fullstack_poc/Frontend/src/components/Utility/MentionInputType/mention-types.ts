export interface MentionItem {
  display: string;
  id: string;
  childIndex: number;
  index: number;
  plainTextIndex: number;
}

export type OnChangeHandlerFunc = (
  event: { target: { value: string } },
  newValue: string,
  newPlainTextValue: string,
  mentions: MentionItem[],
) => void;

export type DisplayTransformFunc = (id: string, display: string) => string;

export interface SuggestionDataItem {
  id: string | number;
  display?: string | undefined;
}

export type DataFunc = (
  query: string,
  callback: (data: SuggestionDataItem[]) => void,
) =>
  | Promise<void>
  | void
  | Promise<SuggestionDataItem[]>
  | SuggestionDataItem[];

export type SuggestionFunc = (
  suggestion: SuggestionDataItem,
  search: string,
  highlightedDisplay: React.ReactNode,
  index: number,
  focused: boolean,
) => React.ReactNode;

export type OnAddHandlerFunc = (
  id: string | number,
  display: string,
  startPos: number,
  endPos: number,
) => void;

export interface MentionProps {
  /**
   * Callback invoked when a suggestion has been added
   */
  onAdd?: OnAddHandlerFunc | undefined;

  /** Allows customizing how mention suggestions are rendered */
  renderSuggestion?: SuggestionFunc | undefined;
  className?: string | undefined;

  /**
   * A template string for the markup to use for mentions
   * @default '@[__display__](__id__)'
   */
  markup?: string | undefined;

  /** Accepts a function for customizing the string that is displayed for a mention */
  displayTransform?: DisplayTransformFunc | undefined;

  /**
   * Defines the char sequence upon which to trigger querying the data source
   * @default '@'
   */
  trigger: string | RegExp;
  isLoading?: boolean | undefined;

  /**
   * An array of the mentionable data entries (objects with id & display keys, or a filtering function that returns an array based on a query parameter
   * @default null
   */
  data: SuggestionDataItem[] | DataFunc | null;
  style?: React.CSSProperties;

  /** Append a space when a suggestion has been added */
  appendSpaceOnAdd?: boolean | undefined;

  /**
   * Allows providing a custom regular expression for parsing your markup and extracting the placeholder interpolations
   */
  regex?: RegExp | undefined;
}

export interface MentionsInputStyleDefinition extends React.CSSProperties {
  control?: React.CSSProperties;
  highlighter?: React.CSSProperties;
  input?: React.CSSProperties;
}

export interface MentionsSuggestionItemStyle extends React.CSSProperties {
  '&focused'?: React.CSSProperties;
}

export interface MentionsSuggestionsStyle extends React.CSSProperties {
  list?: React.CSSProperties;
  item?: MentionsSuggestionItemStyle;
}

export interface MentionsInputStyle
  extends React.CSSProperties,
    MentionsInputStyleDefinition {
  '&multiLine'?: MentionsInputStyleDefinition;
  '&singleLine'?: MentionsInputStyleDefinition;
  suggestions?: MentionsSuggestionsStyle;
}

export interface MentionsInputProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'onBlur' | 'onKeyDown' | 'onSelect'
  > {
  /**
   * If set to `true` a regular text input element will be rendered
   * instead of a textarea
   * @default false
   */
  singleLine?: boolean | undefined;

  /**
   * If set to `true` spaces will not interrupt matching suggestions
   */
  allowSpaceInQuery?: boolean | undefined;

  /** Renders the SuggestionList above the cursor if there is not enough space below */
  allowSuggestionsAboveCursor?: boolean | undefined;

  /** Forces the SuggestionList to be rendered above the cursor */
  forceSuggestionsAboveCursor?: boolean | undefined;
  ignoreAccents?: boolean | undefined;

  /** @default '' */
  value?: string | undefined;

  /** A callback that is invoked when the user changes the value in the mentions input */
  onChange?: OnChangeHandlerFunc | undefined;
  placeholder?: string | undefined;

  /** Passes true as second argument if the blur was caused by a mousedown on a suggestion */
  onBlur?:
    | ((
        event:
          | React.FocusEvent<HTMLInputElement>
          | React.FocusEvent<HTMLTextAreaElement>,
        clickedSuggestion: boolean,
      ) => void)
    | undefined;
  onSelect?: ((event: React.UIEvent) => void) | undefined;
  onKeyDown?:
    | ((
        event:
          | React.KeyboardEvent<HTMLTextAreaElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => void)
    | undefined;
  children:
    | React.ReactElement<MentionProps>
    | Array<React.ReactElement<MentionProps>>;
  className?: string | undefined;
  classNames?: any;
  style?: MentionsInputStyle;

  /** Allows customizing the container of the suggestions */
  customSuggestionsContainer?:
    | ((children: React.ReactNode) => React.ReactNode)
    | undefined;

  /** Render suggestions into the DOM in the supplied host element. */
  suggestionsPortalHost?: Element | undefined;

  /** Accepts a React ref to forward to the underlying input element */
  inputRef?:
    | React.Ref<HTMLTextAreaElement>
    | React.Ref<HTMLInputElement>
    | undefined;

  /**
   * This label would be exposed to screen readers when suggestion popup appears
   * @default ''
   */
  a11ySuggestionsListLabel?: string | undefined;
}

export interface TagInputProps
  extends Omit<
    MentionsInputProps,
    'onChange' | 'value' | 'required' | 'children'
  > {
  placeholder?: string;
  rounded?: boolean;
  required?: string | boolean;
  type?: string;
  name?: string;
  dark?: boolean;
  autoFocus?: boolean;
  multiLine?: boolean;
  singleLine?: boolean;
  disabled?: boolean;
  value: string;
  onChange?: (value: string) => void;
  isIcon?: boolean;
  id?: string;
  outline?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  fixHt?: boolean;
  commentHt?: boolean;
  isCommentField?: boolean;
  setHasInvalidHashtag?: (hasValidHashTag: boolean) => void;
  /**
   * If set, @-mention suggestions will be restricted to campfire members.
   * Useful for campfire contexts where users blocked by campfire admins
   * should not be mentionable inside that campfire.
   */
  mentionCampfireId?: string;
  restrictMentionsToCampfire?: boolean;
}

export interface User {
  id: string;
  name: string;
  profilePicture: string;
}

export interface Hashtag {
  id: string;
  hashtag_name: string;
  number_of_posts: number;
}

export interface MentionData extends SuggestionDataItem {
  profilePicture?: string;
  noPosts?: number;
}

export interface SearchResponse {
  users: User[];
}

export interface HashtagResponse {
  hashtags: Hashtag[];
}
