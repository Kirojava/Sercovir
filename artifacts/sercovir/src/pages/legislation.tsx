import { useState } from "react";
import { useListLegislation } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Globe, AlertTriangle, Users } from "lucide-react";
import { format } from "date-fns";

export default function Legislation() {
  const [search, setSearch] = useState("");
  const { data: legislation, isLoading } = useListLegislation({ country: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">LEGISLATION TRACKER</h1>
          <p className="text-muted-foreground font-mono mt-1">Database of proposed and enacted domestic laws.</p>
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
          {legislation?.map((leg) => (
            <Card key={leg.id} className="bg-card/50 border-border backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                          {leg.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {leg.country}
                          </span>
                          <span className="uppercase px-1.5 py-0.5 bg-muted rounded border border-border/50">
                            {leg.category}
                          </span>
                          {leg.proposedDate && (
                            <span>PROP: {format(new Date(leg.proposedDate), "MMM yyyy")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-mono text-muted-foreground pl-8">
                      {leg.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <Badge variant="outline" className={`font-mono uppercase
                      ${leg.status === 'enacted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        leg.status === 'proposed' ? 'bg-primary/10 text-primary border-primary/30' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {leg.status}
                    </Badge>
                    
                    {leg.controversyLevel && (
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <AlertTriangle className={`w-3 h-3 ${
                          leg.controversyLevel === 'high' ? 'text-red-500' :
                          leg.controversyLevel === 'medium' ? 'text-yellow-500' :
                          'text-emerald-500'
                        }`} />
                        <span className="text-muted-foreground">CONTROVERSY:</span>
                        <span className="uppercase">{leg.controversyLevel}</span>
                      </div>
                    )}
                    
                    {leg.proposedBy && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>SPONSOR: {leg.proposedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {legislation?.length === 0 && (
            <div className="py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No legislation records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
