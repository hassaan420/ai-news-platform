import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment: string;
  score?: number;
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  if (!sentiment) return null;

  const getSentimentConfig = () => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return { icon: Smile, className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/15' };
      case 'negative':
        return { icon: Frown, className: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/15' };
      default:
        return { icon: Meh, className: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const { icon: Icon, className } = getSentimentConfig();

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-0.5 ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{sentiment}</span>
    </Badge>
  );
}
