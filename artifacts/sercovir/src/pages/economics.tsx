import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign, Globe, Activity, Shield } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const COUNTRY_COLORS: Record<string, string> = {
  'United States': '#3b82f6',
  'China': '#ef4444',
  'Germany': '#f59e0b',
  'Japan': '#a855f7',
  'India': '#10b981',
  'United Kingdom': '#06b6d4',
  'France': '#ec4899',
  'Russia': '#f97316',
  'Saudi Arabia': '#84cc16',
  'Brazil': '#14b8a6',
  'Turkey': '#8b5cf6',
  'South Korea': '#64748b',
  'Australia': '#0ea5e9',
  'Ukraine': '#fbbf24',
  'Israel': '#6366f1',
};

const TOP8 = ['United States', 'China', 'Germany', 'Japan', 'India', 'United Kingdom', 'France', 'Russia'];

interface CountryData {
  id: string;
  name: string;
  flag: string;
  region: string;
  gdp: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  militaryPct: number;
  tradeBalance: number;
  debtPct: number;
  gdpHistory: { year: number; value: number }[];
  growthHistory: { year: number; value: number }[];
  riskScore: number;
  growthTrend: string;
}

interface EconData {
  countries: CountryData[];
  globalGdp: string;
  avgGrowth: string;
  avgInflation: string;
  lastUpdated: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded p-3 text-xs font-mono shadow-xl">
      <div className="text-muted-foreground mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-bold">${p.value.toFixed(2)}T</span>
        </div>
      ))}
    </div>
  );
}

function GrowthTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded p-3 text-xs font-mono shadow-xl">
      <div className="text-muted-foreground mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className={`font-bold ${p.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{p.value > 0 ? '+' : ''}{p.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Economics() {
  const { data, isLoading } = useQuery<EconData>({
    queryKey: ['economics'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/economics/data`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const gdpChartData = data ? (() => {
    const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    return years.map(year => {
      const point: Record<string, number | string> = { year };
      data.countries
        .filter(c => TOP8.includes(c.name))
        .forEach(c => {
          const h = c.gdpHistory.find(h => h.year === year);
          if (h) point[c.name] = h.value;
        });
      return point;
    });
  })() : [];

  const growthChartData = data ? (() => {
    const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    return years.map(year => {
      const point: Record<string, number | string> = { year };
      data.countries
        .filter(c => ['United States', 'China', 'India', 'Germany', 'Russia'].includes(c.name))
        .forEach(c => {
          const h = c.growthHistory.find(h => h.year === year);
          if (h) point[c.name] = h.value;
        });
      return point;
    });
  })() : [];

  const gdpRankData = data
    ? [...data.countries].sort((a, b) => b.gdp - a.gdp).map(c => ({
        name: c.flag + ' ' + c.name.replace('United ', 'U.'),
        fullName: c.name,
        gdp: c.gdp,
        growth: c.gdpGrowth,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight">ECONOMIC INTELLIGENCE</h1>
        <p className="text-muted-foreground font-mono mt-1 text-sm">
          Global GDP, growth trajectories, inflation, and economic stress indicators — {data?.countries.length} economies tracked.
          <span className="ml-2 text-xs text-primary/60">DATA: IMF/World Bank 2023 · UPDATED: {new Date(data?.lastUpdated || '').toLocaleDateString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Globe className="w-3 h-3" /> GLOBAL GDP (TRACKED)
            </div>
            <div className="text-2xl font-mono font-bold text-primary">${data?.globalGdp}T</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">USD, 2023 Current</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Activity className="w-3 h-3" /> AVG GROWTH RATE
            </div>
            <div className={`text-2xl font-mono font-bold ${parseFloat(data?.avgGrowth || '0') > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {parseFloat(data?.avgGrowth || '0') > 0 ? '+' : ''}{data?.avgGrowth}%
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Weighted, 2023</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" /> AVG INFLATION
            </div>
            <div className={`text-2xl font-mono font-bold ${parseFloat(data?.avgInflation || '0') > 5 ? 'text-red-400' : parseFloat(data?.avgInflation || '0') > 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {data?.avgInflation}%
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">CPI Year-on-Year</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Shield className="w-3 h-3" /> HIGHEST MIL. SPEND
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {data ? [...data.countries].sort((a, b) => b.militaryPct - a.militaryPct)[0]?.militaryPct.toFixed(1) : 0}%
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-1">
              {data ? [...data.countries].sort((a, b) => b.militaryPct - a.militaryPct)[0]?.flag + ' ' + [...data.countries].sort((a, b) => b.militaryPct - a.militaryPct)[0]?.name : ''} of GDP
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            GDP TRAJECTORY — TOP 8 ECONOMIES 2013–2023 (TRILLIONS USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={gdpChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {TOP8.map(name => (
                  <linearGradient key={name} id={`grad-${name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COUNTRY_COLORS[name]} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COUNTRY_COLORS[name]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}T`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '16px' }} />
              {TOP8.map(name => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COUNTRY_COLORS[name]}
                  strokeWidth={2}
                  fill={`url(#grad-${name.replace(/\s/g, '')})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              GDP RANKING 2023 (CURRENT USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={gdpRankData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}T`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontFamily: 'monospace', fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}T`, 'GDP']}
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #222', fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Bar dataKey="gdp" radius={[0, 3, 3, 0]}>
                  {gdpRankData.map((entry, i) => (
                    <Cell key={i} fill={COUNTRY_COLORS[entry.fullName] || '#666'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              GDP GROWTH RATES 2015–2023 (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                <Tooltip content={<GrowthTooltip />} />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '16px' }} />
                {['United States', 'China', 'India', 'Germany', 'Russia'].map(name => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COUNTRY_COLORS[name]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: COUNTRY_COLORS[name] }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm">ECONOMIC INDICATORS MATRIX — 2023 DATA</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-muted-foreground">COUNTRY</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">GDP (T)</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">GROWTH</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">INFLATION</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">UNEMPLOYMENT</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">MIL. SPEND</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">DEBT/GDP</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">TRADE BAL.</th>
                  <th className="px-4 py-3 text-right text-muted-foreground">TREND</th>
                </tr>
              </thead>
              <tbody>
                {data && [...data.countries].sort((a, b) => b.gdp - a.gdp).map((c, i) => {
                  const TrendIcon = c.growthTrend === 'accelerating' ? TrendingUp : c.growthTrend === 'decelerating' ? TrendingDown : Minus;
                  const trendColor = c.growthTrend === 'accelerating' ? 'text-emerald-400' : c.growthTrend === 'decelerating' ? 'text-red-400' : 'text-yellow-400';
                  return (
                    <tr key={c.id} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? 'bg-card/20' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span style={{ color: COUNTRY_COLORS[c.name] || '#888' }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold">${c.gdp.toFixed(2)}T</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${c.gdpGrowth > 3 ? 'text-emerald-400' : c.gdpGrowth > 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                        {c.gdpGrowth > 0 ? '+' : ''}{c.gdpGrowth.toFixed(1)}%
                      </td>
                      <td className={`px-4 py-2.5 text-right ${c.inflation > 10 ? 'text-red-400 font-bold' : c.inflation > 5 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {c.inflation.toFixed(1)}%
                      </td>
                      <td className={`px-4 py-2.5 text-right ${c.unemployment > 15 ? 'text-red-400 font-bold' : c.unemployment > 8 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {c.unemployment.toFixed(1)}%
                      </td>
                      <td className={`px-4 py-2.5 text-right ${c.militaryPct > 4 ? 'text-red-400 font-bold' : c.militaryPct > 2 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {c.militaryPct.toFixed(2)}%
                      </td>
                      <td className={`px-4 py-2.5 text-right ${c.debtPct > 100 ? 'text-red-400' : c.debtPct > 60 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {c.debtPct.toFixed(0)}%
                      </td>
                      <td className={`px-4 py-2.5 text-right ${c.tradeBalance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.tradeBalance > 0 ? '+' : ''}${c.tradeBalance}B
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`flex items-center justify-end gap-1 ${trendColor}`}>
                          <TrendIcon className="w-3 h-3" />
                          {c.growthTrend.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
