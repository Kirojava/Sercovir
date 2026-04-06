import { useParams } from "wouter";
import { useGetLeader, useGetLeaderStatements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, MapPin, Activity, ShieldAlert,
  UserCheck, UserX, Globe, Calendar, Network,
  AlertTriangle, BookOpen, Quote
} from "lucide-react";
import { format } from "date-fns";

export default function Leader() {
  const { id } = useParams();
  const { data: leader, isLoading: isLoadingLeader } = useGetLeader(Number(id), { query: { enabled: !!id } });
  const { data: statements, isLoading: isLoadingStatements } = useGetLeaderStatements(Number(id), { query: { enabled: !!id } });

  if (isLoadingLeader) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-1" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!leader) {
    return <div className="p-8 text-center font-mono text-muted-foreground">LEADER NOT FOUND</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-card/50 p-6 rounded-lg border border-border backdrop-blur-sm">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-mono font-bold tracking-tight">{leader.name}</h1>
            {leader.isCurrentlyInPower ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/50 font-mono text-xs">
                IN POWER
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground font-mono text-xs">
                FORMER
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-primary/70" />
              <span className="text-foreground">{leader.position}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-primary/70" />
              <span>{leader.country}</span>
              <span className="opacity-50">({leader.countryCode})</span>
            </div>
            {leader.party && (
              <div className="flex items-center gap-1">
                <Network className="w-4 h-4 text-primary/70" />
                <span>{leader.party}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span>LOC: {leader.currentLocation || "UNKNOWN"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px] w-full md:w-auto p-4 bg-background/50 rounded-md border border-border/50">
          <div className="text-xs font-mono text-muted-foreground mb-1">APPROVAL RATING</div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold font-mono leading-none ${
              (leader.approvalRating || 0) < 40 ? 'text-red-500' :
              (leader.approvalRating || 0) < 60 ? 'text-yellow-500' :
              'text-emerald-500'
            }`}>
              {leader.approvalRating}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full ${
                (leader.approvalRating || 0) < 40 ? 'bg-red-500' :
                (leader.approvalRating || 0) < 60 ? 'bg-yellow-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${leader.approvalRating || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Details */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <BookOpen className="w-4 h-4" />
                INTELLIGENCE DOSSIER
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-border/50 text-sm font-mono">
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">IDEOLOGY</dt>
                  <dd className="col-span-2">{leader.ideology || "N/A"}</dd>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">BORN</dt>
                  <dd className="col-span-2">{leader.bornDate ? format(new Date(leader.bornDate), "MMM dd, yyyy") : "UNKNOWN"}</dd>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">NATIONALITY</dt>
                  <dd className="col-span-2">{leader.nationality || "UNKNOWN"}</dd>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">EDUCATION</dt>
                  <dd className="col-span-2">{leader.education || "UNKNOWN"}</dd>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">NET WORTH</dt>
                  <dd className="col-span-2">{leader.netWorth || "CLASSIFIED"}</dd>
                </div>
                <div className="grid grid-cols-3 p-4">
                  <dt className="text-muted-foreground">TWITTER</dt>
                  <dd className="col-span-2">{leader.twitterHandle || "N/A"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {leader.previousRoles && leader.previousRoles.length > 0 && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Activity className="w-4 h-4" />
                  PREVIOUS ROLES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 font-mono text-sm">
                  {leader.previousRoles.map((role, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">›</span>
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {leader.recentTravel && leader.recentTravel.length > 0 && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  RECENT TRAVEL
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2 font-mono text-sm">
                  {leader.recentTravel.map((travel, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">›</span>
                      <span>{travel}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Background, Achievements, Controversies, Statements */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm text-primary">BACKGROUND ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {leader.background || "No background analysis available."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <ShieldAlert className="w-4 h-4" />
                  NOTABLE ACHIEVEMENTS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {leader.notableAchievements && leader.notableAchievements.length > 0 ? (
                  <ul className="space-y-3 font-mono text-sm">
                    {leader.notableAchievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">+</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm font-mono text-muted-foreground">No data recorded.</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  CONTROVERSIES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {leader.controversies && leader.controversies.length > 0 ? (
                  <ul className="space-y-3 font-mono text-sm">
                    {leader.controversies.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">!</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm font-mono text-muted-foreground">No data recorded.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Quote className="w-4 h-4" />
                RECENT STATEMENTS & COMMUNICATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStatements ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : statements && statements.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {statements.map((stmt) => (
                    <div key={stmt.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            {stmt.platform}
                          </Badge>
                          {stmt.isControversial && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/30 font-mono text-[10px] uppercase">
                              FLAGGED
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {format(new Date(stmt.timestamp), "MMM dd, HH:mm")}
                        </span>
                      </div>
                      <p className="font-mono text-sm mb-2">{stmt.content}</p>
                      {(stmt.topic || stmt.sentiment) && (
                        <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                          {stmt.topic && <span>TOPIC: {stmt.topic.toUpperCase()}</span>}
                          {stmt.sentiment && <span>SENTIMENT: {stmt.sentiment.toUpperCase()}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-mono text-muted-foreground">
                  No intercepted communications found.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
