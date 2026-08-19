import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Discovery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Search typing effect
  const searchQuery = "artificial intelligence";
  const typedCharacters = Math.floor(interpolate(frame, [30, 90], [0, searchQuery.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const displayedQuery = searchQuery.substring(0, typedCharacters);
  
  // Results entering
  const showResults = spring({ frame: Math.max(0, frame - 120), fps, config: { damping: 15, stiffness: 60 } });
  
  // Shift to side for recommended
  const shiftLayout = spring({ frame: Math.max(0, frame - 280), fps, config: { damping: 18, stiffness: 50 } });
  const mainX = interpolate(shiftLayout, [0, 1], [0, -400]);
  
  // Recommended entering
  const showRecommended = spring({ frame: Math.max(0, frame - 340), fps, config: { damping: 15, stiffness: 60 } });
  
  // Trending entering
  const showTrending = spring({ frame: Math.max(0, frame - 450), fps, config: { damping: 15, stiffness: 60 } });

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))', padding: '100px' }}>
      
      {/* Search Layout */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: 480 + mainX,
        width: '960px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Search Bar */}
        <div style={{
          backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--primary))',
          borderRadius: '16px', padding: '24px 40px', fontSize: '36px',
          display: 'flex', alignItems: 'center', gap: '20px',
          boxShadow: '0 20px 40px rgba(139,124,246,0.1)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'hsl(var(--primary))' }}>search</span>
          <span style={{ color: 'hsl(var(--foreground))' }}>
            {displayedQuery}
            <span style={{ opacity: frame % 30 < 15 ? 1 : 0, color: 'hsl(var(--primary))' }}>|</span>
          </span>
        </div>

        {/* Search Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: showResults }}>
          {[
            { title: 'The Future of Artificial Intelligence in Business', rel: '98%' },
            { title: 'AI Investment Hits Record Highs in Q3', rel: '92%' },
            { title: 'Regulating Large Language Models', rel: '85%' }
          ].map((res, i) => (
            <div key={i} style={{
              backgroundColor: 'hsl(var(--card))', border: '1px solid hsla(var(--border), 0.5)',
              borderRadius: '12px', padding: '24px', display: 'flex', gap: '30px',
              opacity: interpolate(frame, [120 + i * 15, 150 + i * 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `translateY(${interpolate(frame, [120 + i * 15, 150 + i * 15], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`
            }}>
              <div style={{ color: 'hsl(var(--primary))', fontSize: '24px', fontWeight: 700, width: '80px' }}>{res.rel}</div>
              <div>
                <h3 style={{ fontSize: '24px', margin: 0, marginBottom: '8px' }}>{res.title}</h3>
                <div style={{ color: 'hsl(var(--muted-foreground))' }}>In-depth analysis of industry trends and predictions.</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended / Trending Sidebar */}
      <div style={{
        position: 'absolute',
        top: 150,
        right: 150,
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '60px'
      }}>
        
        {/* Recommended */}
        <div style={{
          opacity: showRecommended,
          transform: `translateX(${interpolate(showRecommended, [0, 1], [40, 0])}px)`
        }}>
          <h3 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'hsl(var(--primary))' }}>
            <span className="material-symbols-outlined">recommend</span> Recommended For You
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {['Tech Sector Growth', 'Cloud Infrastructure Optimization'].map((title, i) => (
              <div key={i} style={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsla(var(--border), 0.5)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '18px', margin: 0 }}>{title}</h4>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginTop: '8px' }}>Based on your reading history</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div style={{
          opacity: showTrending,
          transform: `translateX(${interpolate(showTrending, [0, 1], [40, 0])}px)`
        }}>
          <h3 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'hsl(var(--foreground))' }}>
            <span className="material-symbols-outlined">trending_up</span> Trending Now
          </h3>
          <div style={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsla(var(--border), 0.5)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 700, color: 'hsla(var(--primary), 0.2)' }}>1</div>
            <div>
              <h4 style={{ fontSize: '20px', margin: 0 }}>Global Semiconductor Shortage Ends</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginTop: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span> 124K Views
              </div>
            </div>
          </div>
        </div>

      </div>

    </AbsoluteFill>
  );
};
