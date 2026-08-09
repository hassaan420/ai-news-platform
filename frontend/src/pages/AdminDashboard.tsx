import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminStats } from '@/store/adminSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, status } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div className="space-y-8 max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-max_content_width mx-auto w-full flex-grow flex flex-col gap-gutter pb-12 mt-8 md:mt-0"
    >
      <div className="mb-2">
        <h1 className="font-display-lg text-[32px] font-bold text-foreground tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and management metrics.</p>
      </div>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-card rounded-xl p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-muted-foreground">Total Users</span>
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">group</span>
          </div>
          <div>
            <div className="font-display-lg text-[32px] font-bold text-foreground mb-1">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +12% <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-muted-foreground">Total Articles</span>
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">article</span>
          </div>
          <div>
            <div className="font-display-lg text-[32px] font-bold text-foreground mb-1">{stats?.totalArticles || 0}</div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span> +18% <span className="text-muted-foreground ml-1">since last week</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-muted-foreground">Active Sessions</span>
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">monitoring</span>
          </div>
          <div>
            <div className="font-display-lg text-[32px] font-bold text-foreground mb-1">{stats?.activeSessions || 0}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">Currently online</div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] font-medium text-muted-foreground">System Status</span>
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">settings</span>
          </div>
          <div>
            <div className={`font-display-lg text-[24px] font-bold mb-2 ${stats?.systemHealth === 'UP' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              {stats?.systemHealth || 'UNKNOWN'}
            </div>
            <div className="text-sm text-muted-foreground">All microservices running</div>
          </div>
        </div>
      </section>

      {/* Admin Tools Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
        {[
          { title: 'User Management', path: '/admin/users', icon: 'group', desc: 'Manage roles and status' },
          { title: 'Article Control', path: '/admin/articles', icon: 'article', desc: 'Feature and hide articles' },
          { title: 'System Health', path: '/admin/health', icon: 'monitoring', desc: 'Service status checks' },
          { title: 'Audit Logs', path: '/admin/audit', icon: 'list_alt', desc: 'View admin actions' },
          { title: 'Error Monitor', path: '/admin/errors', icon: 'error', desc: 'System error reports' },
          { title: 'Settings', path: '/admin/settings', icon: 'settings', desc: 'Global configurations' }
        ].map((link, idx) => (
          <Link key={idx} to={link.path} className="bg-card rounded-xl p-4 flex flex-col shadow-subtle hover:shadow-premium transition-shadow">
            <span className="material-symbols-outlined text-muted-foreground mb-3">{link.icon}</span>
            <span className="text-sm font-semibold text-foreground mb-1">{link.title}</span>
            <span className="text-[12px] text-muted-foreground">{link.desc}</span>
          </Link>
        ))}
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-card rounded-xl p-6 shadow-premium">
          <h3 className="font-headline-md text-[22px] font-bold text-foreground mb-2">Platform Growth</h3>
          <p className="text-sm text-muted-foreground mb-6">User and article ingestion trends over the last 7 days.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="users" stroke="#34d399" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="articles" stroke="#818cf8" fillOpacity={1} fill="url(#colorArticles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-premium">
          <h3 className="font-headline-md text-[22px] font-bold text-foreground mb-2">Recent System Activity</h3>
          <p className="text-sm text-muted-foreground mb-6">Automated tasks and administrative actions.</p>
          
          <div className="space-y-6">
            {(stats?.recentActivity || []).length > 0 ? (
              (stats?.recentActivity || []).map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="material-symbols-outlined text-muted-foreground text-[16px]">bolt</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <span className="text-[12px] text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-muted-foreground text-[16px]">info</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-foreground">No recent activity</span>
                    <span className="text-[12px] text-muted-foreground">Just now</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">System is running normally with no recent logged events.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Panel */}
      <section className="bg-card rounded-xl p-6 shadow-premium">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-muted-foreground">psychology</span>
          <h3 className="font-headline-md text-[22px] font-bold text-foreground">AI Pipeline Metrics</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Gemini processing queue and insights overview.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border/40 rounded-lg p-4">
            <div className="text-[12px] text-muted-foreground mb-1">Total Processed</div>
            <div className="font-display-lg text-[24px] font-bold text-foreground">{stats?.aiStats?.aiTasksCompleted || 0}</div>
          </div>
          <div className="bg-background border border-border/40 rounded-lg p-4">
            <div className="text-[12px] text-muted-foreground mb-1">Processing</div>
            <div className="font-display-lg text-[24px] font-bold text-amber-600 dark:text-amber-400">{stats?.aiStats?.aiTasksPending || 0}</div>
          </div>
          <div className="bg-background border border-border/40 rounded-lg p-4">
            <div className="text-[12px] text-muted-foreground mb-1">Avg Confidence</div>
            <div className="font-display-lg text-[24px] font-bold text-foreground">
              {stats?.aiStats?.avgAiConfidence ? Math.round(stats.aiStats.avgAiConfidence * 100) : 0}%
            </div>
          </div>
          <div className="bg-background border border-border/40 rounded-lg p-4">
            <div className="text-[12px] text-muted-foreground mb-1">Avg Processing Time</div>
            <div className="font-display-lg text-[24px] font-bold text-foreground">
              {stats?.aiStats?.avgProcessingTimeMs ? (stats.aiStats.avgProcessingTimeMs / 1000).toFixed(1) : '0.0'}s
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
