import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { newsApi } from '../api/newsApi';
import { Article } from '../types/news';
import { createPortal } from 'react-dom';

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// Global portal for hover cards to bypass overflow:hidden
const HoverCardPortal = ({ children, position, visible }: { children: React.ReactNode, position: { x: number, y: number }, visible: boolean }) => {
  if (!visible) return null;
  return createPortal(
    <div 
      style={{ left: position.x, top: position.y + 20 }}
      className="fixed z-[100] w-80 bg-card border border-border shadow-premium rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
    >
      {children}
    </div>,
    document.body
  );
};

export default function LiveTickerBar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const response = await newsApi.getLatestNews(0, 15, 'LATEST');
        if (isMounted) setArticles(response.content || []);
      } catch (error) {
        console.error('Failed to fetch latest news for ticker', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Continuous Auto-scroll logic using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      if (!isPaused && trackRef.current) {
         const delta = time - lastTime;
         if (delta > 16) {
           trackRef.current.scrollLeft += 1;
           lastTime = time;
         }
      } else {
         lastTime = time;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);



  if (loading || articles.length === 0) {
    return (
      <div className="w-full flex justify-center py-2 relative z-20">
         <div className="bg-surface-container-lowest border border-border/60 rounded-full h-11 w-[96%] flex items-center shadow-subtle overflow-hidden">
            <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-4 h-full border-r border-border/60 bg-muted/30">
               <span className="text-red-600 dark:text-red-400 text-[11px] font-bold tracking-widest uppercase">LIVE FEED</span>
            </div>
            <span className="px-4 text-xs text-muted-foreground">{loading ? 'Loading live stream...' : 'No live updates.'}</span>
         </div>
      </div>
    );
  }

  // Duplicate items for infinite scroll feel
  const duplicatedArticles = [...articles, ...articles, ...articles];

  return (
    <div className="w-full flex justify-center py-2 relative z-20">
      <div className="bg-surface-container-lowest border border-border/60 rounded-full h-11 w-[98%] max-w-[1400px] flex items-center shadow-subtle overflow-visible relative">
        
        {/* Left Badge - LIVE FEED */}
        <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-4 h-full border-r border-border/60 bg-card rounded-l-full relative z-10 shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-red-600 dark:text-red-500 text-[11px] font-bold tracking-widest uppercase">
            LIVE FEED
          </span>
        </div>

        {/* Scrolling Track */}
        <div 
          className="flex-1 overflow-x-hidden h-full flex items-center no-scrollbar relative cursor-pointer"
          ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center min-w-max gap-8 px-6 h-full">
            {duplicatedArticles.map((article, idx) => (
              <TickerItem key={`${article.id}-${idx}`} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerItem({ article }: { article: Article }) {
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const domain = article.url ? new URL(article.url).hostname : '';
  const favicon = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  const timeAgo = getTimeAgo(article.publishedAt);
  // Deterministic fake velocity based on article id so it doesn't jump
  const velocity = ((article.id % 5) + 1) + '.' + (article.id % 9) + 'K';

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ x: rect.left, y: rect.bottom });
    setIsHovered(true);
  };

  return (
    <>
      <div 
        className="group relative flex items-center h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/news/${article.id}`} className="flex items-center gap-3 text-[13.5px] whitespace-nowrap hover:text-primary transition-colors">
          <div className="flex items-center gap-2 border-r border-border/50 pr-3">
            <img src={favicon} alt={article.source?.name} className="w-4 h-4 rounded-full bg-white object-contain shadow-sm" />
            <span className="font-semibold text-foreground">{article.source?.name || 'News'}</span>
          </div>
          <span className="text-muted-foreground text-[12px] font-medium">{timeAgo}</span>
          <span className="w-1 h-1 rounded-full bg-border"></span>
          <span className="text-foreground font-medium tracking-tight">{article.title}</span>
          <span className="ml-2 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded shadow-sm border border-amber-200 dark:border-amber-900/50">
            <span className="material-symbols-outlined text-[12px]">bolt</span>
            {velocity} readers
          </span>
        </Link>
      </div>

      <HoverCardPortal position={hoverPos} visible={isHovered}>
        <div className="flex items-start gap-3 mb-3">
           <img src={favicon} alt="" className="w-6 h-6 rounded-full border border-border" />
           <div>
             <div className="font-bold text-sm text-foreground">{article.source?.name}</div>
             <div className="text-xs text-muted-foreground">{timeAgo}</div>
           </div>
        </div>
        <h4 className="font-bold text-sm mb-2 line-clamp-2 leading-snug text-foreground">{article.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{article.description}</p>
      </HoverCardPortal>
    </>
  );
}
