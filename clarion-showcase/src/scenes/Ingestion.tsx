import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';
import { DataFlow } from '../components/DataFlow';

const Node: React.FC<{
  title: string;
  icon: string;
  x: number;
  y: number;
  delay: number;
  isMain?: boolean;
}> = ({ title, icon, x, y, delay, isMain = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${progress})`,
      opacity: progress,
      backgroundColor: isMain ? 'hsla(var(--primary), 0.1)' : 'hsl(var(--card))',
      border: `1px solid ${isMain ? 'hsl(var(--primary))' : 'hsla(var(--border), 0.8)'}`,
      borderRadius: isMain ? '50%' : '12px',
      width: isMain ? '250px' : '220px',
      height: isMain ? '250px' : '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: isMain ? '0 0 60px rgba(139,124,246,0.2)' : '0 10px 30px rgba(0,0,0,0.3)',
      color: isMain ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
      fontSize: isMain ? '32px' : '20px',
      fontWeight: 600,
      zIndex: 10
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: isMain ? '48px' : '28px', color: 'hsl(var(--primary))' }}>
        {icon}
      </span>
      {title}
    </div>
  );
};

export const Ingestion: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Sources */}
      <Node title="NewsAPI" icon="rss_feed" x={300} y={200} delay={30} />
      <Node title="GNews" icon="public" x={300} y={400} delay={60} />
      <Node title="The Guardian" icon="newspaper" x={300} y={600} delay={90} />
      <Node title="MediaStack" icon="article" x={300} y={800} delay={120} />

      {/* Main Clarion Hub */}
      <Node title="Clarion" icon="hub" x={960} y={500} delay={180} isMain />

      {/* Database */}
      <Node title="Unified DB" icon="database" x={1500} y={500} delay={280} />

      {/* Data Flows from Sources to Hub */}
      <DataFlow startX={410} startY={200} endX={835} endY={500} delay={50} />
      <DataFlow startX={410} startY={400} endX={835} endY={500} delay={80} />
      <DataFlow startX={410} startY={600} endX={835} endY={500} delay={110} />
      <DataFlow startX={410} startY={800} endX={835} endY={500} delay={140} />

      {/* Data Flows from Hub to DB */}
      <DataFlow startX={1085} startY={500} endX={1390} endY={500} delay={240} />
      
      {/* Repeated particles for continuous flow effect */}
      <DataFlow startX={410} startY={200} endX={835} endY={500} delay={150} />
      <DataFlow startX={410} startY={400} endX={835} endY={500} delay={180} />
      <DataFlow startX={410} startY={600} endX={835} endY={500} delay={210} />
      <DataFlow startX={410} startY={800} endX={835} endY={500} delay={240} />
      <DataFlow startX={1085} startY={500} endX={1390} endY={500} delay={320} />
      
    </AbsoluteFill>
  );
};
