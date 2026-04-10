import { Link, useLocation } from "wouter";
import { 
  Globe, 
  ShieldAlert, 
  Users, 
  FileText, 
  Network, 
  UserCircle, 
  RadioTower,
  LayoutDashboard,
  Building2,
  MapPin,
  Scale,
  FileSignature,
  Newspaper,
  Crosshair,
  Wifi,
  Megaphone,
  TrendingUp,
  BarChart2,
  Brain,
  GitBranch,
  Target,
  Map
} from "lucide-react";
import { ReactNode } from "react";
import { GlobalSearch } from "@/components/global-search";

const NAV_SECTIONS = [
  {
    title: "LIVE FEEDS",
    items: [
      { href: "/", label: "Command Center", icon: LayoutDashboard },
      { href: "/live-news", label: "Live World News", icon: Wifi },
      { href: "/press-releases", label: "Press Releases", icon: Megaphone },
      { href: "/intelligence", label: "Intelligence Feed", icon: RadioTower },
    ]
  },
  {
    title: "GLOBAL ACTORS",
    items: [
      { href: "/leaders", label: "World Leaders", icon: UserCircle },
      { href: "/country-intel", label: "Country Intel", icon: MapPin },
    ]
  },
  {
    title: "GEOPOLITICS",
    items: [
      { href: "/countries", label: "Global Profiles", icon: Globe },
      { href: "/conflicts", label: "Active Conflicts", icon: ShieldAlert },
      { href: "/alliances", label: "Alliances", icon: Network },
    ]
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
    ]
  },
  {
    title: "DOMESTIC",
    items: [
      { href: "/legislation", label: "Legislation", icon: FileText },
      { href: "/criminal-cases", label: "Criminal Cases", icon: Scale },
      { href: "/media-events", label: "Media Events", icon: Newspaper },
    ]
  },
  {
    title: "ECONOMIC INTELLIGENCE",
    items: [
      { href: "/economics", label: "Economic Analysis", icon: BarChart2 },
      { href: "/trade", label: "Trade & Sanctions", icon: TrendingUp },
      { href: "/forecasting", label: "Forecasting / AI", icon: Brain },
    ]
  },
  {
    title: "PALANTIR ANALYTICS",
    items: [
      { href: "/entity-graph", label: "Entity Network", icon: GitBranch },
      { href: "/threat-matrix", label: "Threat Matrix", icon: Target },
      { href: "/geo-map", label: "Geospatial Map", icon: Map },
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/delegates", label: "Delegates", icon: UserCircle },
    ]
  }
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden selection:bg-primary/30">
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3 text-primary">
            <Globe className="w-6 h-6" />
            <span className="font-mono font-bold tracking-widest text-lg">SERCOVIR</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col gap-4">
            {NAV_SECTIONS.map((section, idx) => (
              <div key={idx} className="px-4">
                <div className="text-[10px] font-mono text-muted-foreground mb-2 px-2 uppercase tracking-wider font-bold">
                  {section.title}
                </div>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    const Icon = item.icon;
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <div 
                          className={`flex items-center gap-3 px-3 py-1.5 rounded-md transition-all cursor-pointer font-mono text-xs ${
                            isActive 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          {item.label}
                          {isActive && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border bg-sidebar">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">STATUS</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay z-50" 
             style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%' }} />
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm relative z-10">
          <h2 className="font-mono text-sm text-muted-foreground">
            {location.toUpperCase() || "COMMAND CENTER"}
          </h2>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-4">
              <span>SYS.OP: ADMIN</span>
              <span>{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}