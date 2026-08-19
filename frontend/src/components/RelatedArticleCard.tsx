import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';

interface RelatedArticleCardProps {
  article: Article;
}

export default function RelatedArticleCard({ article }: RelatedArticleCardProps) {
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
      className="h-full w-full"
    >
      <Link to={`/news/${article.id}`} className="flex flex-col h-full bg-card rounded-lg shadow-subtle hover:shadow-premium transition-shadow duration-300 group overflow-hidden border border-border/30">
        {article.image && (
          <div className="w-full h-32 overflow-hidden bg-muted">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[12px] font-medium text-muted-foreground">{article.source.name} · {formattedDate}</span>
            <button className="material-symbols-outlined text-muted-foreground group-hover:text-primary text-[18px] transition-colors" onClick={(e) => e.preventDefault()} aria-label="Save article">
              bookmark_add
            </button>
          </div>
          <h3 className="font-headline-md text-[15px] leading-[21px] text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {article.title}
          </h3>
          <div className="mt-auto">
            {article.sentiment ? (
              <div className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${getSentimentStyle(article.sentiment)}`}>
                {article.sentiment}
              </div>
            ) : (
              <div className="inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                Neutral
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
