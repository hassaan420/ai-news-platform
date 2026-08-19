import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoScale = spring({ frame, fps, config: { damping: 200, stiffness: 20 } });
  const mappedScale = interpolate(logoScale, [0, 1], [0.95, 1]);

  const Pillar: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
    const pEnter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 60 } });
    return (
      <div style={{
        opacity: pEnter,
        transform: `translateY(${interpolate(pEnter, [0, 1], [20, 0])}px)`,
        fontSize: '24px',
        color: 'hsl(var(--muted-foreground))',
        fontWeight: 600,
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        {text}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))', justifyContent: 'center', alignItems: 'center' }}>
      
      <div style={{
        opacity: logoOpacity,
        transform: `scale(${mappedScale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '60px'
      }}>
        <h1 style={{
          fontSize: '120px',
          fontWeight: 700,
          color: 'hsl(var(--primary))',
          letterSpacing: '-2px',
          margin: 0,
          lineHeight: 1
        }}>
          Clarion
        </h1>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 400,
          color: 'hsl(var(--foreground))',
          marginTop: '24px',
          letterSpacing: '1px'
        }}>
          News, understood.
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '60px' }}>
        <Pillar text="AI" delay={30} />
        <Pillar text="DISCOVERY" delay={45} />
        <Pillar text="VERIFICATION" delay={60} />
        <Pillar text="INTELLIGENCE" delay={75} />
      </div>

    </AbsoluteFill>
  );
};
