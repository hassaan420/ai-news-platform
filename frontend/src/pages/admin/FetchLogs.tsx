import { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface FetchLog {
  id: number;
  sourceId: number;
  status: string;
  articlesFetched: number;
  articlesStored: number;
  duplicatesSkipped: number;
  errorMessage: string | null;
  fetchedAt: string;
  executionTimeMs: number;
}

export default function FetchLogs() {
  const [logs, setLogs] = useState<FetchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFetchLogs(0, 50);
      setLogs(data.content || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to retrieve fetch logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    try {
      await adminApi.triggerScheduler();
      toast({ title: 'Scheduler Triggered', description: 'News fetching process started.' });
      setTimeout(fetchLogs, 5000); // Reload logs after a few seconds
    } catch (error) {
      toast({ title: 'Trigger Failed', description: 'Failed to start scheduler', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-display-lg text-[32px] font-bold text-foreground">Fetch Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor automated news ingestion</p>
        </div>
        <button 
          onClick={handleManualTrigger}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium shadow-subtle transition-colors flex items-center"
        >
          <span className="material-symbols-outlined mr-2 text-[20px]">bolt</span>
          Trigger Fetch Now
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-premium overflow-hidden border border-border">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Source ID</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Fetched</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Stored</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Skipped</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Time (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground">{new Date(log.fetchedAt).toLocaleString()}</td>
                    <td className="p-4 text-sm">{log.sourceId || 'ALL'}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                        log.status === 'FAILED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {log.status}
                      </span>
                      {log.errorMessage && (
                        <p className="text-xs text-destructive mt-1 max-w-xs truncate" title={log.errorMessage}>
                          {log.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">{log.articlesFetched}</td>
                    <td className="p-4 text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">{log.articlesStored}</td>
                    <td className="p-4 text-sm text-right text-muted-foreground">{log.duplicatesSkipped}</td>
                    <td className="p-4 text-sm text-right text-muted-foreground">{log.executionTimeMs}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No fetch logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
