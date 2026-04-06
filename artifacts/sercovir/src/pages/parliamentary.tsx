import { useState } from "react";
import { useListParliamentary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Calendar, Vote, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Parliamentary() {
  const [search, setSearch] = useState("");
  const { data: discussions, isLoading } = useListParliamentary({ country: search || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">PARLIAMENTARY DEBATES</h1>
          <p className="text-muted-foreground font-mono mt-1">Monitor global legislative assembly activities and outcomes.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {discussions?.map((disc) => (
            <Card key={disc.id} className="bg-card/50 border-border backdrop-blur-sm flex flex-col h-full group">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="font-mono text-base font-bold leading-tight group-hover:text-primary transition-colors">
                      {disc.topic}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span>{disc.country} ({disc.chamber})</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] uppercase shrink-0
                    ${disc.status === 'concluded' ? 'border-emerald-500/50 text-emerald-500' :
                      disc.status === 'in-progress' ? 'border-primary/50 text-primary' : ''}
                  `}>
                    {disc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-sm font-mono text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {disc.description}
                </p>
                
                <div className="space-y-3 mt-auto">
                  {disc.keyPoints && disc.keyPoints.length > 0 && (
                    <div className="text-xs font-mono bg-muted/30 p-2 rounded">
                      <span className="text-primary font-bold mr-2">›</span>
                      {disc.keyPoints[0]}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs font-mono border-t border-border/50 pt-3">
                    <div className="flex gap-3">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <Vote className="w-3 h-3" /> {disc.votesFor || 0}
                      </span>
                      <span className="text-red-500 flex items-center gap-1">
                        <Vote className="w-3 h-3" /> {disc.votesAgainst || 0}
                      </span>
                    </div>
                    {disc.date && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(disc.date), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {discussions?.length === 0 && (
            <div className="col-span-full py-12 text-center font-mono text-muted-foreground">
              No parliamentary discussions found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
