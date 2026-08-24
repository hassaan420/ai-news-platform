import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { year: '2019', ai: 400, hardware: 240, saas: 800 },
  { year: '2020', ai: 500, hardware: 280, saas: 900 },
  { year: '2021', ai: 800, hardware: 350, saas: 1100 },
  { year: '2022', ai: 1200, hardware: 400, saas: 1300 },
  { year: '2023', ai: 2400, hardware: 500, saas: 1400 },
  { year: '2024', ai: 3800, hardware: 600, saas: 1500 },
];

export default function TrendGrowthGraph() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-serif font-bold text-lg text-foreground">Sector Investment Trend</h4>
          <p className="text-xs text-muted-foreground">AI vs Hardware vs SaaS ($B)</p>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="saas" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="hardware" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Line type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
