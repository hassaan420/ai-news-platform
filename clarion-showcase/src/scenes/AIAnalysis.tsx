import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';
import { ArticleCard } from '../components/ArticleCard';

export const AIAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bring the article in
  const articleEnter = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 14, stiffness: 60 } });
  // Move it left to make room for AI panels
  const articleShift = spring({ frame: Math.max(0, frame - 150), fps, config: { damping: 20, stiffness: 40 } });
  
  const articleX = interpolate(articleEnter, [0, 1], [-600, 750]);
  const finalArticleX = interpolate(articleShift, [0, 1], [articleX, 200]);

  // Panels
  const showSummary = spring({ frame: Math.max(0, frame - 220), fps, config: { damping: 15, stiffness: 60 } });
  const showKeywords = spring({ frame: Math.max(0, frame - 300), fps, config: { damping: 15, stiffness: 60 } });
  const showSentiment = spring({ frame: Math.max(0, frame - 380), fps, config: { damping: 15, stiffness: 60 } });

  const Panel: React.FC<{ title: string; icon: string; delayAnim: number; children: React.ReactNode }> = ({ title, icon, delayAnim, children }) => (
    <div style={{
      opacity: delayAnim,
      transform: `translateX(${interpolate(delayAnim, [0, 1], [40, 0])}px)`,
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsla(var(--border), 0.6)',
      borderRadius: '16px',
      padding: '30px',
      width: '700px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'hsl(var(--primary))', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
        <span className="material-symbols-outlined">{icon}</span> {title}
      </div>
      <div style={{ fontSize: '18px', color: 'hsl(var(--foreground))', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'hsl(var(--background))' }}>
      
      {/* Target Article */}
      <ArticleCard
        category="Technology"
        source="TechCrunch"
        headline="Breakthrough in Natural Language Models Reduces Hallucination Rates"
        timestamp="10m ago"
        x={finalArticleX}
        y={280}
        scale={1.2}
      />

      {/* AI Processing Node (visual link) */}
      <div style={{
        position: 'absolute',
        left: 850,
        top: 400,
        opacity: interpolate(articleShift, [0, 0.5, 1], [0, 0, 1]),
        color: 'hsl(var(--primary))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', border: '2px solid hsl(var(--primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(139,124,246,0.3)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>psychology</span>
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'hsl(var(--primary))', opacity: 0.5 }} />
      </div>

      {/* AI Metadata Panels */}
      <div style={{ position: 'absolute', left: 1050, top: 180, display: 'flex', flexDirection: 'column' }}>
        <Panel title="AI Summary" icon="auto_awesome" delayAnim={showSummary}>
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>
            Researchers have published a new methodology that drastically reduces hallucination rates in large language models while maintaining creative outputs, marking a significant step for enterprise deployment.
          </span>
        </Panel>

        <Panel title="Extracted Keywords" icon="label" delayAnim={showKeywords}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['LLM', 'Research', 'Enterprise', 'Safety'].map((kw) => (
              <span key={kw} style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                {kw}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Sentiment Analysis" icon="mood" delayAnim={showSentiment}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'hsl(var(--success))', fontSize: '32px', fontWeight: 700 }}>Positive</span>
            <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '16px' }}>(88% Confidence)</span>
          </div>
        </Panel>
      </div>

    </AbsoluteFill>
  );
};
