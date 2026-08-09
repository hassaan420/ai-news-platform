import { useEffect, useState } from 'react';
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
import ArticleCard from '@/components/ArticleCard';
import { newsApi } from '@/api/newsApi';
// It is usually better to import types at the top rather than inline
import { Article } from '@/types/news';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { currentArticle: article, status, error, categoryNews } = useAppSelector((state) => state.news);

  // FIXED: Moved useState to the top level, out of the broken useEffect
  const [aiRelatedArticles, setAiRelatedArticles] = useState<Article[]>([]);

  // FIXED: Removed the duplicate, unclosed useEffect. This one handles both actions.
  useEffect(() => {
    if (id) {
      dispatch(fetchArticleById(Number(id)));
      newsApi.getRelatedArticles(Number(id))
        .then(res => setAiRelatedArticles(res))
        .catch(console.error);
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
    ? aiRelatedArticles.slice(0, 3)
    : (categoryNews[article.category]?.content?.filter(a => a.id !== article.id).slice(0, 3) || []);

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    const lower = sentiment.toLowerCase();
    if (lower === 'positive') return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20"><TrendingUp className="w-3 h-3 mr-1" /> Positive</Badge>;
    if (lower === 'negative') return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 border-rose-500/20"><TrendingDown className="w-3 h-3 mr-1" /> Negative</Badge>;
    return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-border"><Minus className="w-3 h-3 mr-1" /> Neutral</Badge>;
  };

  return (
    <article className="pb-12 px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors cursor-pointer bg-transparent border-0 p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to previous
        </button>

        <header className="mb-10 space-y-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">{article.category}</span>
            <span className="text-sm font-medium text-muted-foreground">{article.source.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground font-serif">
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

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-8 border-y border-border/40 py-4">
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

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 font-serif">
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

        <div className="flex justify-center border-t border-b border-border/30 py-10 mb-16 bg-card rounded-2xl shadow-subtle">
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

        {relatedArticles.length > 0 && (
          <div className="border-t border-border/30 pt-12">
            <h3 className="text-2xl font-bold mb-6 text-foreground">More from {article.category}</h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedArticles.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}