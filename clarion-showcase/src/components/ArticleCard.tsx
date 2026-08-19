import React from 'react';

interface ArticleCardProps {
  category: string;
  source: string;
  headline: string;
  timestamp: string;
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
  blur?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  category, source, headline, timestamp, opacity = 1, scale = 1, x = 0, y = 0, blur = 0
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        width: '420px',
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsla(var(--border), 0.6)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: '200px', backgroundColor: 'hsl(var(--muted))', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'hsla(var(--card), 0.9)',
          backdropFilter: 'blur(4px)',
          color: 'hsl(var(--primary))',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {category}
        </div>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: 'hsl(var(--foreground))',
          margin: 0,
          lineHeight: 1.4,
        }}>
          {headline}
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          <span style={{ fontWeight: 500 }}>{source}</span>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};
