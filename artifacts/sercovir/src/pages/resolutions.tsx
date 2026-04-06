import { Link } from "wouter";
import { useListResolutions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, CheckCircle2, XCircle } from "lucide-react";

export default function Resolutions() {
  const { data: resolutions, isLoading } = useListResolutions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">RESOLUTIONS</h1>
          <p className="text-muted-foreground font-mono mt-1">Legislative workspace and document tracking.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {resolutions?.map((resolution) => (
            <Link key={resolution.id} href={`/resolutions/${resolution.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm group">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`font-mono uppercase text-xs
                        ${resolution.status === 'passed' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' :
                          resolution.status === 'failed' ? 'border-red-500 text-red-500 bg-red-500/10' :
                          resolution.status === 'draft' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                          'border-blue-500 text-blue-500 bg-blue-500/10'}
                      `}>
                        {resolution.status}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {resolution.committeeName || `CMT-${resolution.committeeId}`}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold font-mono group-hover:text-primary transition-colors">
                      {resolution.title}
                    </h3>
                    
                    {resolution.sponsors && resolution.sponsors.length > 0 && (
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        SPONSORS: {resolution.sponsors.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-4 text-right">
                    <div className="flex items-center gap-4 text-sm font-mono bg-background/50 px-3 py-2 rounded-md border border-border">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted-foreground mb-1">YEA</span>
                        <span className="text-emerald-500 font-bold">{resolution.votesFor || 0}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted-foreground mb-1">NAY</span>
                        <span className="text-red-500 font-bold">{resolution.votesAgainst || 0}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted-foreground mb-1">ABS</span>
                        <span className="text-yellow-500 font-bold">{resolution.abstentions || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!resolutions || resolutions.length === 0) && (
            <div className="p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground font-mono">No resolutions drafted.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}