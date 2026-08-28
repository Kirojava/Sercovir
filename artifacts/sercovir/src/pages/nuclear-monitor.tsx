import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radiation, AlertTriangle, Shield, Target, ChevronRight, Globe } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface NuclearProgram {
  id: number;
  country: string;
  countryCode: string;
  flagEmoji: string;
  programStatus: string;
  nuclearWarheads: number | null;
  deliveryCapability: string[];
  programType: string[];
  treatyStatus: string[];
  latestTest: string | null;
  threatLevel: string;
  iaeaCompliance: string;
  estimatedRange: number | null;
  description: string;
  recentDevelopments: string[];
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "#ef4444",
  developing: "#f97316",
  suspected: "#eab308",
  dismantled: "#22c55e",
};

const THREAT_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const COMPLIANCE_COLOR: Record<string, string> = {
  full: "#22c55e",
  partial: "#eab308",
  "non-compliant": "#ef4444",
  none: "#dc2626",
};

export default function NuclearMonitor() {
  const { data: programs = [], isLoading } = useQuery<NuclearProgram[]>({
    queryKey: ["nuclear-programs"],
    queryFn: () => fetch(`${BASE}/api/nuclear-programs`).then(r => r.json()),
  });
  const { data: summary } = useQuery({
    queryKey: ["nuclear-summary"],
    queryFn: () => fetch(`${BASE}/api/nuclear-programs/summary`).then(r => r.json()),
  });

  const [selected, setSelected] = useState<NuclearProgram | null>(null);

  const getRadarData = (prog: NuclearProgram) => [
    { subject: "Arsenal Size", A: Math.min(100, ((prog.nuclearWarheads || 0) / 6257) * 100) },
    { subject: "Delivery", A: prog.deliveryCapability?.length ? prog.deliveryCapability.length * 14 : 0 },
    { subject: "Range", A: Math.min(100, ((prog.estimatedRange || 0) / 16000) * 100) },
    { subject: "Threat Level", A: prog.threatLevel === "critical" ? 100 : prog.threatLevel === "high" ? 70 : prog.threatLevel === "medium" ? 40 : 10 },
    { subject: "IAEA Non-compliance", A: prog.iaeaCompliance === "none" ? 100 : prog.iaeaCompliance === "non-compliant" ? 80 : prog.iaeaCompliance === "partial" ? 40 : 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-muted-foreground animate-pulse">LOADING CLASSIFIED DATA...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Radiation className="w-7 h-7 text-yellow-400" />
            NUCLEAR/WMD MONITOR
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Global Nuclear Arsenal Tracking · Proliferation Intelligence · IAEA Compliance Status
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="font-mono text-xs text-red-400">IRAN AT 89.9% ENRICHMENT</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Nations Monitored", value: summary?.total || 0, color: "text-foreground" },
          { label: "Confirmed Programs", value: summary?.confirmed || 0, color: "text-red-400" },
          { label: "Developing", value: summary?.developing || 0, color: "text-orange-400" },
          { label: "Critical Threat", value: summary?.critical || 0, color: "text-yellow-400" },
          { label: "Total Warheads", value: (summary?.totalWarheads || 0).toLocaleString(), color: "text-cyan-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <p className="font-mono text-xs text-muted-foreground px-1">SELECT NATION</p>
          {programs.map(prog => (
            <button
              key={prog.id}
              onClick={() => setSelected(selected?.id === prog.id ? null : prog)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected?.id === prog.id ? "border-yellow-500/40 bg-yellow-500/10" : "border-border/50 bg-card/30 hover:bg-muted/30"}`}
            >
              <span className="font-mono text-[10px] text-muted-foreground">NUC</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold">{prog.country}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ color: STATUS_COLOR[prog.programStatus] || "#94a3b8", background: (STATUS_COLOR[prog.programStatus] || "#94a3b8") + "18" }}
                  >
                    {prog.programStatus?.toUpperCase()}
                  </div>
                  {prog.nuclearWarheads !== null && prog.nuclearWarheads > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground">{prog.nuclearWarheads.toLocaleString()} warheads</span>
                  )}
                </div>
              </div>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: THREAT_COLOR[prog.threatLevel] || "#94a3b8" }}
              />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card className="bg-card/50 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-3">
                    <span className="font-mono text-sm text-primary">{selected.countryCode}</span>
                    <div>
                      <div className="text-xl">{selected.country}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge style={{ color: STATUS_COLOR[selected.programStatus], borderColor: STATUS_COLOR[selected.programStatus] + "40", background: STATUS_COLOR[selected.programStatus] + "15" }} className="font-mono text-[10px]">
                          {selected.programStatus?.toUpperCase()}
                        </Badge>
                        <Badge style={{ color: THREAT_COLOR[selected.threatLevel], borderColor: THREAT_COLOR[selected.threatLevel] + "40", background: THREAT_COLOR[selected.threatLevel] + "15" }} className="font-mono text-[10px]">
                          THREAT: {selected.threatLevel?.toUpperCase()}
                        </Badge>
                        <Badge style={{ color: COMPLIANCE_COLOR[selected.iaeaCompliance || "full"], borderColor: COMPLIANCE_COLOR[selected.iaeaCompliance || "full"] + "40", background: COMPLIANCE_COLOR[selected.iaeaCompliance || "full"] + "15" }} className="font-mono text-[10px]">
                          IAEA: {selected.iaeaCompliance?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: "Warheads", value: selected.nuclearWarheads !== null ? selected.nuclearWarheads.toLocaleString() : "Unknown" },
                        { label: "Max Range (km)", value: selected.estimatedRange?.toLocaleString() || "Unknown" },
                        { label: "Latest Test", value: selected.latestTest || "None" },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/20 rounded-lg p-2.5">
                          <div className="font-mono text-xs text-muted-foreground">{item.label}</div>
                          <div className="font-mono text-sm font-bold mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-3">
                      <p className="font-mono text-xs text-muted-foreground mb-1.5">DELIVERY SYSTEMS</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.deliveryCapability?.map(d => (
                          <Badge key={d} variant="outline" className="font-mono text-[10px] border-red-500/30 text-red-300">{d}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-mono text-xs text-muted-foreground mb-1.5">TREATY STATUS</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.treatyStatus?.map(t => (
                          <Badge key={t} variant="outline" className="font-mono text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-xs text-muted-foreground mb-1.5">ASSESSMENT</p>
                      <p className="font-mono text-xs leading-relaxed text-muted-foreground">{selected.description}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-xs text-muted-foreground mb-2">THREAT PROFILE</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={getRadarData(selected)}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: "monospace", fill: "#64748b" }} />
                        <Radar name={selected.country} dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.15} strokeWidth={1.5} />
                        <Tooltip contentStyle={{ background: "#0a0f1a", border: "1px solid #1e293b", fontFamily: "monospace", fontSize: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>

                    <div className="mt-3">
                      <p className="font-mono text-xs text-muted-foreground mb-1.5">RECENT DEVELOPMENTS</p>
                      <ul className="space-y-1.5">
                        {selected.recentDevelopments?.map(dev => (
                          <li key={dev} className="font-mono text-[11px] flex items-start gap-2 text-muted-foreground">
                            <span className="text-yellow-400 flex-shrink-0 mt-0.5">▸</span>
                            {dev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border/50 rounded-xl text-center">
              <Radiation className="w-12 h-12 text-yellow-400/20 mb-3" />
              <p className="font-mono text-muted-foreground text-sm">Select a nation to view classified dossier</p>
              <p className="font-mono text-muted-foreground/50 text-xs mt-1">Radar profile · Arsenal data · Treaty status · Intelligence summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
