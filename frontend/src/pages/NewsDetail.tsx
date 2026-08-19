import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Calendar, User, Share2, Copy, Bookmark,
  Sparkles, Clock, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchArticleById, fetchCategoryNews } from '@/store/newsSlice';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { newsApi } from '@/api/newsApi';
// It is usually better to import types at the top rather than inline
import { Article, ArticleVerificationDto } from '@/types/news';
import ReadingProgress from '@/components/ReadingProgress';
import RelatedArticleCard from '@/components/RelatedArticleCard';
import { motion } from 'framer-motion';

const TwinklingBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
    {Array(20).fill(0).map((_, i) => {
      const size = Math.random() * 3 + 2;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/60 shadow-[0_0_12px_2px_rgba(var(--primary),0.8)]"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      );
    })}
  </div>
);

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { currentArticle: article, status, error, categoryNews } = useAppSelector((state) => state.news);

  // FIXED: Moved useState to the top level, out of the broken useEffect
  const [aiRelatedArticles, setAiRelatedArticles] = useState<Article[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<ArticleVerificationDto | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const articleRef = useRef<HTMLElement>(null);

  // FIXED: Removed the duplicate, unclosed useEffect. This one handles both actions.
  useEffect(() => {
    if (id) {
      dispatch(fetchArticleById(Number(id)));
      
      setRelatedLoading(true);
      newsApi.getRelatedArticles(Number(id))
        .then(res => setAiRelatedArticles(res))
        .catch(console.error)
        .finally(() => setRelatedLoading(false));
        
      setVerificationLoading(true);
      newsApi.getArticleVerification(Number(id))
        .then(res => setVerificationData(res))
        .catch(e => {
            // Ignore 404s for unverified articles
            if (e.response?.status !== 404) console.error(e);
            setVerificationData(null);
        })
        .finally(() => setVerificationLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;


    if (article?.processingStatus === 'PENDING') {
      interval = setInterval(() => {
        dispatch(fetchArticleById(Number(id)));
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, id, article?.processingStatus]);

  useEffect(() => {
    if (article?.category) {
      dispatch(fetchCategoryNews({ category: article.category, page: 0, size: 3 }));
    }
  }, [dispatch, article?.category]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Article link copied to clipboard.",
    });
  };

  const handleSaveArticle = async () => {
    if (!article) return;
    try {
      await newsApi.saveArticle(article.id);
      toast({
        title: "Article saved!",
        description: "You can find it in your Saved Articles.",
      });
    } catch (err) {
      toast({
        title: "Failed to save article",
        description: "Please make sure you are logged in.",
        variant: "destructive"
      });
    }
  };

  if (status === 'loading' || (!article && status !== 'failed')) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse px-4 md:px-0">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  if (status === 'failed' || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="bg-muted h-24 w-24 rounded-full flex items-center justify-center mb-6">
          <ExternalLink className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-foreground">Article not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error || 'The article you are looking for does not exist or has been removed.'}</p>
        <Link to="/">
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const relatedArticles = aiRelatedArticles.length > 0
    ? aiRelatedArticles.slice(0, 6)
    : (categoryNews[article.category]?.content?.filter(a => a.id !== article.id).slice(0, 6) || []);

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    const lower = sentiment.toLowerCase();
    if (lower === 'positive') return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20"><TrendingUp className="w-3 h-3 mr-1" /> Positive</Badge>;
    if (lower === 'negative') return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 border-rose-500/20"><TrendingDown className="w-3 h-3 mr-1" /> Negative</Badge>;
    return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-border"><Minus className="w-3 h-3 mr-1" /> Neutral</Badge>;
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth() && date.getUTCDate() === now.getUTCDate();
    if (isToday) {
      const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      return hoursDiff > 0 ? `${hoursDiff}h ago` : 'Just now';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRelationshipBadge = (relationship: string) => {
    const rel = relationship?.toUpperCase() || '';
    if (rel === 'CORROBORATING') return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0 text-[10px] tracking-wide">Corroborating</Badge>;
    if (rel === 'CONFLICTING') return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 px-1.5 py-0 text-[10px] tracking-wide">Conflicting</Badge>;
    if (rel === 'NEUTRAL') return <Badge className="bg-muted text-muted-foreground border-border px-1.5 py-0 text-[10px] tracking-wide">Neutral</Badge>;
    return <Badge className="bg-muted text-muted-foreground border-border px-1.5 py-0 text-[10px] tracking-wide">{relationship}</Badge>;
  };

  const hasInsufficientEvidence = verificationData?.status === 'INSUFFICIENT_EVIDENCE' || verificationData?.status === 'SINGLE_SOURCE';
  const hasSources = verificationData?.sources && verificationData.sources.length > 0;
  const showFallback = !verificationData || hasInsufficientEvidence || !hasSources;

  return (
    <>
    <ReadingProgress targetRef={articleRef} />
    <article ref={articleRef} className="pb-12 px-4 md:px-0">
      <div className="max-w-5xl mx-auto mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to previous
        </button>
      </div>

      <div className="max-w-5xl mx-auto relative mb-12 rounded-[2rem] border border-primary/20 bg-card/40 backdrop-blur-md shadow-[0_0_40px_rgba(var(--primary),0.1)] px-6 py-16 md:py-20 md:px-12">
        <TwinklingBackground />

        <header className="relative z-10 space-y-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(var(--primary),0.2)]">{article.category}</span>
            <span className="text-sm font-medium text-foreground/80">{article.source.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-foreground font-serif bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/70">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            {article.author && (
              <div className="flex items-center gap-2">
                <div className="bg-muted p-1.5 rounded-full"><User className="h-3.5 w-3.5" /></div>
                <span className="font-medium">{article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-muted p-1.5 rounded-full"><Calendar className="h-3.5 w-3.5" /></div>
              <span className="font-medium">{formattedDate}</span>
            </div>
            {article.readingTime && (
              <div className="flex items-center gap-2">
                <div className="bg-muted p-1.5 rounded-full"><Clock className="h-3.5 w-3.5" /></div>
                <span className="font-medium">{article.readingTime} min read</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {getSentimentBadge(article.sentiment)}
            {article.keywords && article.keywords.slice(0, 4).map(kw => (
              <Badge key={kw} variant="secondary" className="font-normal text-xs">{kw}</Badge>
            ))}
          </div>
        </header>
      </div>

      {article.image && (
        <div className="max-w-6xl mx-auto aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted mb-12 shadow-premium">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2 flex flex-col order-1 lg:order-none">
            <div className="flex items-center gap-2 mb-8 border-y border-border/40 py-4 max-w-3xl mx-auto lg:mx-0 w-full">
              <Button variant="outline" size="sm" className="mr-auto gap-2" onClick={handleSaveArticle}>
                <Bookmark className="h-4 w-4" />
                Save Article
              </Button>
              <span className="text-sm font-medium text-muted-foreground mr-4">Share:</span>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}`, '_blank')}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none mb-12 font-serif max-w-3xl mx-auto lg:mx-0 w-full">
              <p className="text-xl leading-relaxed text-muted-foreground first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-foreground">
                {article.description}
              </p>

              {article.summary && (
                <div className="my-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 dark:border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary/10 dark:bg-primary/20 rounded-bl-xl px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="w-3 h-3" />
                    AI Summary
                  </div>
                  <p className="text-foreground leading-relaxed mt-2 text-lg font-medium">
                    {article.summary}
                  </p>
                  {article.aiConfidence && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${article.aiConfidence * 100}%` }} />
                      </div>
                      <span>{Math.round(article.aiConfidence * 100)}% Confidence</span>
                    </div>
                  )}
                </div>
              )}

              {!article.summary && article.processingStatus === 'PENDING' && (
                <div className="my-8 p-6 bg-muted/30 rounded-2xl border border-border relative overflow-hidden animate-pulse">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">✨ Generating AI insights...</span>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[90%] mb-2" />
                  <Skeleton className="h-4 w-[75%]" />
                </div>
              )}

              {article.content ? (
                <p className="mt-6 text-foreground leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              ) : (
                <p className="mt-6 text-muted-foreground italic">
                  Full content is only available on the original source.
                </p>
              )}
            </div>

            <div className="flex justify-center border-t border-b border-border/30 py-10 mb-16 bg-card rounded-2xl shadow-subtle max-w-3xl mx-auto lg:mx-0 w-full">
              <div className="text-center">
                <h3 className="font-bold text-xl mb-4 text-foreground">Continue reading on {article.source.name}</h3>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 rounded-full px-8">
                    Read Full Article
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 order-2 lg:order-none">
            <div className="sticky top-24">
              {verificationLoading ? (
                <div className="p-6 bg-card rounded-3xl border relative overflow-hidden shadow-sm animate-pulse mb-8">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-20 w-full rounded-xl mb-3" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : verificationData && !showFallback ? (
                <div className="p-6 rounded-3xl border bg-card shadow-sm mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="font-headline-md text-lg text-foreground">How others are reporting this</h3>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${
                      verificationData.status === 'STRONGLY_CORROBORATED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      verificationData.status === 'PARTIALLY_CORROBORATED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      {verificationData.verificationScore}/100
                    </div>
                  </div>

                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                    className="flex flex-col gap-3"
                  >
                    {verificationData.sources.map(src => (
                      <motion.a 
                        key={src.id} 
                        href={src.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.3 } }
                        }}
                        className="group block p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{src.sourceName}</span>
                          <span className="shrink-0">{getRelationshipBadge(src.relationship)}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(src.publishedAt)}
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl border bg-card shadow-sm mb-8">
                  <div className="mb-2">
                    <h3 className="font-headline-md text-lg text-foreground mb-3">How others are reporting this</h3>
                    <div className="flex items-start gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/50">
                       <div className="mt-0.5 shrink-0"><Sparkles className="w-4 h-4 text-muted-foreground" /></div>
                       <p className="text-sm text-muted-foreground leading-relaxed">
                         Our AI found limited independent coverage of this event from other trusted sources.
                       </p>
                    </div>
                  </div>

                  {(relatedLoading || relatedArticles.length > 0) && (
                    <div className="mt-6 border-t border-border/30 pt-5">
                      <h4 className="text-sm font-semibold text-foreground mb-3">You might also want to read</h4>
                      {relatedLoading ? (
                        <div className="flex flex-col gap-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 p-2 rounded-xl">
                              <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <Skeleton className="h-4 w-full mb-1.5" />
                                <Skeleton className="h-4 w-4/5 mb-1.5" />
                                <Skeleton className="h-3 w-1/3 mt-0.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <motion.div 
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                          className="flex flex-col gap-3"
                        >
                          {relatedArticles.slice(0, 3).map((a) => (
                            <motion.div 
                              key={a.id}
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.3 } }
                              }}
                            >
                              {a.id < 0 ? (
                                <a href={a.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                  {a.image && (
                                    <img src={`https://wsrv.nl/?url=${encodeURIComponent(a.image)}&w=128&h=128&fit=cover`} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border/50" alt="" />
                                  )}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h5 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h5>
                                    <span className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">{a.source.name} <ExternalLink className="w-3 h-3" /></span>
                                  </div>
                                </a>
                              ) : (
                                <Link to={`/news/${a.id}`} className="group flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                  {a.image && (
                                    <img src={`https://wsrv.nl/?url=${encodeURIComponent(a.image)}&w=128&h=128&fit=cover`} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border/50" alt="" />
                                  )}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h5 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h5>
                                    <span className="text-xs text-muted-foreground mt-1.5">{a.source.name}</span>
                                  </div>
                                </Link>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="max-w-3xl mx-auto lg:max-w-none w-full">
          {relatedArticles.length > 0 && !showFallback && (
            <div className="border-t border-border/30 pt-12">
              <div className="mb-6">
                <h3 className="font-headline-md text-[20px] text-foreground">Keep Reading</h3>
                <p className="text-muted-foreground text-sm mt-1">More on this story</p>
              </div>
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.06 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {relatedArticles.map((a) => (
                  <motion.div 
                    key={a.id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
                    }}
                  >
                    <RelatedArticleCard article={a} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </article>
    </>
  );
}