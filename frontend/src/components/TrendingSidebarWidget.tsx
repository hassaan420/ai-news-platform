import React from 'react';
import { useAppSelector } from '@/store/hooks';
import TrendingCard from '@/components/TrendingCard';
import { Flame } from 'lucide-react';

export default function TrendingSidebarWidget() {
  const trendingNews = useAppSelector((state) => state.news.trendingNews);
  
  if (!trendingNews || trendingNews.content.length === 0) return null;

  // Limit to exactly 5 articles
  const articles = trendingNews.content.slice(0, 5);

  return (
    <section className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.2] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.15]">
        <h2 className="font-serif text-[22px] font-bold text-white drop-shadow-sm flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Trending Now
        </h2>
      </div>
      <div className="space-y-4">
        {articles.map((article, i) => (
          <TrendingCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </section>
  );
}
