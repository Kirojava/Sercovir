import { useState } from "react";
import { useListCriminalCases } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scale, Globe, AlertTriangle, Users } from "lucide-react";
import { format } from "date-fns";

export default function CriminalCases() {
  const [search, setSearch] = useState("");
  const { data: cases, isLoading } = useListCriminalCases({ country: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">CRIMINAL CASES</h1>
          <p className="text-muted-foreground font-mono mt-1">Ongoing domestic and international legal proceedings.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Filter by country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cases?.map((c) => (
            <Card key={c.id} className="bg-card/50 border-border backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                          {c.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {c.country}
                          </span>
                          {c.court && <span className="uppercase px-1.5 py-0.5 bg-muted rounded border border-border/50">COURT: {c.court}</span>}
                          {c.startDate && (
                            <span>STARTED: {format(new Date(c.startDate), "MMM yyyy")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-mono text-muted-foreground pl-8">
                      {c.description}
                    </p>
                    
                    <div className="pl-8 pt-2">
                      <div className="text-xs font-mono text-muted-foreground mb-1">CHARGES:</div>
                      <div className="flex flex-wrap gap-2">
                        {c.charges?.map((charge, idx) => (
                          <Badge key={idx} variant="outline" className="font-mono text-[10px] uppercase">
                            {charge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <div className="flex gap-2">
                      {c.internationalInvolvement && (
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 font-mono uppercase">
                          INTL
                        </Badge>
                      )}
                      <Badge variant="outline" className={`font-mono uppercase
                        ${c.status === 'concluded' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                          c.status === 'ongoing' ? 'bg-primary/10 text-primary border-primary/30' :
                          'bg-muted text-muted-foreground'}
                      `}>
                        {c.status}
                      </Badge>
                    </div>
                    
                    {c.severity && (
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <AlertTriangle className={`w-3 h-3 ${
                          c.severity === 'high' ? 'text-red-500' :
                          c.severity === 'medium' ? 'text-yellow-500' :
                          'text-emerald-500'
                        }`} />
                        <span className="text-muted-foreground">SEVERITY:</span>
                        <span className="uppercase">{c.severity}</span>
                      </div>
                    )}
                    
                    {c.defendants && c.defendants.length > 0 && (
                      <div className="flex flex-col items-end gap-1 text-[10px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> DEFENDANTS:</div>
                        <div className="text-right">
                          {c.defendants.slice(0, 2).join(', ')}
                          {c.defendants.length > 2 && ` +${c.defendants.length - 2}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {cases?.length === 0 && (
            <div className="py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No criminal cases found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
