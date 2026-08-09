import { useEffect, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { Activity } from 'lucide-react';

export default function SystemHealth() {
  const [health, setHealth] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await adminApi.getHealth();
      setHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center text-foreground"><Activity className="mr-3" /> System Health Monitor</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(health).map(([service, status]) => (
          <div key={service} className="bg-card rounded-xl p-6 shadow-premium flex flex-col justify-between hover:shadow-premium-hover transition-shadow">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">{service}</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {status === 'UP' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'UP' ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
              </div>
              <div className={`text-2xl font-bold ${status === 'UP' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
