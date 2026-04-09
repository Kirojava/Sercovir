import { useState } from "react";
import { Link } from "wouter";
import { useListTreaties } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileSignature, Globe, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Treaties() {
  const [search, setSearch] = useState("");
  const { data: treaties, isLoading } = useListTreaties({});

  const filteredTreaties = treaties?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">TREATIES</h1>
          <p className="text-muted-foreground font-mono mt-1">Database of international agreements and pacts.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Search by treaty title or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTreaties?.map((treaty) => (
            <Link key={treaty.id} href={`/treaties/${treaty.id}`}>
            <Card className="bg-card/50 border-border backdrop-blur-sm group cursor-pointer hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <FileSignature className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                          {treaty.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                          <span className="uppercase px-1.5 py-0.5 bg-muted rounded border border-border/50">
                            TYPE: {treaty.type}
                          </span>
                          {treaty.signedDate && (
                            <span>SIGNED: {format(new Date(treaty.signedDate), "MMM dd, yyyy")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-mono text-muted-foreground pl-8">
                      {treaty.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <Badge variant="outline" className={`font-mono uppercase
                      ${treaty.status === 'in-force' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        treaty.status === 'signed' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {treaty.status}
                    </Badge>
                    
                    {treaty.effectiveDate && (
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">EFFECTIVE:</span>
                        <span>{format(new Date(treaty.effectiveDate), "yyyy-MM-dd")}</span>
                      </div>
                    )}
                    
                    {treaty.signatories && treaty.signatories.length > 0 && (
                      <div className="flex flex-col items-end gap-1 text-[10px] font-mono text-muted-foreground">
                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> SIGNATORIES: {treaty.signatories.length}</div>
                        <div className="text-right">
                          {treaty.signatories.slice(0, 3).join(', ')}
                          {treaty.signatories.length > 3 && ` +${treaty.signatories.length - 3}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
          {filteredTreaties?.length === 0 && (
            <div className="py-12 text-center font-mono text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border/50">
              No treaties found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
