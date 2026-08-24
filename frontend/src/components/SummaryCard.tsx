interface SummaryCardProps {
  title: string;
  metric: string;
  icon?: string;
}

export default function SummaryCard({ title, metric, icon = 'monitoring' }: SummaryCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-subtle hover:shadow-elevated transition-shadow flex flex-col justify-between h-full group">
      <h4 className="font-serif text-[18px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2">
        {title}
      </h4>
      <div className="flex items-center gap-2 mt-auto">
        <span className="material-symbols-outlined text-[16px] text-muted-foreground">{icon}</span>
        <span className="text-[14px] font-medium text-muted-foreground">{metric}</span>
      </div>
    </div>
  );
}
