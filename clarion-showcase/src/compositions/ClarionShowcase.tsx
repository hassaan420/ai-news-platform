import { AbsoluteFill, Series } from 'remotion';
import { Opening } from '../scenes/Opening';
import { NewsChaos } from '../scenes/NewsChaos';
import { Ingestion } from '../scenes/Ingestion';
import { AIAnalysis } from '../scenes/AIAnalysis';
import { Discovery } from '../scenes/Discovery';
import { Verification } from '../scenes/Verification';
import { ProductUI } from '../scenes/ProductUI';
import { Administration } from '../scenes/Administration';
import { Architecture } from '../scenes/Architecture';
import { Observability } from '../scenes/Observability';
import { Closing } from '../scenes/Closing';

export const ClarionShowcase: React.FC = () => {
  return (
    <AbsoluteFill className="bg-[var(--background)] text-[var(--foreground)] font-['Hanken_Grotesk']">
      <Series>
        <Series.Sequence durationInFrames={480} name="Opening">
          <Opening />
        </Series.Sequence>
        <Series.Sequence durationInFrames={420} name="NewsChaos">
          <NewsChaos />
        </Series.Sequence>
        <Series.Sequence durationInFrames={480} name="Ingestion">
          <Ingestion />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} name="AIAnalysis">
          <AIAnalysis />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} name="Discovery">
          <Discovery />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} name="Verification">
          <Verification />
        </Series.Sequence>
        <Series.Sequence durationInFrames={720} name="ProductUI">
          <ProductUI />
        </Series.Sequence>
        <Series.Sequence durationInFrames={420} name="Administration">
          <Administration />
        </Series.Sequence>
        <Series.Sequence durationInFrames={600} name="Architecture">
          <Architecture />
        </Series.Sequence>
        <Series.Sequence durationInFrames={300} name="Observability">
          <Observability />
        </Series.Sequence>
        <Series.Sequence durationInFrames={180} name="Closing">
          <Closing />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
