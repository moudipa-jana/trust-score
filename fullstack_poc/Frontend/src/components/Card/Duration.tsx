/**
 * Duration Component
 *
 * Displays a duration value with customizable styling based on variant and margin preferences.
 * Optionally hides margin and adjusts text size based on the `variant` prop.
 */

interface DurationProps {
  duration: string;
  variant?: string;
  noMargin?: boolean;
}

function Duration({ duration, variant, noMargin }: DurationProps) {
  return duration ? (
    <div
      className={`block font-medium time ${
        noMargin ? '' : 'ml-1 lg:ml-2'
      } lg:mr-2 lg:inline    ${
        variant === 'sm'
          ? 'text-xs text-black-700 xl:text-sm '
          : 'text-xs text-[#505050] lg:text-sm xl:text-sm'
      } `}
    >
      {duration}
    </div>
  ) : null;
}

export default Duration;
