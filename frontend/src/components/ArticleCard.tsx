import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';
import { newsApi } from '@/api/newsApi';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    const isToday = date.getUTCFullYear() === now.getUTCFullYear() &&
                    date.getUTCMonth() === now.getUTCMonth() &&
                    date.getUTCDate() === now.getUTCDate();

    if (isToday) {
      const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      return hoursDiff > 0 ? `${hoursDiff}h ago` : 'Just now';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish':
      case 'optimistic': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'negative':
      case 'bearish':
      case 'skeptical': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formattedDate = formatDate(article.publishedAt);

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-xl overflow-hidden flex flex-col group shadow-premium hover:shadow-premium-hover transition-shadow duration-300"
    >
      <Link to={`/news/${article.id}`} className="block relative h-48 overflow-hidden">
        {article.image ? (
          <img
            src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-card/90 backdrop-blur-sm text-primary font-label-sm text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wide">
            {article.category}
          </span>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          {article.sentiment ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
              className={`flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${getSentimentStyle(article.sentiment)}`}
            >
              {article.sentiment}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
              className="flex items-center text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
            >
              Neutral
            </motion.div>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} 
            onClick={handleSave} 
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            <span className="material-symbols-outlined text-[20px] block">{isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
          </motion.button>
        </div>
        
        <Link to={`/news/${article.id}`} className="block mb-2">
          <h3 className="font-headline-md text-[18px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-4 clamp-2">
          {article.summary || article.description}
        </p>
        
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-muted-foreground">
          <span className="text-[12px] font-medium">{article.source.name} · {formattedDate}</span>
        </div>
      </div>
    </motion.article>
  );
}
