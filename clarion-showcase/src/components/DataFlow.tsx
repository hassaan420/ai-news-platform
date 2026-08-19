import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const DataFlow: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  color?: string;
}> = ({ startX, startY, endX, endY, delay, color = 'hsl(var(--primary))' }) => {
  const frame = useCurrentFrame();
  
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX);
  
  // Line drawing animation
  const drawProgress = interpolate(frame - delay, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Particle traveling animation
  const particleProgress = interpolate(frame - delay - 20, [0, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const particleX = startX + (endX - startX) * particleProgress;
  const particleY = startY + (endY - startY) * particleProgress;

  return (
    <>
      <div style={{
        position: 'absolute',
        top: startY,
        left: startX,
        width: `${length * drawProgress}px`,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}55)`,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}rad)`,
      }} />
      
      {particleProgress > 0 && particleProgress < 1 && (
        <div style={{
          position: 'absolute',
          top: particleY - 3,
          left: particleX - 3,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: `0 0 12px 2px ${color}`,
        }} />
      )}
    </>
  );
};
