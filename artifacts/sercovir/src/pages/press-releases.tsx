import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText, Search, RefreshCw, ExternalLink, Clock, Building2, Wifi
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface PressReleaseItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceLabel: string;
  organization: string;
  publishedAt: string;
}

const SOURCE_COLORS: Record<string, string> = {
  foreignaffairs: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  politico: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  skynews: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  guardian: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  bbc: "text-red-400 border-red-400/30 bg-red-400/10",
  dw: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  france24: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  reuters: "text-orange-300 border-orange-300/30 bg-orange-300/10",
};

const SOURCES = [
  { id: "foreignaffairs", label: "Foreign Affairs" },
  { id: "politico", label: "POLITICO" },
  { id: "reuters", label: "Reuters Politics" },
  { id: "bbc", label: "BBC Politics" },
  { id: "skynews", label: "Sky News" },
  { id: "guardian", label: "The Guardian" },
  { id: "dw", label: "Deutsche Welle" },
  { id: "france24", label: "France 24" },
];

function usePressReleases(source: string | null) {
  return useQuery<PressReleaseItem[]>({
    queryKey: ["press-releases", source],
    queryFn: async () => {
      const url = source
        ? `${BASE}/api/press-releases?org=${source}&limit=80`
        : `${BASE}/api/press-releases?limit=80`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 120_000,
    staleTime: 90_000,
    retry: 2,
  });
}

function PressCard({ item }: { item: PressReleaseItem }) {
  const colorClass = SOURCE_COLORS[item.source] || "text-primary border-primary/30 bg-primary/10";
  const published = (() => {
    try { return new Date(item.publishedAt); } catch { return new Date(); }
  })();
  const isRecent = Date.now() - published.getTime() < 24 * 60 * 60 * 1000;

  return (
    <Card className={`bg-card/50 border-border backdrop-blur-sm group transition-all hover:border-primary/30 hover:bg-card/80 ${isRecent ? "border-l-2 border-l-primary/40" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`font-mono text-[10px] uppercase ${colorClass}`}>
              {item.sourceLabel}
            </Badge>
            {isRecent && (
              <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                NEW
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(published, { addSuffix: true })}
          </span>
        </div>

        <h3 className="font-mono font-bold text-sm mb-2 leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-xs text-muted-foreground font-mono line-clamp-3 leading-relaxed mb-3">
            {item.summary.replace(/<[^>]*>/g, "").slice(0, 300)}
            {item.summary.length > 300 ? "..." : ""}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {item.organization}
          </span>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors"
            >
              FULL STORY <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PressReleases() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { data: releases = [], isLoading, isFetching, refetch } = usePressReleases(selectedSource);

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshed(new Date());
  }, [refetch]);

  const filtered = search
    ? releases.filter(
        r =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.organization.toLowerCase().includes(search.toLowerCase()) ||
          r.summary.toLowerCase().includes(search.toLowerCase())
      )
    : releases;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">POLITICAL PRESS & ANALYSIS</h1>
          <p className="text-muted-foreground font-mono mt-1">
            Live political reporting &amp; analysis from Foreign Affairs, POLITICO, Reuters, BBC Politics &amp; more.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-muted-foreground">
            Updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="font-mono text-xs gap-2"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            REFRESH
          </Button>
        </div>
      </div>

      {releases.length > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-md px-4 py-2">
          <span className="shrink-0 font-mono text-[10px] font-bold text-primary uppercase animate-pulse flex items-center gap-1.5">
            <Wifi className="w-3 h-3" /> LIVE
          </span>
          <p className="font-mono text-xs text-foreground truncate flex-1">
            <span className={`mr-2 text-[10px] px-1.5 py-0.5 rounded border ${SOURCE_COLORS[releases[0]?.source] || "text-primary border-primary/30 bg-primary/10"}`}>
              {releases[0]?.sourceLabel}
            </span>
            {releases[0]?.title}
          </p>
          <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
            LATEST
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <FileText className="w-4 h-4 text-primary shrink-0" />
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 font-mono bg-background/50 border-border/50 text-sm"
            placeholder="Search press & analysis..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={selectedSource === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSource(null)}
            className="font-mono text-[10px] h-7"
          >
            ALL SOURCES
          </Button>
          {SOURCES.map(src => (
            <Button
              key={src.id}
              variant={selectedSource === src.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource(src.id === selectedSource ? null : src.id)}
              className="font-mono text-[10px] h-7"
            >
              {src.label.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-card/30 border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
          <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
          {releases.length === 0
            ? "Loading political analysis feeds..."
            : "No articles match your search."}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {filtered.length} ARTICLES
              {selectedSource ? ` FROM ${SOURCES.find(s => s.id === selectedSource)?.label.toUpperCase()}` : " FROM ALL SOURCES"}
            </span>
            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AUTO-UPDATING
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <PressCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
