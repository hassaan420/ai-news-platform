import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

const data = [
  { subject: 'Policy Support', A: 120, B: 110, fullMark: 150 },
  { subject: 'Public Approval', A: 98, B: 130, fullMark: 150 },
  { subject: 'Media Sentiment', A: 86, B: 130, fullMark: 150 },
  { subject: 'Economic Impact', A: 99, B: 100, fullMark: 150 },
  { subject: 'Social Impact', A: 85, B: 90, fullMark: 150 },
  { subject: 'Voter Turnout', A: 65, B: 85, fullMark: 150 },
];

export default function RadarChartViz() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-serif font-bold text-lg text-foreground">Political Sentiment Radar</h4>
          <p className="text-xs text-muted-foreground">Key Policy Indicators</p>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--border)" opacity={0.5} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Radar name="Current Administration" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
            <Radar name="Opposition" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
