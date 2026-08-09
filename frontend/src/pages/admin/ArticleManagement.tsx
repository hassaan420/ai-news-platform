import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';

export default function ArticleManagement() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await adminApi.getArticles(0, 50);
      setArticles(data.content || data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFeature = async (id: number, featured: boolean) => {
    await adminApi.featureArticle(id, !featured);
    fetchArticles();
  };

  const toggleHide = async (id: number, hidden: boolean) => {
    await adminApi.hideArticle(id, !hidden);
    fetchArticles();
  };

  const deleteArticle = async (id: number) => {
    if (confirm("Delete article?")) {
      await adminApi.deleteArticle(id);
      fetchArticles();
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Article Control Center</h1>
      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">Manage Articles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">AI Sentiment</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium max-w-md">
                    <div className="line-clamp-2">{a.title}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{a.source}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <span className="material-symbols-outlined text-[14px] mr-1">star</span> Featured
                        </span>
                      )}
                      {a.hidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          Hidden
                        </span>
                      )}
                      {!a.featured && !a.hidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                          Standard
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${getSentimentStyle(a.sentiment)}`}>
                      {a.sentiment} ({a.sentimentScore})
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3 whitespace-nowrap">
                    <button onClick={() => toggleFeature(a.id, a.featured)} className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                      {a.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => toggleHide(a.id, a.hidden)} className="text-amber-600 dark:text-amber-400 hover:opacity-80 text-sm font-medium transition-colors">
                      {a.hidden ? 'Show' : 'Hide'}
                    </button>
                    <button onClick={() => deleteArticle(a.id)} className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
