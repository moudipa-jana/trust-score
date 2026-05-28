import dynamic from 'next/dynamic';
import { CSSProperties } from 'react';
const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

interface ILoaderProps {
  loop: boolean;
  play: boolean;
  onComplete?: () => void;
  style?: CSSProperties | undefined;
  animationData?: object;
  renderer?: string;
}
export default function LottieLoader({
  play,
  loop,
  onComplete,
  style,
  animationData,
  renderer,
}: ILoaderProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      play={play}
      onComplete={onComplete}
      style={style}
      renderer={renderer as 'svg'}
    />
  );
}
