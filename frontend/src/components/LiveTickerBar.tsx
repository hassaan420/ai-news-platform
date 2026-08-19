import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../api/newsApi';
import { Article } from '../types/news';

export default function LiveTickerBar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        const response = await newsApi.getLatestNews(0, 15, 'LATEST');
        if (isMounted) {
          setArticles(response.content || []);
        }
      } catch (error) {
        console.error('Failed to fetch latest news for ticker', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-card border-b border-border/40 h-9 flex items-center overflow-hidden w-full text-[13px] text-muted-foreground">
        <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-3 h-full z-10 border-r border-border/40">
          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">LIVE</span>
        </div>
        <span className="px-4">Loading latest updates...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-card border-b border-border/40 h-9 flex items-center overflow-hidden w-full text-[13px] text-muted-foreground">
        <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-3 h-full z-10 border-r border-border/40">
          <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">LIVE</span>
        </div>
        <span className="px-4">No live updates at the moment.</span>
      </div>
    );
  }

  return (
    <div className="bg-card border-b border-border/40 h-9 flex items-center overflow-hidden w-full">
      {/* Non-scrolling left badge */}
      <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-3 h-full z-10 bg-card border-r border-border/40">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
          LIVE
        </span>
      </div>

      {/* Scrolling Ticker */}
      <div className="flex-1 overflow-hidden h-full flex group relative">
        <style>{`
          @keyframes scroll-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            flex-shrink: 0;
            animation: scroll-ticker 40s linear infinite;
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="ticker-track h-full items-center">
          {/* First set of items */}
          {articles.map((article) => (
            <React.Fragment key={`ticker-1-${article.id}`}>
              <TickerItem article={article} />
              <div className="w-8" />
            </React.Fragment>
          ))}
          {/* Duplicated set for seamless looping */}
          {articles.map((article) => (
            <React.Fragment key={`ticker-2-${article.id}`}>
              <TickerItem article={article} />
              <div className="w-8" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function TickerItem({ article }: { article: Article }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
      </span>
      <span className="font-semibold text-foreground/80">{article.source?.name || 'News'}</span>
      <span className="h-3 w-px bg-border/60"></span>
      <span>{article.title}</span>
    </Link>
  );
}
