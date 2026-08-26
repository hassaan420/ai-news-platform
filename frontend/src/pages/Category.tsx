import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryNews, fetchCategoryTrendingNews } from '@/store/newsSlice';
import ArticleCard from '@/components/ArticleCard';
import HeroArticle from '@/components/HeroArticle';
import FeatureAnalysisCard from '@/components/FeatureAnalysisCard';
import SummaryCard from '@/components/SummaryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, HeartPulse, TrendingUp, Landmark, SearchX, FlaskConical, Wallet, Scale, Lightbulb, Globe, Vote, ClipboardCheck, Syringe, Brain, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_CONFIG: Record<string, { tabs: string[], icon: any, summaries: { title: string, metric: string, icon: any }[] }> = {
  technology: {
    icon: Cpu,
    tabs: ['Latest', 'Trending', 'AI', 'Startups', 'Hardware', 'Software', 'Global Policy'],
    summaries: [
      { title: 'New Chipsets', metric: '33K reads', icon: Cpu },
      { title: 'Startups Funding', metric: '$1.2B today', icon: Wallet },
      { title: 'AI Regulations', metric: '3.1K edits', icon: Scale }
    ]
  },
  health: {
    icon: HeartPulse,
    tabs: ['Latest', 'Trending', 'Research', 'Policies', 'Global Health', 'Disease Control', 'Wellness'],
    summaries: [
      { title: 'Vaccine Efficacy', metric: 'Trending Up', icon: Syringe },
      { title: 'Mental Health', metric: '50K mentions', icon: Brain },
      { title: 'Regulatory Approvals', metric: '12 pending', icon: ClipboardCheck }
    ]
  },
  business: {
    icon: TrendingUp,
    tabs: ['Latest', 'Trending', 'Markets', 'M&A', 'Economy', 'Corporate Governance', 'Sector Reports'],
    summaries: [
      { title: 'Fed Rate Hike', metric: 'Market priced in', icon: Landmark },
      { title: 'M&A Activity', metric: '$45B volume', icon: Handshake },
      { title: 'Industry Disruptors', metric: 'Top 10 list', icon: Lightbulb }
    ]
  },
  politics: {
    icon: Landmark,
    tabs: ['Latest', 'Trending', 'Elections', 'Global Relations', 'Legislation', 'Public Opinion'],
    summaries: [
      { title: 'Election Polling', metric: '+2.4% swing', icon: Vote },
      { title: 'Senate Bills', metric: '3 passed today', icon: Scale },
      { title: 'Diplomatic Visits', metric: 'G7 Summit', icon: Globe }
    ]
  }
};

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
      <Skeleton className="h-[400px] w-full rounded-2xl bg-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px] bg-white/10" />
              <Skeleton className="h-4 w-[200px] bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const config = CATEGORY_CONFIG[slug?.toLowerCase() || ''] || CATEGORY_CONFIG['politics'];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12"
    >
      {/* Category Header */}
      <div className="mb-stack_lg border-b border-white/[0.2] pb-stack_md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display-lg text-display-lg text-white/90 capitalize">{slug}</h1>
            <p className="text-sm text-white/90">AI-curated analysis and updates from the world of {slug}.</p>
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
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${(mode === tabId) ? 'bg-white/[0.15] text-white/90' : 'text-white/90 hover:bg-white/[0.1] hover:text-white/90'
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
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] rounded-2xl shadow-2xl">
          <div className="bg-white/[0.15] p-4 rounded-full mb-6">
            <SearchX className="w-10 h-10 text-white/90" />
          </div>
          <h2 className="font-headline-md text-headline-md text-white/90 mb-2">No stories found</h2>
          <p className="text-sm text-white/90 max-w-md">We don't have any articles in the {slug} category right now. Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column (Hero & Summaries) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {categoryNews?.content?.[0] && <HeroArticle article={categoryNews.content[0]} />}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/[0.2] items-start">
              {categoryNews.content.slice(4).map((article, idx) => (
                <ArticleCard key={article.id} article={article} index={idx + 4} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {categoryNews && categoryNews.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10 border-t border-white/[0.2]">
              <button
                className="rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] shadow-2xl px-6 py-2 text-sm font-medium text-white/90 hover:text-white/90 hover:bg-white/[0.2] transition-colors disabled:opacity-50 disabled:hover:bg-white/[0.12]"
                disabled={categoryNews.pageNumber === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Previous Page
              </button>
              <span className="text-sm font-medium text-white/90">
                Page {categoryNews.pageNumber + 1} of {categoryNews.totalPages}
              </span>
              <button
                className="rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] shadow-2xl px-6 py-2 text-sm font-medium text-white/90 hover:text-white/90 hover:bg-white/[0.2] transition-colors disabled:opacity-50 disabled:hover:bg-white/[0.12]"
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
