import { useState, useEffect } from 'react';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import { isInternationalSource } from '@/lib/internationalSources';

interface UseInternationalHeadlinesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

/**
 * Returns a curated list of articles from internationally recognised outlets.
 *
 * Current implementation: fetches the latest 30 articles and filters by source
 * name using `isInternationalSource`.
 *
 * Future swap-out point: when the backend exposes a `?region=international`
 * query parameter (or a dedicated endpoint), replace only the data-fetching
 * logic inside this hook. The returned shape — `{ articles, loading, error }` —
 * must stay the same so all consumers continue to work without changes.
 */
export function useInternationalHeadlines(): UseInternationalHeadlinesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    newsApi
      .getLatestNews(0, 30)
      .then((res) => {
        if (cancelled) return;
        const filtered = res.content.filter((article) =>
          isInternationalSource(article.source.name)
        );
        setArticles(filtered);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load international headlines.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, loading, error };
}
