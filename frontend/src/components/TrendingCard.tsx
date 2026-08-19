import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';
import { newsApi } from '@/api/newsApi';

interface TrendingCardProps {
  article: Article;
  index?: number;
}

export default function TrendingCard({ article, index = 0 }: TrendingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isSaved) {
        await newsApi.unsaveArticle(Number(article.id));
      } else {
        await newsApi.saveArticle(Number(article.id));
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };
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
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full mb-3 last:mb-0"
    >
      <Link to={`/news/${article.id}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300 group">
        <div className="flex-shrink-0 w-8 text-center pt-1">
          <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{article.category}</span>
            <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
          </div>
          <h3 className="font-headline-md text-[14px] leading-snug text-foreground mb-2 clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center justify-between">
            {article.sentiment ? (
              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${getSentimentStyle(article.sentiment)}`}>
                {article.sentiment}
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Neutral
              </span>
            )}
            <button 
              className={`material-symbols-outlined text-[16px] transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary'}`} 
              onClick={handleSave} 
              aria-label={isSaved ? "Unsave article" : "Save article"}
            >
              {isSaved ? 'bookmark_added' : 'bookmark_add'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
