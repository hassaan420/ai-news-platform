import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryNews, fetchCategoryTrendingNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import HeroArticle from '@/components/HeroArticle';
import FeatureAnalysisCard from '@/components/FeatureAnalysisCard';
import SummaryCard from '@/components/SummaryCard';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_CONFIG: Record<string, { tabs: string[], icon: string, summaries: { title: string, metric: string, icon: string }[] }> = {
  technology: {
    icon: 'memory',
    tabs: ['Latest', 'Trending', 'AI', 'Startups', 'Hardware', 'Software', 'Global Policy'],
    summaries: [
      { title: 'New Chipsets', metric: '33K reads', icon: 'memory' },
      { title: 'Startups Funding', metric: '$1.2B today', icon: 'payments' },
      { title: 'AI Regulations', metric: '3.1K edits', icon: 'gavel' }
    ]
  },
  health: {
    icon: 'health_and_safety',
    tabs: ['Latest', 'Trending', 'Research', 'Policies', 'Global Health', 'Disease Control', 'Wellness'],
    summaries: [
      { title: 'Vaccine Efficacy', metric: 'Trending Up', icon: 'vaccines' },
      { title: 'Mental Health', metric: '50K mentions', icon: 'psychology' },
      { title: 'Regulatory Approvals', metric: '12 pending', icon: 'fact_check' }
    ]
  },
  business: {
    icon: 'trending_up',
    tabs: ['Latest', 'Trending', 'Markets', 'M&A', 'Economy', 'Corporate Governance', 'Sector Reports'],
    summaries: [
      { title: 'Fed Rate Hike', metric: 'Market priced in', icon: 'account_balance' },
      { title: 'M&A Activity', metric: '$45B volume', icon: 'handshake' },
      { title: 'Industry Disruptors', metric: 'Top 10 list', icon: 'lightbulb' }
    ]
  },
  politics: {
    icon: 'account_balance',
    tabs: ['Latest', 'Trending', 'Elections', 'Global Relations', 'Legislation', 'Public Opinion'],
    summaries: [
      { title: 'Election Polling', metric: '+2.4% swing', icon: 'how_to_vote' },
      { title: 'Senate Bills', metric: '3 passed today', icon: 'gavel' },
      { title: 'Diplomatic Visits', metric: 'G7 Summit', icon: 'public' }
    ]
  }
};
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
      if (mode === 'trending') {
        dispatch(fetchCategoryTrendingNews({ category: slug, page, size: 13 }));
      } else {
        dispatch(fetchCategoryNews({ category: slug, page, size: 13 })); // 1 hero + 12 grid
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, slug, page, mode]);

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

  const config = CATEGORY_CONFIG[slug?.toLowerCase() || ''] || CATEGORY_CONFIG['politics'];

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
            <span className="material-symbols-outlined text-2xl">{config.icon}</span>
          </div>
          <div>
            <h1 className="font-display-lg text-display-lg text-foreground capitalize">{slug}</h1>
            <p className="text-sm text-muted-foreground">AI-curated analysis and updates from the world of {slug}.</p>
          </div>
        </div>

        {/* Sort/Filter Bar */}
        <div className="flex items-center justify-between mt-stack_md pt-stack_sm overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {config.tabs.map(tab => {
              const tabId = tab.toLowerCase();
              const isClickable = tabId === 'latest' || tabId === 'trending';
              return (
                <button
                  key={tab}
                  onClick={() => isClickable && setMode(tabId as any)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${(mode === tabId) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    } ${!isClickable ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (Hero & Summaries) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {categoryNews?.content?.[0] && <HeroArticle article={categoryNews.content[0]} />}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {config.summaries.map((summary, idx) => (
                  <SummaryCard key={idx} {...summary} />
                ))}
              </div>
            </div>

            {/* Center Column (Feature Analysis) */}
            <div className="lg:col-span-4">
              {categoryNews?.content?.[1] && <FeatureAnalysisCard article={categoryNews.content[1]} category={slug || 'politics'} />}
            </div>

            {/* Right Column (Small Cards) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {categoryNews?.content?.slice(2, 4).map((article, idx) => (
                <div key={article.id} className="flex-1 h-full min-h-[200px]">
                  <ArticleCard article={article} index={idx + 2} />
                </div>
              ))}
            </div>

          </div>

          {/* Remaining Grid Articles */}
          {categoryNews?.content && categoryNews.content.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-border/30">
              {categoryNews.content.slice(4).map((article, idx) => (
                <ArticleCard key={article.id} article={article} index={idx + 4} />
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
