import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { newsApi } from '@/api/newsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Trending() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getTrendingNews(page, 20);
        setArticles(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError('Failed to load trending news.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [page]);

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formattedDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12"
    >
      <div className="mb-stack_lg flex items-end justify-between border-b border-border/30 pb-4 mt-8 md:mt-0">
        <div>
          <h1 className="font-display-lg text-display-lg md:text-[56px] md:leading-[64px] text-primary tracking-tight mb-2">Trending Now</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">The most significant stories currently gaining traction across our curated network, analyzed in real-time.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-muted-foreground text-[13px] font-medium bg-card px-3 py-1.5 rounded-lg shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Live Updates Active
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-xl p-4 flex items-center gap-6 shadow-subtle">
              <Skeleton className="w-12 h-12" />
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-xl shadow-subtle">
          <span className="material-symbols-outlined text-4xl mb-4">trending_down</span>
          <p className="text-base">No trending articles found at the moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link to={`/news/${article.id}`} className="group bg-card rounded-xl p-4 flex items-center gap-6 shadow-subtle hover:shadow-premium transition-shadow duration-200 relative overflow-hidden block">
                {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
                
                <div className="flex-shrink-0 w-8 md:w-12 text-center">
                  <span className={`font-display-lg text-[32px] md:text-[40px] leading-none font-bold block ${index + (page * 20) < 3 ? 'text-primary opacity-40' : 'text-muted-foreground opacity-20'}`}>
                    {index + 1 + (page * 20)}
                  </span>
                </div>
                
                <div className="flex-shrink-0 relative hidden sm:block">
                  {article.image ? (
                    <img
                      className="w-24 h-24 object-cover rounded-lg"
                      src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted" />
                  )}
                  <div className="absolute -top-2 -right-2 bg-card rounded-full p-1 shadow-subtle flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[14px] ${index + (page * 20) < 3 ? 'text-rose-500' : 'text-amber-500 dark:text-amber-400'}`}>local_fire_department</span>
                    <span className="text-[10px] font-bold text-foreground">
                      {article.trendingScore != null ? article.trendingScore.toFixed(1) : (10 - index * 0.4).toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary uppercase">
                      {article.category}
                    </span>
                    {article.sentiment && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${getSentimentStyle(article.sentiment)}`}>
                        {article.sentiment}
                      </span>
                    )}
                    <span className="text-[12px] font-medium text-muted-foreground">{article.source.name} · {formattedDate(article.publishedAt)}</span>
                  </div>
                  <h2 className="font-headline-md text-[18px] md:text-[20px] leading-tight md:leading-[28px] text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </div>
                
                <div className="hidden lg:flex flex-shrink-0 flex-col items-end justify-center w-32 border-l border-border/30 pl-6">
                  <span className="text-[20px] font-bold text-foreground">
                    {article.views != null ? (article.views >= 1000 ? (article.views / 1000).toFixed(1) + 'K' : article.views) : 0}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Views</span>
                </div>
              </Link>
            </motion.div>
          ))}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center bg-card p-4 rounded-xl shadow-subtle">
              <button
                onClick={() => { setPage(Math.max(0, page - 1)); window.scrollTo(0, 0); }}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary/50 text-foreground disabled:opacity-50 hover:bg-secondary transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => { setPage(Math.min(totalPages - 1, page + 1)); window.scrollTo(0, 0); }}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary/50 text-foreground disabled:opacity-50 hover:bg-secondary transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
