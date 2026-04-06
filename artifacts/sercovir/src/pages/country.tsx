import { useRoute } from "wouter";
import { useGetCountry, getGetCountryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Globe, ShieldAlert, Activity, DollarSign, Users, Crosshair, Network, FileText } from "lucide-react";

export default function CountryProfile() {
  const [match, params] = useRoute("/countries/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: country, isLoading } = useGetCountry(id, {
    query: { enabled: !!id, queryKey: getGetCountryQueryKey(id) }
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!country) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{country.flagEmoji}</span>
            <h1 className="text-4xl font-mono font-bold tracking-tight">{country.name}</h1>
            <Badge variant="outline" className="font-mono text-lg">{country.code}</Badge>
          </div>
          <p className="text-muted-foreground font-mono flex items-center gap-2">
            <Globe className="w-4 h-4" /> {country.region}
          </p>
        </div>

        <div className={`px-6 py-4 rounded-md border flex flex-col items-end gap-1 font-mono
          ${country.threatLevel === 'critical' ? 'bg-red-500/10 border-red-500/50' : 
            country.threatLevel === 'high' ? 'bg-orange-500/10 border-orange-500/50' : 
            country.threatLevel === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/50' : 
            'bg-emerald-500/10 border-emerald-500/50'}
        `}>
          <span className="text-[10px] opacity-80 leading-none">ASSESSED THREAT LEVEL</span>
          <span className={`text-xl font-bold uppercase
            ${country.threatLevel === 'critical' ? 'text-red-500' : 
              country.threatLevel === 'high' ? 'text-orange-500' : 
              country.threatLevel === 'moderate' ? 'text-yellow-500' : 
              'text-emerald-500'}
          `}>
            {country.threatLevel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" />
              VITAL STATISTICS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-muted-foreground">STABILITY INDEX</span>
                <span className="font-bold">{country.stabilityIndex}/100</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    (country.stabilityIndex || 0) < 30 ? 'bg-red-500' :
                    (country.stabilityIndex || 0) < 60 ? 'bg-yellow-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${country.stabilityIndex || 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> POPULATION
                </span>
                <p className="font-mono text-lg">
                  {country.population ? (country.population / 1000000).toFixed(1) + 'M' : 'UNKNOWN'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> GDP
                </span>
                <p className="font-mono text-lg">
                  {country.gdp ? '$' + (country.gdp / 1000000000).toFixed(1) + 'B' : 'UNKNOWN'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> MILITARY BUDGET
                </span>
                <p className="font-mono text-lg">
                  {country.militaryBudget ? '$' + (country.militaryBudget / 1000000000).toFixed(1) + 'B' : 'UNKNOWN'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" /> SYSTEM
                </span>
                <p className="font-mono text-sm truncate" title={country.politicalSystem}>
                  {country.politicalSystem || 'UNKNOWN'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Network className="w-4 h-4" />
                KEY ALLIANCES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {country.keyAlliances && country.keyAlliances.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {country.keyAlliances.map(alliance => (
                    <Badge key={alliance} variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20">
                      {alliance}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">No registered alliances.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border flex-1">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                INTELLIGENCE NOTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {country.notes ? (
                <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {country.notes}
                </p>
              ) : (
                <p className="text-sm font-mono text-muted-foreground italic">No briefing notes available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}