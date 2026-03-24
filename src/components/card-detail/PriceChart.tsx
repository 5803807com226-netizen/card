'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { PriceLog } from '@/types';

interface PriceChartProps {
  logs: PriceLog[];
}

interface ChartDataPoint {
  date: string;
  ebay?: number | null;
  japan?: number | null;
  thai?: number | null;
  profit?: number | null;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-text-muted mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="text-text font-medium">
              {entry.value != null ? `$${entry.value.toFixed(2)}` : '-'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PriceChart({ logs }: PriceChartProps) {
  const data: ChartDataPoint[] = logs
    .slice()
    .reverse()
    .map((log) => ({
      date: format(new Date(log.checked_at), 'd MMM', { locale: th }),
      ebay: log.ebay_price,
      japan: log.japan_price,
      profit: log.profit,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        ยังไม่มีข้อมูลราคา
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#2a2a3a' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="ebay"
          name="eBay"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="japan"
          name="Japan"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
