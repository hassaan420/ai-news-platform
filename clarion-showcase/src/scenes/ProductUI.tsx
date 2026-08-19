import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const ProductUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide 1: Home (0-180)
  const homeOpacity = interpolate(frame, [0, 30, 150, 180], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const homeScale = interpolate(frame, [0, 180], [1, 1.1]);
  const homeY = spring({ frame, fps, config: { damping: 200, stiffness: 20 } });
  
  // Slide 2: Article (180-360)
  const articleOpacity = interpolate(frame, [150, 180, 330, 360], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const articleScale = interpolate(frame, [150, 360], [1.1, 1]);
  const articleY = interpolate(frame, [150, 360], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Slide 3: Search (360-540)
  const searchOpacity = interpolate(frame, [330, 360, 510, 540], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const searchScale = interpolate(frame, [360, 540], [1, 1.05]);

  // Slide 4: Trending (540-720)
  const trendingOpacity = interpolate(frame, [510, 540], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const trendingScale = interpolate(frame, [540, 720], [1.05, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Home UI */}
      <AbsoluteFill style={{ opacity: homeOpacity, transform: `scale(${homeScale}) translateY(${interpolate(homeY, [0, 1], [50, 0])}px)` }}>
        <Img src={staticFile('home.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Soft vignette */}
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)' }} />
      </AbsoluteFill>

      {/* Article UI */}
      <AbsoluteFill style={{ opacity: articleOpacity, transform: `scale(${articleScale}) translateY(${articleY}px)` }}>
        <Img src={staticFile('article.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)' }} />
      </AbsoluteFill>

      {/* Search UI */}
      <AbsoluteFill style={{ opacity: searchOpacity, transform: `scale(${searchScale})` }}>
        <Img src={staticFile('search.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)' }} />
      </AbsoluteFill>

      {/* Trending UI */}
      <AbsoluteFill style={{ opacity: trendingOpacity, transform: `scale(${trendingScale})` }}>
        <Img src={staticFile('trending.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)' }} />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
