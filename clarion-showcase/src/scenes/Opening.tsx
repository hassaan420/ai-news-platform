import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const logoOpacity = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: {
      damping: 200,
      stiffness: 20,
      mass: 2
    },
  });

  // Calculate actual scale ranging from 0.95 to 1
  const mappedScale = interpolate(logoScale, [0, 1], [0.95, 1]);

  const logoBlur = interpolate(frame, [30, 80], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const taglineOpacity = interpolate(frame, [120, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const taglineY = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const mappedTaglineY = interpolate(taglineY, [0, 1], [20, 0]);

  // Subtle background sweep
  const sweepX = interpolate(frame, [0, 480], [-50, 150]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Subtle Background Movement */}
      <AbsoluteFill>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: `${sweepX}%`,
          width: '50%',
          height: '40%',
          background: 'radial-gradient(ellipse at center, hsla(var(--primary), 0.05) 0%, transparent 60%)',
          filter: 'blur(80px)',
          transform: 'translate(-50%, -50%)',
        }} />
      </AbsoluteFill>

      {/* Main Content */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        
        <div style={{
          opacity: logoOpacity,
          transform: `scale(${mappedScale})`,
          filter: `blur(${logoBlur}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
            opacity: taglineOpacity,
            transform: `translateY(${mappedTaglineY}px)`,
            fontSize: '36px',
            fontWeight: 400,
            color: 'hsl(var(--muted-foreground))',
            marginTop: '24px',
            letterSpacing: '1px'
          }}>
            News, understood.
          </h2>

        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
