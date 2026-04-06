import { useState } from "react";
import { useListIcjCases } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scale, Globe, ArrowRight, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function IcjCases() {
  const [search, setSearch] = useState("");
  const { data: cases, isLoading } = useListIcjCases({}); // Ignoring search

  const filteredCases = cases?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.applicantCountry.toLowerCase().includes(search.toLowerCase()) ||
    c.respondentCountry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">ICJ CASES</h1>
          <p className="text-muted-foreground font-mono mt-1">International Court of Justice dispute resolution tracker.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Search by case title or country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCases?.map((c) => (
            <Card key={c.id} className="bg-card/50 border-border backdrop-blur-sm group">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground">
                      <Scale className="w-3 h-3 text-primary" />
                      <span className="uppercase tracking-widest">{c.caseType || "DISPUTE"}</span>
                    </div>
                    <CardTitle className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                      {c.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] uppercase shrink-0
                    ${c.status === 'judged' ? 'border-emerald-500/50 text-emerald-500' :
                      c.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' :
                      'border-primary/50 text-primary'}
                  `}>
                    {c.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 flex flex-col">
                <div className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded text-sm font-mono">
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Applicant</span>
                    <span className="font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {c.applicantCountry}
                    </span>
                  </div>
                  <div className="px-4 text-muted-foreground/30">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Respondent</span>
                    <span className="font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {c.respondentCountry}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm font-mono text-muted-foreground line-clamp-3">
                  {c.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-3 border-t border-border/50 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> PHASE
                    </span>
                    <span className="uppercase">{c.currentPhase || "UNKNOWN"}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> FILED
                    </span>
                    <span>{c.filedDate ? format(new Date(c.filedDate), "MMM dd, yyyy") : "UNKNOWN"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredCases?.length === 0 && (
            <div className="col-span-full py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No ICJ cases found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
