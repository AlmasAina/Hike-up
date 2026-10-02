'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const NAVY = '#0a3175';
const GOLD = '#f3a60c';
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-AE', { month: 'short' });

export function MonthlyAreaChart({ data, color = 'navy', label }: { data: { month: string; count: number }[]; color?: 'navy' | 'gold'; label: string }) {
  const stroke = color === 'navy' ? NAVY : GOLD;
  return (
    <div className="h-64" role="img" aria-label={`${label}: ${data.map((d) => `${monthLabel(d.month)} ${d.count}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={(m) => monthLabel(String(m))} formatter={(v) => [v, label]} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Area type="monotone" dataKey="count" stroke={stroke} strokeWidth={2.5} fill={`url(#fill-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ServiceBarChart({ data }: { data: { service: string; count: number }[] }) {
  if (!data.length) return <p className="py-16 text-center text-sm text-slate-500">No requests yet.</p>;
  return (
    <div className="h-64" role="img" aria-label={`Requests by service: ${data.map((d) => `${d.service} ${d.count}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="service" width={130} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [v, 'Requests']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Bar dataKey="count" fill={GOLD} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
