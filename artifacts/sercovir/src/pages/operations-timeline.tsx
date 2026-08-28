import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, Globe, Shield, TrendingUp, Filter, RefreshCw } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface TimelineEvent {
  id: number;
  title: string;
  summary: string;
  category: string;
  priority: string;
  region: string;
  countries: string[];
  source: string;
  isAlert: boolean;
  occurredAt: string;
}

const CATEGORIES = ["all", "military", "cyber", "nuclear", "conflict", "diplomatic", "economic", "maritime", "legal", "law-enforcement", "political"];

const CAT_ICON: Record<string, React.ReactNode> = {
  military: <Shield className="w-3 h-3" />,
  cyber: <Zap className="w-3 h-3" />,
  nuclear: <span className="text-[9px] font-mono">NUC</span>,
  conflict: <AlertTriangle className="w-3 h-3" />,
  diplomatic: <Globe className="w-3 h-3" />,
  economic: <TrendingUp className="w-3 h-3" />,
  maritime: <span className="text-[9px] font-mono">SEA</span>,
  legal: <span className="text-[9px] font-mono">LAW</span>,
  "law-enforcement": <span className="text-[9px] font-mono">LE</span>,
  political: <span className="text-[9px] font-mono">POL</span>,
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const CAT_COLOR: Record<string, string> = {
  military: "#ef4444",
  cyber: "#06b6d4",
  nuclear: "#eab308",
  conflict: "#f97316",
  diplomatic: "#8b5cf6",
  economic: "#10b981",
  maritime: "#3b82f6",
  legal: "#94a3b8",
  "law-enforcement": "#3b82f6",
  political: "#a78bfa",
};

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(ms / 3600000);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return "Just now";
}

export default function OperationsTimeline() {
  const [category, setCategory] = useState("all");

  const { data: events = [], isLoading, refetch, isFetching } = useQuery<TimelineEvent[]>({
    queryKey: ["ops-timeline", category],
    queryFn: () => fetch(`${BASE}/api/operations-timeline?category=${category}&limit=50`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const criticalEvents = events.filter(e => e.priority === "critical");
  const alertEvents = events.filter(e => e.isAlert);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-purple-400" />
            OPERATIONS TIMELINE
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Real-Time Global Intelligence Feed · April 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alertEvents.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-xs text-red-400">{alertEvents.length} ACTIVE ALERTS</span>
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg border border-border hover:bg-muted/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {criticalEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {criticalEvents.slice(0, 3).map(evt => (
            <div key={evt.id} className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 animate-pulse-slow">
              <div className="flex items-center justify-between mb-1.5">
                <Badge className="font-mono text-[10px] bg-red-500/20 text-red-400 border-red-500/40">
                    CRITICAL · {evt.category?.toUpperCase()}
                </Badge>
                <span className="font-mono text-[10px] text-muted-foreground">{timeAgo(evt.occurredAt)}</span>
              </div>
              <p className="font-mono text-xs font-semibold">{evt.title}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[10px] transition-all ${category === cat ? "border-primary/40 bg-primary/15 text-primary" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"}`}
            style={category === cat && CAT_COLOR[cat] ? { borderColor: CAT_COLOR[cat] + "40", background: CAT_COLOR[cat] + "15", color: CAT_COLOR[cat] } : {}}
          >
            {CAT_ICON[cat] || null}
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="font-mono text-muted-foreground animate-pulse">FETCHING INTELLIGENCE FEED...</div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border to-transparent" />
          <div className="space-y-0">
            {events.map((evt, idx) => (
              <div key={evt.id} className="relative flex gap-4 pb-4 group">
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs"
                    style={{
                      borderColor: (PRIORITY_COLOR[evt.priority] || "#64748b") + "60",
                      background: (PRIORITY_COLOR[evt.priority] || "#64748b") + "15",
                      color: PRIORITY_COLOR[evt.priority] || "#64748b",
                    }}
                  >
                    {CAT_ICON[evt.category] || <Globe className="w-3 h-3" />}
                  </div>
                  {evt.isAlert && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                  )}
                </div>

                <div
                  className={`flex-1 rounded-xl border p-3.5 transition-all hover:shadow-md ${evt.isAlert ? "border-red-500/20 bg-red-500/5 hover:border-red-500/30" : "border-border/50 bg-card/30 hover:bg-card/50"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="font-mono text-sm font-semibold leading-tight">{evt.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge
                        className="font-mono text-[10px]"
                        style={{ color: CAT_COLOR[evt.category], borderColor: (CAT_COLOR[evt.category] || "") + "40", background: (CAT_COLOR[evt.category] || "") + "15" }}
                      >
                        {evt.category?.toUpperCase()}
                      </Badge>
                      <Badge
                        className="font-mono text-[10px]"
                        style={{ color: PRIORITY_COLOR[evt.priority], borderColor: (PRIORITY_COLOR[evt.priority] || "") + "40", background: (PRIORITY_COLOR[evt.priority] || "") + "15" }}
                      >
                        {evt.priority?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-2">{evt.summary}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground/70">
                    {evt.region && <span>REGION / {evt.region}</span>}
                    {evt.countries?.slice(0, 3).map(c => <span key={c}>{c}</span>)}
                    {evt.source && <span className="text-muted-foreground/50">Source: {evt.source}</span>}
                    <span className="ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(evt.occurredAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground font-mono">
          No events found for selected category
        </div>
      )}
    </div>
  );
}
