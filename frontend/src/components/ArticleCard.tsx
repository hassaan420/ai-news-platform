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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border border-border rounded-[20px] overflow-hidden flex flex-col group shadow-subtle hover:shadow-premium transition-all duration-300"
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
        <div className="absolute top-4 left-4">
          <span className="bg-foreground/[0.1] backdrop-blur-md text-white border border-white/[0.1] font-sans text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest font-semibold shadow-subtle">
            {article.category}
          </span>
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            {article.sentiment ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest ${getSentimentStyle(article.sentiment)}`}
              >
                {article.sentiment}
              </motion.div>
            ) : null}
            <div className="flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest bg-foreground/[0.04] text-muted-foreground border border-border">
              <span className="material-symbols-outlined text-[12px] mr-1">psychology</span> AI
            </div>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`transition-colors ${isSaved ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} 
            onClick={handleSave} 
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            <span className="material-symbols-outlined text-[20px] block">{isSaved ? 'bookmark_added' : 'bookmark_add'}</span>
          </motion.button>
        </div>
        
        <Link to={`/news/${article.id}`} className="block mb-3">
          <h3 className="font-serif text-[20px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 font-semibold tracking-tight">
            {article.title}
          </h3>
        </Link>
        
        <p className="font-sans text-[14px] leading-relaxed text-muted-foreground mb-6 line-clamp-2">
          {article.summary || article.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={`https://www.google.com/s2/favicons?domain=${article.url ? new URL(article.url).hostname : 'news.google.com'}&sz=16`} alt="" className="w-4 h-4 object-contain rounded-full bg-white/[0.05]" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="font-sans text-[12px] font-medium text-foreground tracking-wide uppercase">{article.source.name}</span>
          </div>
          <span className="font-sans text-[12px]">{formattedDate}</span>
        </div>
      </div>
    </motion.article>
  );
}
