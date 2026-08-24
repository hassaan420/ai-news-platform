import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLatestNews, fetchTrendingNews, clearLatestNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import FeaturedCarousel from '@/components/FeaturedCarousel';
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
  const [initialFeatured, setInitialFeatured] = useState<Article[]>([]);
  
  const [activeTab, setActiveTab] = useState<'latest' | 'foryou'>('latest');
  const [personalizedNews, setPersonalizedNews] = useState<Article[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch news when page or filters change
  useEffect(() => {
    dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to })); 
  }, [dispatch, page, dateFilter, from, to]);

  // Accumulate news as pages load
  useEffect(() => {
    if (latestNews && latestNews.pageNumber === page) {
      if (page === 0) {
        setAccumulatedNews(latestNews.content);
        if (initialFeatured.length === 0 && latestNews.content.length > 0) {
          setInitialFeatured(latestNews.content.slice(0, 5));
        }
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  const featuredArticles = initialFeatured.length > 0 ? initialFeatured : accumulatedNews.slice(0, 5);
  const featuredIds = new Set(featuredArticles.map(a => a.id));
  const gridArticles = accumulatedNews.filter(a => !featuredIds.has(a.id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-7xl mx-auto block"
    >
      {isAuthenticated && user?.name && (
        <div className="mb-8 block">
          <h1 className="text-3xl font-headline-md text-foreground">Welcome back, {user.name}</h1>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8 text-sm font-medium block">
          {error}
        </div>
      )}

      {/* RIGHT COLUMN: Sidebar (Floated) */}
      {/* We float this to the right so that content on the left can flow around it! */}
      <div className="hidden lg:block float-right w-[33.333%] pl-8 pb-8 relative z-10">
        <div className="space-y-8">
          <WeatherSportsWidget />

          {/* Trending Vertical List */}
          {trendingNews && trendingNews.content.length > 0 && (
            <section className="bg-card rounded-[20px] p-6 border border-border shadow-subtle relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h2 className="font-serif text-[22px] font-bold text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">local_fire_department</span>
                  Trending Now
                </h2>
              </div>
              <div className="space-y-1">
                {trendingNews.content.slice(0, 5).map((article, i) => (
                  <TrendingCard key={article.id} article={article} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* LEFT COLUMN CONTENT */}
      {/* Because the sidebar is floated right, any block elements here will overlap it if they don't have BFC. 
          Grid containers natively establish a BFC, so they will automatically be constrained to the ~66.6% left space next to the float! */}
      
      <section className="mb-12">
        {status === 'loading' && page === 0 && initialFeatured.length === 0 ? (
          <Skeleton className="h-[400px] w-full rounded-2xl mb-12" />
        ) : featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FeaturedCarousel articles={featuredArticles.slice(0, 3)} />
            </div>
            {featuredArticles[3] && (
              <ArticleCard article={featuredArticles[3]} index={1} />
            )}
            {featuredArticles[4] && (
              <ArticleCard article={featuredArticles[4]} index={2} />
            )}
          </div>
        ) : null}
      </section>

      {/* International Headlines */}
      {(intlLoading || internationalArticles.length > 0) && (
        <section className="pt-8 border-t border-border/50 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif font-bold text-[26px] text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">globe</span>
              International Headlines
            </h2>
          </div>
          {intlLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Skeleton className="h-[200px] w-full rounded-xl" />
               <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
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

      {/* LATEST ANALYSIS (Flows into available space!) */}
      {/* We do NOT use grid here. We use block and floats so it can dynamically wrap around the sidebar! */}
      <section className="pt-8 border-t border-border/50 block">
        {/* Header (establishes BFC if it's flex, so it stays on the left if next to sidebar, or full width if below) */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="font-serif font-bold text-[26px] text-foreground flex items-center gap-4 flex-wrap">
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
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${activeTab === 'latest' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              onClick={() => setActiveTab('latest')}
            >
              All News
            </button>
            {isAuthenticated && (
              <button 
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'foryou' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                onClick={() => setActiveTab('foryou')}
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span> For You
              </button>
            )}
          </div>
        </div>

        {activeTab === 'latest' ? (
          <>
            {status === 'loading' && page === 0 ? (
              renderSkeletons(4)
            ) : (
              <div className="block">
                <div className="block -mr-6">
                  {gridArticles.map((article, i) => (
                    <div key={article.id} className="float-left w-full md:w-1/2 lg:w-1/4 pr-6 pb-6">
                      <ArticleCard article={article} index={i} />
                    </div>
                  ))}
                  {/* Clear floats so the container expands fully */}
                  <div className="clear-both"></div>
                </div>

                {gridArticles.length === 0 && status === 'succeeded' && (
                  <div className="text-center py-12 bg-card rounded-xl shadow-subtle border border-border/50 mt-4 clear-both">
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
                  <div className="mt-8 clear-both">
                    {renderSkeletons(4)}
                  </div>
                )}

                {latestNews && !latestNews.last && (
                  <div ref={observerTarget} className="flex justify-center pt-8 border-t border-border/30 clear-both">
                    {status !== 'loading' && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg px-8 py-3 text-sm font-bold text-foreground bg-card border border-border hover:bg-muted transition-colors shadow-sm"
                      >
                        Load More Articles
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="block">
            {loadingPersonalized ? (
               renderSkeletons(4)
            ) : personalizedNews.length > 0 ? (
              <div className="block -mr-6">
                {personalizedNews.map((article, i) => (
                  <div key={article.id} className="float-left w-full md:w-1/2 lg:w-1/4 pr-6 pb-6">
                    <ArticleCard article={article} index={i} />
                  </div>
                ))}
                <div className="clear-both"></div>
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-[24px] shadow-subtle border border-border mt-4 clear-both">
                <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-4 block">magic_button</span>
                <p className="text-lg text-muted-foreground font-medium">Read more articles to get personalized AI recommendations!</p>
              </div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}
