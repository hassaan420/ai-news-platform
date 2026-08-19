import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';
import { ArticleCard } from '../components/ArticleCard';

const CARDS = [
  { cat: 'Technology', src: 'Reuters', headline: 'New AI Chips Unveiled for Enterprise Workloads', time: '1h ago', destX: 150, destY: 100, delay: 0, startX: -500, startY: 80 },
  { cat: 'Business', src: 'Bloomberg', headline: 'Global Markets Rally on Positive Inflation Data', time: '2h ago', destX: 1350, destY: 120, delay: 30, startX: 2000, startY: 100 },
  { cat: 'Politics', src: 'Associated Press', headline: 'International Summit Concludes with Historic Agreement', time: '4h ago', destX: 200, destY: 600, delay: 60, startX: -500, startY: 650 },
  { cat: 'Science', src: 'Nature', headline: 'Breakthrough in Renewable Battery Storage Capacity', time: '5h ago', destX: 1300, destY: 650, delay: 90, startX: 2000, startY: 700 },
  { cat: 'World', src: 'The Guardian', headline: 'Climate Policy Updates Expected Next Quarter', time: '6h ago', destX: 750, destY: 80, delay: 120, startX: 750, startY: -400 },
  { cat: 'Health', src: 'Stat News', headline: 'New Study Links Longevity to Cellular Health', time: '8h ago', destX: 750, destY: 680, delay: 150, startX: 750, startY: 1200 },
];

export const NewsChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The scene pulls inwards at the end
  const pullIn = spring({
    frame: Math.max(0, frame - 360),
    fps,
    config: { damping: 200, stiffness: 40 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: 300,
          color: 'hsl(var(--muted-foreground))',
          opacity: interpolate(frame, [180, 240, 340, 380], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          letterSpacing: '2px'
        }}>
          Every day, millions of stories emerge.
        </h2>
      </AbsoluteFill>

      {CARDS.map((c, i) => {
        // Entrance animation
        const enterProgress = spring({
          frame: Math.max(0, frame - c.delay),
          fps,
          config: { damping: 14, stiffness: 50, mass: 1.5 },
        });

        const currentX = interpolate(enterProgress, [0, 1], [c.startX, c.destX]);
        const currentY = interpolate(enterProgress, [0, 1], [c.startY, c.destY]);
        
        // Exit pull animation
        const finalX = interpolate(pullIn, [0, 1], [currentX, 960 - 210]); // pull towards center X
        const finalY = interpolate(pullIn, [0, 1], [currentY, 540 - 150]); // pull towards center Y
        
        const currentScale = interpolate(pullIn, [0, 1], [1, 0.4]);
        const currentOpacity = interpolate(pullIn, [0, 0.8, 1], [1, 0.5, 0]);

        return (
          <ArticleCard
            key={i}
            category={c.cat}
            source={c.src}
            headline={c.headline}
            timestamp={c.time}
            x={finalX}
            y={finalY}
            scale={currentScale}
            opacity={currentOpacity}
          />
        );
      })}
    </AbsoluteFill>
  );
};
