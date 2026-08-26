import { useEffect, useState, useRef } from 'react';
import createGlobe from 'cobe';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLatestNews, fetchTrendingNews, clearLatestNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import TrendingCard from '@/components/TrendingCard';
import TrendingSidebarWidget from '@/components/TrendingSidebarWidget';
import SidebarArticlesWidget from '@/components/SidebarArticlesWidget';
import CorroboratedReportsWidget from '@/components/CorroboratedReportsWidget';
import DateFilterDropdown, { DateFilterType } from '@/components/DateFilterDropdown';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherSportsWidget from '@/components/WeatherSportsWidget';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';
import { useInternationalHeadlines } from '@/hooks/useInternationalHeadlines';
import {
  Search, SearchX, Sparkles, TrendingUp, Cpu, Globe, Briefcase, FlaskConical,
  Shield, Flame, Newspaper, Brain
} from 'lucide-react';

const HERO_CATEGORIES = [
  { label: 'Trending', icon: TrendingUp, slug: '/trending' },
  { label: 'Technology', icon: Cpu, slug: '/category/technology' },
  { label: 'AI', icon: Brain, slug: '/category/technology' },
  { label: 'Business', icon: Briefcase, slug: '/category/business' },
  { label: 'Science', icon: FlaskConical, slug: '/category/science' },
  { label: 'World', icon: Globe, slug: '/category/politics' },
  { label: 'Security', icon: Shield, slug: '/category/technology' },
];

function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.1,
      dark: 1, 
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [0.88, 0.11, 0.28], // primary red
      glowColor: [0.2, 0.2, 0.2],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.0060], size: 0.1 },
        { location: [51.5072, 0.1276], size: 0.08 },
        { location: [35.6895, 139.6917], size: 0.12 },
        { location: [-33.8688, 151.2093], size: 0.05 },
      ],
      onRender: (state: Record<string, number>) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-40 mix-blend-screen overflow-hidden">
      <div style={{ width: '800px', height: '800px', transform: 'translateY(15%)' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', contain: 'layout paint size' }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const { articles: internationalArticles, loading: intlLoading } = useInternationalHeadlines();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { latestNews, trendingNews, status, error } = useAppSelector((state) => state.news);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const dateFilter = (searchParams.get('dateFilter') as DateFilterType) || 'LATEST';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  
  const [page, setPage] = useState(0);
  const [accumulatedNews, setAccumulatedNews] = useState<Article[]>([]);
  const [initialFeatured, setInitialFeatured] = useState<Article[]>([]);
  
  const [personalizedNews, setPersonalizedNews] = useState<Article[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [heroSearch, setHeroSearch] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchLatestNews({ page, size: 12, dateFilter, from, to })); 
  }, [dispatch, page, dateFilter, from, to]);

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
        .then(res => setPersonalizedNews(res.slice(0, 4))) // Only grab top 4 for the section
        .catch(console.error)
        .finally(() => setLoadingPersonalized(false));
    }
  }, [dispatch, isAuthenticated]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl bg-black/50" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-black/50" />
            <Skeleton className="h-4 w-[200px] bg-black/50" />
          </div>
        </div>
      ))}
    </div>
  );

  const featuredArticles = initialFeatured.length > 0 ? initialFeatured : accumulatedNews.slice(0, 5);
  const featuredIds = new Set(featuredArticles.map(a => a.id));
  const gridArticles = accumulatedNews.filter(a => !featuredIds.has(a.id));

  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-7xl mx-auto block"
    >
      <section className="relative pt-8 pb-16 mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-primary text-sm font-bold mb-4 tracking-[0.2em] uppercase flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isAuthenticated && user?.name ? `${greeting}, ${user.name}` : greeting}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 tracking-tight leading-[1.1] mb-8"
          >
            Here's what's happening
            <br />
            <span className="text-gray-300">in your world.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {HERO_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => navigate(cat.slug)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.2] text-gray-300 text-sm font-medium hover:bg-black/70 hover:text-white drop-shadow-sm transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 text-sm font-medium border border-red-500/20 block">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 flex flex-col">
          
          {isAuthenticated && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif font-bold text-[26px] text-white drop-shadow-sm flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Recommended for you
                </h2>
              </div>
              {loadingPersonalized ? (
                 renderSkeletons(4)
              ) : personalizedNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                  {personalizedNews.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.2] shadow-2xl">
                  <p className="text-gray-300 font-medium">Read more articles to get personalized AI recommendations!</p>
                </div>
              )}
            </section>
          )}

          <CorroboratedReportsWidget />

          <section className="pt-8 border-t border-white/[0.15]">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="font-serif font-bold text-[26px] text-white drop-shadow-sm flex items-center gap-4 flex-wrap">
                <Newspaper className="w-6 h-6 text-primary" />
                Latest Stories
              </h2>
              <DateFilterDropdown 
                value={dateFilter} 
                onChange={handleFilterChange} 
                from={from} 
                to={to} 
              />
            </div>

            {status === 'loading' && page === 0 ? (
              renderSkeletons(4)
              ) : (
                <div className="space-y-8">
                  {page === 0 && featuredArticles.length > 0 && (
                    <FeaturedCarousel articles={featuredArticles} />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 items-start">
                    {gridArticles.map((article, i) => (
                      <ArticleCard key={article.id} article={article} index={i} />
                    ))}
                  </div>

                {gridArticles.length === 0 && featuredArticles.length === 0 && status === 'succeeded' && (
                  <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.2] shadow-2xl mt-4">
                    <SearchX className="w-10 h-10 text-white mx-auto mb-4" />
                    <p className="text-gray-300 mb-4 font-medium">No articles found for this period.</p>
                    <button 
                      onClick={() => handleFilterChange('LATEST')}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      Try another date range
                    </button>
                  </div>
                )}

                {status === 'loading' && page > 0 && (
                  <div className="mt-8">
                    {renderSkeletons(3)}
                  </div>
                )}

                {latestNews && !latestNews.last && (
                  <div ref={observerTarget} className="flex justify-center pt-8 mt-8 border-t border-white/[0.15]">
                    {status !== 'loading' && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl px-8 py-3 text-sm font-bold text-white bg-black/50 backdrop-blur-xl border border-white/[0.2] hover:bg-black/70 transition-all shadow-lg"
                      >
                        Load More Articles
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Sidebar (Sticky) */}
        <aside className="hidden lg:block w-[320px] xl:w-[360px] flex-shrink-0 relative">
          <div className="sticky top-24 space-y-8 pb-12">
            <WeatherSportsWidget />

            {/* Trending Vertical List */}
            <TrendingSidebarWidget />

            {/* Discover Topics to fill space nicely */}
            <section className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.2] shadow-2xl">
              <h2 className="font-serif text-[20px] font-bold text-white drop-shadow-sm mb-4 pb-4 border-b border-white/[0.15]">
                Discover Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {HERO_CATEGORIES.map(cat => (
                  <button 
                    key={cat.label}
                    onClick={() => navigate(cat.slug)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="text-center text-xs text-white/40 pt-6 font-medium">
                You're all caught up
              </div>
            </section>
            
            {/* Dynamic Articles filling the rest of the right space */}
            <SidebarArticlesWidget />
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
