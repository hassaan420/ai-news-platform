import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import HeroArticle from '@/components/HeroArticle';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'latest' | 'trending'>('latest');
  const categoryNews = useAppSelector((state) => slug ? state.news.categoryNews[slug] : null);
  const status = useAppSelector((state) => state.news.status);

  useEffect(() => {
    setPage(0);
  }, [slug]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCategoryNews({ category: slug, page, size: 13 })); // 1 hero + 12 grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, slug, page]);

  const renderSkeletons = () => (
    <div className="space-y-8">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const heroArticle = categoryNews?.content?.[0];
  const gridArticles = categoryNews?.content?.slice(1) || [];
  const displayedArticles = mode === 'trending' 
    ? [...gridArticles].sort((a, b) => (b.aiConfidence || 0) - (a.aiConfidence || 0))
    : gridArticles;

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'politics': return 'account_balance';
      case 'technology': return 'memory';
      case 'business': return 'trending_up';
      case 'science': return 'science';
      case 'health': return 'health_and_safety';
      case 'sports': return 'sports_basketball';
      default: return 'category';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12"
    >
      {/* Category Header */}
      <div className="mb-stack_lg border-b border-border/30 pb-stack_md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">{getCategoryIcon(slug || '')}</span>
          </div>
          <div>
            <h1 className="font-display-lg text-display-lg text-foreground capitalize">{slug}</h1>
            <p className="text-sm text-muted-foreground">AI-curated analysis and updates from the world of {slug}.</p>
          </div>
        </div>
        
        {/* Sort/Filter Bar */}
        <div className="flex items-center justify-between mt-stack_md pt-stack_sm">
          <div className="flex gap-2">
            <button 
              onClick={() => setMode('latest')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'latest' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              Latest
            </button>
            <button 
              onClick={() => setMode('trending')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'trending' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              Trending
            </button>
          </div>
        </div>
      </div>
      
      {status === 'loading' && !categoryNews ? (
        renderSkeletons()
      ) : categoryNews?.content?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-2xl shadow-subtle">
          <div className="bg-muted p-4 rounded-full mb-6">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">explore_off</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-foreground mb-2">No stories found</h2>
          <p className="text-sm text-muted-foreground max-w-md">We don't have any articles in the {slug} category right now. Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Featured Article Hero */}
          {heroArticle && (
            <HeroArticle article={heroArticle} />
          )}

          {/* Grid Articles */}
          {displayedArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {categoryNews && categoryNews.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10 border-t border-border/30">
              <button
                className="rounded-lg px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                disabled={categoryNews.pageNumber === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous Page
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                Page {categoryNews.pageNumber + 1} of {categoryNews.totalPages}
              </span>
              <button
                className="rounded-lg px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                disabled={categoryNews.last}
                onClick={() => setPage(p => p + 1)}
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
