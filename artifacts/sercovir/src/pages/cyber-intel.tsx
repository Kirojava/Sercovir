import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Skull, Globe2, Target, Zap, Clock, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface AptGroup {
  id: number;
  name: string;
  aliases: string[];
  attribution: string;
  country: string;
  active: string;
  sophistication: string;
  primaryTargets: string[];
  knownTtps: string[];
  notableOperations: string[];
  description: string;
}

interface CyberIncident {
  id: number;
  title: string;
  description: string;
  attackType: string;
  threatActor: string;
  attribution: string;
  targetSector: string;
  targetCountry: string;
  originCountry: string;
  severity: string;
  status: string;
  financialDamage: string;
  detectedDate: string;
}

interface Summary {
  totalIncidents: number;
  critical: number;
  high: number;
  active: number;
  totalAptGroups: number;
  byType: Record<string, number>;
}

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const SOPH_COLOR: Record<string, string> = {
  "nation-state": "#ef4444",
  "advanced": "#f97316",
  "moderate": "#eab308",
};

export default function CyberIntel() {
  const { data: summary } = useQuery<Summary>({ queryKey: ["cyber-summary"], queryFn: () => fetch(`${BASE}/api/cyber-intel/summary`).then(r => r.json()) });
  const { data: incidents = [] } = useQuery<CyberIncident[]>({ queryKey: ["cyber-incidents"], queryFn: () => fetch(`${BASE}/api/cyber-intel/incidents`).then(r => r.json()) });
  const { data: aptGroups = [] } = useQuery<AptGroup[]>({ queryKey: ["apt-groups"], queryFn: () => fetch(`${BASE}/api/cyber-intel/apt-groups`).then(r => r.json()) });

  const [selectedApt, setSelectedApt] = useState<AptGroup | null>(null);

  const attackTypeData = summary?.byType
    ? Object.entries(summary.byType).map(([name, count]) => ({ name: name.split(" / ")[0], count }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-400" />
            CYBER INTELLIGENCE
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Global APT Tracking · Incident Intelligence · Threat Actor Profiling
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="font-mono text-xs text-red-400">THREAT LEVEL: CRITICAL</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Incidents", value: summary?.totalIncidents || 0, icon: Target, color: "text-foreground" },
          { label: "Critical", value: summary?.critical || 0, icon: Skull, color: "text-red-400" },
          { label: "High Severity", value: summary?.high || 0, icon: AlertTriangle, color: "text-orange-400" },
          { label: "Active Now", value: summary?.active || 0, icon: Zap, color: "text-yellow-400" },
          { label: "APT Groups", value: summary?.totalAptGroups || 0, icon: Globe2, color: "text-cyan-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              ACTIVE INCIDENTS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-mono text-sm font-semibold leading-tight">{inc.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge style={{ backgroundColor: SEV_COLOR[inc.severity] + "20", borderColor: SEV_COLOR[inc.severity] + "40", color: SEV_COLOR[inc.severity] }} className="font-mono text-[10px] uppercase">
                        {inc.severity}
                      </Badge>
                      <Badge variant={inc.status === "active" ? "destructive" : "secondary"} className="font-mono text-[10px] uppercase">
                        {inc.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-2">{inc.description}</p>
                  <div className="flex flex-wrap gap-3 text-[10px] font-mono text-muted-foreground">
                    <span>TYPE / {inc.attackType}</span>
                    <span>SECTOR / {inc.targetSector}</span>
                    <span>COUNTRY / {inc.targetCountry}</span>
                    {inc.attribution && <span>ATTRIBUTION / {inc.attribution}</span>}
                    {inc.financialDamage && inc.financialDamage !== "N/A (intelligence operation)" && <span className="text-red-400">LOSS / {inc.financialDamage}</span>}
                    {inc.detectedDate && <span className="text-muted-foreground/60">DETECTED / {inc.detectedDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm">ATTACK TYPES</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={attackTypeData} layout="vertical" margin={{ left: -10 }}>
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace" }} width={80} />
                  <Tooltip
                    contentStyle={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                    {attackTypeData.map((_, i) => <Cell key={i} fill="#06b6d4" opacity={0.8 - i * 0.07} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm">THREAT ACTORS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {aptGroups.map(apt => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedApt(selectedApt?.id === apt.id ? null : apt)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left ${selectedApt?.id === apt.id ? "border-cyan-500/40 bg-cyan-500/10" : "border-border/50 bg-muted/20 hover:bg-muted/40"}`}
                >
                  <span className="font-mono text-[10px] text-muted-foreground">REG</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-semibold truncate">{apt.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{apt.attribution}</p>
                  </div>
                  <div
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ color: SOPH_COLOR[apt.sophistication] || "#94a3b8", background: (SOPH_COLOR[apt.sophistication] || "#94a3b8") + "15" }}
                  >
                    {apt.sophistication?.toUpperCase()}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedApt && (
        <Card className="bg-card/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">REG</span>
              {selectedApt.name}
              <Badge className="font-mono text-[10px]" style={{ color: SOPH_COLOR[selectedApt.sophistication], borderColor: SOPH_COLOR[selectedApt.sophistication] + "40", background: SOPH_COLOR[selectedApt.sophistication] + "15" }}>
                {selectedApt.sophistication?.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">ALIASES</p>
                <div className="flex flex-wrap gap-1">
                  {selectedApt.aliases?.map(a => <Badge key={a} variant="outline" className="font-mono text-[10px]">{a}</Badge>)}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">PRIMARY TARGETS</p>
                <div className="flex flex-wrap gap-1">
                  {selectedApt.primaryTargets?.map(t => <Badge key={t} variant="outline" className="font-mono text-[10px] border-orange-500/30 text-orange-400">{t}</Badge>)}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">KNOWN TTPs</p>
                <div className="flex flex-wrap gap-1">
                  {selectedApt.knownTtps?.map(t => <Badge key={t} variant="outline" className="font-mono text-[10px] border-red-500/30 text-red-400">{t}</Badge>)}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">ASSESSMENT</p>
                <p className="font-mono text-xs leading-relaxed">{selectedApt.description}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground mb-1">NOTABLE OPERATIONS</p>
                <ul className="space-y-1">
                  {selectedApt.notableOperations?.map(op => (
                    <li key={op} className="font-mono text-xs flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      {op}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
