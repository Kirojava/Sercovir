import { useState } from "react";
import { useListDelegates, useListCommittees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserCircle, Search, Users, Award } from "lucide-react";

export default function Delegates() {
  const [committeeId, setCommitteeId] = useState<string>("all");
  const { data: delegates, isLoading } = useListDelegates(committeeId !== "all" ? { committeeId: parseInt(committeeId, 10) } : {});
  const { data: committees } = useListCommittees();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">DELEGATES</h1>
          <p className="text-muted-foreground font-mono mt-1">Roster of all participating representatives.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={committeeId} onValueChange={setCommitteeId}>
            <SelectTrigger className="w-full sm:w-[250px] font-mono">
              <SelectValue placeholder="Filter by committee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL COMMITTEES</SelectItem>
              {committees?.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.abbreviation} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {delegates?.map((delegate) => (
            <Card key={delegate.id} className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-5 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                  <UserCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-mono font-bold truncate">{delegate.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase bg-background px-1.5 py-0">
                      {delegate.countryCode || delegate.country.substring(0, 3).toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground truncate" title={delegate.country}>
                      {delegate.country}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2 border-t border-border/50 pt-2">
                    <span className="text-[10px] font-mono text-muted-foreground truncate flex items-center gap-1">
                      <Users className="w-3 h-3" /> {delegate.committeeName || `CMT-${delegate.committeeId}`}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1
                      ${delegate.position !== 'delegate' ? 'text-primary' : 'text-muted-foreground'}
                    `}>
                      <Award className="w-3 h-3" /> {delegate.position}
                    </span>
                  </div>
                  {delegate.bloc && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="font-mono text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/20">
                        {delegate.bloc}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!delegates || delegates.length === 0) && (
            <div className="col-span-full p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground font-mono">No delegates found matching criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}