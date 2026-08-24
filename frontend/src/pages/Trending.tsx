import { useState, useEffect } from 'react';
import { Article } from '@/types/news';
import { newsApi } from '@/api/newsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import TrendingCard from '@/components/TrendingCard';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12"
    >
      <div className="mb-8 flex items-end justify-between border-b border-border/30 pb-4 mt-8 md:mt-0">
        <div>
          <h1 className="font-serif text-5xl md:text-[56px] md:leading-[64px] text-foreground font-bold tracking-tight mb-2">Trending Now</h1>
          <p className="text-sm text-muted-foreground max-w-2xl font-sans">The most significant stories currently gaining traction across our curated network, analyzed in real-time.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border border-emerald-500/10 text-[13px] font-semibold px-4 py-1.5 rounded-full shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Updates Active
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full mb-8 h-[400px]">
            <Skeleton className="w-full h-full rounded-[24px]" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-1 h-[350px]">
              <Skeleton className="w-full h-full rounded-[20px]" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-xl shadow-subtle">
          <span className="material-symbols-outlined text-4xl mb-4">trending_down</span>
          <p className="text-base">No trending articles found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {articles.map((article, index) => {
            const globalIndex = index + (page * 20);
            const isHero = index === 0 && page === 0;
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
                className={isHero ? "col-span-full" : "col-span-1 h-full"}
              >
                <TrendingCard article={article} index={globalIndex} isHero={isHero} />
              </motion.div>
            );
          })}
        </div>
      )}
      
      {!loading && articles.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex justify-between items-center bg-card p-4 rounded-[16px] shadow-subtle border border-border">
          <button
            onClick={() => { setPage(Math.max(0, page - 1)); window.scrollTo(0, 0); }}
            disabled={page === 0}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-muted text-foreground disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => { setPage(Math.min(totalPages - 1, page + 1)); window.scrollTo(0, 0); }}
            disabled={page >= totalPages - 1}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-muted text-foreground disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}
