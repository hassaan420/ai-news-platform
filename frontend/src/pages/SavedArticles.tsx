import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { newsApi } from '@/api/newsApi';
import ArticleCard from '@/components/ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function SavedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getSavedArticles();
        setArticles(data.content || []);
      } catch (err) {
        setError('Failed to load saved articles.');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12 max-w-max_content_width mx-auto"
    >
      <div className="mb-stack_lg flex justify-between items-end border-b border-border/30 pb-8 mt-8 md:mt-0">
        <div>
          <h2 className="font-display-lg text-[40px] leading-[48px] text-foreground tracking-tight mb-2">Saved Articles</h2>
          <p className="text-sm text-muted-foreground">Your curated collection of insights.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl">
          <p>{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-xl shadow-subtle">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 0"}}>bookmark_border</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-foreground mb-2">No saved articles yet</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-md">
            When you find an article you want to read later or keep for reference, tap the bookmark icon to save it here.
          </p>
          <Link to="/" className="bg-primary text-primary-foreground font-label-sm text-label-sm py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">explore</span>
            Explore Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
            >
              <ArticleCard article={article} index={i} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
