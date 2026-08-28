import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Plane, Anchor, Crosshair, Activity, AlertTriangle,
  Globe, Users, Radio, ChevronRight, ChevronDown, MapPin,
  Zap, Eye, TrendingUp, BarChart2, Clock, Brain, Copy, Check,
  Filter, X, Layers, Map, List, GitMerge, FileText, RefreshCw
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface MilitaryActivity {
  id: number; title: string; type: string; status: string; threatLevel: string;
  country: string; countryCode: string | null; flagEmoji: string | null;
  region: string; location: string | null; lat: number | null; lng: number | null;
  involvedCountries: string[]; forces: string | null; assets: string[];
  estimatedPersonnel: string | null; objective: string | null;
  description: string | null; isNatoRelated: boolean | null;
  isJoint: boolean | null; startDate: string | null; endDate: string | null;
  isOngoing: boolean | null; updates: string[];
}
interface Summary {
  total: number; active: number; critical: number;
  byType: Record<string, number>; byThreat: Record<string, number>;
  byRegion: Record<string, number>; natoRelated: number; joint: number;
  totalPersonnel: number; regions: string[];
}
interface TimelineEvent {
  activityId: number; activityTitle: string; type: string;
  threatLevel: string; region: string; country: string;
  flagEmoji: string | null; update: string; sortKey: string;
}

const TYPE_META: Record<string, { label: string; icon: typeof Shield; color: string; bg: string; dot: string }> = {
  deployment:          { label: "Deployment",         icon: Shield,    color: "text-red-400",     bg: "bg-red-400/10 border-red-400/30",     dot: "#f87171" },
  exercise:            { label: "Exercise",            icon: Activity,  color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/30",    dot: "#60a5fa" },
  restricted_airspace: { label: "Restricted Airspace", icon: Plane,     color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30",  dot: "#fbbf24" },
  naval_patrol:        { label: "Naval Patrol",        icon: Anchor,    color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/30",    dot: "#22d3ee" },
  no_fly_zone:         { label: "No-Fly Zone",         icon: Crosshair, color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30",dot: "#fb923c" },
  troop_movement:      { label: "Troop Movement",      icon: Users,     color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/30",dot: "#a78bfa" },
  base_activation:     { label: "Base Activation",     icon: Radio,     color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30",dot: "#34d399" },
};

const THREAT_STYLE: Record<string, { cls: string; color: string; score: number }> = {
  critical: { cls: "text-red-400 border-red-400/40 bg-red-400/10",     color: "#f87171", score: 92 },
  high:     { cls: "text-orange-400 border-orange-400/40 bg-orange-400/10", color: "#fb923c", score: 72 },
  medium:   { cls: "text-amber-400 border-amber-400/40 bg-amber-400/10",   color: "#fbbf24", score: 48 },
  low:      { cls: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10", color: "#34d399", score: 25 },
};

function escalationRisk(a: MilitaryActivity): number {
  let score = THREAT_STYLE[a.threatLevel]?.score ?? 50;
  if (a.isOngoing) score += 5;
  if (a.isJoint) score += 4;
  if (a.isNatoRelated) score += 3;
  if (a.type === "restricted_airspace" || a.type === "no_fly_zone") score += 6;
  if (a.type === "troop_movement") score += 4;
  return Math.min(score, 99);
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#f87171" : score >= 60 ? "#fb923c" : score >= 40 ? "#fbbf24" : "#34d399";
  const pct = score / 99;
  const r = 18; const cx = 24; const cy = 24;
  const arc = 2 * Math.PI * r * 0.75;
  return (
    <div className="flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="4" strokeDasharray={`${arc} ${2*Math.PI*r}`} strokeDashoffset={-arc*0.125} strokeLinecap="round" transform={`rotate(-225 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${arc*pct} ${2*Math.PI*r}`} strokeDashoffset={-arc*0.125} strokeLinecap="round" transform={`rotate(-225 ${cx} ${cy})`} />
        <text x={cx} y={cy+4} textAnchor="middle" fontSize="10" fontFamily="monospace" fill={color} fontWeight="bold">{score}</text>
      </svg>
      <span className="font-mono text-[9px] text-muted-foreground mt-0.5">ESCALATION</span>
    </div>
  );
}

// Tactical map: equirectangular projection on 1000×500 viewBox
function latLngToXY(lat: number, lng: number): [number, number] {
  return [(lng + 180) / 360 * 1000, (90 - lat) / 180 * 500];
}

const REGION_BOXES = [
  { label: "N.AMERICA",    x: 60,  y: 60,  w: 220, h: 220 },
  { label: "S.AMERICA",    x: 160, y: 290, w: 160, h: 190 },
  { label: "W.EUROPE",     x: 395, y: 50,  w: 130, h: 150 },
  { label: "E.EUROPE",     x: 510, y: 50,  w: 100, h: 130 },
  { label: "MIDDLE EAST",  x: 520, y: 180, w: 110, h: 100 },
  { label: "AFRICA",       x: 400, y: 210, w: 150, h: 230 },
  { label: "RUSSIA",       x: 510, y: 30,  w: 200, h: 120 },
  { label: "C.ASIA",       x: 620, y: 120, w: 110, h: 100 },
  { label: "E.ASIA",       x: 720, y: 80,  w: 140, h: 180 },
  { label: "SE.ASIA",      x: 720, y: 250, w: 140, h: 130 },
  { label: "S.ASIA",       x: 620, y: 210, w: 110, h: 100 },
  { label: "PACIFIC",      x: 750, y: 180, w: 200, h: 200 },
  { label: "AUSTRALIA",    x: 750, y: 360, w: 160, h: 120 },
  { label: "INDIAN OCN",   x: 560, y: 320, w: 160, h: 130 },
];

function TacticalMap({ activities, onSelect, selected }: {
  activities: MilitaryActivity[];
  onSelect: (a: MilitaryActivity) => void;
  selected: MilitaryActivity | null;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSweepAngle(a => (a + 2) % 360), 30);
    return () => clearInterval(t);
  }, []);

  const mapped = activities.filter(a => a.lat != null && a.lng != null);
  return (
    <div className="relative w-full rounded-xl border border-primary/20 bg-black overflow-hidden" style={{ aspectRatio: "2/1" }}>
      <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ fontFamily: "monospace" }}>
        {/* Background */}
        <rect width="1000" height="500" fill="#030712" />
        {/* Grid lines */}
        {Array.from({ length: 21 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={500} stroke="#14532d" strokeWidth="0.3" opacity="0.5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 50} x2={1000} y2={i * 50} stroke="#14532d" strokeWidth="0.3" opacity="0.5" />
        ))}
        {/* Region boxes */}
        {REGION_BOXES.map(r => (
          <g key={r.label}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#052e16" fillOpacity="0.3" stroke="#166534" strokeWidth="0.5" rx="2" />
            <text x={r.x + r.w / 2} y={r.y + 10} textAnchor="middle" fontSize="6" fill="#4ade80" opacity="0.5">{r.label}</text>
          </g>
        ))}
        {/* Radar sweep origin: centered on europe */}
        <g>
          <circle cx={500} cy={200} r={300} fill="none" stroke="#15803d" strokeWidth="0.5" opacity="0.2" />
          <circle cx={500} cy={200} r={200} fill="none" stroke="#15803d" strokeWidth="0.3" opacity="0.15" />
          <circle cx={500} cy={200} r={100} fill="none" stroke="#15803d" strokeWidth="0.3" opacity="0.1" />
          <defs>
            <radialGradient id="sweep" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d={`M 500 200 L ${500 + 300 * Math.cos((sweepAngle - 90) * Math.PI / 180)} ${200 + 300 * Math.sin((sweepAngle - 90) * Math.PI / 180)} A 300 300 0 0 1 ${500 + 300 * Math.cos((sweepAngle - 70) * Math.PI / 180)} ${200 + 300 * Math.sin((sweepAngle - 70) * Math.PI / 180)} Z`}
            fill="url(#sweep)" opacity="0.5"
          />
        </g>
        {/* Activity markers */}
        {mapped.map(a => {
          const [x, y] = latLngToXY(a.lat!, a.lng!);
          const meta = TYPE_META[a.type] ?? TYPE_META.deployment;
          const threat = THREAT_STYLE[a.threatLevel];
          const isHov = hovered === a.id;
          const isSel = selected?.id === a.id;
          return (
            <g key={a.id} style={{ cursor: "pointer" }} onClick={() => onSelect(a)} onMouseEnter={() => setHovered(a.id)} onMouseLeave={() => setHovered(null)}>
              {/* Pulse ring */}
              {(isHov || isSel) && (
                <circle cx={x} cy={y} r={18} fill="none" stroke={threat.color} strokeWidth="1" opacity="0.5" />
              )}
              <circle cx={x} cy={y} r={12} fill={threat.color} fillOpacity="0.15" stroke={threat.color} strokeWidth="0.8" />
              <circle cx={x} cy={y} r={5} fill={meta.dot} />
              {a.threatLevel === "critical" && (
                <circle cx={x} cy={y} r={5} fill={meta.dot} opacity="0.4">
                  <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect x={x + 12} y={y - 28} width={180} height={40} rx="3" fill="#0f172a" stroke={threat.color} strokeWidth="0.8" />
                  <text x={x + 17} y={y - 13} fontSize="7" fill="#f1f5f9" fontWeight="bold">{a.title.slice(0, 30)}{a.title.length > 30 ? "…" : ""}</text>
                  <text x={x + 17} y={y - 3} fontSize="6" fill={threat.color}>{a.threatLevel.toUpperCase()} · {a.region}</text>
                  <text x={x + 17} y={y + 7} fontSize="6" fill="#94a3b8">{a.countryCode || "REG"} {a.country}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* Legend */}
        {Object.entries(TYPE_META).slice(0, 4).map(([k, v], i) => (
          <g key={k}>
            <circle cx={15} cy={15 + i * 14} r={4} fill={v.dot} />
            <text x={23} y={19 + i * 14} fontSize="7" fill="#94a3b8">{v.label}</text>
          </g>
        ))}
        {Object.entries(TYPE_META).slice(4).map(([k, v], i) => (
          <g key={k}>
            <circle cx={95} cy={15 + i * 14} r={4} fill={v.dot} />
            <text x={103} y={19 + i * 14} fontSize="7" fill="#94a3b8">{v.label}</text>
          </g>
        ))}
        {/* LIVE badge */}
        <rect x={935} y={6} width={58} height={14} rx="3" fill="#dc2626" fillOpacity="0.2" stroke="#dc2626" strokeWidth="0.6" />
        <circle cx={940} cy={13} r={2.5} fill="#f87171"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" /></circle>
        <text x={946} y={17} fontSize="7" fill="#f87171" fontWeight="bold">LIVE FEED</text>
        {/* Coordinates display */}
        <text x={5} y={495} fontSize="6" fill="#4ade80" opacity="0.4">EQUIRECTANGULAR PROJECTION · SERCOVIR TACTICAL v2.6 · {new Date().toUTCString().slice(0, 25)} UTC</text>
      </svg>
    </div>
  );
}

function LiveTicker({ activities }: { activities: MilitaryActivity[] }) {
  const allUpdates = activities.flatMap(a =>
    a.updates.map(u => ({ text: u, activity: a.title, threat: a.threatLevel, flag: a.countryCode }))
  );
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (allUpdates.length === 0) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % allUpdates.length); setVisible(true); }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, [allUpdates.length]);
  if (allUpdates.length === 0) return null;
  const cur = allUpdates[idx % allUpdates.length];
  const tColor = THREAT_STYLE[cur.threat]?.color ?? "#94a3b8";
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-black/40 border border-border/40 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-[10px] text-red-400 font-bold">LIVE INTEL</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
          <span className="font-mono text-[10px] mr-2" style={{ color: tColor }}>
            [{cur.threat.toUpperCase()}]
          </span>
          <span className="font-mono text-[10px] text-muted-foreground mr-2">
            {cur.flag} {cur.activity.slice(0, 40)}{cur.activity.length > 40 ? "…" : ""} —
          </span>
          <span className="font-mono text-[10px] text-foreground">{cur.text}</span>
        </div>
      </div>
      <span className="font-mono text-[9px] text-muted-foreground/40 flex-shrink-0">{idx + 1}/{allUpdates.length}</span>
    </div>
  );
}

function SitrepPanel({ activities, onClose }: { activities: MilitaryActivity[]; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (isStreaming) return;
    setContent(""); setDone(false); setIsStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const criticals = activities.filter(a => a.threatLevel === "critical").map(a => a.title).join(", ");
    const query = `Generate a comprehensive MILITARY SITUATION REPORT (SITREP) for April 2026. Cover all active military activities globally. Critical activities: ${criticals}. Include: (1) Executive Summary, (2) Critical Flashpoints, (3) NATO/Allied Posture, (4) Adversary Activities, (5) Airspace Restrictions & No-Fly Zones, (6) Naval Operations, (7) 72-Hour Outlook. Use military SITREP format with section headers.`;
    try {
      const resp = await fetch(`${BASE}/api/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, entityType: "military", entityName: "Global Military Situation April 2026" }),
        signal: ctrl.signal,
      });
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;
        for (const line of dec.decode(value).split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) { full += data.content; setContent(full); }
              if (data.done) { setDone(true); break; }
            } catch {}
          }
        }
      }
    } catch {}
    setIsStreaming(false);
  }, [isStreaming, activities]);

  useEffect(() => { generate(); }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-background border border-primary/30 rounded-xl shadow-2xl m-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm font-bold">ARES MILITARY SITREP — APRIL 2026</span>
            {isStreaming && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary">GENERATING…</span>
              </div>
            )}
            {done && <span className="font-mono text-[10px] text-emerald-400">✓ COMPLETE</span>}
          </div>
          <div className="flex items-center gap-2">
            {content && (
              <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground font-mono text-[10px] transition-colors">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "COPIED" : "COPY"}
              </button>
            )}
            {done && (
              <button onClick={generate} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground font-mono text-[10px] transition-colors">
                <RefreshCw className="w-3 h-3" /> REGEN
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {content || <span className="text-muted-foreground/40">Connecting to ARES intelligence core…</span>}
          {isStreaming && <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5 align-middle" />}
        </div>
      </div>
    </div>
  );
}

function ComparisonView({ a, b, onClear }: { a: MilitaryActivity; b: MilitaryActivity; onClear: () => void }) {
  const fields = [
    { label: "Type",        va: TYPE_META[a.type]?.label ?? a.type,        vb: TYPE_META[b.type]?.label ?? b.type },
    { label: "Threat",      va: a.threatLevel.toUpperCase(),               vb: b.threatLevel.toUpperCase() },
    { label: "Region",      va: a.region,                                  vb: b.region },
    { label: "Country",     va: `${a.countryCode ?? "REG"} ${a.country}`,       vb: `${b.countryCode ?? "REG"} ${b.country}` },
    { label: "Personnel",   va: a.estimatedPersonnel ?? "Unknown",         vb: b.estimatedPersonnel ?? "Unknown" },
    { label: "Escalation",  va: `${escalationRisk(a)}/99`,                 vb: `${escalationRisk(b)}/99` },
    { label: "NATO",        va: a.isNatoRelated ? "Yes" : "No",            vb: b.isNatoRelated ? "Yes" : "No" },
    { label: "Joint Op",    va: a.isJoint ? "Yes" : "No",                  vb: b.isJoint ? "Yes" : "No" },
    { label: "Start",       va: a.startDate ?? "—",                        vb: b.startDate ?? "—" },
    { label: "Status",      va: a.isOngoing ? "Ongoing" : "Complete",      vb: b.isOngoing ? "Ongoing" : "Complete" },
    { label: "Assets",      va: `${a.assets.length} systems`,              vb: `${b.assets.length} systems` },
    { label: "Nations",     va: `${a.involvedCountries.length} nations`,   vb: `${b.involvedCountries.length} nations` },
  ];
  const radarData = [
    { axis: "Threat",     A: escalationRisk(a), B: escalationRisk(b) },
    { axis: "Assets",     A: Math.min(a.assets.length * 10, 99), B: Math.min(b.assets.length * 10, 99) },
    { axis: "Nations",   A: Math.min(a.involvedCountries.length * 15, 99), B: Math.min(b.involvedCountries.length * 15, 99) },
    { axis: "Coverage",  A: a.isJoint ? 80 : 40, B: b.isJoint ? 80 : 40 },
    { axis: "NATO",      A: a.isNatoRelated ? 85 : 20, B: b.isNatoRelated ? 85 : 20 },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold flex items-center gap-2"><GitMerge className="w-4 h-4 text-primary" /> COMPARISON MODE</h2>
        <button onClick={onClear} className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border/50 px-2 py-1 rounded"><X className="w-3 h-3" /> Clear</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] text-muted-foreground px-1">ACTIVITY A</div>
          <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
            <p className="font-mono text-xs font-semibold leading-snug">{a.title}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="font-mono text-xl text-muted-foreground/30">VS</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] text-muted-foreground px-1">ACTIVITY B</div>
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <p className="font-mono text-xs font-semibold leading-snug">{b.title}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          {fields.map(f => (
            <div key={f.label} className="grid grid-cols-3 gap-2 text-[10px] font-mono py-1 border-b border-border/20">
              <span className="text-muted-foreground/60">{f.label}</span>
              <span className="text-primary/80 font-medium">{f.va}</span>
              <span className="text-amber-400/80 font-medium">{f.vb}</span>
            </div>
          ))}
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }} />
              <Radar name={a.title.slice(0, 20)} dataKey="A" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
              <Radar name={b.title.slice(0, 20)} dataKey="B" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.2} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const CHART_COLORS = ["#f87171","#60a5fa","#fbbf24","#22d3ee","#fb923c","#a78bfa","#34d399"];

function AnalyticsView({ activities, summary }: { activities: MilitaryActivity[]; summary: Summary | undefined }) {
  if (!summary) return <div className="text-center py-12 font-mono text-sm text-muted-foreground">Loading analytics…</div>;

  const typeData = Object.entries(summary.byType).map(([k, v]) => ({ name: TYPE_META[k]?.label ?? k, value: v, color: TYPE_META[k]?.dot ?? "#94a3b8" }));
  const threatData = Object.entries(summary.byThreat).map(([k, v]) => ({ name: k.toUpperCase(), value: v, fill: THREAT_STYLE[k]?.color ?? "#94a3b8" }));
  const regionData = Object.entries(summary.byRegion).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: k, value: v }));
  const personnelByType = Object.entries(
    activities.reduce((acc, a) => {
      const type = TYPE_META[a.type]?.label ?? a.type;
      const p = parseInt((a.estimatedPersonnel || "0").replace(/[^0-9]/g, "")) || 0;
      acc[type] = (acc[type] || 0) + p;
      return acc;
    }, {} as Record<string, number>)
  ).map(([k, v]) => ({ name: k, personnel: v })).filter(x => x.personnel > 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Type distribution */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="font-mono text-xs text-muted-foreground">OPERATIONS BY TYPE</CardTitle></CardHeader>
        <CardContent className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={70} innerRadius={30} paddingAngle={2}>
                {typeData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }} />
              <Legend formatter={(v) => <span className="font-mono text-[10px] text-muted-foreground">{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Threat breakdown */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="font-mono text-xs text-muted-foreground">THREAT LEVEL DISTRIBUTION</CardTitle></CardHeader>
        <CardContent className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={threatData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }} width={55} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {threatData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Region heatmap */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="font-mono text-xs text-muted-foreground">ACTIVITY BY REGION</CardTitle></CardHeader>
        <CardContent className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} margin={{ left: 0, right: 10, top: 5, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }} />
              <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]}>
                {regionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Personnel by type */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="font-mono text-xs text-muted-foreground">ESTIMATED PERSONNEL DEPLOYED</CardTitle></CardHeader>
        <CardContent className="h-52">
          {personnelByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelByType} margin={{ left: 0, right: 10, top: 5, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontFamily: "monospace", fontSize: 10 }} formatter={(v: number) => [`${v.toLocaleString()} personnel`, ""]} />
                <Bar dataKey="personnel" fill="#a78bfa" radius={[4, 4, 0, 0]}>
                  {personnelByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} opacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-xs">No personnel data</div>
          )}
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <Card className="bg-card/50 border-border col-span-2">
        <CardHeader className="pb-2"><CardTitle className="font-mono text-xs text-muted-foreground">GLOBAL FORCE POSTURE SUMMARY</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "TOTAL PERSONNEL DEPLOYED", value: summary.totalPersonnel.toLocaleString() + "+", color: "text-foreground" },
              { label: "MULTI-NATION JOINT OPS",    value: summary.joint,                                  color: "text-purple-400" },
              { label: "NATO-LINKED OPERATIONS",    value: summary.natoRelated,                            color: "text-blue-400" },
              { label: "CRITICAL THREAT LEVEL OPS", value: summary.critical,                               color: "text-red-400" },
            ].map(k => (
              <div key={k.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/40">
                <div className={`font-mono text-3xl font-bold ${k.color}`}>{k.value}</div>
                <div className="font-mono text-[9px] text-muted-foreground mt-1">{k.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ALL_TYPES = ["all", "deployment", "exercise", "restricted_airspace", "naval_patrol", "no_fly_zone", "troop_movement", "base_activation"];

export default function MilitaryActivities() {
  const [viewMode, setViewMode] = useState<"operations" | "map" | "timeline" | "analytics">("operations");
  const [activeType, setActiveType] = useState("all");
  const [activeThreat, setActiveThreat] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<MilitaryActivity | null>(null);
  const [comparison, setComparison] = useState<[MilitaryActivity | null, MilitaryActivity | null]>([null, null]);
  const [compareMode, setCompareMode] = useState(false);
  const [showSitrep, setShowSitrep] = useState(false);
  const [expandedUpdates, setExpandedUpdates] = useState(false);

  const { data: activities = [], isLoading } = useQuery<MilitaryActivity[]>({
    queryKey: ["military-activities"],
    queryFn: () => fetch(`${BASE}/api/military-activities`).then(r => r.json()),
    refetchInterval: 60000,
  });
  const { data: summary } = useQuery<Summary>({
    queryKey: ["military-summary"],
    queryFn: () => fetch(`${BASE}/api/military-activities/summary`).then(r => r.json()),
    refetchInterval: 60000,
  });
  const { data: timeline = [] } = useQuery<TimelineEvent[]>({
    queryKey: ["military-timeline"],
    queryFn: () => fetch(`${BASE}/api/military-activities/timeline`).then(r => r.json()),
  });

  const regions = summary?.regions ?? [];

  const filtered = activities.filter(a => {
    if (activeType !== "all" && a.type !== activeType) return false;
    if (activeThreat !== "all" && a.threatLevel !== activeThreat) return false;
    if (activeRegion !== "all" && a.region !== activeRegion) return false;
    return true;
  });

  const handleSelect = (a: MilitaryActivity) => {
    if (compareMode) {
      setComparison(prev => {
        if (!prev[0]) return [a, null];
        if (!prev[1] && prev[0].id !== a.id) return [prev[0], a];
        return [a, null];
      });
    } else {
      setSelected(s => s?.id === a.id ? null : a);
      setExpandedUpdates(false);
    }
  };

  const canCompare = comparison[0] && comparison[1];

  return (
    <div className="flex flex-col gap-4">
      {/* AI SITREP modal */}
      {showSitrep && <SitrepPanel activities={activities} onClose={() => setShowSitrep(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            MILITARY ACTIVITIES
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-0.5">
            Global deployments · Exercises · Airspace restrictions · Naval patrols · Troop movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCompareMode(m => !m); setComparison([null, null]); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-xs transition-all ${compareMode ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "border-border/50 text-muted-foreground hover:text-foreground"}`}
          >
            <GitMerge className="w-3.5 h-3.5" /> COMPARE
          </button>
          <button
            onClick={() => setShowSitrep(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 font-mono text-xs transition-all"
          >
            <Brain className="w-3.5 h-3.5" /> AI SITREP
          </button>
          {(summary?.critical ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 bg-red-500/10">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="font-mono text-xs text-red-400">{summary?.critical} CRITICAL</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400">{summary?.active ?? "—"} ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Live ticker */}
      <LiveTicker activities={activities} />

      {/* Compare mode banner */}
      {compareMode && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/5 font-mono text-xs">
          <GitMerge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400">COMPARISON MODE ACTIVE</span>
          <span className="text-muted-foreground">— Select 2 activities to compare:</span>
          <span className="text-foreground">A: {comparison[0]?.title.slice(0, 30) ?? "—"}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">B: {comparison[1]?.title.slice(0, 30) ?? "—"}</span>
          {canCompare && (
            <button onClick={() => setViewMode("operations")} className="ml-auto px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors">
              VIEW COMPARISON →
            </button>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: "TOTAL",      value: summary?.total ?? "—",       icon: Globe,      color: "text-foreground" },
          { label: "ACTIVE",     value: summary?.active ?? "—",      icon: Activity,   color: "text-emerald-400" },
          { label: "CRITICAL",   value: summary?.critical ?? "—",    icon: AlertTriangle, color: "text-red-400" },
          { label: "EXERCISES",  value: summary?.byType?.exercise ?? "—", icon: Activity, color: "text-blue-400" },
          { label: "NAVAL",      value: summary?.byType?.naval_patrol ?? "—", icon: Anchor, color: "text-cyan-400" },
          { label: "AIRSPACE",   value: (summary?.byType?.restricted_airspace ?? 0) + (summary?.byType?.no_fly_zone ?? 0), icon: Plane, color: "text-amber-400" },
          { label: "NATO OPS",   value: summary?.natoRelated ?? "—", icon: Shield,     color: "text-blue-400" },
          { label: "JOINT OPS",  value: summary?.joint ?? "—",       icon: Users,      color: "text-purple-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card/40 border-border/50">
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[8px] text-muted-foreground">{s.label}</span>
                  <Icon className={`w-3 h-3 ${s.color}`} />
                </div>
                <div className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View mode tabs + filter toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {([
            { id: "operations", label: "OPERATIONS", icon: List },
            { id: "map",        label: "TACTICAL MAP", icon: Map },
            { id: "timeline",   label: "INTEL TIMELINE", icon: Clock },
            { id: "analytics",  label: "ANALYTICS", icon: BarChart2 },
          ] as const).map(tab => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[11px] transition-all ${
                  isActive ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border bg-muted/10"
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[11px] transition-all ${showFilters ? "bg-primary/10 border-primary/30 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
        >
          <Filter className="w-3 h-3" /> FILTERS
          {(activeType !== "all" || activeThreat !== "all" || activeRegion !== "all") && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
          <div>
            <div className="font-mono text-[9px] text-muted-foreground mb-2">TYPE</div>
            <div className="flex flex-wrap gap-1">
              {ALL_TYPES.map(t => {
                const meta = t === "all" ? null : TYPE_META[t];
                return (
                  <button key={t} onClick={() => setActiveType(t)}
                    className={`font-mono text-[10px] px-2 py-1 rounded border transition-all ${activeType === t ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                    {t === "all" ? "ALL" : meta?.label ?? t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-muted-foreground mb-2">THREAT</div>
            <div className="flex gap-1">
              {["all", "critical", "high", "medium", "low"].map(t => (
                <button key={t} onClick={() => setActiveThreat(t)}
                  className={`font-mono text-[10px] px-2 py-1 rounded border transition-all ${activeThreat === t ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {regions.length > 0 && (
            <div>
              <div className="font-mono text-[9px] text-muted-foreground mb-2">REGION</div>
              <div className="flex flex-wrap gap-1">
                {["all", ...regions].map(r => (
                  <button key={r} onClick={() => setActiveRegion(r)}
                    className={`font-mono text-[10px] px-2 py-1 rounded border transition-all ${activeRegion === r ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
                    {r === "all" ? "ALL" : r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => { setActiveType("all"); setActiveThreat("all"); setActiveRegion("all"); }}
            className="self-end font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 border border-border/30 rounded hover:border-border transition-colors">
            <X className="w-3 h-3" /> Clear filters
          </button>
        </div>
      )}

      {/* COMPARISON VIEW */}
      {compareMode && canCompare ? (
        <ComparisonView a={comparison[0]!} b={comparison[1]!} onClear={() => setComparison([null, null])} />
      ) : (
        <>
          {/* OPERATIONS VIEW */}
          {viewMode === "operations" && (
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted/20 animate-pulse border border-border/30" />)
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground font-mono text-sm">No activities match current filters</div>
                ) : filtered.map(a => {
                  const meta = TYPE_META[a.type] ?? TYPE_META.deployment;
                  const Icon = meta.icon;
                  const risk = escalationRisk(a);
                  const isSelected = selected?.id === a.id;
                  const isCompA = comparison[0]?.id === a.id;
                  const isCompB = comparison[1]?.id === a.id;
                  return (
                    <div key={a.id} onClick={() => handleSelect(a)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                        isSelected ? "bg-primary/5 border-primary/30" :
                        isCompA ? "bg-primary/5 border-primary/40" :
                        isCompB ? "bg-amber-500/5 border-amber-500/40" :
                        "bg-card/40 border-border/50 hover:border-border hover:bg-card/60"
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded ${THREAT_STYLE[a.threatLevel]?.cls ?? ""}`}>{a.threatLevel.toUpperCase()}</span>
                                {a.isNatoRelated && <span className="font-mono text-[10px] border border-blue-400/30 bg-blue-400/10 text-blue-400 px-1.5 py-0.5 rounded">NATO</span>}
                                {a.isJoint && <span className="font-mono text-[10px] border border-purple-400/30 bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded">JOINT</span>}
                                {a.isOngoing && <span className="font-mono text-[10px] border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE</span>}
                                {compareMode && isCompA && <span className="font-mono text-[10px] border border-primary/40 bg-primary/10 text-primary px-1.5 py-0.5 rounded">COMPARE A</span>}
                                {compareMode && isCompB && <span className="font-mono text-[10px] border border-amber-500/40 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">COMPARE B</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <RiskGauge score={risk} />
                              <div className="text-right">
                                <div className="font-mono text-xs text-muted-foreground">{a.countryCode || "REG"} {a.country}</div>
                                <div className="font-mono text-[10px] text-muted-foreground/60 flex items-center gap-1 justify-end mt-0.5"><MapPin className="w-2.5 h-2.5" />{a.region}</div>
                              </div>
                            </div>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground mt-2 line-clamp-1">{a.objective}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                      </div>
                      {a.updates.length > 0 && !isSelected && (
                        <div className="mt-2 pt-2 border-t border-border/30 ml-12 flex items-start gap-1.5">
                          <Zap className="w-2.5 h-2.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="font-mono text-[10px] text-muted-foreground/70 leading-snug">{a.updates[0]}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detail panel */}
              {selected && !compareMode && (
                <div className="w-96 flex-shrink-0 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                  <Card className="bg-card/60 border-border sticky top-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {(() => { const m = TYPE_META[selected.type] ?? TYPE_META.deployment; const I = m.icon; return (
                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${m.bg}`}><I className={`w-4 h-4 ${m.color}`} /></div>
                        ); })()}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="font-mono text-xs leading-snug">{selected.title}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className={`text-[10px] font-mono ${THREAT_STYLE[selected.threatLevel]?.cls}`}>{selected.threatLevel.toUpperCase()} THREAT</Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">RISK: {escalationRisk(selected)}/99</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-[11px] font-mono">
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          ["COUNTRY",    `${selected.countryCode ?? "REG"} ${selected.country}`],
                          ["REGION",     selected.region],
                          ["LOCATION",   selected.location ?? "—"],
                          ["PERSONNEL",  selected.estimatedPersonnel ?? "—"],
                          ["START",      selected.startDate ?? "—"],
                          ["END",        selected.endDate ?? (selected.isOngoing ? "Ongoing" : "—")],
                        ].map(([l, v]) => (
                          <div key={l} className="bg-muted/20 rounded-lg p-2">
                            <div className="text-[9px] text-muted-foreground mb-0.5">{l}</div>
                            <div className="text-foreground text-[10px] truncate">{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {selected.isNatoRelated && <span className="text-[10px] border border-blue-400/30 bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded">NATO</span>}
                        {selected.isJoint && <span className="text-[10px] border border-purple-400/30 bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded">JOINT OP</span>}
                        {selected.isOngoing && <span className="text-[10px] border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />ONGOING</span>}
                      </div>
                      {selected.involvedCountries.length > 0 && (
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> INVOLVED NATIONS</div>
                          <div className="flex flex-wrap gap-1">
                            {selected.involvedCountries.map(c => (
                              <span key={c} className="text-[10px] bg-muted/30 border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selected.forces && (
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-2.5 h-2.5" /> FORCES</div>
                          <p className="text-muted-foreground leading-relaxed">{selected.forces}</p>
                        </div>
                      )}
                      {selected.assets.length > 0 && (
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1"><Crosshair className="w-2.5 h-2.5" /> KEY ASSETS</div>
                          <div className="flex flex-wrap gap-1">
                            {selected.assets.map(a => (
                              <span key={a} className="text-[10px] bg-primary/10 border border-primary/20 text-primary/80 px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selected.objective && (
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> OBJECTIVE</div>
                          <p className="text-muted-foreground leading-relaxed">{selected.objective}</p>
                        </div>
                      )}
                      {selected.description && (
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> ASSESSMENT</div>
                          <p className="text-muted-foreground leading-relaxed">{selected.description}</p>
                        </div>
                      )}
                      {selected.updates.length > 0 && (
                        <div>
                          <button onClick={() => setExpandedUpdates(x => !x)} className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1 w-full hover:text-foreground transition-colors">
                            <Zap className="w-2.5 h-2.5 text-amber-400" /> INTELLIGENCE UPDATES ({selected.updates.length})
                            <ChevronDown className={`w-2.5 h-2.5 ml-auto transition-transform ${expandedUpdates ? "rotate-180" : ""}`} />
                          </button>
                          <div className="space-y-1.5">
                            {(expandedUpdates ? selected.updates : selected.updates.slice(0, 1)).map((u, i) => (
                              <div key={i} className="flex gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                                <div className="w-1 bg-amber-400/50 rounded flex-shrink-0" />
                                <p className="text-muted-foreground leading-relaxed">{u}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TACTICAL MAP VIEW */}
          {viewMode === "map" && (
            <div className="flex flex-col gap-3">
              <TacticalMap activities={filtered} onSelect={handleSelect} selected={selected} />
              {selected && (
                <div className="p-3 rounded-xl border border-primary/20 bg-card/50 flex items-center gap-4 font-mono text-xs">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ background: THREAT_STYLE[selected.threatLevel]?.color }} />
                  <span className="font-bold">{selected.title}</span>
                  <Badge variant="outline" className={`text-[10px] ${THREAT_STYLE[selected.threatLevel]?.cls}`}>{selected.threatLevel.toUpperCase()}</Badge>
                  <span className="text-muted-foreground">{selected.countryCode ?? "REG"} {selected.country} · {selected.region}</span>
                  {selected.lat && <span className="text-muted-foreground/50">LAT {selected.lat.toFixed(1)}° LNG {selected.lng?.toFixed(1)}°</span>}
                  <span className="ml-auto text-muted-foreground">ESCALATION: <span className="text-foreground">{escalationRisk(selected)}/99</span></span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {filtered.filter(a => a.lat).map(a => {
                  const meta = TYPE_META[a.type] ?? TYPE_META.deployment;
                  return (
                    <div key={a.id} onClick={() => handleSelect(a)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all text-[10px] font-mono ${selected?.id === a.id ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card/30 hover:border-border"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.dot }} />
                        <span className="text-foreground font-medium truncate">{a.countryCode || "REG"} {a.country}</span>
                        <span className={`ml-auto ${THREAT_STYLE[a.threatLevel]?.cls ?? ""} text-[9px]`}>{a.threatLevel.toUpperCase()}</span>
                      </div>
                      <p className="text-muted-foreground/70 mt-0.5 truncate">{a.title.slice(0, 45)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTEL TIMELINE VIEW */}
          {viewMode === "timeline" && (
            <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-2">
              <div className="font-mono text-[10px] text-muted-foreground px-2 mb-1">
                {timeline.length} intelligence updates · sorted by recency
              </div>
              {timeline.map((evt, i) => {
                const meta = TYPE_META[evt.type] ?? TYPE_META.deployment;
                const Icon = meta.icon;
                const threat = THREAT_STYLE[evt.threatLevel];
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/30 bg-card/30 hover:bg-card/50 transition-colors">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      {i < timeline.length - 1 && <div className="flex-1 w-px bg-border/30" style={{ minHeight: 8 }} />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-semibold text-foreground">
                          REG {evt.country}
                        </span>
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded ${threat?.cls ?? ""}`}>
                          {evt.threatLevel.toUpperCase()}
                        </span>
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground/50 ml-auto">{evt.region}</span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground/70 mt-0.5 truncate">{evt.activityTitle}</p>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1 leading-snug">{evt.update}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {viewMode === "analytics" && (
            <AnalyticsView activities={activities} summary={summary} />
          )}
        </>
      )}
    </div>
  );
}
