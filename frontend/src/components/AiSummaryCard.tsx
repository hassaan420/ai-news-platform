import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiSummaryCardProps {
  summary: string;
}

export function AiSummaryCard({ summary }: AiSummaryCardProps) {
  if (!summary) return null;

  return (
    <Card className="my-6 bg-primary/5 dark:bg-primary/10 border-primary/15 dark:border-primary/20 shadow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          AI Generated Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
