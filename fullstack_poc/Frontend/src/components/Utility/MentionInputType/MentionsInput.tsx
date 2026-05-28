import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  RefObject,
} from 'react'
import {
  applyChangeToValue,
  countSuggestions,
  escapeRegex,
  findStartOfMentionInPlainText,
  getEndOfLastMention,
  getMentions,
  getPlainText,
  getSubstringIndex,
  makeMentionsMarkup,
  mapPlainTextIndex,
  readConfigFromChildren,
  spliceString,
  isIE,
  isNumber,
  keys,
  omit,
  getSuggestionHtmlId,
  createDefaultStyle,
} from './mention_utils'

import Highlighter from './Highlighter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import SuggestionsOverlay from './SuggestionsOverlay'

export interface MentionData {
  id: string
  display?: string
  [key: string]: any
}

export interface MentionChildProps {
  trigger: string | RegExp
  data: MentionData[] | ((query: string, callback: (results: MentionData[]) => void) => void)
  markup: string
  displayTransform: (id: string, display: string) => string
  appendSpaceOnAdd?: boolean
  onAdd?: (id: string, display: string, start: number, end: number) => void
  isLoading?: boolean
}

export interface MentionInputProps {
  singleLine?: boolean
  allowSpaceInQuery?: boolean
  allowSuggestionsAboveCursor?: boolean
  forceSuggestionsAboveCursor?: boolean
  ignoreAccents?: boolean
  a11ySuggestionsListLabel?: string
  value?: string
  onKeyDown?: (ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  customSuggestionsContainer?: any
  onSelect?: (ev: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, clickedSuggestion?: boolean) => void
  onChange?: (event: { target: { value: string } }, newValue: string, newPlainTextValue: string, mentions: MentionData[]) => void
  suggestionsPortalHost?: Element
  inputRef?: ((el: HTMLInputElement | HTMLTextAreaElement | null) => void) | RefObject<HTMLInputElement | HTMLTextAreaElement>
  inputComponent?: React.ComponentType<any>
  children: ReactNode
  style?: any
  valueLink?: {
    requestChange: (value: string, ...args: any[]) => void
  }
  readOnly?: boolean
  disabled?: boolean
}

export interface MentionInputState {
  focusIndex: number
  selectionStart: number | null
  selectionEnd: number | null
  suggestions: Record<string, any>
  caretPosition: { left: number; top: number } | null
  suggestionsPosition: { left?: number; top?: number; right?: number; position?: string }
  setSelectionAfterHandlePaste?: boolean
  setSelectionAfterMentionChange?: boolean
  scrollFocusedIntoView?: boolean
}

export const makeTriggerRegex = function (
  trigger: string | RegExp,
  options: { allowSpaceInQuery?: boolean } = {}
): RegExp {
  if (trigger instanceof RegExp) {
    return trigger
  } else {
    const { allowSpaceInQuery } = options
    const escapedTriggerChar = escapeRegex(trigger)
    return new RegExp(
      `(?:^|\\s)(${escapedTriggerChar}([^${allowSpaceInQuery ? '' : '\\s'
      }${escapedTriggerChar}]*))$`
    )
  }
}

const getDataProvider = function (
  data: MentionData[] | ((query: string, callback: (results: MentionData[]) => void) => void),
  ignoreAccents?: boolean
) {
  if (Array.isArray(data)) {
    return function (query: string, callback: (results: MentionData[]) => void) {
      const results: MentionData[] = []
      for (let i = 0, l = data.length; i < l; ++i) {
        const display = data[i].display || data[i].id
        if (getSubstringIndex(display, query, ignoreAccents ?? false) >= 0) {
          results.push(data[i])
        }
      }
      return results
    }
  } else {
    return data
  }
}

const KEY = { TAB: 9, RETURN: 13, ESC: 27, UP: 38, DOWN: 40 }

let isComposing = false

const propTypes = {
  singleLine: PropTypes.bool,
  allowSpaceInQuery: PropTypes.bool,
  allowSuggestionsAboveCursor: PropTypes.bool,
  forceSuggestionsAboveCursor: PropTypes.bool,
  ignoreAccents: PropTypes.bool,
  a11ySuggestionsListLabel: PropTypes.string,
  value: PropTypes.string,
  onKeyDown: PropTypes.func,
  customSuggestionsContainer: PropTypes.func,
  onSelect: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  suggestionsPortalHost:
    typeof Element === 'undefined'
      ? PropTypes.any
      : PropTypes.instanceOf(Element),
  inputRef: PropTypes.any,
  inputComponent: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.string,
  ]),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
}

const getComputedStyleLengthProp = (forElement: Element, propertyName: string) => {
  const length = parseFloat(
    window.getComputedStyle(forElement, null).getPropertyValue(propertyName)
  )
  return isFinite(length) ? length : 0
}

const isMobileSafari = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

const styled = createDefaultStyle(
  {
    position: 'relative',
    overflowY: 'visible',

    input: {
      display: 'block',
      width: '100%',
      position: 'absolute',
      margin: 0,
      top: 0,
      left: 0,
      boxSizing: 'border-box',
      backgroundColor: 'transparent',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      letterSpacing: 'inherit',
      paddingLeft: "8px"
    },

    '&multiLine': {
      input: {
        height: '100%',
        bottom: 0,
        overflow: 'hidden',
        resize: 'none',
        ...(isMobileSafari
          ? {
            marginTop: 1,
            marginLeft: -3,
          }
          : null),
      },
    },
  },
  ({ singleLine }: { singleLine?: boolean }) => ({
    '&singleLine': singleLine,
    '&multiLine': !singleLine,
  })
)

const MentionsInput: React.FC<MentionInputProps> = (props) => {
  const {
    singleLine = false,
    ignoreAccents = false,
    allowSuggestionsAboveCursor = false,
    onKeyDown = () => null,
    onSelect = () => null,
    onBlur = () => null,
    onChange,
    value,
    children,
    style,
    inputComponent: CustomInput,
    inputRef,
    suggestionsPortalHost,
    customSuggestionsContainer,
    a11ySuggestionsListLabel,
    forceSuggestionsAboveCursor,
    allowSpaceInQuery,
    valueLink,
    readOnly,
    disabled,
    ...rest
  } = props

  const [focusIndex, setFocusIndex] = useState(0)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, any>>({})
  const [caretPosition, setCaretPosition] = useState<{ left: number; top: number } | null>(null)
  const [suggestionsPosition, setSuggestionsPosition] = useState<{ left?: number; top?: number; right?: number; position?: string }>({})
  const [setSelectionAfterHandlePaste, setSetSelectionAfterHandlePaste] = useState(false)
  const [setSelectionAfterMentionChange, setSetSelectionAfterMentionChange] = useState(false)
  const [scrollFocusedIntoView, setScrollFocusedIntoView] = useState(false)

  const inputElement = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const highlighterElement = useRef<HTMLElement | null>(null)
  const suggestionsElement = useRef<HTMLElement | null>(null)
  const containerElement = useRef<HTMLElement | null>(null)
  const suggestionsRef = useRef<Record<string, any>>({})
  const uuidSuggestionsOverlay = useRef(Math.random().toString(16).substring(2))
  const queryId = useRef(0)
  const suggestionsMouseDown = useRef(false)

  // Helper functions
  // Avoid shadowing imported getPlainText
  const getCurrentPlainText = useCallback(() => {
    return getPlainText(
      value || '',
      (readConfigFromChildren(children) as any[]).filter(Boolean)
    )
  }, [value, children])

  const executeOnChange = useCallback(
    (event: { target: { value: string } }, ...args: any[]) => {
      if (onChange) {
        // Only pass the expected args for onChange
        return onChange(event, ...(args as [string, string, MentionData[]]))
      }
      if (valueLink) {
        return valueLink.requestChange(event.target.value, ...args)
      }
    },
    [onChange, valueLink]
  )

  // Clipboard handlers
  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      if (event.target !== inputElement.current) return
      if (!event.clipboardData) return
      event.preventDefault()
      saveSelectionToClipboard(event)
    }
    const handleCut = (event: ClipboardEvent) => {
      if (event.target !== inputElement.current) return
      if (!event.clipboardData) return
      event.preventDefault()
      saveSelectionToClipboard(event)
      const config: any = readConfigFromChildren(children)
      const markupStartIndex: any = mapPlainTextIndex(
        value || '',
        config,
        selectionStart!,
        'START'
      )
      const markupEndIndex: any = mapPlainTextIndex(value || '', config, selectionEnd!, 'END')
      const newValue = [
        (value || '').slice(0, markupStartIndex),
        (value || '').slice(markupEndIndex),
      ].join('')
      const newPlainTextValue = getPlainText(newValue, config)
      const eventMock = {
        target: { ...event.target, value: newPlainTextValue },
      }
      executeOnChange(
        eventMock,
        newValue,
        newPlainTextValue,
        getMentions(value || '', config)
      )
    }
    const handlePaste = (event: ClipboardEvent) => {
      if (event.target !== inputElement.current) return
      if (!event.clipboardData) return
      event.preventDefault()
      const config: any = readConfigFromChildren(children)
      const markupStartIndex: any = mapPlainTextIndex(
        value || '',
        config,
        selectionStart!,
        'START'
      )
      const markupEndIndex: any = mapPlainTextIndex(value || '', config, selectionEnd!, 'END')
      const pastedMentions = event.clipboardData?.getData('text/react-mentions')
      const pastedData = event.clipboardData?.getData('text/plain')
      const newValue = spliceString(
        value || '',
        markupStartIndex,
        markupEndIndex,
        pastedMentions || pastedData || ''
      ).replace(/\r/g, '')
      const newPlainTextValue = getPlainText(newValue, config)
      const eventMock = { target: { ...event.target, value: newValue } }
      executeOnChange(
        eventMock,
        newValue,
        newPlainTextValue,
        getMentions(newValue, config)
      )
      const startOfMention = findStartOfMentionInPlainText(
        value || '',
        config,
        selectionStart!
      )
      const nextPos =
        (startOfMention || selectionStart!) +
        getPlainText(pastedMentions || pastedData || '', config).length
      setSelectionStart(nextPos)
      setSelectionEnd(nextPos)
      setSetSelectionAfterHandlePaste(true)
    }
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('paste', handlePaste)
    }
    // eslint-disable-next-line
  }, [children, value, selectionStart, selectionEnd, executeOnChange])

  const saveSelectionToClipboard = (event: ClipboardEvent) => {
    const selectionStartVal = (inputElement.current as any).selectionStart
    const selectionEndVal = (inputElement.current as any).selectionEnd
    const config: any = readConfigFromChildren(children)
    const markupStartIndex: any = mapPlainTextIndex(
      value || '',
      config,
      selectionStartVal,
      'START'
    )
    const markupEndIndex: any = mapPlainTextIndex(value || '', config, selectionEndVal, 'END')
    event.clipboardData?.setData(
      'text/plain',
      (event.target as any).value.slice(selectionStartVal, selectionEndVal)
    )
    event.clipboardData?.setData(
      'text/react-mentions',
      (value || '').slice(markupStartIndex, markupEndIndex)
    )
  }

  // Selection after mention change or paste
  useEffect(() => {
    if (setSelectionAfterMentionChange) {
      setSetSelectionAfterMentionChange(false)
      setSelection(selectionStart, selectionEnd)
    }
    if (setSelectionAfterHandlePaste) {
      setSetSelectionAfterHandlePaste(false)
      setSelection(selectionStart, selectionEnd)
    }
    // eslint-disable-next-line
  }, [setSelectionAfterMentionChange, setSelectionAfterHandlePaste])

  // Suggestions position update
  useEffect(() => {
    updateSuggestionsPosition()
    // eslint-disable-next-line
  }, [caretPosition, suggestionsPosition, suggestions])

  // Set selection
  const setSelection = (start: number | null, end: number | null) => {
    if (start === null || end === null) return
    const el = inputElement.current as any
    if (el && el.setSelectionRange) {
      el.setSelectionRange(start, end)
    } else if (el && el.createTextRange) {
      const range = el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', end)
      range.moveStart('character', start)
      range.select()
    }
  }

  // Input props
  const getInputProps = () => {
    let propsOmitted = omit(props, ['style', 'classNames', 'className', 'multiLine'], keys(propTypes));
    return {
      ...propsOmitted,
      ...(style ? style('input') : {}),
      value: getCurrentPlainText(),
      onScroll: updateHighlighterScroll,
      ...(!readOnly &&
        !disabled && {
        onChange: handleChange,
        onSelect: handleSelect,
        onKeyDown: handleKeyDown,
        onCompositionStart: handleCompositionStart,
        onCompositionEnd: handleCompositionEnd,
      }),
      ...(isOpened() && {
        role: 'combobox',
        'aria-controls': uuidSuggestionsOverlay.current,
        'aria-expanded': true,
        'aria-autocomplete': 'list',
        'aria-haspopup': 'listbox',
        'aria-activedescendant': getSuggestionHtmlId(
          uuidSuggestionsOverlay.current,
          focusIndex as any
        ),
      }),
    }
  }

  // Renderers
  const renderInput = (props: any) => (<input type="text" className='mentions-input' ref={setInputRef} {...props} />);
  const renderTextarea = (props: any) => (<textarea ref={setInputRef} {...props} />);

  function setInputRef(el: HTMLInputElement | HTMLTextAreaElement | null) {
    inputElement.current = el
    if (typeof inputRef === 'function') {
      inputRef(el)
    } else if (
      inputRef &&
      'current' in inputRef &&
      (() => {
        try {
          (inputRef as any).current = (inputRef as any).current
          return true
        } catch {
          return false
        }
      })()
    ) {
      (inputRef as { current: HTMLInputElement | HTMLTextAreaElement | null }).current = el
    }
  }

  function setSuggestionsElement(el: HTMLElement | null) { suggestionsElement.current = el }

  function setHighlighterElement(el: HTMLElement | null) { highlighterElement.current = el }

  // Highlighter scroll
  function updateHighlighterScroll() {
    const input = inputElement.current as any
    const highlighter = highlighterElement.current as any
    if (!input || !highlighter) return
    highlighter.scrollLeft = input.scrollLeft
    highlighter.scrollTop = input.scrollTop
    highlighter.height = input.height
  }

  // Caret position
  function handleCaretPositionChange(position: { left: number; top: number }) { setCaretPosition(position); }

  // Change handler
  function handleChange(ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    isComposing = false
    if (isIE()) {
      const currentDocument =
        (document.activeElement && (document.activeElement as any).contentDocument) ||
        document
      if (currentDocument.activeElement !== ev.target) {
        return
      }
    }
    const config: any = readConfigFromChildren(children)
    let newPlainTextValue: any = ev.target.value
    let selectionStartBefore: any = selectionStart
    if (selectionStartBefore == null) {
      selectionStartBefore = ev.target.selectionStart
    }
    let selectionEndBefore: any = selectionEnd
    if (selectionEndBefore == null) {
      selectionEndBefore = ev.target.selectionEnd
    }
    let newValue: any = applyChangeToValue(
      value || '',
      newPlainTextValue,
      {
        selectionStartBefore,
        selectionEndBefore,
        selectionEndAfter: ev.target.selectionEnd as any,
      },
      config
    )
    newPlainTextValue = getCurrentPlainText()
    let selectionStartVal: any = ev.target.selectionStart
    let selectionEndVal = ev.target.selectionEnd
    let setSelectionAfterMentionChangeVal = false
    let startOfMention = findStartOfMentionInPlainText(
      value || '',
      config,
      selectionStartVal
    )
    if (
      startOfMention !== undefined &&
      selectionEnd! > startOfMention
    ) {
      selectionStartVal =
        startOfMention + ((ev.nativeEvent as any).data ? (ev.nativeEvent as any).data.length : 0)
      selectionEndVal = selectionStartVal
      setSelectionAfterMentionChangeVal = true
    }
    setSelectionStart(selectionStartVal)
    setSelectionEnd(selectionEndVal)
    setSetSelectionAfterMentionChange(setSelectionAfterMentionChangeVal)
    let mentions = getMentions(newValue, config)
    if ((ev.nativeEvent as any).isComposing && selectionStartVal === selectionEndVal) {
      updateMentionsQueries((inputElement.current as any).value, selectionStartVal)
    }
    let eventMock = { target: { value: newValue } }
    executeOnChange(eventMock, newValue, newPlainTextValue, mentions)
  }

  function handleSelect(ev: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = ev.target as HTMLInputElement | HTMLTextAreaElement
    setSelectionStart(target.selectionStart)
    setSelectionEnd(target.selectionEnd)
    if (isComposing) return
    const el = inputElement.current
    if (target.selectionStart === target.selectionEnd) {
      updateMentionsQueries(el ? el.value : '', target.selectionStart!)
    } else {
      clearSuggestions()
    }
    updateHighlighterScroll()
    if (props.onSelect) props.onSelect(ev)
  }

  function handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const suggestionsCount = countSuggestions(suggestions)
    if (suggestionsCount === 0 || !suggestionsElement.current) {
      if (props.onKeyDown) props.onKeyDown(ev)
      return
    }
    if (Object.values(KEY).indexOf(ev.keyCode) >= 0) {
      ev.preventDefault()
      ev.stopPropagation()
    }
    switch (ev.keyCode) {
      case KEY.ESC: {
        clearSuggestions()
        return
      }
      case KEY.DOWN: {
        shiftFocus(+1)
        return
      }
      case KEY.UP: {
        shiftFocus(-1)
        return
      }
      case KEY.RETURN: {
        selectFocused()
        return
      }
      case KEY.TAB: {
        selectFocused()
        return
      }
      default: {
        return
      }
    }
  }

  function shiftFocus(delta: number) {
    const suggestionsCount = countSuggestions(suggestions)
    setFocusIndex((suggestionsCount + focusIndex + delta) % suggestionsCount)
    setScrollFocusedIntoView(true)
  }

  function selectFocused() {
    const flat = Object.values(suggestions).reduce(
      (acc: any[], { results, queryInfo }: any) => [
        ...acc,
        ...results.map((result: any) => ({ result, queryInfo })),
      ],
      []
    )
    const { result, queryInfo } = flat[focusIndex]
    addMention(result, queryInfo)
    setFocusIndex(0)
  }


  function handleSuggestionsMouseDown(ev: React.MouseEvent) { suggestionsMouseDown.current = true; }

  function handleSuggestionsMouseEnter(focusIndex: number) {
    setFocusIndex(focusIndex)
    setScrollFocusedIntoView(false)
  }

  function handleCompositionStart() { isComposing = true; }

  function handleCompositionEnd() { isComposing = false; }

  function updateSuggestionsPosition() {
    if (!caretPosition || !suggestionsElement.current) return
    let suggestionsNode = suggestionsElement.current
    let highlighter = highlighterElement.current
    const caretOffsetParentRect = highlighter!.getBoundingClientRect()
    const caretHeight = getComputedStyleLengthProp(highlighter!, 'font-size')
    const viewportRelative = {
      left: caretOffsetParentRect.left + caretPosition.left,
      top: caretOffsetParentRect.top + caretPosition.top + caretHeight,
    }
    const viewportHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    )
    if (!suggestionsNode) return
    let position: any = {}
    if (suggestionsPortalHost) {
      position.position = 'fixed'
      let left = viewportRelative.left
      let top = viewportRelative.top
      left -= getComputedStyleLengthProp(suggestionsNode, 'margin-left')
      top -= getComputedStyleLengthProp(suggestionsNode, 'margin-top')
      left -= highlighter!.scrollLeft
      top -= highlighter!.scrollTop
      const viewportWidth = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
      if (left + suggestionsNode.offsetWidth > viewportWidth) {
        position.left = Math.max(0, viewportWidth - suggestionsNode.offsetWidth)
      } else {
        position.left = left
      }
      if (
        (allowSuggestionsAboveCursor &&
          top + suggestionsNode.offsetHeight > viewportHeight &&
          suggestionsNode.offsetHeight < top - caretHeight) ||
        forceSuggestionsAboveCursor
      ) {
        position.top = Math.max(0, top - suggestionsNode.offsetHeight - caretHeight)
      } else {
        position.top = top
      }
    } else {
      let left = caretPosition.left - highlighter!.scrollLeft
      let top = caretPosition.top - highlighter!.scrollTop
      if (left + suggestionsNode.offsetWidth > containerElement.current!.offsetWidth) {
        position.right = 0
      } else {
        position.left = left
      }
      if (
        (allowSuggestionsAboveCursor &&
          viewportRelative.top -
          highlighter!.scrollTop +
          suggestionsNode.offsetHeight >
          viewportHeight &&
          suggestionsNode.offsetHeight <
          caretOffsetParentRect.top - caretHeight - highlighter!.scrollTop) ||
        forceSuggestionsAboveCursor
      ) {
        position.top = top - suggestionsNode.offsetHeight - caretHeight
      } else {
        position.top = top
      }
    }
    if (
      position.left === suggestionsPosition.left &&
      position.top === suggestionsPosition.top &&
      position.position === suggestionsPosition.position
    ) {
      return
    }
    setSuggestionsPosition(position)
  }

  function updateMentionsQueries(plainTextValue: string, caretPosition: number) {
    queryId.current++
    suggestionsRef.current = {}
    setSuggestions({})
    const config: any = readConfigFromChildren(children)
    const positionInValue = mapPlainTextIndex(
      value || '',
      config,
      caretPosition,
      'NULL'
    )
    if (positionInValue === null) return
    const substringStartIndex = getEndOfLastMention(
      (value || '').substring(0, positionInValue),
      config
    )
    const substring = plainTextValue.substring(
      substringStartIndex,
      caretPosition
    )
    React.Children.forEach(children, (child: any, childIndex: number) => {
      if (!child) return
      const regex = makeTriggerRegex(child.props.trigger, props)
      const match = substring.match(regex)
      if (match) {
        const querySequenceStart =
          substringStartIndex + substring.indexOf(match[1], match.index)
        queryData(
          match[2],
          childIndex,
          querySequenceStart,
          querySequenceStart + match[1].length,
          plainTextValue
        )
      }
    })
  }

  function clearSuggestions() {
    queryId.current++
    suggestionsRef.current = {}
    setSuggestions({})
    setFocusIndex(0)
  }

  function queryData(
    query: string,
    childIndex: number,
    querySequenceStart: number,
    querySequenceEnd: number,
    plainTextValue: string
  ) {
    const mentionChild = React.Children.toArray(children)[childIndex] as any
    const provideData = getDataProvider(mentionChild.props.data, ignoreAccents)
    const syncResult: any = provideData(
      query,
      (results: MentionData[]) => {
        updateSuggestions(
          queryId.current,
          childIndex,
          query,
          querySequenceStart,
          querySequenceEnd,
          plainTextValue,
          results
        )
      }
    )
    if (Array.isArray(syncResult)) {
      updateSuggestions(
        queryId.current,
        childIndex,
        query,
        querySequenceStart,
        querySequenceEnd,
        plainTextValue,
        syncResult
      )
    }
  }

  function updateSuggestions(
    queryIdVal: number,
    childIndex: number,
    query: string,
    querySequenceStart: number,
    querySequenceEnd: number,
    plainTextValue: string,
    results: MentionData[]
  ) {
    if (queryIdVal !== queryId.current) return
    suggestionsRef.current = {
      ...suggestionsRef.current,
      [childIndex]: {
        queryInfo: {
          childIndex,
          query,
          querySequenceStart,
          querySequenceEnd,
          plainTextValue,
        },
        results,
      },
    }
    const suggestionsCount = countSuggestions(suggestionsRef.current)
    setSuggestions({
      ...suggestionsRef.current,
    })
    setFocusIndex((focusIndex) =>
      focusIndex >= suggestionsCount
        ? Math.max(suggestionsCount - 1, 0)
        : focusIndex
    )
  }

  function addMention(
    { id, display }: MentionData,
    { childIndex, querySequenceStart, querySequenceEnd, plainTextValue }: any
  ) {
    const config: any = readConfigFromChildren(children)
    const mentionsChild = React.Children.toArray(children)[childIndex] as any
    const {
      markup,
      displayTransform,
      appendSpaceOnAdd,
      onAdd,
    } = mentionsChild.props
    const start: any = mapPlainTextIndex(value || '', config, querySequenceStart, 'START')
    const end = start + querySequenceEnd - querySequenceStart
    let insert = makeMentionsMarkup(markup, id, display as any)
    if (appendSpaceOnAdd) {
      insert += ' '
    }
    const newValue = spliceString(value || '', start, end, insert)
    inputElement.current?.focus()
    let displayValue = displayTransform(id, display)
    if (appendSpaceOnAdd) {
      displayValue += ' '
    }
    const newCaretPosition = querySequenceStart + displayValue.length
    setSelectionStart(newCaretPosition)
    setSelectionEnd(newCaretPosition)
    setSetSelectionAfterMentionChange(true)
    const eventMock = { target: { value: newValue } }
    const mentions = getMentions(newValue, config)
    const newPlainTextValue = spliceString(
      plainTextValue,
      querySequenceStart,
      querySequenceEnd,
      displayValue
    )
    executeOnChange(eventMock, newValue, newPlainTextValue, mentions)
    if (onAdd) {
      onAdd(id, display, start, end)
    }
    clearSuggestions()
  }

  function isLoading() {
    let isLoading = false
    React.Children.forEach(children, function (child: any) {
      isLoading = isLoading || (child && child.props.isLoading)
    })
    return isLoading
  }

  function isOpened() {
    return (
      isNumber(selectionStart) &&
      (countSuggestions(suggestions) !== 0 || isLoading())
    )
  }

  // Renderers
  function renderHighlighter() {
    return (
      <Highlighter
        containerRef={setHighlighterElement}
        style={style ? style('highlighter') : undefined}
        value={value}
        singleLine={singleLine}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        onCaretPositionChange={handleCaretPositionChange}
      >
        {children}
      </Highlighter>
    )
  }

  function renderSuggestionsOverlay() {
    if (!isNumber(selectionStart)) return null
    const { position, left, top, right } = suggestionsPosition
    const suggestionsNode = (
      <SuggestionsOverlay
        id={uuidSuggestionsOverlay.current}
        style={style ? style('suggestions') : undefined}
        position={position}
        left={left}
        top={top}
        right={right}
        focusIndex={focusIndex}
        scrollFocusedIntoView={scrollFocusedIntoView}
        containerRef={setSuggestionsElement}
        suggestions={suggestions}
        customSuggestionsContainer={customSuggestionsContainer}
        onSelect={addMention}
        onMouseDown={handleSuggestionsMouseDown}
        onMouseEnter={handleSuggestionsMouseEnter}
        isLoading={isLoading()}
        isOpened={isOpened()}
        ignoreAccents={ignoreAccents}
        a11ySuggestionsListLabel={a11ySuggestionsListLabel}
      >
        {children}
      </SuggestionsOverlay>
    )
    if (suggestionsPortalHost) {
      return ReactDOM.createPortal(
        suggestionsNode,
        suggestionsPortalHost
      )
    } else {
      return suggestionsNode
    }
  }

  function renderControl() {
    const inputProps = getInputProps()
    return (
      <div {...(style ? style('control') : {})}>
        {renderHighlighter()}
        {CustomInput
          ? <CustomInput ref={setInputRef} {...inputProps} />
          : singleLine
            ? renderInput(inputProps)
            : renderTextarea(inputProps)
        }
      </div>
    )
  }

  return (
    <div className='mentions-input-container' ref={containerElement} {...(style ? style() : {})}>
      {renderControl()}
      {renderSuggestionsOverlay()}
    </div>
  )
}

export default styled(MentionsInput)
