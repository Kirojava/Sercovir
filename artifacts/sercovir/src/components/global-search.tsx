import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Globe, Users, ShieldAlert, Network, FileSignature, Crosshair, Scale, FileText, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface SearchResult {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  country: Globe,
  leader: Users,
  conflict: ShieldAlert,
  alliance: Network,
  treaty: FileSignature,
  interpol: Crosshair,
  icj: Scale,
  resolution: FileText,
  committee: Users,
};

const TYPE_COLORS: Record<string, string> = {
  country: "text-emerald-400",
  leader: "text-indigo-400",
  conflict: "text-red-400",
  alliance: "text-sky-400",
  treaty: "text-purple-400",
  interpol: "text-orange-400",
  icj: "text-cyan-400",
  resolution: "text-yellow-400",
  committee: "text-pink-400",
};

const BADGE_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  elevated: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  passed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setDebouncedQuery("");
      setSelectedIdx(0);
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<{ results: SearchResult[] }>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return { results: [] };
      const r = await fetch(`${BASE}/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      return r.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 10_000,
  });

  const results = data?.results || [];

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.href);
    setOpen(false);
  }, [navigate]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[selectedIdx]) handleSelect(results[selectedIdx]);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all font-mono text-xs"
      >
        <Search className="w-3 h-3" />
        <span>Search entities…</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-muted border border-border">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {isFetching ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKey}
            placeholder="Search countries, leaders, conflicts, treaties…"
            className="flex-1 bg-transparent outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && debouncedQuery.length >= 2 && !isFetching && (
            <div className="px-4 py-8 text-center text-muted-foreground font-mono text-sm">
              No entities found for "{debouncedQuery}"
            </div>
          )}
          {results.length === 0 && debouncedQuery.length < 2 && (
            <div className="px-4 py-8 text-center font-mono text-xs text-muted-foreground space-y-1">
              <p>Search across all intelligence entities</p>
              <p className="text-[10px]">Countries · Leaders · Conflicts · Alliances · Treaties · Interpol · ICJ</p>
            </div>
          )}
          {results.map((r, idx) => {
            const Icon = TYPE_ICONS[r.type] || Search;
            const colorCls = TYPE_COLORS[r.type] || "text-primary";
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={`${r.type}-${r.id}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-muted/40"}`}
                onClick={() => handleSelect(r)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <Icon className={`w-4 h-4 shrink-0 ${colorCls}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-foreground truncate">{r.title}</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border font-mono uppercase ${BADGE_COLORS[r.badge] || "bg-muted text-muted-foreground border-border"}`}>
                      {r.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                    {r.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-card/50 flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
            <span className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}
