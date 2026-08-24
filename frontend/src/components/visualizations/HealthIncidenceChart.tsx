import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { month: 'Jan', newCases: 4000, recoveries: 2400 },
  { month: 'Feb', newCases: 3000, recoveries: 1398 },
  { month: 'Mar', newCases: 2000, recoveries: 9800 },
  { month: 'Apr', newCases: 2780, recoveries: 3908 },
  { month: 'May', newCases: 1890, recoveries: 4800 },
  { month: 'Jun', newCases: 2390, recoveries: 3800 },
  { month: 'Jul', newCases: 3490, recoveries: 4300 },
];

export default function HealthIncidenceChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-serif font-bold text-lg text-foreground">Global Disease Incidence</h4>
          <p className="text-xs text-muted-foreground">Trailing 7-month velocity</p>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRecoveries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Area type="monotone" dataKey="newCases" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCases)" />
            <Area type="monotone" dataKey="recoveries" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecoveries)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
