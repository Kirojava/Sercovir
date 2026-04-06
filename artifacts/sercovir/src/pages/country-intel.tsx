import { useState } from "react";
import { useGetCountryIntelligence } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, ShieldAlert, Globe, Activity, FileText, 
  Users, Scale, RadioTower, Building2 
} from "lucide-react";
import { format } from "date-fns";

export default function CountryIntel() {
  const [searchInput, setSearchInput] = useState("");
  const [queryCode, setQueryCode] = useState("");
  
  const { data: intel, isLoading, isError } = useGetCountryIntelligence(queryCode, { 
    query: { enabled: !!queryCode, retry: false } 
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQueryCode(searchInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">COUNTRY INTELLIGENCE</h1>
          <p className="text-muted-foreground font-mono mt-1">Comprehensive A-Z intelligence reports by nation.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Enter country name or ISO code (e.g. USA, China, FRA)..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" className="font-mono bg-primary text-primary-foreground hover:bg-primary/90">
          EXECUTE QUERY
        </Button>
      </form>

      {!queryCode && !isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-border/50 rounded-lg bg-card/10">
          <Globe className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-mono text-lg font-bold text-muted-foreground">AWAITING QUERY</h3>
          <p className="font-mono text-sm text-muted-foreground/70">Enter a country identifier to generate a full intelligence dossier.</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}

      {isError && queryCode && !isLoading && (
        <div className="py-12 text-center border border-red-500/30 rounded-lg bg-red-500/5">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-mono text-lg font-bold text-red-500">NO DATA FOUND</h3>
          <p className="font-mono text-sm text-red-500/70">Could not compile intelligence report for "{queryCode}".</p>
        </div>
      )}

      {intel && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row gap-6 justify-between p-6 rounded-lg bg-gradient-to-br from-card/80 to-background border border-border backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{intel.country.flagEmoji}</span>
                <h2 className="text-3xl font-mono font-bold">{intel.country.name}</h2>
                <Badge variant="outline" className="font-mono text-sm">{intel.country.code}</Badge>
              </div>
              <div className="flex gap-4 text-sm font-mono text-muted-foreground mt-4">
                <span>SYS: {intel.country.politicalSystem || "UNKNOWN"}</span>
                <span>REG: {intel.country.region}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-md border border-border/50 flex flex-col justify-center">
                <span className="text-xs font-mono text-muted-foreground mb-1">THREAT LEVEL</span>
                <span className={`text-xl font-bold font-mono uppercase ${
                  intel.country.threatLevel === 'critical' ? 'text-red-500' :
                  intel.country.threatLevel === 'high' ? 'text-orange-500' :
                  'text-emerald-500'
                }`}>
                  {intel.country.threatLevel}
                </span>
              </div>
              <div className="p-4 bg-background/50 rounded-md border border-border/50 flex flex-col justify-center">
                <span className="text-xs font-mono text-muted-foreground mb-1">STABILITY</span>
                <span className="text-xl font-bold font-mono text-primary">
                  {intel.country.stabilityIndex || 0}/100
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Leadership & Statements */}
            <Card className="bg-card/50 border-border backdrop-blur-sm xl:col-span-1">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4" />
                  LEADERSHIP
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/50 h-[400px] overflow-y-auto">
                {intel.leaders?.map(leader => (
                  <div key={leader.id} className="p-4 hover:bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono font-bold text-sm">{leader.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{leader.position}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">{leader.approvalRating}% APP</Badge>
                    </div>
                  </div>
                ))}
                {(!intel.leaders || intel.leaders.length === 0) && (
                  <div className="p-4 text-center font-mono text-xs text-muted-foreground">No leadership data</div>
                )}
              </CardContent>
            </Card>

            {/* Recent Briefings / Events */}
            <Card className="bg-card/50 border-border backdrop-blur-sm xl:col-span-2">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <RadioTower className="w-4 h-4" />
                  INCIDENTS & BRIEFINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/50 h-[400px] overflow-y-auto">
                {intel.intelligenceBriefings?.map(briefing => (
                  <div key={briefing.id} className="p-4 border-l-2 border-l-primary/50 hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                        BRIEFING: {briefing.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {format(new Date(briefing.timestamp), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm mb-1">{briefing.title}</div>
                    <div className="font-mono text-xs text-muted-foreground line-clamp-2">{briefing.content}</div>
                  </div>
                ))}
                {intel.mediaEvents?.map(event => (
                  <div key={event.id} className="p-4 border-l-2 border-l-orange-500/50 hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] font-mono bg-orange-500/5 text-orange-500 border-orange-500/20">
                        MEDIA: {event.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {event.date ? format(new Date(event.date), "MMM dd, HH:mm") : "N/A"}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm mb-1">{event.title}</div>
                    <div className="font-mono text-xs text-muted-foreground line-clamp-2">{event.description}</div>
                  </div>
                ))}
                {(!intel.intelligenceBriefings?.length && !intel.mediaEvents?.length) && (
                  <div className="p-8 text-center font-mono text-sm text-muted-foreground">No recent activity detected.</div>
                )}
              </CardContent>
            </Card>

            {/* Parliamentary & Legislation */}
            <Card className="bg-card/50 border-border backdrop-blur-sm lg:col-span-2 xl:col-span-1">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Building2 className="w-4 h-4" />
                  DOMESTIC POLICY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/50 h-[300px] overflow-y-auto">
                {intel.legislation?.map(leg => (
                  <div key={leg.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-mono font-bold text-sm line-clamp-1">{leg.title}</div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted-foreground">{leg.category}</span>
                      <span className={leg.status === 'enacted' ? 'text-emerald-500' : 'text-yellow-500'}>
                        {leg.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Criminal & Interpol */}
            <Card className="bg-card/50 border-border backdrop-blur-sm lg:col-span-2 xl:col-span-2">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Scale className="w-4 h-4" />
                  LAW ENFORCEMENT
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/50 h-[300px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full divide-x divide-border/50">
                  <div className="p-0 divide-y divide-border/50">
                    <div className="p-2 bg-muted/50 text-xs font-mono text-muted-foreground text-center sticky top-0">DOMESTIC CASES</div>
                    {intel.criminalCases?.map(case_ => (
                      <div key={case_.id} className="p-3">
                        <div className="font-mono text-sm font-bold truncate">{case_.title}</div>
                        <div className="flex justify-between text-[10px] font-mono mt-1 text-muted-foreground">
                          <span>{case_.caseType}</span>
                          <span>{case_.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-0 divide-y divide-border/50">
                    <div className="p-2 bg-muted/50 text-xs font-mono text-muted-foreground text-center sticky top-0">INTERPOL NOTICES</div>
                    {intel.interpolNotices?.map(notice => (
                      <div key={notice.id} className="p-3 flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          notice.noticeType === 'red' ? 'bg-red-500' :
                          notice.noticeType === 'blue' ? 'bg-blue-500' :
                          notice.noticeType === 'yellow' ? 'bg-yellow-500' :
                          'bg-primary'
                        }`} />
                        <div>
                          <div className="font-mono text-sm font-bold">{notice.subjectName}</div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1 line-clamp-1">{notice.charges}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
