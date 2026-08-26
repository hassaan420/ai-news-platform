import { Activity, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  metric: string;
  icon?: string;
}

export default function SummaryCard({ title, metric, icon = 'monitoring' }: SummaryCardProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'monitoring': return <Activity className="w-4 h-4 text-white/90" />;
      case 'menu_book': return <BookOpen className="w-4 h-4 text-white/90" />;
      case 'schedule': return <Clock className="w-4 h-4 text-white/90" />;
      case 'trending_up': return <TrendingUp className="w-4 h-4 text-white/90" />;
      default: return <Activity className="w-4 h-4 text-white/90" />;
    }
  };

  return (
    <div className="bg-white/[0.12] backdrop-blur-xl border border-white/[0.2] rounded-2xl shadow-2xl p-5 hover:shadow-elevated transition-shadow flex flex-col justify-between h-full group">
      <h4 className="font-serif text-[18px] font-bold leading-tight text-white/90 group-hover:text-primary transition-colors mb-4 line-clamp-2">
        {title}
      </h4>
      <div className="flex items-center gap-2 mt-auto">
        {getIcon(icon)}
        <span className="text-[14px] font-medium text-white/90">{metric}</span>
      </div>
    </div>
  );
}
