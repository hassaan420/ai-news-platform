import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchArticles } from '@/store/newsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

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
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="mb-stack_lg flex flex-col justify-between border-b border-border/30 pb-8 mt-8 md:mt-0">
        <h1 className="font-display-lg text-[40px] leading-[48px] text-foreground tracking-tight mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="relative w-full mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[24px]">search</span>
          <input
            className="w-full bg-card border border-border/60 rounded-xl py-3 pl-14 pr-32 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground"
            placeholder="Search for news, topics, or sources..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            type="text"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-label-sm text-label-sm px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
      </div>

      {!queryParam ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl shadow-subtle">
          <div className="bg-muted p-4 rounded-full mb-6 text-muted-foreground">
            <span className="material-symbols-outlined text-4xl">search</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-foreground mb-2">What are you looking for?</h2>
          <p className="text-sm text-muted-foreground max-w-md">Enter a search term above to find the latest news, articles, and analysis from across the platform.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-gutter">
          
          {/* Main Results Area */}
          <div className="flex-1">
            <div className="mb-stack_md flex justify-between items-end border-b border-border/30 pb-4">
              {status === 'loading' ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <h2 className="text-sm text-muted-foreground">
                  {searchResults?.totalElements || 0} results for "<span className="text-foreground font-semibold">{queryParam}</span>"
                </h2>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-[12px] text-muted-foreground">Sort:</span>
                <select 
                  className="bg-transparent border-none text-[13px] font-semibold text-primary focus:ring-0 cursor-pointer p-0 pr-4"
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
                  <div key={i} className="flex flex-col sm:flex-row gap-6 bg-card p-4 rounded-xl shadow-subtle">
                    <Skeleton className="sm:w-1/3 aspect-[4/3] rounded-lg shrink-0" />
                    <div className="flex flex-col justify-between flex-1 py-1 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))
              ) : searchResults?.content?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl shadow-subtle">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">search_off</span>
                  <h3 className="font-headline-md text-headline-md text-foreground mb-2">No results found</h3>
                  <p className="text-sm text-muted-foreground">We couldn't find any articles matching your search criteria.</p>
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
                    <Link to={`/news/${article.id}`} className="group flex flex-col sm:flex-row gap-6 bg-card p-4 rounded-xl shadow-subtle hover:shadow-premium transition-shadow duration-200">
                      <div className="sm:w-1/3 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                        {article.image ? (
                          <img
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="material-symbols-outlined text-[48px] text-muted-foreground/40">article</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">schedule</span> {formattedDate(article.publishedAt)}
                            </span>
                            {article.sentiment ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${getSentimentStyle(article.sentiment)}`}>
                                {article.sentiment}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold">
                                Neutral
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-md text-headline-md text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.summary || article.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-primary">{article.source.name}</span>
                          <button className="text-muted-foreground hover:text-primary transition-colors" title="Save article" onClick={(e) => e.preventDefault()} aria-label="Save article">
                            <span className="material-symbols-outlined">bookmark_add</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                    </motion.div>
                  ))}
                  
                  {/* Pagination */}
                  {searchResults && searchResults.totalPages > 1 && (
                    <div className="mt-stack_lg flex justify-center items-center space-x-4 pt-6 border-t border-border/30">
                      <button
                        className="w-10 h-10 rounded-lg bg-card shadow-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-premium transition-all disabled:opacity-50"
                        disabled={searchResults.pageNumber === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <span className="text-sm font-medium text-muted-foreground">
                        Page {searchResults.pageNumber + 1} of {searchResults.totalPages}
                      </span>
                      <button
                        className="w-10 h-10 rounded-lg bg-card shadow-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-premium transition-all disabled:opacity-50"
                        disabled={searchResults.last}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
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
