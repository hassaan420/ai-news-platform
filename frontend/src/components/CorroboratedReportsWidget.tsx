import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { newsApi } from '@/api/newsApi';
import { Article } from '@/types/news';
import ArticleCard from '@/components/ArticleCard';

export default function CorroboratedReportsWidget() {
  const [verifiedArticles, setVerifiedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchVerified = async () => {
      try {
        setLoading(true);
        // Fetch a pool of latest articles to check
        const response = await newsApi.getLatestNews(0, 15);
        const articles = response.content;
        
        // Check verification status in parallel
        const verificationPromises = articles.map(article => 
          newsApi.getArticleVerification(Number(article.id))
            .then(verification => ({ article, verification }))
            .catch(() => ({ article, verification: null }))
        );
        
        const results = await Promise.all(verificationPromises);
        
        // Filter for heavily corroborated articles
        const corroborated = results
          .filter(res => res.verification && (res.verification.status === 'STRONGLY_CORROBORATED' || res.verification.status === 'PARTIALLY_CORROBORATED'))
          .map(res => res.article);
          
        if (mounted) {
          // Take the top 4
          setVerifiedArticles(corroborated.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch verified articles", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVerified();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif font-bold text-[26px] text-white drop-shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Consensus Reports
          </h2>
        </div>
        <div className="flex justify-center py-12 bg-black/20 backdrop-blur-md rounded-2xl border border-white/[0.1]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin opacity-75" />
        </div>
      </section>
    );
  }

  if (verifiedArticles.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h2 className="font-serif font-bold text-[26px] text-white drop-shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Consensus Reports
          </h2>
          <p className="text-sm text-gray-300 font-medium mt-1 ml-8">
            Stories independently verified by multiple external sources.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {verifiedArticles.map((article, i) => (
          <ArticleCard key={`verified-${article.id}`} article={article} index={i} />
        ))}
      </div>
    </section>
  );
}
