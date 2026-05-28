import { CSSProperties } from 'react';

import clsxm from '@/lib/clsxm';

interface TextAreaProps {
  placeholder?: string;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style?: CSSProperties;
  rows?: number;
  cols?: number;
  className?: string;
}

function TextArea({
  placeholder,
  required,
  name,
  value,
  onChange,
  style,
  rows,
  cols,
  className,
}: TextAreaProps) {
  return (
    <textarea
      id={name}
      className={clsxm(
        'block max-h-40 w-full overflow-y-auto rounded-sm border border-gray-600  bg-white p-2.5 text-sm  placeholder-gray-700 focus:outline-none',
        className,
      )}
      placeholder={placeholder}
      value={value}
      required={required}
      onChange={onChange}
      style={style}
      rows={rows}
      cols={cols}
      wrap="soft"
    />
  );
}

export default TextArea;
