import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ShieldAlert, Globe, Crosshair, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Conflict {
  id: number;
  title: string;
  description?: string;
  region: string;
  status: string;
  severity: string;
  partiesInvolved?: string[];
  casualties?: number;
}

interface Country {
  id: number;
  name: string;
  flagEmoji?: string;
  region: string;
  threatLevel: string;
}

const REGION_POSITIONS: Record<string, { x: number; y: number }> = {
  "Europe": { x: 48, y: 22 },
  "Eastern Europe": { x: 54, y: 22 },
  "Middle East": { x: 57, y: 34 },
  "Asia": { x: 72, y: 28 },
  "Asia-Pacific": { x: 78, y: 38 },
  "East Asia": { x: 76, y: 26 },
  "South Asia": { x: 67, y: 36 },
  "Central Asia": { x: 63, y: 28 },
  "Africa": { x: 50, y: 50 },
  "North Africa": { x: 47, y: 38 },
  "Sub-Saharan Africa": { x: 50, y: 58 },
  "West Africa": { x: 42, y: 52 },
  "East Africa": { x: 56, y: 54 },
  "Americas": { x: 22, y: 38 },
  "North America": { x: 18, y: 28 },
  "South America": { x: 26, y: 62 },
  "Latin America": { x: 22, y: 52 },
  "Caribbean": { x: 23, y: 42 },
  "Oceania": { x: 82, y: 66 },
  "Southeast Asia": { x: 76, y: 44 },
};

function getRegionPos(region: string): { x: number; y: number } {
  if (REGION_POSITIONS[region]) return REGION_POSITIONS[region];
  for (const [key, val] of Object.entries(REGION_POSITIONS)) {
    if (region.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(region.toLowerCase())) {
      return val;
    }
  }
  return { x: 50 + (Math.random() - 0.5) * 40, y: 40 + (Math.random() - 0.5) * 30 };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const SEVERITY_SIZES: Record<string, number> = {
  critical: 16,
  high: 12,
  medium: 9,
  low: 7,
};

export default function GeoMap() {
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "escalating">("all");

  const { data: conflicts, isLoading: conflictsLoading, refetch } = useQuery<Conflict[]>({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/conflicts`);
      return r.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: countries } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/countries`);
      return r.json();
    },
    staleTime: 30_000,
  });

  const allConflicts = conflicts || [];
  const displayConflicts = allConflicts.filter(c => {
    if (filter === "all") return c.status === "active" || c.status === "escalating" || c.status === "frozen";
    return c.status === filter;
  });

  const criticalCountries = (countries || []).filter(c => c.threatLevel === "critical" || c.threatLevel === "high");

  const regionConflictCounts: Record<string, number> = {};
  for (const c of allConflicts) {
    if (c.status === "active" || c.status === "escalating") {
      regionConflictCounts[c.region] = (regionConflictCounts[c.region] || 0) + 1;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">GEOSPATIAL OPERATIONS MAP</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Real-time global conflict and threat visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 rounded-md border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "active", "escalating"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md font-mono text-xs uppercase border transition-all ${
              filter === f ? "bg-primary/10 text-primary border-primary/30" : "bg-card/50 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {displayConflicts.length} conflict zones active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4">
              {conflictsLoading ? (
                <Skeleton className="w-full h-80" />
              ) : (
                <div className="relative w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800" style={{ paddingBottom: "56.25%" }}>
                  <svg
                    viewBox="0 0 100 56.25"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="glow-orange" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect width="100" height="56.25" fill="#0a0f1e" />

                    {[20, 40, 60, 80].map(x => (
                      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={56.25} stroke="rgba(100,120,160,0.08)" strokeWidth={0.1} />
                    ))}
                    {[14, 28, 42].map(y => (
                      <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke="rgba(100,120,160,0.08)" strokeWidth={0.1} />
                    ))}

                    <ellipse cx="18" cy="28" rx="14" ry="18" fill="rgba(30,60,100,0.3)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />
                    <ellipse cx="27" cy="56" rx="10" ry="14" fill="rgba(30,60,100,0.3)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />
                    <ellipse cx="50" cy="38" rx="12" ry="16" fill="rgba(30,60,100,0.25)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />
                    <ellipse cx="48" cy="22" rx="20" ry="10" fill="rgba(30,60,100,0.35)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />
                    <ellipse cx="72" cy="30" rx="18" ry="16" fill="rgba(30,60,100,0.3)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />
                    <ellipse cx="83" cy="60" rx="8" ry="6" fill="rgba(30,60,100,0.2)" stroke="rgba(60,90,140,0.2)" strokeWidth={0.2} />

                    {Object.entries(regionConflictCounts).map(([region, count]) => {
                      const pos = getRegionPos(region);
                      const r = Math.min(8, count * 2.5 + 2);
                      return (
                        <circle
                          key={`heatmap-${region}`}
                          cx={pos.x}
                          cy={pos.y}
                          r={r}
                          fill="url(#glow-red)"
                          opacity={0.5}
                        />
                      );
                    })}

                    {displayConflicts.map(c => {
                      const pos = getRegionPos(c.region);
                      const color = SEVERITY_COLORS[c.severity] || "#eab308";
                      const size = (SEVERITY_SIZES[c.severity] || 9) / 10;
                      const isSelected = selectedConflict?.id === c.id;

                      return (
                        <g
                          key={c.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedConflict(cc => cc?.id === c.id ? null : c)}
                        >
                          {isSelected && (
                            <circle cx={pos.x} cy={pos.y} r={size * 2.5} fill="none" stroke={color} strokeWidth={0.3} opacity={0.6} />
                          )}
                          {c.status === "escalating" && (
                            <circle cx={pos.x} cy={pos.y} r={size * 1.8}>
                              <animate attributeName="r" values={`${size * 1.2};${size * 2.5};${size * 1.2}`} dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                              <animateColor attributeName="fill" values={color} />
                            </circle>
                          )}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={size}
                            fill={color}
                            fillOpacity={0.85}
                            stroke={color}
                            strokeWidth={0.2}
                          />
                          <text
                            x={pos.x + size + 0.5}
                            y={pos.y + 0.5}
                            fontSize={1.5}
                            fill="rgba(220,230,240,0.8)"
                            fontFamily="monospace"
                          >
                            {c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[9px] font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                    {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
                      <span key={sev} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span style={{ color }}>{sev}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedConflict && (
            <Card className="bg-card/50 border-red-500/20 border backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-xs text-red-400">ACTIVE CONFLICT</CardTitle>
                  <button onClick={() => setSelectedConflict(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-mono text-sm font-bold">{selectedConflict.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] font-mono uppercase ${SEVERITY_COLORS[selectedConflict.severity] ? "border-red-500/30 text-red-400" : ""}`}>
                    {selectedConflict.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {selectedConflict.status}
                  </Badge>
                </div>
                {selectedConflict.description && (
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{selectedConflict.description}</p>
                )}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <p className="text-[10px] font-mono text-muted-foreground">REGION: <span className="text-foreground">{selectedConflict.region}</span></p>
                  {selectedConflict.casualties != null && (
                    <p className="text-[10px] font-mono text-muted-foreground">CASUALTIES: <span className="text-red-400">{selectedConflict.casualties.toLocaleString()}</span></p>
                  )}
                  {selectedConflict.partiesInvolved && selectedConflict.partiesInvolved.length > 0 && (
                    <p className="text-[10px] font-mono text-muted-foreground">PARTIES: <span className="text-foreground">{selectedConflict.partiesInvolved.join(", ")}</span></p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm">ACTIVE CONFLICT ZONES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {displayConflicts.map(c => {
                  const color = SEVERITY_COLORS[c.severity] || "#eab308";
                  const isSelected = selectedConflict?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConflict(cc => cc?.id === c.id ? null : c)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? "bg-red-500/10 border-red-500/30" : "border-border/50 hover:bg-muted/20"
                      }`}
                    >
                      <div className="mt-0.5 relative flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        {c.status === "escalating" && (
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping" style={{ background: color, opacity: 0.4 }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-bold truncate">{c.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{c.region}</p>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border`} style={{ color, borderColor: color + "40", background: color + "15" }}>
                        {c.status}
                      </span>
                    </div>
                  );
                })}
                {displayConflicts.length === 0 && (
                  <p className="text-center font-mono text-xs text-muted-foreground py-4">No conflicts match filter</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm">HIGH THREAT NATIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {criticalCountries.map(c => (
                  <div key={c.id} className="flex items-center gap-2.5 text-xs font-mono">
                    <span className="font-mono text-[10px] text-muted-foreground">REG</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className={`text-[10px] uppercase ${c.threatLevel === "critical" ? "text-red-400" : "text-orange-400"}`}>
                      {c.threatLevel}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
