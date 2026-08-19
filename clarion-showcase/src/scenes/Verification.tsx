import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const Verification: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const showMain = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 15, stiffness: 60 } });
  
  const v1 = spring({ frame: Math.max(0, frame - 180), fps, config: { damping: 15, stiffness: 60 } });
  const v2 = spring({ frame: Math.max(0, frame - 220), fps, config: { damping: 15, stiffness: 60 } });
  const v3 = spring({ frame: Math.max(0, frame - 260), fps, config: { damping: 15, stiffness: 60 } });
  const v4 = spring({ frame: Math.max(0, frame - 300), fps, config: { damping: 15, stiffness: 60 } });

  const showResult = spring({ frame: Math.max(0, frame - 400), fps, config: { damping: 12, stiffness: 50, mass: 1.5 } });

  const VSource: React.FC<{ name: string; status: string; icon: string; anim: number }> = ({ name, status, icon, anim }) => (
    <div style={{
      opacity: anim,
      transform: `translateX(${interpolate(anim, [0, 1], [40, 0])}px)`,
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsla(var(--border), 0.5)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '20px',
      marginBottom: '16px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    }}>
      <span>{name}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--success))', fontWeight: 600 }}>
        <span className="material-symbols-outlined">{icon}</span> {status}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))', padding: '100px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '80px' }}>
      
      {/* Main Claim */}
      <div style={{
        opacity: showMain,
        width: '600px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsla(var(--border), 0.5)',
        borderRadius: '16px',
        padding: '50px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), transparent)',
          border: '1px solid hsl(var(--primary))',
          color: 'hsl(var(--primary))',
          padding: '12px 24px',
          borderRadius: '50px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '30px'
        }}>
          <span className="material-symbols-outlined">verified</span> Source Verification
        </div>
        
        <h2 style={{ fontSize: '36px', marginBottom: '20px', lineHeight: 1.3 }}>Global Trade Agreement Finalized</h2>
        <p style={{ fontSize: '20px', color: 'hsl(var(--muted-foreground))', marginBottom: '40px' }}>Primary Source: Reuters</p>
        
        <div style={{ height: '2px', backgroundColor: 'hsla(var(--border), 0.5)', margin: '40px 0' }} />
        
        <div style={{
          fontSize: '18px', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite' }}>sync</span>
          Cross-checking curated network...
        </div>
      </div>

      {/* Sources list */}
      <div style={{ width: '600px', display: 'flex', flexDirection: 'column' }}>
        <VSource name="NewsAPI Network" status="Corroborated" icon="check_circle" anim={v1} />
        <VSource name="GNews Aggregation" status="Corroborated" icon="check_circle" anim={v2} />
        <VSource name="The Guardian" status="Matching Report" icon="check_circle" anim={v3} />
        <VSource name="MediaStack" status="Corroborated" icon="check_circle" anim={v4} />

        {/* Final Result */}
        <div style={{
          opacity: showResult,
          transform: `scale(${interpolate(showResult, [0, 1], [0.9, 1])})`,
          marginTop: '40px',
          backgroundColor: 'hsla(var(--success), 0.1)',
          border: '1px solid hsl(var(--success))',
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          color: 'hsl(var(--success))',
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '2px'
        }}>
          STRONGLY CORROBORATED
        </div>
      </div>
    </AbsoluteFill>
  );
};
