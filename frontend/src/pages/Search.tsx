import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchArticles } from '@/store/newsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Clock, SearchX, BookmarkPlus, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(queryParam);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(0);
  
  const dispatch = useAppDispatch();
  const { searchResults, status } = useAppSelector((state) => state.news);

  useEffect(() => {
    setPage(0);
  }, [queryParam]);

  useEffect(() => {
    if (queryParam) {
      dispatch(searchArticles({ query: queryParam, page, size: 10 }));
      setLocalQuery(queryParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, queryParam, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setPage(0);
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-white/5 text-white/90 border border-white/10';
    }
  };

  const formattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 24 && hoursDiff > 0) return `${hoursDiff} hours ago`;
    if (hoursDiff === 0) return 'Just now';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="pb-12 max-w-5xl mx-auto"
    >
      <div className="mb-stack_lg flex flex-col justify-between border-b border-white/[0.2] pb-8 mt-8 md:mt-0">
        <h1 className="font-display-lg text-[40px] leading-[48px] text-heading-theme tracking-tight mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="relative w-full mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-theme w-5 h-5 pointer-events-none" />
          <input
            className="clarion-input w-full py-4 pl-12 pr-32 font-sans text-base"
            placeholder="Search for news, topics, or sources..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            type="text"
          />
          <button type="submit" className="clarion-btn clarion-btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5">
            Search
          </button>
        </form>
      </div>

      {!queryParam ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card border-border/60 rounded-2xl">
          <div className="bg-black/5 dark:bg-white/10 p-4 rounded-full mb-6 text-primary-theme">
            <SearchIcon className="w-10 h-10" />
          </div>
          <h2 className="font-headline-md text-headline-md text-heading-theme mb-2">What are you looking for?</h2>
          <p className="text-sm text-secondary-theme max-w-md">Enter a search term above to find the latest news, articles, and analysis from across the platform.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-gutter">
          
          {/* Main Results Area */}
          <div className="flex-1">
            <div className="mb-stack_md flex justify-between items-end border-b border-white/[0.2] pb-4">
              {status === 'loading' ? (
                <Skeleton className="h-6 w-48 bg-white/10" />
              ) : (
                <h2 className="text-sm text-secondary-theme">
                  {searchResults?.totalElements || 0} results for "<span className="text-heading-theme font-semibold">{queryParam}</span>"
                </h2>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-[12px] text-white/90">Sort:</span>
                <select 
                  className="bg-transparent border-none text-[13px] font-semibold text-primary focus:ring-0 cursor-pointer p-0 pr-4 [&>option]:bg-[#0a0a0f] [&>option]:text-white/90"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {status === 'loading' ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-6 glass-card p-4 rounded-2xl">
                    <Skeleton className="sm:w-1/3 aspect-[4/3] rounded-lg shrink-0 bg-black/5 dark:bg-white/10" />
                    <div className="flex flex-col justify-between flex-1 py-1 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-black/5 dark:bg-white/10" />
                        <Skeleton className="h-6 w-full bg-black/5 dark:bg-white/10" />
                        <Skeleton className="h-4 w-full bg-black/5 dark:bg-white/10" />
                        <Skeleton className="h-4 w-2/3 bg-black/5 dark:bg-white/10" />
                      </div>
                      <Skeleton className="h-4 w-40 bg-black/5 dark:bg-white/10" />
                    </div>
                  </div>
                ))
              ) : searchResults?.content?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card border-border/60 rounded-2xl">
                  <SearchX className="w-10 h-10 text-muted-theme mb-4" />
                  <h3 className="font-headline-md text-headline-md text-heading-theme mb-2">No results found</h3>
                  <p className="text-sm text-secondary-theme">We couldn't find any articles matching your search criteria.</p>
                  <button className="mt-6 text-sm font-medium text-primary hover:underline" onClick={() => { setLocalQuery(''); setSearchParams({}); }}>Clear search</button>
                </div>
              ) : (
                <>
                  {searchResults?.content.map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                    >
                    <Link to={`/news/${article.id}`} className="group flex flex-col sm:flex-row gap-6 glass-card glass-card-hover border-border/60 p-4 rounded-2xl">
                      <div className="sm:w-1/3 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-white/10">
                        {article.image ? (
                          <img
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-white/[0.2] flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-white/90 flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {formattedDate(article.publishedAt)}
                            </span>
                            {article.sentiment ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getSentimentStyle(article.sentiment)}`}>
                                {article.sentiment}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/90 text-[11px] font-semibold">
                                Neutral
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-md text-headline-md text-white/90 mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-white/90 line-clamp-2">
                            {article.summary || article.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-primary">{article.source.name}</span>
                          <button className="text-white/90 hover:text-white/90 transition-colors" title="Save article" onClick={(e) => e.preventDefault()} aria-label="Save article">
                            <BookmarkPlus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </Link>
                    </motion.div>
                  ))}
                  
                  {/* Pagination */}
                  {searchResults && searchResults.totalPages > 1 && (
                    <div className="mt-stack_lg flex justify-center items-center space-x-4 pt-6 border-t border-white/[0.2]">
                      <button
                        className="w-10 h-10 rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] shadow-2xl flex items-center justify-center text-white/90 hover:text-white/90 hover:bg-white/[0.2] transition-all disabled:opacity-50 disabled:hover:bg-white/[0.12]"
                        disabled={searchResults.pageNumber === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium text-white/90">
                        Page {searchResults.pageNumber + 1} of {searchResults.totalPages}
                      </span>
                      <button
                        className="w-10 h-10 rounded-xl bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] shadow-2xl flex items-center justify-center text-white/90 hover:text-white/90 hover:bg-white/[0.2] transition-all disabled:opacity-50 disabled:hover:bg-white/[0.12]"
                        disabled={searchResults.last}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

