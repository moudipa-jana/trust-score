interface ProgressBarProps {
  width?: string | number;
}

const ProgressBar = ({ width }: ProgressBarProps) => {
  return (
    <>
      <div className="overflow-hidden rounded-full bg-primary-light h-3 w-full">
        <div
          style={{ width }}
          className="h-3 rounded-full bg-primary transition-all duration-300 ease-in-out"
        />
      </div>
    </>
  );
};
export default ProgressBar;
