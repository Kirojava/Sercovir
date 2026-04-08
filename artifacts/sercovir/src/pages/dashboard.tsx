import { useState, useEffect } from "react";
import { useGetDashboard } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Globe, Crosshair, Users, Activity, FileText, Wifi, ExternalLink, Clock, RefreshCw, Newspaper, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

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
}

interface PressItem {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceLabel: string;
  organization: string;
  publishedAt: string;
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
  un: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  nato: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  whitehouse: "text-red-400 border-red-400/30 bg-red-400/10",
  usdos: "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  eu: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  icc: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  icj: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  interpol: "text-orange-400 border-orange-400/30 bg-orange-400/10",
};

function LiveNewsTicker({ items }: { items: NewsItem[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % items.length), 4500);
    return () => clearInterval(iv);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[idx];

  return (
    <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-md px-4 py-2.5 overflow-hidden">
      <span className="shrink-0 font-mono text-[10px] font-bold text-primary uppercase animate-pulse flex items-center gap-1.5">
        <Wifi className="w-3 h-3" /> LIVE
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="font-mono text-xs text-foreground truncate">
          <span className={`mr-2 text-[10px] px-1.5 py-0.5 rounded border ${SOURCE_COLORS[item.source] || "text-primary border-primary/30 bg-primary/10"}`}>
            {item.sourceLabel}
          </span>
          {item.title}
        </p>
      </div>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-[10px] font-mono text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
      >
        READ <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard({ query: { refetchInterval: 120_000 } });

  const { data: liveNews = [] } = useQuery<NewsItem[]>({
    queryKey: ["dashboard-live-news"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/live-feed?limit=40`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 90_000,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: pressReleases = [] } = useQuery<PressItem[]>({
    queryKey: ["dashboard-press"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/press-releases?limit=8`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 120_000,
    staleTime: 90_000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const topNews = liveNews.slice(0, 6);
  const topPress = pressReleases.slice(0, 5);

  return (
    <div className="space-y-6">
      {liveNews.length > 0 && <LiveNewsTicker items={liveNews.slice(0, 20)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">GLOBAL INTELLIGENCE OVERVIEW</h1>
          <p className="text-muted-foreground font-mono mt-1">Live metrics and real-time geopolitical threat assessment.</p>
        </div>
        
        <div className={`px-6 py-3 rounded-md border flex items-center gap-3 font-mono font-bold
          ${dashboard.globalThreatLevel === 'critical' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
            dashboard.globalThreatLevel === 'high' ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 
            dashboard.globalThreatLevel === 'elevated' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 
            'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}
        `}>
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] opacity-80 leading-none">THREAT LEVEL</span>
            <span className="uppercase">{dashboard.globalThreatLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="ACTIVE CONFLICTS" 
          value={dashboard.activeConflicts} 
          icon={Crosshair} 
          trend={dashboard.escalatingConflicts ? `+${dashboard.escalatingConflicts} ESCALATING` : undefined}
          trendColor="text-red-500"
        />
        <MetricCard 
          title="WORLD LEADERS" 
          value={dashboard.totalLeaders || 0} 
          icon={Users} 
        />
        <MetricCard 
          title="ACTIVE INTERPOL NOTICES" 
          value={dashboard.activeInterpolNotices || 0} 
          icon={ShieldAlert} 
          trendColor="text-red-500"
        />
        <MetricCard 
          title="ACTIVE ICJ CASES" 
          value={dashboard.activeIcjCases || 0} 
          icon={FileText} 
        />
        <MetricCard 
          title="MONITORED NATIONS" 
          value={dashboard.totalCountries} 
          icon={Globe} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" />
              RECENT INTELLIGENCE BRIEFINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {dashboard.recentBriefings?.map((briefing) => (
                <div key={briefing.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border
                        ${briefing.priority === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                          briefing.priority === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                          'bg-primary/10 border-primary/30 text-primary'}
                      `}>
                        {briefing.priority.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {briefing.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(briefing.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{briefing.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{briefing.content}</p>
                </div>
              ))}
              {(!dashboard.recentBriefings || dashboard.recentBriefings.length === 0) && (
                <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                  No recent briefings intercepted.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
              <Globe className="w-4 h-4" />
              CONFLICTS BY REGION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {dashboard.conflictsByRegion && Object.entries(dashboard.conflictsByRegion).map(([region, count]) => (
                <div key={region} className="space-y-1">
                  <div className="flex justify-between text-sm font-mono">
                    <span>{region}</span>
                    <span className="text-primary font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(count / dashboard.activeConflicts) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm flex items-center justify-between text-primary">
              <span className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                LIVE WORLD NEWS
              </span>
              <Link href="/live-news">
                <span className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  VIEW ALL <ExternalLink className="w-3 h-3" />
                </span>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topNews.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground font-mono text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin opacity-40" />
                Loading live feeds...
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {topNews.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 flex gap-3 hover:bg-muted/50 transition-colors group block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`font-mono text-[10px] shrink-0 ${SOURCE_COLORS[item.source] || "text-primary border-primary/30"}`}>
                          {item.sourceLabel}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm flex items-center justify-between text-primary">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                OFFICIAL PRESS RELEASES
              </span>
              <Link href="/press-releases">
                <span className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  VIEW ALL <ExternalLink className="w-3 h-3" />
                </span>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topPress.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground font-mono text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin opacity-40" />
                Loading official releases...
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {topPress.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 flex gap-3 hover:bg-muted/50 transition-colors group block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`font-mono text-[10px] shrink-0 ${SOURCE_COLORS[item.source] || "text-primary border-primary/30"}`}>
                          {item.sourceLabel}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {item.organization}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendColor }: any) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-mono text-muted-foreground">{title}</p>
          <Icon className="w-4 h-4 text-primary/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-mono font-bold">{value}</h3>
          {trend && (
            <span className={`text-[10px] font-mono font-bold ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
