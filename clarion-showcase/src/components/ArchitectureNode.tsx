import React from 'react';

export const ArchitectureNode: React.FC<{
  title: string;
  icon: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  anim: number;
  type?: 'core' | 'service' | 'data' | 'infra';
}> = ({ title, icon, x, y, width = 200, height = 80, anim, type = 'service' }) => {
  
  let bg = 'hsl(var(--card))';
  let border = '1px solid hsla(var(--border), 0.8)';
  let color = 'hsl(var(--foreground))';

  if (type === 'core') {
    bg = 'hsla(var(--primary), 0.1)';
    border = '1px solid hsl(var(--primary))';
    color = 'hsl(var(--primary))';
  } else if (type === 'data') {
    border = '1px dashed hsl(var(--muted-foreground))';
    color = 'hsl(var(--muted-foreground))';
  } else if (type === 'infra') {
    bg = 'transparent';
    border = '1px solid hsla(var(--border), 0.4)';
    color = 'hsl(var(--muted-foreground))';
  }

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      transform: `translate(-50%, -50%) scale(${anim})`,
      opacity: anim,
      backgroundColor: bg,
      border,
      borderRadius: type === 'infra' ? '24px' : '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      color,
      fontSize: '20px',
      fontWeight: 600,
      zIndex: type === 'infra' ? 0 : 10,
      boxShadow: type === 'core' ? '0 0 30px hsla(var(--primary), 0.2)' : '0 10px 20px rgba(0,0,0,0.2)'
    }}>
      {icon && <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{icon}</span>}
      {title}
    </div>
  );
};
