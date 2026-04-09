import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ComposedChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Package, ShieldOff, Globe } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface CountryData {
  id: string;
  name: string;
  flag: string;
  tradeBalance: number;
  gdp: number;
  gdpGrowth: number;
}

interface SanctionData {
  target: string;
  by: string[];
  type: string;
  sectors: string[];
  intensity: number;
  since: string;
}

interface EconData {
  countries: CountryData[];
  sanctions: SanctionData[];
}

const FLAG_MAP: Record<string, string> = {
  'United States': '🇺🇸', 'China': '🇨🇳', 'Germany': '🇩🇪', 'Japan': '🇯🇵',
  'India': '🇮🇳', 'United Kingdom': '🇬🇧', 'France': '🇫🇷', 'Russia': '🇷🇺',
  'Saudi Arabia': '🇸🇦', 'Brazil': '🇧🇷', 'Turkey': '🇹🇷', 'South Korea': '🇰🇷',
  'Australia': '🇦🇺', 'Ukraine': '🇺🇦', 'Israel': '🇮🇱',
};

const TRADE_PARTNER_DATA = [
  { pair: 'US ↔ China', usExports: 148, usImports: 500, balance: -352, volume: 648 },
  { pair: 'US ↔ EU', usExports: 370, usImports: 553, balance: -183, volume: 923 },
  { pair: 'China ↔ EU', usExports: 231, usImports: 427, balance: -196, volume: 658 },
  { pair: 'China ↔ ASEAN', usExports: 450, usImports: 320, balance: 130, volume: 770 },
  { pair: 'Germany ↔ China', usExports: 97, usImports: 191, balance: -94, volume: 288 },
  { pair: 'Russia ↔ China', usExports: 111, usImports: 110, balance: 1, volume: 221 },
  { pair: 'S.Korea ↔ China', usExports: 124, usImports: 196, balance: -72, volume: 320 },
];

const COMMODITY_DATA = [
  { commodity: 'Crude Oil', volume: 1420, unit: 'bn USD', dominantExporter: 'Saudi Arabia 🇸🇦', dominantImporter: 'China 🇨🇳' },
  { commodity: 'LNG / Gas', volume: 534, unit: 'bn USD', dominantExporter: 'Russia 🇷🇺', dominantImporter: 'EU 🇪🇺' },
  { commodity: 'Semiconductors', volume: 678, unit: 'bn USD', dominantExporter: 'S. Korea 🇰🇷', dominantImporter: 'China 🇨🇳' },
  { commodity: 'Automotive', volume: 1050, unit: 'bn USD', dominantExporter: 'Germany 🇩🇪', dominantImporter: 'United States 🇺🇸' },
  { commodity: 'Pharmaceuticals', volume: 387, unit: 'bn USD', dominantExporter: 'Germany 🇩🇪', dominantImporter: 'United States 🇺🇸' },
  { commodity: 'Agriculture', volume: 892, unit: 'bn USD', dominantExporter: 'United States 🇺🇸', dominantImporter: 'China 🇨🇳' },
  { commodity: 'Rare Earths', volume: 6.8, unit: 'bn USD', dominantExporter: 'China 🇨🇳', dominantImporter: 'Japan 🇯🇵' },
  { commodity: 'Gold / Precious', volume: 310, unit: 'bn USD', dominantExporter: 'Australia 🇦🇺', dominantImporter: 'India 🇮🇳' },
];

export default function Trade() {
  const { data, isLoading } = useQuery<EconData>({
    queryKey: ['economics'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/economics/data`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const tradeBalanceData = data
    ? [...data.countries]
        .sort((a, b) => b.tradeBalance - a.tradeBalance)
        .map(c => ({
          name: (FLAG_MAP[c.name] || '') + ' ' + c.name.replace('United ', 'U.').replace(' Kingdom', '.K.'),
          fullName: c.name,
          balance: c.tradeBalance,
        }))
    : [];

  const surplusCountries = data?.countries.filter(c => c.tradeBalance > 0).length || 0;
  const deficitCountries = data?.countries.filter(c => c.tradeBalance < 0).length || 0;
  const totalSurplus = data?.countries.reduce((s, c) => c.tradeBalance > 0 ? s + c.tradeBalance : s, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight">GLOBAL TRADE NETWORKS</h1>
        <p className="text-muted-foreground font-mono mt-1 text-sm">
          Trade balances, bilateral flows, commodity markets, and economic sanctions tracker.
          <span className="ml-2 text-xs text-primary/60">SOURCE: WTO / UN COMTRADE / OFAC 2023</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-xs font-mono text-muted-foreground mb-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> SURPLUS ECONOMIES
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{surplusCountries}</div>
            <div className="text-xs font-mono text-muted-foreground">Total: +${totalSurplus}B net</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-xs font-mono text-muted-foreground mb-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-red-400" /> DEFICIT ECONOMIES
            </div>
            <div className="text-2xl font-mono font-bold text-red-400">{deficitCountries}</div>
            <div className="text-xs font-mono text-muted-foreground">Tracked in this dataset</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-xs font-mono text-muted-foreground mb-1 flex items-center gap-1">
              <ShieldOff className="w-3 h-3 text-amber-400" /> ACTIVE SANCTIONS REGIMES
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">{data?.sanctions.length || 0}</div>
            <div className="text-xs font-mono text-muted-foreground">Multi-lateral & unilateral</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            CURRENT ACCOUNT BALANCE BY ECONOMY (USD BILLIONS) — 2023
            <span className="text-xs text-muted-foreground ml-auto font-normal">Positive = surplus | Negative = deficit</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={tradeBalanceData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${v}B`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}B`, 'Trade Balance']}
                contentStyle={{ background: '#0a0a0a', border: '1px solid #222', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Bar dataKey="balance" radius={[3, 3, 0, 0]}>
                {tradeBalanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.balance > 0 ? '#10b981' : '#ef4444'} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              MAJOR BILATERAL TRADE FLOWS (USD BILLIONS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={TRADE_PARTNER_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="pair" tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}B`} />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #222', fontFamily: 'monospace', fontSize: '11px' }}
                  formatter={(v: number) => `$${v}B`}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                <Bar dataKey="usExports" name="Exports" fill="#10b981" opacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar dataKey="usImports" name="Imports" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              GLOBAL COMMODITY MARKETS — ANNUAL VOLUME
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {COMMODITY_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/10 text-xs font-mono">
                  <div className="font-bold text-foreground w-32">{item.commodity}</div>
                  <div className="text-primary font-bold">${item.volume}{item.volume < 100 ? 'B' : 'B'}</div>
                  <div className="text-muted-foreground text-[10px] text-right">
                    <div className="text-emerald-400">{item.dominantExporter}</div>
                    <div className="text-red-400">→ {item.dominantImporter}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <ShieldOff className="w-4 h-4 text-amber-400" />
            ECONOMIC SANCTIONS MATRIX — ACTIVE REGIMES
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-muted-foreground">TARGET</th>
                  <th className="px-4 py-3 text-left text-muted-foreground">TYPE</th>
                  <th className="px-4 py-3 text-left text-muted-foreground">SECTORS</th>
                  <th className="px-4 py-3 text-left text-muted-foreground">IMPOSED BY</th>
                  <th className="px-4 py-3 text-center text-muted-foreground">SINCE</th>
                  <th className="px-4 py-3 text-center text-muted-foreground">INTENSITY</th>
                </tr>
              </thead>
              <tbody>
                {data?.sanctions.sort((a, b) => b.intensity - a.intensity).map((s, i) => (
                  <tr key={i} className={`border-b border-border/30 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? 'bg-card/20' : ''}`}>
                    <td className="px-4 py-3 font-bold text-foreground">{s.target}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] uppercase ${
                        s.type === 'Comprehensive' ? 'border-red-500/50 text-red-400' :
                        s.type === 'Nuclear' || s.type === 'Nuclear/JCPOA' ? 'border-orange-500/50 text-orange-400' :
                        'border-yellow-500/50 text-yellow-400'
                      }`}>{s.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.sectors.slice(0, 3).map((sec, j) => (
                          <span key={j} className="px-1 py-0.5 bg-muted/30 border border-border/50 rounded text-[10px]">{sec}</span>
                        ))}
                        {s.sectors.length > 3 && <span className="text-muted-foreground text-[10px]">+{s.sectors.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.by.join(', ')}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s.since}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted/30 rounded h-1.5">
                          <div
                            className={`h-1.5 rounded ${s.intensity >= 85 ? 'bg-red-500' : s.intensity >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                            style={{ width: `${s.intensity}%` }}
                          />
                        </div>
                        <span className={`w-8 text-right font-bold ${s.intensity >= 85 ? 'text-red-400' : s.intensity >= 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                          {s.intensity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
