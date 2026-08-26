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
    <div className="space-y-8 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col gap-2 mb-10">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary-theme/95 flex items-center gap-4">
          <Activity className="w-10 h-10 text-primary-theme" strokeWidth={1.5} /> 
          System Health Monitor
        </h1>
        <p className="text-muted-theme text-sm sm:text-base font-medium tracking-wide max-w-2xl">
          Real-time operational status and connectivity across all internal microservices.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10">
        {Object.entries(health).map(([service, status]) => (
          <div key={service} className="group relative">
            {/* Hover glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-theme/30 to-blue-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            
            <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl shadow-premium flex flex-col justify-between transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-black/50">
              <h2 className="text-xs font-bold text-muted-theme uppercase tracking-[0.2em] mb-6">{service}</h2>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold tracking-tight ${status === 'UP' ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {status}
                </div>
                <div className="relative flex h-4 w-4">
                  {status === 'UP' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>}
                  <span className={`relative inline-flex rounded-full h-4 w-4 ${status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'}`}></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 relative z-10 mt-12">
        <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-premium overflow-hidden h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-primary-theme">Infrastructure Metrics</h2>
          </div>
          <iframe 
            src="http://localhost:3001/d/e050a081-68d5-47d3-b0cf-1196e618fe2f/infrastructure-metrics-dbs-docker-k8s?orgId=1&kiosk" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            className="flex-1"
          />
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-premium overflow-hidden h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-primary-theme">JVM & Micrometer</h2>
          </div>
          <iframe 
            src="http://localhost:3001/d/0356e1a9-8fec-493f-a31d-5228f89b8016/jvm-and-application-metrics?orgId=1&kiosk" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
