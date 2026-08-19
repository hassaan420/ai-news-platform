import { Composition } from 'remotion';
import { ClarionShowcase } from './compositions/ClarionShowcase';
import './styles.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClarionShowcase"
        component={ClarionShowcase}
        durationInFrames={5400} // 90 seconds @ 60fps
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
