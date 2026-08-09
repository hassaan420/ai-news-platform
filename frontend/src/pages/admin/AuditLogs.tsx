import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await adminApi.getAuditLogs(0, 50);
      setLogs(data.content || data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
      <div className="bg-card rounded-xl shadow-premium overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">Recent Admin Actions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{log.actor}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary uppercase">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="font-medium text-foreground">{log.entityType}</span> ({log.entityId})
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{log.description}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No audit logs available.
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
