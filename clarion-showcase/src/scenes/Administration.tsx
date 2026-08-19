import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Administration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 60 } });
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))', padding: '60px' }}>
      <div style={{
        flex: 1,
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsla(var(--border), 0.5)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `scale(${interpolate(enter, [0, 1], [0.95, 1])})`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '30px', borderBottom: '1px solid hsla(var(--border), 0.5)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'hsl(var(--primary))' }}>admin_panel_settings</span>
          <span style={{ fontSize: '24px', fontWeight: 600 }}>Clarion Administration</span>
        </div>
        
        {/* We use the real admin screenshot */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Img src={staticFile('admin.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          
          {/* Simulated scanning effect to make it feel alive without fabricating data */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
            boxShadow: '0 0 20px 4px hsla(var(--primary), 0.3)',
            transform: `translateY(${interpolate(frame, [30, 200], [0, 800], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
            opacity: interpolate(frame, [30, 60, 180, 200], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
