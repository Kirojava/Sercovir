import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Newspaper, Search, RefreshCw, ExternalLink, RadioTower,
  Clock, Filter, Wifi
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceLabel: string;
  category: string;
  publishedAt: string;
  isBreaking: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  reuters: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  bbc: "text-red-400 border-red-400/30 bg-red-400/10",
  cnn: "text-red-500 border-red-500/30 bg-red-500/10",
  aljazeera: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  guardian: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  abc: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  skynews: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  ft: "text-pink-400 border-pink-400/30 bg-pink-400/10",
  wsj: "text-blue-300 border-blue-300/30 bg-blue-300/10",
  ap: "text-green-400 border-green-400/30 bg-green-400/10",
};

function useNewsData(source: string | null) {
  return useQuery<NewsItem[]>({
    queryKey: ["live-news", source],
    queryFn: async () => {
      const url = source
        ? `${BASE}/api/live-feed?source=${source}&limit=100`
        : `${BASE}/api/live-feed?limit=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 90_000,
    staleTime: 60_000,
    retry: 2,
  });
}

function useSources() {
  return useQuery<{ id: string; label: string; category: string }[]>({
    queryKey: ["news-sources"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/live-feed/sources`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60 * 60 * 1000,
  });
}

function NewsTicker({ items }: { items: NewsItem[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % items.length), 5000);
    return () => clearInterval(iv);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[idx];
  return (
    <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-md px-4 py-2 overflow-hidden">
      <span className="shrink-0 font-mono text-[10px] font-bold text-primary uppercase animate-pulse flex items-center gap-1.5">
        <Wifi className="w-3 h-3" /> LIVE
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="font-mono text-xs text-foreground truncate transition-all">
          <span className={`mr-2 text-[10px] px-1.5 py-0.5 rounded border ${SOURCE_COLORS[item.source] || "text-primary border-primary/30 bg-primary/10"}`}>
            {item.sourceLabel}
          </span>
          {item.title}
        </p>
      </div>
      <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
        {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
      </span>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const colorClass = SOURCE_COLORS[item.source] || "text-primary border-primary/30 bg-primary/10";
  const published = (() => {
    try { return new Date(item.publishedAt); } catch { return new Date(); }
  })();
  const isRecent = Date.now() - published.getTime() < 3 * 60 * 60 * 1000;

  return (
    <Card className={`bg-card/50 border-border backdrop-blur-sm group transition-all hover:border-primary/30 hover:bg-card/80 ${isRecent ? "border-l-2 border-l-primary/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`font-mono text-[10px] uppercase shrink-0 ${colorClass}`}>
              {item.sourceLabel}
            </Badge>
            {isRecent && (
              <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10 shrink-0">
                RECENT
              </Badge>
            )}
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{item.category}</span>
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
          <p className="text-xs text-muted-foreground font-mono line-clamp-2 leading-relaxed mb-3">
            {item.summary.replace(/<[^>]*>/g, "").slice(0, 200)}
            {item.summary.length > 200 ? "..." : ""}
          </p>
        )}

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors"
          >
            READ FULL STORY <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function LiveNews() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { data: news = [], isLoading, isFetching, refetch } = useNewsData(selectedSource);
  const { data: sources = [] } = useSources();

  const uniqueSources = Array.from(new Map(sources.map(s => [s.id, s])).values());

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshed(new Date());
  }, [refetch]);

  const filtered = search
    ? news.filter(
        n =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.sourceLabel.toLowerCase().includes(search.toLowerCase()) ||
          n.summary.toLowerCase().includes(search.toLowerCase())
      )
    : news;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">LIVE WORLD NEWS</h1>
          <p className="text-muted-foreground font-mono mt-1">
            Real-time feeds from Reuters, BBC, CNN, Al Jazeera &amp; more — auto-refreshing.
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

      {news.length > 0 && <NewsTicker items={news.slice(0, 20)} />}

      <div className="flex items-center gap-3 flex-wrap bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <RadioTower className="w-4 h-4 text-primary shrink-0" />
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 font-mono bg-background/50 border-border/50 text-sm"
            placeholder="Search headlines..."
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
            ALL
          </Button>
          {uniqueSources.map(src => (
            <Button
              key={src.id}
              variant={selectedSource === src.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource(src.id === selectedSource ? null : src.id)}
              className={`font-mono text-[10px] h-7 ${SOURCE_COLORS[src.id] ? "" : ""}`}
            >
              {src.label.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-card/30 border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
          <Newspaper className="w-8 h-8 mx-auto mb-3 opacity-30" />
          {news.length === 0
            ? "No live news feeds available. Sources may be temporarily unreachable."
            : "No articles match your search."}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {filtered.length} ARTICLES
              {selectedSource ? ` FROM ${uniqueSources.find(s => s.id === selectedSource)?.label.toUpperCase()}` : " FROM ALL SOURCES"}
            </span>
            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
