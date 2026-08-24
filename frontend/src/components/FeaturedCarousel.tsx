import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Article } from '@/types/news';
import HeroArticle from './HeroArticle';

interface FeaturedCarouselProps {
  articles: Article[];
}

export default function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <HeroArticle article={articles[currentIndex]} />
        </motion.div>
      </AnimatePresence>
      
      {/* Dots navigation */}
      {articles.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-background/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/20">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-primary' : 'bg-primary/20 hover:bg-primary/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
