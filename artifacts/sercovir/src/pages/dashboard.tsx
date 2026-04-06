import { useGetDashboard } from "@workspace/api-client-react";
import { ShieldAlert, Globe, Crosshair, Users, Activity, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
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
          title="MONITORED NATIONS" 
          value={dashboard.totalCountries} 
          icon={Globe} 
        />
        <MetricCard 
          title="ACTIVE COMMITTEES" 
          value={dashboard.activeCommittees || dashboard.totalCommittees} 
          icon={Users} 
        />
        <MetricCard 
          title="DRAFT RESOLUTIONS" 
          value={dashboard.totalResolutions} 
          icon={FileText} 
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