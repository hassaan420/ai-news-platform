import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';

interface TrendingCardProps {
  article: Article;
}

export default function TrendingCard({ article }: TrendingCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="snap-start shrink-0 w-[260px] h-full"
    >
      <Link to={`/news/${article.id}`} className="block h-full bg-card p-4 rounded-lg shadow-subtle hover:shadow-premium transition-shadow duration-300 group">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[12px] font-medium text-muted-foreground">{article.category} · {formattedDate}</span>
          <button className="material-symbols-outlined text-muted-foreground group-hover:text-primary text-[18px] transition-colors" onClick={(e) => e.preventDefault()} aria-label="Save article">
            bookmark_add
          </button>
        </div>
        <h3 className="font-headline-md text-[15px] leading-[21px] text-foreground mb-2 clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.sentiment ? (
          <div className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${getSentimentStyle(article.sentiment)}`}>
            {article.sentiment}
          </div>
        ) : (
          <div className="inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            Neutral
          </div>
        )}
      </Link>
    </motion.div>
  );
}
