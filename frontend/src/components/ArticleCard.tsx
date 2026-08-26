import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';
import { newsApi } from '@/api/newsApi';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';

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
      case 'optimistic': return 'bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/15';
      case 'negative':
      case 'bearish':
      case 'skeptical': return 'bg-rose-500/10 text-rose-400/90 border border-rose-500/15';
      default: return 'bg-white/[0.12] text-white/90 border border-white/[0.07]';
    }
  };

  const formattedDate = formatDate(article.publishedAt);

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="glass-2 rounded-2xl shadow-premium hover:shadow-premium-hover hover:bg-white/[0.05] overflow-hidden flex flex-col group transition-all duration-300"
    >
      {/* Image */}
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
          <div className="w-full h-full bg-white/[0.1]" />
        )}
      </Link>
      
      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category / Source */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] font-bold text-primary tracking-wider uppercase">{article.category}</span>
          <span className="text-[12px] text-muted-theme/40">•</span>
          <div className="flex items-center gap-1.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${article.url ? new URL(article.url).hostname : 'news.google.com'}&sz=16`}
              alt=""
              className="w-3.5 h-3.5 object-contain rounded-sm opacity-70"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
            <span className="font-sans text-[12px] font-medium text-secondary-theme">{article.source?.name}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/news/${article.id}`} className="block mb-2.5">
          <h3 className="font-serif text-[20px] leading-[1.3] text-heading-theme group-hover:text-primary transition-colors line-clamp-2 font-bold tracking-tight">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="font-sans text-[14px] leading-relaxed text-secondary-theme mb-5 line-clamp-2">
          {article.summary || article.description}
        </p>

        {/* Footer: Date + Metadata + Action */}
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <time className="font-sans text-[12px] font-medium text-muted-theme" dateTime={article.publishedAt}>
              {formattedDate}
            </time>
            {article.sentiment && (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${getSentimentStyle(article.sentiment)}`}>
                {article.sentiment}
              </span>
            )}
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.88 }}
            animate={isSaved ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.25 }}
            className={`transition-colors p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${isSaved ? 'text-primary' : 'text-muted-theme hover:text-primary-theme'}`}
            onClick={handleSave} 
            aria-label={isSaved ? "Unsave article" : "Save article"}
          >
            {isSaved ? <BookmarkCheck className="w-4.5 h-4.5 block" /> : <BookmarkPlus className="w-4.5 h-4.5 block" />}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
