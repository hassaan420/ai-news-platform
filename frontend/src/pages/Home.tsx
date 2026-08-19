import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLatestNews, fetchTrendingNews, clearLatestNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import HeroArticle from '@/components/HeroArticle';
import TrendingCard from '@/components/TrendingCard';
import DateFilterDropdown, { DateFilterType } from '@/components/DateFilterDropdown';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherSportsWidget from '@/components/WeatherSportsWidget';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';
import { useInternationalHeadlines } from '@/hooks/useInternationalHeadlines';

export default function Home() {
  const { articles: internationalArticles, loading: intlLoading } = useInternationalHeadlines();
  const dispatch = useAppDispatch();
  const { latestNews, trendingNews, status, error } = useAppSelector((state) => state.news);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = (searchParams.get('dateFilter') as DateFilterType) || 'LATEST';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  
  const [page, setPage] = useState(0);
  const [accumulatedNews, setAccumulatedNews] = useState<Article[]>([]);
  
  const [activeTab, setActiveTab] = useState<'latest' | 'foryou'>('latest');
  const [personalizedNews, setPersonalizedNews] = useState<Article[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch news when page or filters change
  useEffect(() => {
    dispatch(fetchLatestNews({ page, size: 7, dateFilter, from, to })); 
  }, [dispatch, page, dateFilter, from, to]);

  // Accumulate news as pages load
  useEffect(() => {
    if (latestNews && latestNews.pageNumber === page) {
      if (page === 0) {
        setAccumulatedNews(latestNews.content);
      } else {
        setAccumulatedNews(prev => {
          const newIds = new Set(prev.map(a => a.id));
          const toAdd = latestNews.content.filter(a => !newIds.has(a.id));
          return [...prev, ...toAdd];
        });
      }
    }
  }, [latestNews, page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && latestNews && !latestNews.last && status !== 'loading') {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [latestNews, status]);

  const handleFilterChange = (filter: DateFilterType, customFrom?: string, customTo?: string) => {
    dispatch(clearLatestNews());
    setPage(0);
    setAccumulatedNews([]);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('dateFilter', filter);
    if (filter === 'CUSTOM' && customFrom && customTo) {
      newParams.set('from', customFrom);
      newParams.set('to', customTo);
    } else {
      newParams.delete('from');
      newParams.delete('to');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  useEffect(() => {
    dispatch(fetchTrendingNews({ page: 0, size: 10 })); 
    
    if (isAuthenticated) {
      setLoadingPersonalized(true);
      newsApi.getPersonalizedFeed()
        .then(res => setPersonalizedNews(res))
        .catch(console.error)
        .finally(() => setLoadingPersonalized(false));
    }
  }, [dispatch, isAuthenticated]);

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );

  const featuredArticles = accumulatedNews.slice(0, 3);
  const gridArticles = accumulatedNews.slice(3) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {isAuthenticated && user?.name && (
        <div className="mb-8">
          <h1 className="text-3xl font-headline-md text-foreground">Welcome back, {user.name}</h1>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Featured Masonry Grid */}
          <section>
            {status === 'loading' && page === 0 ? (
              <Skeleton className="h-[400px] w-full rounded-2xl mb-12" />
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <HeroArticle article={featuredArticles[0]} />
                </div>
                {featuredArticles[1] && (
                  <ArticleCard article={featuredArticles[1]} index={1} />
                )}
                {featuredArticles[2] && (
                  <ArticleCard article={featuredArticles[2]} index={2} />
                )}
              </div>
            ) : null}
          </section>

          {/* International Headlines */}
          {(intlLoading || internationalArticles.length > 0) && (
            <section className="pt-8 border-t border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-[22px] text-foreground flex items-center">
                  <span className="material-symbols-outlined mr-2 text-primary">globe</span>
                  International Headlines
                </h2>
              </div>
              {intlLoading ? (
                renderSkeletons(2)
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.07 } },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {internationalArticles.slice(0, 4).map((article, i) => (
                    <motion.div
                      key={article.id}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
                      }}
                    >
                      <ArticleCard article={article} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>
          )}

        </div>
      </div>

      {/* FULL WIDTH: Latest Analysis / Feed */}
      <section className="pt-8 border-t border-border/50">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="font-headline-md text-[22px] text-foreground flex items-center gap-4 flex-wrap">
            Latest Analysis
            {activeTab === 'latest' && (
              <DateFilterDropdown 
                value={dateFilter} 
                onChange={handleFilterChange} 
                from={from} 
                to={to} 
              />
            )}
          </h2>
          <div className="flex gap-2">
            <button 
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'latest' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              onClick={() => setActiveTab('latest')}
            >
              All News
            </button>
            {isAuthenticated && (
              <button 
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'foryou' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                onClick={() => setActiveTab('foryou')}
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span> For You
              </button>
            )}
          </div>
        </div>

        {activeTab === 'latest' ? (
          <>
            {status === 'loading' && page === 0 ? (
              renderSkeletons(4)
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gridArticles.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>

                {gridArticles.length === 0 && featuredArticles.length === 0 && status === 'succeeded' && (
                  <div className="text-center py-12 bg-card rounded-xl shadow-subtle border border-border/50">
                    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">search_off</span>
                    <p className="text-muted-foreground mb-4 font-medium">No articles found for this period.</p>
                    <button 
                      onClick={() => handleFilterChange('LATEST')}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Try another date range
                    </button>
                  </div>
                )}

                {status === 'loading' && page > 0 && (
                  <div className="mt-8">
                    {renderSkeletons(4)}
                  </div>
                )}

                {latestNews && !latestNews.last && (
                  <div ref={observerTarget} className="flex justify-center pt-8 border-t border-border/30">
                    {status !== 'loading' && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg px-8 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                      >
                        Load More
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {loadingPersonalized ? (
               renderSkeletons(4)
            ) : personalizedNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {personalizedNews.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl shadow-subtle">
                <p className="text-muted-foreground">Read more articles to get personalized AI recommendations!</p>
              </div>
            )}
          </>
        )}
      </section>
    </motion.div>
  );
}
