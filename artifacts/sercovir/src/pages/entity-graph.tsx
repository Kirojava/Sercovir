import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, Globe, Users, ShieldAlert, FileSignature, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface GraphNode {
  id: string;
  type: string;
  label: string;
  subtitle?: string;
  meta?: string;
  size: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  country: Globe,
  leader: Users,
  alliance: Network,
  conflict: ShieldAlert,
  treaty: FileSignature,
};

const EDGE_COLORS: Record<string, string> = {
  governs: "rgba(129, 140, 248, 0.4)",
  alliance: "rgba(56, 189, 248, 0.5)",
  conflict: "rgba(244, 63, 94, 0.4)",
  treaty: "rgba(168, 85, 247, 0.35)",
};

function useForceSimulation(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const posRef = useRef<Map<string, NodePos>>(new Map());
  const [tick, setTick] = useState(0);
  const animRef = useRef<number | null>(null);
  const stableRef = useRef(false);

  useEffect(() => {
    if (!nodes.length || !width || !height) return;
    const map = new Map<string, NodePos>();
    const cx = width / 2;
    const cy = height / 2;

    const typeZones: Record<string, { x: number; y: number }> = {
      alliance: { x: cx, y: cy * 0.35 },
      country: { x: cx, y: cy },
      conflict: { x: cx * 1.4, y: cy * 1.5 },
      leader: { x: cx * 0.6, y: cy * 1.5 },
    };

    const typeCounters: Record<string, number> = {};
    nodes.forEach((n) => {
      const zone = typeZones[n.type] || { x: cx, y: cy };
      const idx = typeCounters[n.type] || 0;
      typeCounters[n.type] = idx + 1;
      const count = nodes.filter(x => x.type === n.type).length;
      const angle = (idx / Math.max(count, 1)) * Math.PI * 2;
      const spread = n.type === "country" ? 220 : 120;
      map.set(n.id, {
        x: Math.max(30, Math.min(width - 30, zone.x + spread * Math.cos(angle) * (count > 6 ? 1 : 0.6))),
        y: Math.max(30, Math.min(height - 30, zone.y + spread * Math.sin(angle) * (count > 6 ? 1 : 0.6))),
        vx: 0,
        vy: 0,
      });
    });

    posRef.current = map;
    stableRef.current = false;
    setTick(t => t + 1);
  }, [nodes.length, edges.length, width, height]);

  useEffect(() => {
    if (!nodes.length || !width || !height) return;

    let frame = 0;
    const MAX_FRAMES = 300;
    const alpha = { val: 1 };
    const DECAY = 0.97;

    const simulate = () => {
      if (frame++ > MAX_FRAMES || alpha.val < 0.001) {
        stableRef.current = true;
        setTick(t => t + 1);
        return;
      }
      alpha.val *= DECAY;
      const map = posRef.current;
      const nodeArr = nodes;
      const cx = width / 2;
      const cy = height / 2;

      for (const n of nodeArr) {
        const p = map.get(n.id)!;
        if (!p) continue;
        p.vx += (cx - p.x) * 0.003 * alpha.val;
        p.vy += (cy - p.y) * 0.003 * alpha.val;
      }

      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const pi = map.get(nodeArr[i].id)!;
          const pj = map.get(nodeArr[j].id)!;
          if (!pi || !pj) continue;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulsion = (nodeArr[i].size + nodeArr[j].size) * 5 + 60;
          if (dist < repulsion) {
            const force = (repulsion - dist) / dist * 0.3 * alpha.val;
            pi.vx += dx * force;
            pi.vy += dy * force;
            pj.vx -= dx * force;
            pj.vy -= dy * force;
          }
        }
      }

      const edgeSet = edges;
      for (const e of edgeSet) {
        const ps = map.get(e.source);
        const pt = map.get(e.target);
        if (!ps || !pt) continue;
        const dx = pt.x - ps.x;
        const dy = pt.y - ps.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ideal = 130;
        const force = (dist - ideal) / dist * 0.2 * alpha.val;
        ps.vx += dx * force;
        ps.vy += dy * force;
        pt.vx -= dx * force;
        pt.vy -= dy * force;
      }

      const damping = 0.7;
      for (const n of nodeArr) {
        const p = map.get(n.id)!;
        if (!p) continue;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(n.size + 10, Math.min(width - n.size - 10, p.x));
        p.y = Math.max(n.size + 10, Math.min(height - n.size - 10, p.y));
      }

      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [nodes.length, edges.length, width, height]);

  return { positions: posRef.current, tick };
}

const FILTER_TYPES = ["all", "country", "leader", "alliance", "conflict"];

export default function EntityGraph() {
  const [filterType, setFilterType] = useState("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });

  const { data, isLoading, refetch } = useQuery<GraphData>({
    queryKey: ["entity-graph"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/entity-graph`);
      return r.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.max(width, 400), h: Math.max(height, 400) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const allNodes = data?.nodes || [];
  const allEdges = data?.edges || [];

  const filteredNodes = filterType === "all" ? allNodes : allNodes.filter(n => n.type === filterType);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = allEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  const { positions } = useForceSimulation(filteredNodes, filteredEdges, dims.w, dims.h);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(n => n?.id === node.id ? null : node);
  }, []);

  const connectedEdges = selectedNode
    ? filteredEdges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];
  const connectedIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]));

  const typeCount = {
    country: allNodes.filter(n => n.type === "country").length,
    leader: allNodes.filter(n => n.type === "leader").length,
    alliance: allNodes.filter(n => n.type === "alliance").length,
    conflict: allNodes.filter(n => n.type === "conflict").length,
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">ENTITY NETWORK</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Real-time relationship graph across geopolitical entities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-2 rounded-md border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.15))}
            className="p-2 rounded-md border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); refetch(); }}
            className="p-2 rounded-md border border-border bg-card/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {(["country", "leader", "alliance", "conflict"] as const).map(t => {
          const colors: Record<string, string> = {
            country: "text-emerald-400", leader: "text-indigo-400", alliance: "text-sky-400", conflict: "text-red-400"
          };
          return (
            <Card key={t} className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{t}s</p>
                  <p className={`text-xl font-mono font-bold ${colors[t]}`}>{typeCount[t]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {FILTER_TYPES.map(t => (
          <button
            key={t}
            onClick={() => { setFilterType(t); setSelectedNode(null); }}
            className={`px-3 py-1 rounded-md font-mono text-xs uppercase border transition-all ${
              filterType === t
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-card/50 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {filteredNodes.length} nodes · {filteredEdges.length} edges
        </span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div ref={containerRef} className="flex-1 relative bg-card/30 border border-border rounded-xl overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Network className="w-12 h-12 text-primary/30 mx-auto animate-pulse" />
                <p className="font-mono text-sm text-muted-foreground">Building entity graph…</p>
              </div>
            </div>
          ) : (
            <svg
              width={dims.w}
              height={dims.h}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="w-full h-full"
            >
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(100,100,120,0.5)" />
                </marker>
              </defs>

              {filteredEdges.map((e, idx) => {
                const ps = positions.get(e.source);
                const pt = positions.get(e.target);
                if (!ps || !pt) return null;
                const isHighlighted = selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id);
                const isHidden = selectedNode && !isHighlighted;
                return (
                  <line
                    key={idx}
                    x1={ps.x} y1={ps.y} x2={pt.x} y2={pt.y}
                    stroke={isHighlighted ? EDGE_COLORS[e.type] || "rgba(100,200,255,0.6)" : "rgba(80,80,100,0.25)"}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeDasharray={e.type === "treaty" ? "4,3" : undefined}
                    opacity={isHidden ? 0.1 : 1}
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {filteredNodes.map(n => {
                const p = positions.get(n.id);
                if (!p) return null;
                const isSelected = selectedNode?.id === n.id;
                const isConnected = connectedIds.has(n.id);
                const isDimmed = selectedNode && !isSelected && !isConnected;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    onClick={() => handleNodeClick(n)}
                    style={{ cursor: "pointer" }}
                    opacity={isDimmed ? 0.2 : 1}
                  >
                    {isSelected && (
                      <circle r={n.size + 8} fill="none" stroke={n.color} strokeWidth={2} opacity={0.5} />
                    )}
                    <circle
                      r={n.size}
                      fill={n.color + "30"}
                      stroke={n.color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      y={n.size + 12}
                      textAnchor="middle"
                      fill="rgba(200,210,220,0.9)"
                      fontSize={10}
                      fontFamily="monospace"
                    >
                      {n.label.length > 14 ? n.label.slice(0, 14) + "…" : n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] font-mono text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border">
            {[
              { color: "#22c55e", label: "Countries" },
              { color: "#818cf8", label: "Leaders" },
              { color: "#38bdf8", label: "Alliances" },
              { color: "#f43f5e", label: "Conflicts" },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {selectedNode && (
          <div className="w-64 flex-shrink-0">
            <Card className="bg-card/50 border-border backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm">ENTITY DETAILS</CardTitle>
                  <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground">
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: selectedNode.color }} />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{selectedNode.type}</span>
                  </div>
                  <p className="font-mono text-sm font-bold">{selectedNode.label}</p>
                  {selectedNode.subtitle && <p className="font-mono text-xs text-muted-foreground mt-0.5">{selectedNode.subtitle}</p>}
                  {selectedNode.meta && (
                    <Badge variant="outline" className="mt-2 font-mono text-[10px] uppercase">{selectedNode.meta}</Badge>
                  )}
                </div>

                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Connections ({connectedEdges.length})</p>
                  <div className="space-y-1.5">
                    {connectedEdges.slice(0, 8).map((e, i) => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source;
                      const otherNode = filteredNodes.find(n => n.id === otherId);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: otherNode?.color || "#888" }} />
                          <span className="text-muted-foreground flex-1 truncate">{otherNode?.label || otherId}</span>
                          <span className="text-[10px] text-muted-foreground/60">{e.label}</span>
                        </div>
                      );
                    })}
                    {connectedEdges.length > 8 && (
                      <p className="text-[10px] text-muted-foreground">+{connectedEdges.length - 8} more</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
