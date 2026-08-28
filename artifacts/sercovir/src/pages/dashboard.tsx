import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGetDashboardQueryKey, useGetDashboard } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock3,
  Crosshair,
  ExternalLink,
  FileText,
  Globe2,
  Layers3,
  Newspaper,
  Radio,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

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

interface DashboardBriefing {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  timestamp: string;
}

interface DashboardData {
  globalThreatLevel: string;
  totalCountries: number;
  activeConflicts: number;
  escalatingConflicts?: number;
  totalCommittees: number;
  totalResolutions: number;
  totalDelegates?: number;
  totalAlliances?: number;
  totalLeaders?: number;
  activeInterpolNotices?: number;
  activeIcjCases?: number;
  recentBriefings?: DashboardBriefing[];
  conflictsByRegion?: Record<string, number>;
}

const SOURCE_COLORS: Record<string, string> = {
  reuters: "text-[#d2ae57] border-[#d2ae57]/35 bg-[#d2ae57]/10",
  bbc: "text-[#d78878] border-[#d78878]/35 bg-[#d78878]/10",
  cnn: "text-[#d78878] border-[#d78878]/35 bg-[#d78878]/10",
  aljazeera: "text-[#b9c86f] border-[#b9c86f]/35 bg-[#b9c86f]/10",
  guardian: "text-[#73b8b1] border-[#73b8b1]/35 bg-[#73b8b1]/10",
  abc: "text-[#a9c6b9] border-[#a9c6b9]/35 bg-[#a9c6b9]/10",
  skynews: "text-[#81b8b1] border-[#81b8b1]/35 bg-[#81b8b1]/10",
  ft: "text-[#d2ae57] border-[#d2ae57]/35 bg-[#d2ae57]/10",
  wsj: "text-[#a9c6b9] border-[#a9c6b9]/35 bg-[#a9c6b9]/10",
  un: "text-[#73b8b1] border-[#73b8b1]/35 bg-[#73b8b1]/10",
  nato: "text-[#81b8b1] border-[#81b8b1]/35 bg-[#81b8b1]/10",
  whitehouse: "text-[#d78878] border-[#d78878]/35 bg-[#d78878]/10",
  usdos: "text-[#9bb9aa] border-[#9bb9aa]/35 bg-[#9bb9aa]/10",
  eu: "text-[#d2ae57] border-[#d2ae57]/35 bg-[#d2ae57]/10",
  icc: "text-[#b2a6ca] border-[#b2a6ca]/35 bg-[#b2a6ca]/10",
  icj: "text-[#73b8b1] border-[#73b8b1]/35 bg-[#73b8b1]/10",
  interpol: "text-[#d2ae57] border-[#d2ae57]/35 bg-[#d2ae57]/10",
};

function SourceMark({ source, label }: { source: string; label: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-sm border px-1.5 py-1 font-mono text-[9px] uppercase tracking-wide ${SOURCE_COLORS[source] || "border-primary/30 bg-primary/10 text-primary"}`}>
      {label}
    </span>
  );
}

function FeedTicker({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[index];
  return (
    <div className="glass-panel flex min-h-[42px] items-center gap-3 px-3 py-2 sm:px-4" data-testid="status-live-feed">
      <span className="flex shrink-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[.16em] text-primary">
        <Radio className="h-3.5 w-3.5 animate-pulse" /> Live intercept
      </span>
      <span className="hidden h-4 w-px bg-border sm:block" />
      <SourceMark source={item.source} label={item.sourceLabel} />
      <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground/80">{item.title}</p>
      <a href={item.link} target="_blank" rel="noopener noreferrer" data-testid={`link-live-ticker-${item.id}`} className="flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary">
        Open <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone = "primary" }: { label: string; value: number | string; detail?: string; icon: typeof Globe2; tone?: "primary" | "amber" | "red" }) {
  const toneClass = tone === "amber" ? "text-accent" : tone === "red" ? "text-destructive" : "text-primary";
  return (
    <div className="group relative border-l border-border/80 pl-4 transition-colors hover:border-primary/70" data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className={`mb-4 flex items-center justify-between ${toneClass}`}>
        <span className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 opacity-60 transition-transform group-hover:scale-110" />
      </div>
      <div className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">{value}</div>
      {detail && <div className={`mt-2 font-mono text-[9px] uppercase tracking-[.12em] ${toneClass}`}>{detail}</div>}
    </div>
  );
}

function BriefingRow({ briefing, index }: { briefing: any; index: number }) {
  const priorityClass = briefing.priority === "critical" ? "text-destructive" : briefing.priority === "high" ? "text-accent" : "text-primary";
  return (
    <article className="group border-t border-border/70 py-5 first:border-t-0" data-testid={`briefing-${briefing.id}`}>
      <div className="flex items-start gap-4">
        <span className="pt-0.5 font-mono text-[10px] text-muted-foreground/60">0{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={`font-mono text-[9px] uppercase tracking-[.16em] ${priorityClass}`}>{briefing.priority || "field"} priority</span>
            <span className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground/60">{briefing.category}</span>
            <span className="font-mono text-[9px] text-muted-foreground/60">{new Date(briefing.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC</span>
          </div>
          <h3 className="font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary">{briefing.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{briefing.content}</p>
        </div>
        <ChevronRight className="mt-1 hidden h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
      </div>
    </article>
  );
}

function FeedPanel({ title, items, kind }: { title: string; items: (NewsItem | PressItem)[]; kind: "news" | "press" }) {
  return (
    <section className="glass-panel" data-testid={`panel-${kind}-feed`}>
      <div className="flex items-start justify-between border-b border-border/70 px-5 py-5 sm:px-6">
        <div>
          <div className="kicker mb-2">{kind === "news" ? "Signal stream / 04" : "Institutional record / 02"}</div>
          <h2 className="font-serif text-xl text-foreground">{title}</h2>
        </div>
        <Link href={kind === "news" ? "/live-news" : "/press-releases"} data-testid={`link-view-${kind}`} className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground transition-colors hover:text-primary">
          Full stream <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 px-5 py-10 font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:px-6"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Awaiting transmission</div>
        ) : items.map((item) => (
          <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" data-testid={`link-feed-${kind}-${item.id}`} className="group block border-b border-border/50 px-5 py-4 last:border-0 transition-colors hover:bg-primary/[.04] sm:px-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SourceMark source={item.source} label={item.sourceLabel} />
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/60"><Clock3 className="h-3 w-3" /> {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</span>
            </div>
            <p className="max-w-xl font-mono text-xs leading-5 text-foreground/90 transition-colors group-hover:text-primary">{item.title}</p>
            {kind === "press" && <p className="mt-1 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">{(item as PressItem).organization}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { data: rawDashboard, isLoading, isError, refetch } = useGetDashboard({
    query: { queryKey: getGetDashboardQueryKey(), refetchInterval: 120_000 },
  });
  const dashboard = rawDashboard as DashboardData | undefined;
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".dashboard-reveal"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-reveal-visible", "true");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [dashboard]);
  const { data: liveNews = [] } = useQuery<NewsItem[]>({
    queryKey: ["dashboard-live-news"],
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/live-feed?limit=40`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to reach live feed");
      return response.json();
    },
    refetchInterval: 90_000,
    staleTime: 60_000,
    retry: 1,
  });
  const { data: pressReleases = [] } = useQuery<PressItem[]>({
    queryKey: ["dashboard-press"],
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/press-releases?limit=8`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to reach press feed");
      return response.json();
    },
    refetchInterval: 120_000,
    staleTime: 90_000,
    retry: 1,
  });

  const regions = Object.entries(dashboard?.conflictsByRegion || {}).sort(([, a], [, b]) => Number(b) - Number(a));
  const maxRegionValue = Math.max(Number(regions[0]?.[1] || 1), 1);

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="dashboard-loading">
        <Skeleton className="h-10 w-44 bg-primary/10" />
        <Skeleton className="h-[330px] w-full bg-primary/10" />
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4"><Skeleton className="h-28 bg-primary/10" /><Skeleton className="h-28 bg-primary/10" /><Skeleton className="h-28 bg-primary/10" /><Skeleton className="h-28 bg-primary/10" /></div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="glass-panel flex min-h-[360px] flex-col items-start justify-center px-6 sm:px-12" data-testid="dashboard-error">
        <div className="kicker mb-4 text-destructive">Transmission interrupted / 01</div>
        <h1 className="font-serif text-3xl">The observation room is offline.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">The command center could not establish a current intelligence snapshot.</p>
        <button type="button" onClick={() => refetch()} data-testid="button-retry-dashboard" className="mt-7 flex items-center gap-2 border border-primary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[.15em] text-primary transition-colors hover:bg-primary/10"><RefreshCw className="h-3.5 w-3.5" /> Reconnect</button>
      </div>
    );
  }

  const topNews = liveNews.slice(0, 5);
  const topPress = pressReleases.slice(0, 5);
  const threat = String(dashboard.globalThreatLevel || "elevated");
  const threatTone = threat === "critical" || threat === "high" ? "text-destructive" : threat === "elevated" ? "text-accent" : "text-primary";

  return (
    <div className="space-y-16 pb-16">
      <FeedTicker items={liveNews.slice(0, 20)} />

      <section className="dashboard-reveal relative overflow-hidden pt-8 sm:pt-14" data-testid="dashboard-hero">
        <div className="pointer-events-none absolute -right-10 top-0 hidden h-full w-1/2 border-l border-border/30 lg:block" />
        <div className="relative max-w-4xl">
          <div className="kicker mb-5 flex items-center gap-3"><span>Field view / 00.1</span><span className="h-px w-12 bg-primary/60" /><span className="text-muted-foreground">Updated continuously</span></div>
          <h1 className="max-w-4xl font-serif text-5xl leading-[.95] tracking-[-.04em] text-foreground sm:text-7xl lg:text-[clamp(5rem,9vw,9.5rem)]">
            The world,<br /><span className="text-primary">under pressure.</span>
          </h1>
          <div className="mt-8 flex max-w-2xl flex-col gap-6 sm:flex-row sm:items-end">
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">One connected field of actors, conflicts, institutions, and signals. Read the pressure before it becomes the headline.</p>
            <div className="shrink-0 font-mono text-[9px] uppercase leading-5 tracking-[.14em] text-muted-foreground/65"><div>Archive window</div><div className="text-foreground">Live / 24 channels</div></div>
          </div>
        </div>
        <div className="mt-14 grid gap-9 border-y border-border/70 py-7 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Active conflicts" value={dashboard.activeConflicts} detail={dashboard.escalatingConflicts ? `${dashboard.escalatingConflicts} escalating now` : "No escalation flagged"} icon={Crosshair} tone={dashboard.escalatingConflicts ? "red" : "primary"} />
          <Metric label="Nations observed" value={dashboard.totalCountries} detail="Global coverage" icon={Globe2} />
          <Metric label="World leaders" value={dashboard.totalLeaders || 0} detail="Actor registry" icon={Users} tone="amber" />
          <Metric label="Global threat" value={threat.toUpperCase()} detail="Current assessment" icon={ShieldAlert} tone={threat === "normal" ? "primary" : "amber"} />
        </div>
      </section>

      <section className="dashboard-reveal dashboard-reveal-delay-1 grid gap-6 lg:grid-cols-[1.3fr_.7fr]" data-testid="dashboard-briefings">
        <div className="glass-panel px-5 py-6 sm:px-7 sm:py-8">
          <div className="mb-7 flex items-end justify-between border-b border-border/70 pb-5">
            <div><div className="kicker mb-2">Analyst desk / 07</div><h2 className="font-serif text-2xl">Recent intelligence</h2></div>
            <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] ${threatTone}`}><span className="h-2 w-2 animate-pulse rounded-full bg-current" /> {threat} posture</div>
          </div>
          {dashboard.recentBriefings?.length ? dashboard.recentBriefings.slice(0, 5).map((briefing: DashboardBriefing, index: number) => <BriefingRow key={briefing.id} briefing={briefing} index={index} />) : <div className="py-12 text-center font-mono text-[10px] uppercase tracking-wide text-muted-foreground">No briefings in current window.</div>}
        </div>

        <div className="glass-panel px-5 py-6 sm:px-7 sm:py-8">
          <div className="mb-8 border-b border-border/70 pb-5"><div className="kicker mb-2">Pressure map / 02</div><h2 className="font-serif text-2xl">Regional pulse</h2></div>
          <div className="space-y-6">
            {regions.length ? regions.map(([region, count]) => (
              <div key={region} data-testid={`region-${region.toLowerCase().replaceAll(" ", "-")}`}>
                <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.12em]"><span className="truncate text-muted-foreground">{region}</span><span className="text-primary">{Number(count)}</span></div>
                <div className="h-1 overflow-hidden bg-secondary"><div className="h-full bg-primary transition-all duration-700" style={{ width: `${(Number(count) / maxRegionValue) * 100}%` }} /></div>
              </div>
            )) : <p className="font-mono text-[10px] uppercase text-muted-foreground">Regional data pending.</p>}
          </div>
          <div className="mt-10 border-t border-border/70 pt-5 font-mono text-[9px] uppercase leading-5 tracking-[.12em] text-muted-foreground/70">Relative concentration<br /><span className="text-foreground">Conflict registry / latest snapshot</span></div>
        </div>
      </section>

      <section className="dashboard-reveal dashboard-reveal-delay-2 grid grid-cols-2 gap-x-5 gap-y-8 border-y border-border/70 py-8 sm:grid-cols-3 lg:grid-cols-6" data-testid="dashboard-index">
        <Metric label="Committees" value={dashboard.totalCommittees || 0} icon={Layers3} />
        <Metric label="Resolutions" value={dashboard.totalResolutions || 0} icon={FileText} />
        <Metric label="Delegates" value={dashboard.totalDelegates || 0} icon={Users} tone="amber" />
        <Metric label="Alliances" value={dashboard.totalAlliances || 0} icon={Globe2} />
        <Metric label="Interpol notices" value={dashboard.activeInterpolNotices || 0} icon={ShieldAlert} tone="red" />
        <Metric label="ICJ cases" value={dashboard.activeIcjCases || 0} icon={Building2} tone="amber" />
      </section>

      <section className="dashboard-reveal dashboard-reveal-delay-3 grid gap-6 lg:grid-cols-2" data-testid="dashboard-feeds">
        <FeedPanel title="Live world news" items={topNews} kind="news" />
        <FeedPanel title="Official press releases" items={topPress} kind="press" />
      </section>

      <footer className="dashboard-reveal dashboard-reveal-delay-4 flex flex-col gap-4 border-t border-border/70 pt-6 font-mono text-[9px] uppercase tracking-[.15em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between" data-testid="dashboard-footer">
        <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-primary" /> Sercovir observation room / stable</span>
        <span>Signal archive synchronized <ArrowDownRight className="ml-1 inline h-3 w-3 text-primary" /></span>
      </footer>
    </div>
  );
}