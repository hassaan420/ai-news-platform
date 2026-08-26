import React, { useState, useEffect, useCallback } from 'react';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function SidebarArticlesWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await newsApi.getLatestNews(page, 5);
      if (response.content.length === 0 || response.last) {
        setHasMore(false);
      }
      
      if (response.content.length > 0) {
        setArticles(prev => {
          const map = new Map<number, Article>();
          prev.forEach(a => map.set(a.id, a));
          response.content.forEach(a => map.set(a.id, a));
          return Array.from(map.values());
        });
        setPage(p => p + 1);
      }
    } catch (e) {
      console.error('Failed to fetch sidebar articles', e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { targetRef } = useIntersectionObserver(loadMore, {
    root: null,
    rootMargin: '0px 0px 400px 0px',
    threshold: 0
  });

  if (articles.length === 0 && !loading) return null;

  return (
    <div className="space-y-4">
      {articles.map(article => (
        <a 
          key={article.id} 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/[0.2] shadow-xl hover:bg-black/60 transition-all"
        >
          {article.image && (
            <div className="h-32 mb-3 rounded-xl overflow-hidden relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          <h4 className="font-serif font-bold text-white text-sm line-clamp-3 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center justify-between text-[11px] font-medium text-white/50 uppercase tracking-wider">
            <span>{article.source?.name}</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
        </a>
      ))}
      
      {hasMore && (
        <div ref={targetRef} className="h-10 flex items-center justify-center mt-4">
          {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      )}
    </div>
  );
}
