import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLatestNews, fetchTrendingNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import HeroArticle from '@/components/HeroArticle';
import TrendingCard from '@/components/TrendingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import { motion } from 'framer-motion';

export default function Home() {
  const dispatch = useAppDispatch();
  const { latestNews, trendingNews, status, error } = useAppSelector((state) => state.news);
  
  const [latestPage, setLatestPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'latest' | 'foryou'>('latest');
  const [personalizedNews, setPersonalizedNews] = useState<Article[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLatestNews({ page: latestPage, size: 7 })); 
  }, [dispatch, latestPage]);

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

  const heroArticle = latestNews?.content?.[0];
  const gridArticles = latestNews?.content?.slice(1) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="space-y-12"
    >
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Featured Hero Article */}
      {status === 'loading' && !latestNews ? (
        <Skeleton className="h-[400px] w-full rounded-2xl mb-12" />
      ) : heroArticle ? (
        <HeroArticle article={heroArticle} />
      ) : null}

      {/* Trending Strip */}
      {trendingNews && trendingNews.content.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-headline-md text-foreground flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">local_fire_department</span>
              Trending Now
            </h2>
          </div>
          <div className="flex overflow-x-auto pb-4 -mx-margin_mobile px-margin_mobile md:mx-0 md:px-0 space-x-4 snap-x hide-scrollbar">
            {trendingNews.content.map((article) => (
              <TrendingCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Analysis / Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-foreground">Latest Analysis</h2>
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
            {status === 'loading' && !latestNews ? (
              renderSkeletons(6)
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>

                {latestNews && latestNews.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/30">
                    <button
                      className="rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={latestNews.pageNumber === 0 || status === 'loading'}
                      onClick={() => setLatestPage(p => Math.max(0, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {latestNews.pageNumber + 1} of {latestNews.totalPages}
                    </span>
                    <button
                      className="rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={latestNews.last || status === 'loading'}
                      onClick={() => setLatestPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {loadingPersonalized ? (
               renderSkeletons(6)
            ) : personalizedNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
