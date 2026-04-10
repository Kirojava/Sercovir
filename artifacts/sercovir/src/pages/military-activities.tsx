import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Plane, Anchor, Crosshair, Activity, AlertTriangle,
  Globe, Users, Radio, ChevronRight, ChevronDown, MapPin, Calendar,
  Zap, Eye, TrendingUp
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface MilitaryActivity {
  id: number;
  title: string;
  type: string;
  status: string;
  threatLevel: string;
  country: string;
  countryCode: string | null;
  flagEmoji: string | null;
  region: string;
  location: string | null;
  lat: number | null;
  lng: number | null;
  involvedCountries: string[];
  forces: string | null;
  assets: string[];
  estimatedPersonnel: string | null;
  objective: string | null;
  description: string | null;
  isNatoRelated: boolean | null;
  isJoint: boolean | null;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean | null;
  updates: string[];
}

interface Summary {
  total: number;
  active: number;
  critical: number;
  byType: Record<string, number>;
  byThreat: Record<string, number>;
  natoRelated: number;
  joint: number;
}

const TYPE_META: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  deployment:        { label: "Deployment",        icon: Shield,     color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30" },
  exercise:          { label: "Exercise",           icon: Activity,   color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30" },
  restricted_airspace: { label: "Restricted Airspace", icon: Plane,  color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/30" },
  naval_patrol:      { label: "Naval Patrol",       icon: Anchor,     color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/30" },
  no_fly_zone:       { label: "No-Fly Zone",        icon: Crosshair,  color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
  troop_movement:    { label: "Troop Movement",     icon: Users,      color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
  base_activation:   { label: "Base Activation",    icon: Radio,      color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/30" },
};

const THREAT_COLOR: Record<string, string> = {
  critical: "text-red-400 border-red-400/40 bg-red-400/10",
  high:     "text-orange-400 border-orange-400/40 bg-orange-400/10",
  medium:   "text-amber-400 border-amber-400/40 bg-amber-400/10",
  low:      "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
};

const ALL_TYPES = ["all", "deployment", "exercise", "restricted_airspace", "naval_patrol", "no_fly_zone", "troop_movement", "base_activation"];

export default function MilitaryActivities() {
  const [activeType, setActiveType] = useState("all");
  const [selected, setSelected] = useState<MilitaryActivity | null>(null);
  const [expandedUpdates, setExpandedUpdates] = useState(false);

  const { data: activities = [], isLoading } = useQuery<MilitaryActivity[]>({
    queryKey: ["military-activities"],
    queryFn: () => fetch(`${BASE}/api/military-activities`).then(r => r.json()),
  });

  const { data: summary } = useQuery<Summary>({
    queryKey: ["military-summary"],
    queryFn: () => fetch(`${BASE}/api/military-activities/summary`).then(r => r.json()),
  });

  const filtered = activeType === "all" ? activities : activities.filter(a => a.type === activeType);

  const criticalCount = summary?.critical ?? 0;
  const activeCount = summary?.active ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            MILITARY ACTIVITIES
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Global deployments · Exercises · Restricted airspace · Naval patrols · Force movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 bg-red-500/10 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono text-xs text-red-400">{criticalCount} CRITICAL</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400">{activeCount} ACTIVE OPS</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "TOTAL OPS", value: summary?.total ?? "—", icon: Globe, color: "text-foreground" },
          { label: "ACTIVE", value: summary?.active ?? "—", icon: Activity, color: "text-emerald-400" },
          { label: "CRITICAL", value: summary?.critical ?? "—", icon: AlertTriangle, color: "text-red-400" },
          { label: "NATO", value: summary?.natoRelated ?? "—", icon: Shield, color: "text-blue-400" },
          { label: "JOINT OPS", value: summary?.joint ?? "—", icon: Users, color: "text-purple-400" },
          { label: "EXERCISES", value: summary?.byType?.exercise ?? "—", icon: Activity, color: "text-cyan-400" },
          { label: "RESTRICTED", value: (summary?.byType?.restricted_airspace ?? 0) + (summary?.byType?.no_fly_zone ?? 0), icon: Plane, color: "text-amber-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card/50 border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] text-muted-foreground">{s.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
                <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map(t => {
          const meta = t === "all" ? null : TYPE_META[t];
          const Icon = meta?.icon;
          const count = t === "all" ? activities.length : activities.filter(a => a.type === t).length;
          const isActive = activeType === t;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[11px] transition-all ${
                isActive
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-muted/20"
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {t === "all" ? "ALL" : meta?.label.toUpperCase()}
              <span className={`ml-1 ${isActive ? "text-primary/60" : "text-muted-foreground/50"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 min-h-0">
        {/* Activity list */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/20 animate-pulse border border-border/30" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">No activities found</div>
          ) : (
            filtered.map(a => {
              const meta = TYPE_META[a.type] ?? TYPE_META.deployment;
              const Icon = meta.icon;
              const isSelected = selected?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => { setSelected(isSelected ? null : a); setExpandedUpdates(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                    isSelected
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card/40 border-border/50 hover:border-border hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-semibold text-foreground leading-tight truncate pr-2">{a.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </span>
                            <span className={`font-mono text-[10px] border px-1.5 py-0.5 rounded ${THREAT_COLOR[a.threatLevel] ?? ""}`}>
                              {a.threatLevel.toUpperCase()}
                            </span>
                            {a.isNatoRelated && (
                              <span className="font-mono text-[10px] border border-blue-400/30 bg-blue-400/10 text-blue-400 px-1.5 py-0.5 rounded">NATO</span>
                            )}
                            {a.isJoint && (
                              <span className="font-mono text-[10px] border border-purple-400/30 bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded">JOINT</span>
                            )}
                            {a.isOngoing && (
                              <span className="font-mono text-[10px] border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />ONGOING
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                            <span>{a.flagEmoji}</span>
                            <span>{a.country}</span>
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1 justify-end">
                            <MapPin className="w-2.5 h-2.5" />
                            {a.region}
                          </div>
                        </div>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground mt-2 line-clamp-2">{a.objective}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                  </div>

                  {/* Latest update inline */}
                  {a.updates.length > 0 && !isSelected && (
                    <div className="mt-3 pt-2 border-t border-border/30 ml-12">
                      <p className="font-mono text-[10px] text-muted-foreground/70">
                        <span className="text-amber-400">LATEST: </span>{a.updates[0]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-96 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            <Card className="bg-card/60 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {(() => {
                    const meta = TYPE_META[selected.type] ?? TYPE_META.deployment;
                    const Icon = meta.icon;
                    return (
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <Icon className={`w-4.5 h-4.5 ${meta.color}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-mono text-sm leading-snug">{selected.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className={`text-[10px] font-mono ${THREAT_COLOR[selected.threatLevel]}`}>
                        {selected.threatLevel.toUpperCase()} THREAT
                      </Badge>
                      {selected.isOngoing && (
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                          ONGOING
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-[11px] font-mono">
                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "COUNTRY", value: `${selected.flagEmoji ?? ""} ${selected.country}` },
                    { label: "REGION", value: selected.region },
                    { label: "LOCATION", value: selected.location ?? "—" },
                    { label: "PERSONNEL", value: selected.estimatedPersonnel ?? "—" },
                    { label: "START DATE", value: selected.startDate ?? "—" },
                    { label: "END DATE", value: selected.endDate ?? (selected.isOngoing ? "Ongoing" : "—") },
                  ].map(row => (
                    <div key={row.label} className="bg-muted/20 rounded-lg p-2">
                      <div className="text-[9px] text-muted-foreground mb-0.5">{row.label}</div>
                      <div className="text-foreground text-[10px] truncate">{row.value}</div>
                    </div>
                  ))}
                </div>

                {/* Flags */}
                <div className="flex gap-2">
                  {selected.isNatoRelated && (
                    <span className="font-mono text-[10px] border border-blue-400/30 bg-blue-400/10 text-blue-400 px-2 py-1 rounded">🛡 NATO RELATED</span>
                  )}
                  {selected.isJoint && (
                    <span className="font-mono text-[10px] border border-purple-400/30 bg-purple-400/10 text-purple-400 px-2 py-1 rounded">⚡ JOINT OP</span>
                  )}
                </div>

                {/* Involved countries */}
                {selected.involvedCountries.length > 0 && (
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> INVOLVED NATIONS
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.involvedCountries.map(c => (
                        <span key={c} className="font-mono text-[10px] bg-muted/30 border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forces */}
                {selected.forces && (
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> FORCES
                    </div>
                    <p className="text-foreground">{selected.forces}</p>
                  </div>
                )}

                {/* Assets */}
                {selected.assets.length > 0 && (
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> KEY ASSETS
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.assets.map(a => (
                        <span key={a} className="font-mono text-[10px] bg-primary/10 border border-primary/20 text-primary/80 px-1.5 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objective */}
                {selected.objective && (
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> OBJECTIVE
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{selected.objective}</p>
                  </div>
                )}

                {/* Description */}
                {selected.description && (
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" /> ASSESSMENT
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {/* Updates */}
                {selected.updates.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedUpdates(x => !x)}
                      className="text-[9px] text-muted-foreground mb-1.5 flex items-center gap-1 w-full hover:text-foreground transition-colors"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      INTELLIGENCE UPDATES ({selected.updates.length})
                      <ChevronDown className={`w-2.5 h-2.5 ml-auto transition-transform ${expandedUpdates ? "rotate-180" : ""}`} />
                    </button>
                    {expandedUpdates && (
                      <div className="space-y-1.5">
                        {selected.updates.map((u, i) => (
                          <div key={i} className="flex gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                            <div className="w-1 bg-amber-400/50 rounded flex-shrink-0" />
                            <p className="text-muted-foreground leading-relaxed">{u}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {!expandedUpdates && (
                      <div className="flex gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                        <div className="w-1 bg-amber-400/50 rounded flex-shrink-0" />
                        <p className="text-muted-foreground leading-relaxed">{selected.updates[0]}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
