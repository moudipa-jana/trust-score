import Image from 'next/image';
import { CSSProperties } from 'react';

interface LoaderProps {
  loop: boolean;
  play: boolean;
  onComplete?: () => void;
  style?: CSSProperties;
}

export default function TabletLoader({
  play, // kept for interface compatibility
  loop, // kept for interface compatibility
  onComplete, // kept for interface compatibility
  style,
}: LoaderProps) {
  return (
    <div
     
     
    
      style={style}
      className="flex h-full w-full items-center justify-center"
    >
      <Image
        src="/images/Loader_animation.gif"
        alt="Loading..."
        width={500}
        height={500}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}

TabletLoader.defaultProps = {
  play: true,
  loop: true,
  onComplete: () => null,
  style: { height: 100 },
};
