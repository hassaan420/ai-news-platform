import { Article } from '@/types/news';
import CategoryTrendChart from './visualizations/CategoryTrendChart';

interface FeatureAnalysisCardProps {
  article: Article;
  category: string;
  chartData?: { name: string; value: number }[];
}

export default function FeatureAnalysisCard({ article, chartData }: FeatureAnalysisCardProps) {
  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-[24px] overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-300 h-full p-6">
      
      {/* Visualization Area */}
      <div className="w-full h-[150px] mb-6">
        {chartData && chartData.length > 0 ? (
          <CategoryTrendChart data={chartData} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-border/50">
            <span className="text-muted-foreground text-sm font-medium">Gathering trend data...</span>
          </div>
        )}
      </div>

      {/* Article Content below visualization */}
      <div className="flex-1 flex flex-col mt-auto pt-6 border-t border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${getSentimentStyle(article.sentiment || '')}`}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
            {article.sentiment || 'Neutral'}
          </span>
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
            {article.source.name}
          </span>
        </div>
        
        <h3 className="font-serif text-[22px] font-bold leading-snug text-foreground mb-4">
          "{article.title}"
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-[12px] font-medium">
             <span className="material-symbols-outlined text-[16px]">schedule</span>
             1 Min Read
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[12px] font-medium">
             <span className="material-symbols-outlined text-[16px]">visibility</span>
             {Math.floor(Math.random() * 50) + 10}K
          </div>
        </div>
      </div>
    </div>
  );
}
