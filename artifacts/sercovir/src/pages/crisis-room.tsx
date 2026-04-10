import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, AlertTriangle, Shield, Zap, Globe, Clock, Brain, TrendingUp, Activity, Radio } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Conflict {
  id: number;
  title: string;
  region: string;
  status: string;
  threatLevel: string;
  description: string;
}

interface TimelineEvent {
  id: number;
  title: string;
  category: string;
  priority: string;
  summary: string;
  occurredAt: string;
  isAlert: boolean;
}

interface CyberIncident {
  id: number;
  title: string;
  severity: string;
  status: string;
  targetCountry: string;
  attribution: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(ms / 3600000);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return "Just now";
}

function ThreatLevelGauge({ level }: { level: number }) {
  const pct = (level / 10) * 100;
  const color = level >= 8 ? "#ef4444" : level >= 6 ? "#f97316" : level >= 4 ? "#eab308" : "#22c55e";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground">GLOBAL THREAT INDEX</span>
        <span style={{ color }} className="font-bold text-lg">{level}/10</span>
      </div>
      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e, #eab308, ${color})` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[9px] text-muted-foreground/50">
        <span>STABLE</span><span>ELEVATED</span><span>SEVERE</span><span>CRITICAL</span>
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="font-mono text-right">
      <div className="text-2xl font-bold tracking-widest">{time.toUTCString().slice(17, 25)} <span className="text-sm text-muted-foreground">UTC</span></div>
      <div className="text-xs text-muted-foreground">{time.toDateString()}</div>
    </div>
  );
}

const CRITICAL_ALERTS = [
  { text: "IRAN: U-235 at 89.9% — WEAPONS GRADE IMMINENT", color: "#ef4444" },
  { text: "DPRK: HWASONG-18 LAUNCH DETECTED — SEA OF JAPAN", color: "#ef4444" },
  { text: "VOLT TYPHOON: US GRID ACCESS CONFIRMED — NSA EMERGENCY DIRECTIVE", color: "#ef4444" },
  { text: "PLA NAVY: SHANDONG CSG IN TAIWAN STRAIT — US 7TH FLEET RESPONDING", color: "#f97316" },
  { text: "NATO: ARTICLE 4 INVOKED — RUSSIAN AIRSPACE VIOLATION OVER ESTONIA", color: "#f97316" },
  { text: "IRGC: 3 OIL TANKERS SEIZED — STRAIT OF HORMUZ", color: "#f97316" },
];

export default function CrisisRoom() {
  const [ticker, setTicker] = useState(0);

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["conflicts-crisis"],
    queryFn: () => fetch(`${BASE}/api/conflicts`).then(r => r.json()),
    refetchInterval: 60000,
  });

  const { data: timeline = [] } = useQuery<TimelineEvent[]>({
    queryKey: ["timeline-crisis"],
    queryFn: () => fetch(`${BASE}/api/operations-timeline?limit=12`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: cyberIncidents = [] } = useQuery<CyberIncident[]>({
    queryKey: ["cyber-crisis"],
    queryFn: () => fetch(`${BASE}/api/cyber-intel/incidents`).then(r => r.json()),
    refetchInterval: 60000,
  });

  useEffect(() => {
    const t = setInterval(() => setTicker(prev => (prev + 1) % CRITICAL_ALERTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const activeConflicts = conflicts.filter((c: any) => c.status === "active" || c.status === "escalating");
  const criticalEvents = timeline.filter(e => e.priority === "critical");
  const activeCyber = cyberIncidents.filter(i => i.status === "active");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Monitor className="w-7 h-7 text-red-400" />
            CRISIS COMMAND ROOM
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Unified Situational Awareness · April 2026</p>
        </div>
        <LiveClock />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-950/20 py-2.5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-mono text-xs text-red-400 font-bold">FLASH TRAFFIC</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div
              className="font-mono text-xs font-bold transition-all duration-500"
              style={{ color: CRITICAL_ALERTS[ticker]?.color }}
            >
              ▶ {CRITICAL_ALERTS[ticker]?.text}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {CRITICAL_ALERTS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === ticker ? "bg-red-400" : "bg-red-400/20"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Conflicts", value: activeConflicts.length, icon: AlertTriangle, color: "#ef4444" },
          { label: "Critical Events (24h)", value: criticalEvents.length, icon: Activity, color: "#f97316" },
          { label: "Cyber Incidents Active", value: activeCyber.length, icon: Zap, color: "#06b6d4" },
          { label: "Nations Monitored", value: 20, icon: Globe, color: "#8b5cf6" },
        ].map(stat => (
          <Card key={stat.label} className="bg-card/50 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ background: stat.color + "15", border: `1px solid ${stat.color}30` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <ThreatLevelGauge level={8.5} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              ACTIVE CONFLICTS ({activeConflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeConflicts.slice(0, 8).map((conflict: any) => (
              <div key={conflict.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/50">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
                  style={{ background: conflict.status === "escalating" ? "#ef4444" : "#f97316" }}
                />
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold leading-tight">{conflict.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{conflict.region}</span>
                    <Badge
                      className="font-mono text-[10px] uppercase"
                      style={{ color: conflict.status === "escalating" ? "#ef4444" : "#f97316", borderColor: "transparent", background: (conflict.status === "escalating" ? "#ef4444" : "#f97316") + "15" }}
                    >
                      {conflict.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              LATEST INTELLIGENCE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timeline.slice(0, 8).map(evt => (
              <div key={evt.id} className={`p-2.5 rounded-lg border ${evt.isAlert ? "border-red-500/20 bg-red-500/5" : "border-border/50 bg-muted/20"}`}>
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="font-mono text-[11px] font-semibold leading-tight line-clamp-2">{evt.title}</p>
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0">{timeAgo(evt.occurredAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className="font-mono text-[9px]"
                    style={{ color: PRIORITY_COLOR[evt.priority], borderColor: (PRIORITY_COLOR[evt.priority]) + "40", background: (PRIORITY_COLOR[evt.priority]) + "12" }}
                  >
                    {evt.priority?.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">{evt.category}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                CYBER STATUS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cyberIncidents.filter(i => i.severity === "critical" || i.status === "active").slice(0, 5).map(inc => (
                <div key={inc.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inc.status === "active" ? "bg-red-400 animate-pulse" : "bg-muted"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-semibold leading-tight truncate">{inc.title.split(":")[0]}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">{inc.targetCountry} · {inc.attribution}</p>
                  </div>
                  <Badge className="font-mono text-[9px] shrink-0" style={{ color: inc.severity === "critical" ? "#ef4444" : "#f97316", borderColor: "transparent", background: (inc.severity === "critical" ? "#ef4444" : "#f97316") + "15" }}>
                    {inc.severity?.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-amber-500/20 border">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                ARES ASSESSMENT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                Global risk index at <span className="text-red-400 font-bold">8.5/10</span>. Iran nuclear breakout and DPRK ballistic tests are the primary escalation vectors. Volt Typhoon infrastructure positioning represents most critical long-term threat.
              </p>
              <a
                href="./ai-analyst"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all font-mono text-xs text-primary"
              >
                <Brain className="w-3 h-3" />
                Open Full ARES Analysis
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
