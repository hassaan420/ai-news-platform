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

  return (
    <section className="mb-8">
      <Link to={`/news/${article.id}`} className="group relative flex flex-col lg:flex-row bg-card border border-border rounded-[24px] overflow-hidden shadow-subtle hover:shadow-premium transition-all duration-300">
        
        {/* Left Side: Image */}
        <div className="lg:w-[55%] relative min-h-[300px] lg:min-h-[440px] overflow-hidden">
          {article.image ? (
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
              src={`https://wsrv.nl/?url=${encodeURIComponent(article.image)}`}
              alt={article.title}
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-surface-variant" />
          )}
          
          {/* Subtle gradient overlay to ensure text contrast if we place text on it, though text is on right here */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/20 lg:to-card/80 opacity-0 lg:opacity-100" />
        </div>
        
        {/* Right Side: Content */}
        <div className="lg:w-[45%] p-8 lg:p-12 flex flex-col justify-center relative">
          
          {/* Top: Category & Sentiment */}
          <div className="flex items-center gap-3 mb-6 transition-transform duration-500 ease-out group-hover:-translate-y-1">
            <span className="bg-foreground/[0.04] text-foreground border border-foreground/[0.08] font-sans text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-subtle">
              {article.category}
            </span>
          </div>
          
          {/* Middle: Title & Description */}
          <div className="transition-transform duration-500 delay-75 ease-out group-hover:-translate-y-1">
            <h1 className="font-serif text-[28px] md:text-[38px] leading-[1.15] text-foreground mb-4 font-semibold tracking-tight">
              {article.title}
            </h1>
            
            <p className="font-sans text-[16px] leading-[1.6] text-muted-foreground mb-8 clamp-3">
              {article.description}
            </p>
          </div>
          
          {/* Bottom: Metadata & AI Indicator */}
          <div className="mt-auto flex items-center justify-between transition-all duration-500 delay-150 ease-out group-hover:-translate-y-1 opacity-90 group-hover:opacity-100">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden">
                <img src={`https://www.google.com/s2/favicons?domain=${article.url ? new URL(article.url).hostname : 'news.google.com'}&sz=32`} alt="" className="w-4 h-4 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <span className="font-sans text-[12px] font-medium text-foreground tracking-wide uppercase">
                {article.source.name}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">•</span>
              <span className="font-sans text-[13px] text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              <span className="font-sans text-[10px] font-semibold tracking-widest uppercase">AI Analyzed</span>
            </div>
          </div>

        </div>
      </Link>
    </section>
  );
}
