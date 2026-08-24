import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'EV Market', value: 400 },
  { name: 'Traditional Auto', value: 300 },
  { name: 'Autonomous Tech', value: 300 },
  { name: 'Battery Tech', value: 200 },
];

const COLORS = ['#10b981', '#64748b', '#3b82f6', '#f59e0b'];

export default function MarketShareChart() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-serif font-bold text-lg text-foreground">Market Share Breakdown</h4>
          <p className="text-xs text-muted-foreground">Automotive & Mobility Sector</p>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
