import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Globe, Activity, TrendingUp, AlertTriangle, Zap, Target, BarChart2, Clock } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Country {
  id: number;
  name: string;
  flagEmoji?: string;
  region: string;
  threatLevel: string;
  stabilityIndex?: number;
  gdp?: number;
  militaryBudget?: number;
}

interface Conflict {
  id: number;
  title: string;
  region: string;
  status: string;
  severity: string;
}

type ThreatDimension = {
  axis: string;
  value: number;
  max: number;
};

const THREAT_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  critical: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500" },
  high: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", dot: "bg-orange-500" },
  elevated: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", dot: "bg-yellow-500" },
  low: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-500" },
  moderate: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-500" },
};

const REGIONS = ["Europe", "Middle East", "Asia-Pacific", "Africa", "Americas", "Central Asia"];

function ThreatBar({ value, max = 100, color = "#ef4444" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ThreatCell({ level }: { level: string }) {
  const styles = THREAT_COLORS[level] || THREAT_COLORS.low;
  return (
    <div className={`flex items-center justify-center p-1.5 rounded border ${styles.bg} ${styles.border}`}>
      <span className={`font-mono text-[10px] uppercase font-bold ${styles.text}`}>{level}</span>
    </div>
  );
}

function computeThreatScore(country: Country, conflicts: Conflict[]): number {
  let score = 0;
  if (country.threatLevel === "critical") score += 40;
  else if (country.threatLevel === "high") score += 28;
  else if (country.threatLevel === "elevated") score += 18;
  else score += 5;
  if (country.stabilityIndex != null) {
    score += (100 - Number(country.stabilityIndex)) * 0.3;
  }
  const regionConflicts = conflicts.filter(c => 
    c.region.toLowerCase().includes(country.region.toLowerCase().split(" ")[0]) &&
    (c.status === "active" || c.status === "escalating")
  );
  score += regionConflicts.length * 6;
  return Math.min(100, Math.round(score));
}

function computeRadarData(country: Country, conflicts: Conflict[]): ThreatDimension[] {
  const stability = country.stabilityIndex ? 100 - Number(country.stabilityIndex) : 50;
  const militaryBudgetScore = country.militaryBudget ? Math.min(100, Number(country.militaryBudget) / 5e10 * 60) : 20;
  const conflictExposure = Math.min(100, conflicts.filter(c => c.status === "active" || c.status === "escalating").length * 10);
  const threatScore = country.threatLevel === "critical" ? 90 : country.threatLevel === "high" ? 70 : country.threatLevel === "elevated" ? 50 : 20;

  return [
    { axis: "Political", value: Math.round(threatScore * 0.8 + stability * 0.2), max: 100 },
    { axis: "Military", value: Math.round(militaryBudgetScore), max: 100 },
    { axis: "Economic", value: Math.round(stability * 0.6 + 20), max: 100 },
    { axis: "Conflict", value: Math.round(conflictExposure), max: 100 },
    { axis: "Stability", value: Math.round(stability), max: 100 },
    { axis: "Sanctions", value: Math.round(threatScore * 0.5), max: 100 },
  ];
}

export default function ThreatMatrix() {
  const { data: countries, isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/countries`);
      return r.json();
    },
    staleTime: 30_000,
  });

  const { data: conflicts } = useQuery<Conflict[]>({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/conflicts`);
      return r.json();
    },
    staleTime: 30_000,
  });

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");

  const allConflicts = conflicts || [];

  const displayCountries = (countries || [])
    .filter(c => selectedRegion === "all" || c.region === selectedRegion)
    .map(c => ({ ...c, score: computeThreatScore(c, allConflicts) }))
    .sort((a, b) => b.score - a.score);

  const criticalCount = (countries || []).filter(c => c.threatLevel === "critical").length;
  const highCount = (countries || []).filter(c => c.threatLevel === "high").length;
  const elevatedCount = (countries || []).filter(c => c.threatLevel === "elevated").length;
  const activeConflictsCount = allConflicts.filter(c => c.status === "active" || c.status === "escalating").length;

  const radarData = selectedCountry ? computeRadarData(selectedCountry, allConflicts) : [];

  const regionConflictMap: Record<string, number> = {};
  for (const c of allConflicts) {
    if (c.status === "active" || c.status === "escalating") {
      regionConflictMap[c.region] = (regionConflictMap[c.region] || 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold tracking-tight">THREAT MATRIX</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Multi-dimensional threat assessment across all monitored entities
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CRITICAL NATIONS", value: criticalCount, icon: ShieldAlert, color: "text-red-500" },
          { label: "HIGH THREAT", value: highCount, icon: AlertTriangle, color: "text-orange-500" },
          { label: "ELEVATED RISK", value: elevatedCount, icon: Zap, color: "text-yellow-500" },
          { label: "ACTIVE CONFLICTS", value: activeConflictsCount, icon: Target, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 opacity-20 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm">COUNTRY THREAT SCORES</CardTitle>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedRegion("all")}
                    className={`px-2 py-1 rounded text-[10px] font-mono uppercase border transition-all ${selectedRegion === "all" ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border"}`}
                  >all</button>
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(r)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${selectedRegion === r ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border"}`}
                    >{r.split(" ")[0]}</button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {countriesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {displayCountries.map((c, idx) => {
                    const styles = THREAT_COLORS[c.threatLevel] || THREAT_COLORS.low;
                    const barColor = c.threatLevel === "critical" ? "#ef4444" : c.threatLevel === "high" ? "#f97316" : c.threatLevel === "elevated" ? "#eab308" : "#22c55e";
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCountry(cc => cc?.id === c.id ? null : c)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedCountry?.id === c.id ? `${styles.bg} ${styles.border}` : "border-border/50 hover:bg-muted/20"
                        }`}
                      >
                        <span className="font-mono text-xs text-muted-foreground w-6 text-center">{idx + 1}</span>
                        <span className="text-lg">{c.flagEmoji || "🏳"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold truncate">{c.name}</span>
                            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${styles.text} ${styles.border}`}>
                              {c.threatLevel}
                            </Badge>
                          </div>
                          <ThreatBar value={c.score} color={barColor} />
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-mono text-sm font-bold ${styles.text}`}>{c.score}</span>
                          <p className="font-mono text-[10px] text-muted-foreground">/ 100</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedCountry ? (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <span>{selectedCountry.flagEmoji}</span>
                  {selectedCountry.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(100,100,120,0.3)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} />
                      <Radar
                        name={selectedCountry.name}
                        dataKey="value"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v}/100`, ""]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontFamily: "monospace", fontSize: 11 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {radarData.map(d => (
                    <div key={d.axis} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-muted-foreground">{d.axis}</span>
                        <span className={d.value > 60 ? "text-red-400" : d.value > 40 ? "text-yellow-400" : "text-emerald-400"}>{d.value}</span>
                      </div>
                      <ThreatBar value={d.value} color={d.value > 60 ? "#ef4444" : d.value > 40 ? "#eab308" : "#22c55e"} />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Stability Index</span>
                    <span>{selectedCountry.stabilityIndex ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Region</span>
                    <span>{selectedCountry.region}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Target className="w-10 h-10 text-primary/20 mx-auto mb-3" />
                <p className="font-mono text-xs text-muted-foreground">Select a country to view detailed threat radar</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-sm">CONFLICT HOTSPOTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(regionConflictMap).sort((a, b) => b[1] - a[1]).map(([region, count]) => (
                <div key={region} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground flex-1 truncate">{region}</span>
                  <div className="flex items-center gap-1.5">
                    {[...Array(Math.min(count, 5))].map((_, i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-red-500" />
                    ))}
                    {count > 5 && <span className="text-red-400 font-mono text-[10px]">+{count - 5}</span>}
                  </div>
                  <span className="font-mono text-xs font-bold text-red-400 w-6 text-right">{count}</span>
                </div>
              ))}
              {Object.keys(regionConflictMap).length === 0 && (
                <p className="font-mono text-xs text-muted-foreground text-center py-4">No active conflicts tracked</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-sm">THREAT DISTRIBUTION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(THREAT_COLORS).map(([level, styles]) => {
                const count = (countries || []).filter(c => c.threatLevel === level).length;
                if (!count && level === "moderate") return null;
                const total = (countries || []).length || 1;
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className={`uppercase ${styles.text}`}>{level}</span>
                      <span className="text-muted-foreground">{count} nations ({Math.round(count / total * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${styles.dot}`} style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
