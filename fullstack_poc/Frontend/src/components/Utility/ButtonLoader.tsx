{
  /**
   * Loader displays a loading indicator in either a circular spinner or animated logo variant.
   * The `size` and `variant` props control its appearance.
   */
}
import CustomImage from '@/components/Utility/CustomImage';

function ButtonLoader({ size, variant }: { size?: string; variant?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${variant === 'circle' ? `h-${size || '8'} w-${size || '8'}` : 'h-[500px] w-[500px]'}`}
    >
      <CustomImage
        src="/images/btn-loader.gif"
        alt="Loading..."
        width={variant === 'circle' ? 32 : 150}
        height={variant === 'circle' ? 32 : 150}
      />
    </div>
  );
}

export default ButtonLoader;
