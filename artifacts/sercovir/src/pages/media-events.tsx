import { useState } from "react";
import { useListMediaEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, RadioTower, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function MediaEvents() {
  const [search, setSearch] = useState("");
  const { data: events, isLoading } = useListMediaEvents({ country: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">MEDIA EVENTS & CRISES</h1>
          <p className="text-muted-foreground font-mono mt-1">Global incidents, scandals, and major media coverage.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events?.map((event) => (
            <Card key={event.id} className={`bg-card/50 border-border backdrop-blur-sm group
              ${event.severity === 'critical' ? 'border-red-500/30' :
                event.severity === 'high' ? 'border-orange-500/30' : ''}
            `}>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="font-mono text-base font-bold leading-tight group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1 text-foreground">
                        <Globe className="w-3 h-3 text-primary" /> {event.country}
                      </span>
                      <span className="uppercase px-1.5 py-0.5 bg-muted rounded border border-border/50">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase
                      ${event.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        event.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                        event.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-primary/10 text-primary border-primary/30'}
                    `}>
                      {event.severity}
                    </Badge>
                    {event.isVerified ? (
                      <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> UNVERIFIED
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-sm font-mono text-muted-foreground mb-4">
                  {event.description}
                </p>
                
                <div className="mt-auto space-y-3">
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 border border-border/50 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <RadioTower className="w-3 h-3" /> {event.source || "UNKNOWN SOURCE"}
                    </span>
                    {event.date && (
                      <span className="text-muted-foreground">
                        {format(new Date(event.date), "MMM dd, yyyy HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {events?.length === 0 && (
            <div className="col-span-full py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No media events found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
