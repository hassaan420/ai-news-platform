import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';
import { ArchitectureNode } from '../components/ArchitectureNode';
import { DataFlow } from '../components/DataFlow';

export const Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const getAnim = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 60 } });

  const aFrontend = getAnim(30);
  const aGateway = getAnim(60);
  const aServices = getAnim(120);
  const aData = getAnim(180);
  const aDocker = getAnim(240);

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      
      <AbsoluteFill style={{ alignItems: 'center', marginTop: '60px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 300, color: 'hsl(var(--muted-foreground))', letterSpacing: '2px' }}>
          SCALABLE MICROSERVICES ARCHITECTURE
        </h2>
      </AbsoluteFill>

      {/* Docker / K8s Infra Boundary */}
      <ArchitectureNode title="Docker Containerization" icon="" x={960} y={600} width={1400} height={400} anim={aDocker} type="infra" />

      {/* Frontend */}
      <ArchitectureNode title="Clarion Frontend" icon="web" x={960} y={200} anim={aFrontend} type="core" />
      
      {/* Nginx / Gateway */}
      <DataFlow startX={960} startY={240} endX={960} endY={330} delay={45} />
      <ArchitectureNode title="API Gateway" icon="router" x={960} y={370} anim={aGateway} type="core" />

      {/* Microservices */}
      <DataFlow startX={960} startY={410} endX={500} endY={520} delay={90} />
      <DataFlow startX={960} startY={410} endX={800} endY={520} delay={100} />
      <DataFlow startX={960} startY={410} endX={1120} endY={520} delay={110} />
      <DataFlow startX={960} startY={410} endX={1420} endY={520} delay={120} />

      <ArchitectureNode title="News Service" icon="article" x={500} y={560} anim={aServices} />
      <ArchitectureNode title="Category Service" icon="category" x={800} y={560} anim={aServices} />
      <ArchitectureNode title="Search Service" icon="search" x={1120} y={560} anim={aServices} />
      <ArchitectureNode title="Admin Service" icon="admin_panel_settings" x={1420} y={560} anim={aServices} />

      {/* Data Layer */}
      <DataFlow startX={500} startY={600} endX={750} endY={710} delay={150} />
      <DataFlow startX={800} startY={600} endX={750} endY={710} delay={160} />
      <DataFlow startX={1120} startY={600} endX={1170} endY={710} delay={170} />
      <DataFlow startX={1420} startY={600} endX={1170} endY={710} delay={180} />

      <ArchitectureNode title="MySQL Cluster" icon="database" x={750} y={750} anim={aData} type="data" />
      <ArchitectureNode title="Redis Cache" icon="memory" x={1170} y={750} anim={aData} type="data" />

    </AbsoluteFill>
  );
};
