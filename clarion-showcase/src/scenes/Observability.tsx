import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Observability: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 50 } });

  const MetricPanel: React.FC<{ title: string; delay: number; children: React.ReactNode }> = ({ title, delay, children }) => {
    const pEnter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 60 } });
    
    return (
      <div style={{
        backgroundColor: 'hsla(var(--card), 0.8)',
        border: '1px solid hsla(var(--border), 0.5)',
        borderRadius: '12px',
        padding: '24px',
        opacity: pEnter,
        transform: `translateY(${interpolate(pEnter, [0, 1], [20, 0])}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))', padding: '60px' }}>
      
      <div style={{
        opacity: interpolate(enter, [0, 1], [0, 1]),
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'hsl(var(--warning))' }}>monitoring</span>
        <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 400 }}>System Observability</h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        height: '300px',
        marginBottom: '30px'
      }}>
        <MetricPanel title="HTTP Request Metrics" delay={20}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                backgroundColor: 'hsla(var(--primary), 0.6)',
                borderRadius: '4px 4px 0 0',
                height: `${Math.sin(i * 0.5 + frame * 0.05) * 40 + 50}%`
              }} />
            ))}
          </div>
        </MetricPanel>
        
        <MetricPanel title="Service Health" delay={40}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', height: '100%', alignContent: 'center' }}>
            {['API Gateway', 'News Service', 'Auth Service', 'Search Engine', 'Database'].map((s, i) => (
              <div key={i} style={{
                backgroundColor: 'hsla(var(--success), 0.1)',
                border: '1px solid hsl(var(--success))',
                color: 'hsl(var(--success))',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {s}: UP
              </div>
            ))}
          </div>
        </MetricPanel>

        <MetricPanel title="JVM Metrics" delay={60}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '16px solid hsla(var(--border), 0.5)', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-16px', borderRadius: '50%', border: '16px solid transparent',
                borderTopColor: 'hsl(var(--primary))', borderRightColor: 'hsl(var(--primary))',
                transform: `rotate(${interpolate(frame, [0, 100], [-45, 45])}deg)`
              }} />
            </div>
          </div>
        </MetricPanel>
      </div>

      <div style={{ height: '300px' }}>
        <MetricPanel title="Distributed Tracing" delay={80}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {[
              { label: 'GET /api/v1/articles', w: '100%' },
              { label: 'SELECT * FROM articles', w: '60%', indent: '40px' },
              { label: 'GET /api/v1/auth/validate', w: '20%', indent: '40px' }
            ].map((trace, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginLeft: trace.indent || 0 }}>
                <div style={{ width: '200px', fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>{trace.label}</div>
                <div style={{ height: '24px', width: trace.w, backgroundColor: 'hsla(var(--primary), 0.4)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </MetricPanel>
      </div>
      
    </AbsoluteFill>
  );
};
