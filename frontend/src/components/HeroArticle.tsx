import { Link } from 'react-router-dom';
import { Article } from '@/types/news';

interface HeroArticleProps {
  article: Article;
}

export default function HeroArticle({ article }: HeroArticleProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
      case 'bullish': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'negative':
      case 'bearish': return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAuthorInitials = (name?: string) => {
    if (!name) return 'AI';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <section className="mb-12">
      <Link to={`/news/${article.id}`} className="group relative flex flex-col lg:flex-row bg-card rounded-xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-shadow duration-300">
        <div className="lg:w-7/12 relative min-h-[300px] lg:min-h-[400px]">
          {article.image ? (
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
              alt={article.title}
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-muted" />
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-primary text-primary-foreground font-label-sm text-[11px] px-3 py-1 rounded-md uppercase tracking-wider">
              {article.category}
            </span>
            {article.sentiment && (
              <span className={`${getSentimentStyle(article.sentiment)} font-label-sm text-[11px] px-3 py-1 rounded-md flex items-center border`}>
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> {article.sentiment}
              </span>
            )}
          </div>
        </div>
        
        <div className="lg:w-5/12 p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="font-metadata text-[13px] text-muted-foreground flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
              {article.source.name} · {formattedDate}
            </span>
            <button className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.preventDefault()} aria-label="Save article">
              <span className="material-symbols-outlined">bookmark_add</span>
            </button>
          </div>
          
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-[36px] md:leading-[44px] text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h1>
          
          <p className="font-body-lg text-body-lg text-muted-foreground mb-6 clamp-3">
            {article.description}
          </p>
          
          <div className="flex items-center mt-auto pt-4 border-t border-border/30">
            <div className="w-8 h-8 rounded-full bg-muted mr-3 flex items-center justify-center text-muted-foreground font-semibold text-[12px]">
              {getAuthorInitials(article.author)}
            </div>
            <span className="font-metadata text-[13px] text-foreground">By {article.author || 'AI Curated'}</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
