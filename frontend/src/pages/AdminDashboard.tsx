import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminStats } from '@/store/adminSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Newspaper, Activity, Server,
  UserCog, Rss, LayoutGrid, History,
  FileText, HeartPulse, ClipboardList, AlertCircle,
  Settings, Brain, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react';

const adminTools = [
  { title: 'User Management',    path: '/admin/users',      icon: UserCog,       desc: 'Manage roles and status' },
  { title: 'Source Management',  path: '/admin/sources',    icon: Rss,           desc: 'Manage news sources' },
  { title: 'Category Management',path: '/admin/categories', icon: LayoutGrid,    desc: 'Manage article categories' },
  { title: 'Fetch Logs',         path: '/admin/logs',       icon: History,       desc: 'Monitor ingestion jobs' },
  { title: 'Article Control',    path: '/admin/articles',   icon: FileText,      desc: 'Feature and hide articles' },
  { title: 'System Health',      path: '/admin/health',     icon: HeartPulse,    desc: 'Service status checks' },
  { title: 'Audit Logs',         path: '/admin/audit',      icon: ClipboardList, desc: 'View admin actions' },
  { title: 'Error Monitor',      path: '/admin/errors',     icon: AlertCircle,   desc: 'System error reports' },
  { title: 'Settings',           path: '/admin/settings',   icon: Settings,      desc: 'Global configs & Cache' },
];

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, status } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div className="space-y-8 max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0">
        <Skeleton className="h-10 w-64 mb-4 bg-black/5 dark:bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl bg-black/5 dark:bg-white/5" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl bg-black/5 dark:bg-white/5" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col items-center justify-center gap-4 pb-12 mt-8 md:mt-0 pt-20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary-theme">Access Denied or Failed to Load</h2>
        <p className="text-heading-theme text-center max-w-md">
          Unable to fetch dashboard statistics. If you recently changed your role, please <strong className="text-secondary-theme">log out and log back in</strong> to refresh your session token.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0 relative"
    >
      {/* Ambient rose/pink glow behind the dashboard */}
      <div className="ambient-rose-content" aria-hidden="true" />
      <div className="mb-2">
        <h1 className="font-serif text-[32px] font-bold text-heading-theme tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-sm text-secondary-theme">Platform overview and management metrics.</p>
      </div>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter relative z-10">
        {/* Total Users */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-secondary-theme uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-black/10 dark:bg-white/10 transition-colors">
              <Users className="w-4 h-4 text-primary-theme" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-heading-theme mb-1 leading-none">
              {stats?.totalUsers ?? 0}
            </div>
            <div className="text-sm text-secondary-theme flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Active accounts</span>
            </div>
          </div>
        </div>

        {/* Total Articles */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-secondary-theme uppercase tracking-wider">Total Articles</span>
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-black/10 dark:bg-white/10 transition-colors">
              <Newspaper className="w-4 h-4 text-primary-theme" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-heading-theme mb-1 leading-none">
              {stats?.totalArticles ?? 0}
            </div>
            <div className="text-sm text-secondary-theme flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-blue-500">Indexed & searchable</span>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-secondary-theme uppercase tracking-wider">Active Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-black/10 dark:bg-white/10 transition-colors">
              <Activity className="w-4 h-4 text-primary-theme" />
            </div>
          </div>
          <div>
            <div className="font-serif text-[32px] font-bold text-heading-theme mb-1 leading-none">
              {stats?.activeSessions ?? 0}
            </div>
            <div className="text-sm text-secondary-theme mt-2">Currently online</div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-secondary-theme uppercase tracking-wider">System Status</span>
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-black/10 dark:bg-white/10 transition-colors">
              <Server className="w-4 h-4 text-primary-theme" />
            </div>
          </div>
          <div>
            <div className={`font-serif text-[24px] font-bold mb-1 leading-none ${stats?.systemHealth === 'UP' ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats?.systemHealth || 'UNKNOWN'}
            </div>
            <div className="text-sm text-secondary-theme mt-2">
              {stats?.systemHealth === 'UP' ? 'All microservices running' : 'Check service health'}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Tools Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {adminTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Link
              key={idx}
              to={tool.path}
              className="glass-card glass-card-hover p-4 flex flex-col group border-border/60"
            >
              <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border group-hover:bg-black/10 dark:group-hover:bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3 transition-colors">
                <Icon className="w-4 h-4 text-primary-theme" />
              </div>
              <h3 className="font-sans font-semibold text-primary-theme text-[14px] leading-tight mb-1">{tool.title}</h3>
              <p className="font-sans text-[12px] text-muted-theme line-clamp-2">{tool.desc}</p>
            </Link>
          );
        })}
      </section>

      {/* Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter relative z-10">
        <div className="glass-card p-6">
          <h3 className="font-serif text-[20px] font-bold text-heading-theme mb-1">Platform Growth</h3>
          <p className="text-sm text-heading-theme mb-6">User and article ingestion trends over the last 7 days.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(8,8,15,0.95)',
                    color: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(20px)',
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <Area type="monotone" dataKey="users" stroke="#34d399" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="articles" stroke="#818cf8" fillOpacity={1} fill="url(#colorArticles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-serif text-[20px] font-bold text-heading-theme mb-1">Recent System Activity</h3>
          <p className="text-sm text-heading-theme mb-6">Automated tasks and administrative actions.</p>

          <div className="space-y-5">
            {(stats?.recentActivity || []).length > 0 ? (
              (stats?.recentActivity || []).map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-secondary-theme" />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-semibold text-secondary-theme truncate">{item.title}</span>
                      <span className="text-[11px] text-muted-theme shrink-0">{item.time}</span>
                    </div>
                    <p className="text-sm text-secondary-theme mt-0.5 line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-black/5 dark:bg-black/5 dark:bg-white/5 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-secondary-theme" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-primary-theme">No recent activity</span>
                    <span className="text-[11px] text-muted-theme">Just now</span>
                  </div>
                  <p className="text-sm text-secondary-theme mt-0.5">System is running normally with no recent logged events.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Pipeline Metrics */}
      <section className="glass-card p-6 relative z-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif text-[20px] font-bold text-primary-theme/95">AI Pipeline Metrics</h3>
        </div>
        <p className="text-sm text-secondary-theme mb-6">Gemini processing queue and insights overview.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4">
            <div className="text-[11px] text-secondary-theme mb-1 uppercase tracking-wider">Total Processed</div>
            <div className="font-serif text-[26px] font-bold text-heading-theme leading-none">
              {stats?.aiStats?.aiTasksCompleted ?? 0}
            </div>
          </div>
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4">
            <div className="text-[11px] text-secondary-theme mb-1 uppercase tracking-wider">Processing</div>
            <div className="font-serif text-[26px] font-bold text-amber-400 leading-none">
              {stats?.aiStats?.aiTasksPending ?? 0}
            </div>
          </div>
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4">
            <div className="text-[11px] text-secondary-theme mb-1 uppercase tracking-wider">Avg Confidence</div>
            <div className="font-serif text-[26px] font-bold text-heading-theme leading-none">
              {stats?.aiStats?.avgAiConfidence ? Math.round(stats.aiStats.avgAiConfidence * 100) : 0}%
            </div>
          </div>
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4">
            <div className="text-[11px] text-secondary-theme mb-1 uppercase tracking-wider">Avg Processing Time</div>
            <div className="font-serif text-[26px] font-bold text-heading-theme leading-none">
              {stats?.aiStats?.avgProcessingTimeMs ? (stats.aiStats.avgProcessingTimeMs / 1000).toFixed(1) : '0.0'}s
            </div>
          </div>
        </div>
      </section>

      {/* Observability Metrics */}
      <section className="glass-card p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif text-[20px] font-bold text-primary-theme/95">System Observability</h3>
              <p className="text-sm text-muted-theme">Live metrics from Prometheus and Loki.</p>
            </div>
          </div>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-black/5 dark:bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-border/50 rounded-lg transition-colors text-primary-theme"
          >
            Open Grafana <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-[11px] text-primary-theme/70 mb-2 uppercase tracking-wider font-semibold">Total HTTP Requests</div>
            <div className="font-serif text-[24px] font-bold text-heading-theme leading-none">
              {stats?.prometheus?.totalHttpRequests ? parseInt(stats.prometheus.totalHttpRequests).toLocaleString() : '0'}
            </div>
          </div>
          <div className="bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border/30 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-[11px] text-primary-theme/70 mb-2 uppercase tracking-wider font-semibold">JVM Memory Used</div>
            <div className="font-serif text-[24px] font-bold text-heading-theme leading-none">
              {stats?.prometheus?.jvmMemoryUsedBytes ? (parseInt(stats.prometheus.jvmMemoryUsedBytes) / (1024 * 1024)).toFixed(0) : '0'} MB
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
