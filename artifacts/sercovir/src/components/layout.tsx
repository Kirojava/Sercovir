import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, UserButton } from "@clerk/react";
import {
  BarChart2,
  Brain,
  Building2,
  Clock,
  Crosshair,
  FileSignature,
  FileText,
  GitBranch,
  Globe,
  LayoutDashboard,
  Map,
  MapPin,
  Megaphone,
  Monitor,
  Network,
  Newspaper,
  Radiation,
  RadioTower,
  Scale,
  ShieldAlert,
  Swords,
  Target,
  TrendingUp,
  UserCircle,
  Users,
  Wifi,
  Zap,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { OrbitalScene } from "@/components/orbital-scene";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const NAV_SECTIONS = [
  {
    title: "LIVE SIGNALS",
    items: [
      { href: "/", label: "Command Center", icon: LayoutDashboard },
      { href: "/live-news", label: "Live World News", icon: Wifi },
      { href: "/press-releases", label: "Press Releases", icon: Megaphone },
      { href: "/intelligence", label: "Intelligence Feed", icon: RadioTower },
    ],
  },
  {
    title: "GLOBAL ACTORS",
    items: [
      { href: "/leaders", label: "World Leaders", icon: UserCircle },
      { href: "/country-intel", label: "Country Intel", icon: MapPin },
    ],
  },
  {
    title: "GEOPOLITICS",
    items: [
      { href: "/countries", label: "Global Profiles", icon: Globe },
      { href: "/conflicts", label: "Active Conflicts", icon: ShieldAlert },
      { href: "/alliances", label: "Alliances", icon: Network },
    ],
  },
  {
    title: "INSTITUTIONS",
    items: [
      { href: "/committees", label: "Committees", icon: Users },
      { href: "/resolutions", label: "Resolutions", icon: FileText },
      { href: "/treaties", label: "Treaties", icon: FileSignature },
      { href: "/icj", label: "ICJ Cases", icon: Scale },
      { href: "/interpol", label: "Interpol", icon: Crosshair },
      { href: "/parliamentary", label: "Parliamentary", icon: Building2 },
    ],
  },
  {
    title: "DOMESTIC",
    items: [
      { href: "/legislation", label: "Legislation", icon: FileText },
      { href: "/criminal-cases", label: "Criminal Cases", icon: Scale },
      { href: "/media-events", label: "Media Events", icon: Newspaper },
    ],
  },
  {
    title: "ECONOMIC INTELLIGENCE",
    items: [
      { href: "/economics", label: "Economic Analysis", icon: BarChart2 },
      { href: "/trade", label: "Trade & Sanctions", icon: TrendingUp },
      { href: "/forecasting", label: "Forecasting / AI", icon: Brain },
    ],
  },
  {
    title: "NETWORK ANALYTICS",
    items: [
      { href: "/entity-graph", label: "Entity Network", icon: GitBranch },
      { href: "/threat-matrix", label: "Threat Matrix", icon: Target },
      { href: "/geo-map", label: "Geospatial Map", icon: Map },
    ],
  },
  {
    title: "AI INTELLIGENCE",
    items: [
      { href: "/ai-analyst", label: "ARES AI Analyst", icon: Brain },
      { href: "/crisis-room", label: "Crisis Command Room", icon: Monitor },
      { href: "/operations-timeline", label: "Operations Timeline", icon: Clock },
    ],
  },
  {
    title: "THREAT DOMAINS",
    items: [
      { href: "/cyber-intel", label: "Cyber Intelligence", icon: Zap },
      { href: "/nuclear-monitor", label: "Nuclear / WMD Monitor", icon: Radiation },
      { href: "/military-activities", label: "Military Activities", icon: Swords },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/delegates", label: "Delegates", icon: UserCircle },
      { href: "/community", label: "Operator Commons", icon: MessageCircle },
      { href: "/admin", label: "Admin Console", icon: ShieldCheck },
    ],
  },
];

function Navigation({ mobile = false }: { mobile?: boolean }) {
  const [location] = useLocation();
  const items = NAV_SECTIONS.flatMap((section) => section.items);

  if (mobile) {
    return (
      <nav className="quiet-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Primary navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(" ", "-")}`}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                isActive ? "border-primary/50 bg-primary/10 text-primary" : "border-border/70 bg-card/35 text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-6" aria-label="Primary navigation">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="mb-2 px-3 font-mono text-[9px] font-medium uppercase tracking-[.2em] text-muted-foreground/75">
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}
                  className={`group relative flex items-center gap-3 rounded-md border px-3 py-2 font-mono text-[11px] transition-all ${
                    isActive
                      ? "border-primary/25 bg-primary/[.09] text-primary"
                      : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-card/45 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/.12)]" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const dateStamp = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="sercovir-shell relative min-h-[100dvh] w-full overflow-x-hidden text-foreground selection:bg-primary/25">
      <OrbitalScene />
      <div className="observation-grid pointer-events-none fixed inset-0 z-0 opacity-40" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[274px] border-r border-border/70 bg-[hsl(var(--sidebar)/.76)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-[88px] items-center border-b border-border/70 px-7">
          <Link href="/" data-testid="link-brand" className="group flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center border border-primary/45 text-primary">
              <span className="absolute h-5 w-5 rounded-full border border-primary/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span>
              <span className="block font-serif text-[17px] font-semibold tracking-[.25em] text-foreground">SERCOVIR</span>
              <span className="mt-0.5 block font-mono text-[8px] tracking-[.16em] text-primary/80">GLOBAL SIGNALS / 01</span>
            </span>
          </Link>
        </div>
        <div className="quiet-scrollbar flex-1 overflow-y-auto px-4 py-6">
          <Navigation />
        </div>
        <div className="border-t border-border/70 px-6 py-5">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em]">
            <span className="text-muted-foreground">Network status</span>
            <span className="flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Stable</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-muted-foreground/70">
            <span>Node 07 / Pacific</span>
            <span>Encrypted</span>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-h-[100dvh] lg:pl-[274px]">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-[hsl(var(--background)/.72)] backdrop-blur-xl">
          <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="truncate">Observation room / {location === "/" ? "Command center" : location.slice(1).replaceAll("-", " ")}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:gap-6">
              <GlobalSearch />
              {!isSignedIn && (
                <div className="flex items-center gap-2">
                  <Link href="/sign-in" className="hidden font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground hover:text-primary sm:inline">Sign in</Link>
                  <Link href="/sign-up" className="border border-primary/50 px-3 py-2 font-mono text-[9px] uppercase tracking-[.14em] text-primary hover:bg-primary/10">Join network</Link>
                </div>
              )}
              {isSignedIn && <UserButton appearance={{ elements: { avatarBox: "h-8 w-8", userButtonPopoverCard: "bg-card border-border" } }} />}
              <div className="hidden text-right font-mono text-[9px] uppercase leading-relaxed tracking-[.14em] text-muted-foreground sm:block">
                <div>UTC // {dateStamp}</div>
                <div className="text-primary/70">Channel open / 24 feeds</div>
              </div>
            </div>
          </div>
          <Navigation mobile />
        </header>
        <div className="mx-auto min-h-[calc(100dvh-68px)] w-full max-w-[1540px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}