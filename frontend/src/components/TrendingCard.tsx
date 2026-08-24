import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '@/types/news';
import { newsApi } from '@/api/newsApi';

interface TrendingCardProps {
  article: Article;
  index?: number;
  isHero?: boolean;
}

export default function TrendingCard({ article, index = 0, isHero = false }: TrendingCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isSaved) {
        await newsApi.unsaveArticle(Number(article.id));
      } else {
        await newsApi.saveArticle(Number(article.id));
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const getDomain = () => article.url ? new URL(article.url).hostname : 'news.google.com';

  if (isHero) {
    return (
      <Link to={`/news/${article.id}`} className="group relative flex flex-col md:flex-row bg-card border border-border rounded-[24px] overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-300 w-full mb-8 col-span-full">
        {/* Left: Image */}
        <div className="w-full md:w-[55%] relative overflow-hidden aspect-video md:aspect-auto min-h-[300px]">
          <img 
            src={article.image ? `https://wsrv.nl/?url=${encodeURIComponent(article.image)}` : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop"} 
            alt={article.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          <span className="absolute top-6 left-6 font-serif text-6xl md:text-7xl text-white/90 font-bold opacity-90 drop-shadow-lg">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        
        {/* Right: Content */}
        <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col justify-between relative bg-card">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className={`inline-flex items-center text-[12px] font-semibold px-3 py-1 rounded-full ${getSentimentStyle(article.sentiment || '')}`}>
                {article.sentiment || 'Neutral'}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground text-[12px] font-semibold">
                <img src={`https://www.google.com/s2/favicons?domain=${getDomain()}&sz=32`} alt="" className="w-5 h-5 rounded-full bg-white/10" onError={(e) => e.currentTarget.style.display = 'none'} />
                <span className="uppercase tracking-wider">{article.source.name}</span>
              </div>
            </div>
            
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-6 line-clamp-4">
              {article.title}
            </h3>
          </div>
          
          <div className="mt-auto">
            {/* Sparkline */}
            <div className="w-full h-16 mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 200 40" className="w-full h-full stroke-foreground fill-none" preserveAspectRatio="none">
                <path d="M0,30 C20,20 30,35 50,25 C70,15 80,28 100,20 C120,12 130,22 150,15 C170,8 180,18 200,5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,30 C20,20 30,35 50,25 C70,15 80,28 100,20 C120,12 130,22 150,15 C170,8 180,18 200,5 L200,40 L0,40 Z" className="fill-foreground/5 stroke-none" />
              </svg>
            </div>
            
            <div className="flex items-center justify-between border-t border-border pt-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                <span className="text-foreground font-semibold">9.4K Views</span>
                <span className="text-border">/</span>
                <span>1.2M Reach</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500 dark:text-emerald-400 text-[22px]">trending_up</span>
                <button 
                  onClick={(e) => { e.preventDefault(); handleSave(e); }}
                  className={`material-symbols-outlined text-[22px] transition-colors p-2 rounded-full hover:bg-muted ${isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                >
                  {isSaved ? 'bookmark_added' : 'bookmark_add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Normal Card
  return (
    <Link to={`/news/${article.id}`} className="group flex flex-col bg-card border border-border rounded-[20px] overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-300 h-full">
      <div className="w-full relative aspect-video overflow-hidden">
        <img 
          src={article.image ? `https://wsrv.nl/?url=${encodeURIComponent(article.image)}` : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop"} 
          alt={article.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        <span className="absolute top-4 left-4 font-serif text-5xl text-white/90 font-bold opacity-90 drop-shadow-md">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      
      <div className="p-6 flex flex-col flex-1 relative bg-card">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${getSentimentStyle(article.sentiment || '')}`}>
            {article.sentiment || 'Neutral'}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-semibold">
             <img src={`https://www.google.com/s2/favicons?domain=${getDomain()}&sz=16`} alt="" className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 transition-all bg-white/10" onError={(e) => e.currentTarget.style.display = 'none'} />
             <span className="uppercase tracking-wider">{article.source.name}</span>
          </div>
        </div>
        
        <h3 className="font-serif text-[20px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors mb-5 line-clamp-3">
          {article.title}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{Math.floor(Math.random() * 8) + 2}.{Math.floor(Math.random() * 9)}K Views</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)}K Likes</span>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); handleSave(e); }}
            className={`material-symbols-outlined text-[20px] transition-colors p-1.5 rounded-full hover:bg-muted ${isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
          >
            {isSaved ? 'bookmark_added' : 'bookmark_add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
