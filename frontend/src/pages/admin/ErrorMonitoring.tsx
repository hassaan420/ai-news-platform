import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';

export default function ErrorMonitoring() {
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const data = await adminApi.getErrorLogs(0, 50);
      setErrors(data.content || data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Error Monitoring</h1>
      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">System Errors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.map(err => (
                <tr key={err.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(err.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{err.serviceName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      err.severity === 'ERROR' || err.severity === 'CRITICAL' 
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' 
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {err.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[12px] break-all">{err.message}</td>
                </tr>
              ))}
              {errors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-4xl mb-2 text-emerald-500/50">check_circle</span>
                    <p>No system errors recorded.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
