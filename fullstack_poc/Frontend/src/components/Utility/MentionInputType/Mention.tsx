import React from 'react';
import useStyles from 'substyle';

interface MentionProps {
  display: React.ReactNode;
  style?: any;
  className?: string;
  classNames?: Record<string, string>;
  onAdd?: (id: string, display: string) => void;
  onRemove?: (id: string, display: string) => void;
  renderSuggestion?: (
    suggestion: any,
    query: string,
    highlightedDisplay: React.ReactNode,
    index: number,
    focused: boolean
  ) => React.ReactNode;
  trigger?: string | RegExp;
  markup?: string;
  displayTransform?: (id: string, display: string) => string;
  allowSpaceInQuery?: boolean;
  isLoading?: boolean;
  appendSpaceOnAdd?: boolean;
}

const defaultStyle = {
  fontWeight: 'inherit',
};

const Mention: React.FC<MentionProps> & { defaultProps: Partial<MentionProps> } = ({
  display,
  style,
  className,
  classNames,
}) => {
  const styles = useStyles(defaultStyle, { style, className, classNames });
  return <strong className='mention' {...styles}>{display}</strong>;
};

Mention.defaultProps = {
  trigger: '@',
  markup: '@[__display__](__id__)',
  displayTransform: function (id: string, display: string) {
    return display || id;
  },
  onAdd: () => null,
  onRemove: () => null,
  renderSuggestion: undefined,
  isLoading: false,
  appendSpaceOnAdd: false,
};

export default Mention;
