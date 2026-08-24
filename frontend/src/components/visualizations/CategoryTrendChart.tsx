import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface CategoryTrendChartProps {
  data: ChartDataPoint[];
}

const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({ data }) => {
  // Use a nice gradient purple for the fill
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#6b7280' }} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(val: any) => {
            // format 'YYYY-MM-DD' to 'MMM DD'
            const date = new Date(val);
            if (isNaN(date.getTime())) return val;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
          itemStyle={{ color: '#8b5cf6' }}
          labelFormatter={(val: any) => {
            const date = new Date(val);
            if (isNaN(date.getTime())) return val;
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CategoryTrendChart;
