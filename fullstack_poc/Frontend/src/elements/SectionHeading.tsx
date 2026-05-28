interface SectionHeadingProps {
  color?: string;
  size?: 'xl' | string;
  children: React.ReactNode;
}

function SectionHeading({ color, size, children }: SectionHeadingProps) {
  return (
    <div className={`leftLine my-5  ${size === 'xl' ? 'big' : ''} `}>
      <span className={`text-2xl font-bold ${color || 'text-black'}`}>
        {children}
      </span>
    </div>
  );
}

export default SectionHeading;
