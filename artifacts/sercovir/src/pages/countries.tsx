import { useState } from "react";
import { Link } from "wouter";
import { useListCountries, useGetCountriesSummary } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, ShieldAlert, Activity } from "lucide-react";

export default function Countries() {
  const [search, setSearch] = useState("");
  const { data: countries, isLoading } = useListCountries({ search });
  const { data: summary } = useGetCountriesSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">GLOBAL PROFILES</h1>
          <p className="text-muted-foreground font-mono mt-1">Intelligence database of monitored nations.</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">TOTAL NATIONS</p>
                <p className="text-2xl font-mono font-bold">{summary.total}</p>
              </div>
              <Globe className="w-8 h-8 text-primary/20" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">CRITICAL THREAT</p>
                <p className="text-2xl font-mono font-bold text-red-500">
                  {summary.byThreatLevel?.['critical'] || 0}
                </p>
              </div>
              <ShieldAlert className="w-8 h-8 text-red-500/20" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">AVG STABILITY</p>
                <p className="text-2xl font-mono font-bold text-emerald-500">
                  {Math.round(summary.avgStabilityIndex)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-emerald-500/20" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Search nation or country code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {countries?.map((country) => (
            <Link key={country.id} href={`/countries/${country.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm h-full flex flex-col group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-mono flex items-center gap-2 text-lg">
                      <span className="font-mono text-[10px] text-primary/70">{country.code}</span>
                      <span className="group-hover:text-primary transition-colors">{country.name}</span>
                    </CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {country.code}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-mono">
                      <span className="text-muted-foreground">THREAT</span>
                      <span className={`uppercase font-bold ${
                        country.threatLevel === 'critical' ? 'text-red-500' :
                        country.threatLevel === 'high' ? 'text-orange-500' :
                        country.threatLevel === 'moderate' ? 'text-yellow-500' :
                        'text-emerald-500'
                      }`}>
                        {country.threatLevel}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">STABILITY</span>
                        <span>{country.stabilityIndex}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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

                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <span className="text-xs font-mono text-muted-foreground">REGION:</span>
                      <span className="text-xs font-mono">{country.region}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}