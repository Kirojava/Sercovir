import { useRoute } from "wouter";
import { useGetResolution, getGetResolutionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Scale, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ResolutionDetail() {
  const [match, params] = useRoute("/resolutions/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: resolution, isLoading } = useGetResolution(id, {
    query: { enabled: !!id, queryKey: getGetResolutionQueryKey(id) }
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!resolution) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`font-mono uppercase text-sm
              ${resolution.status === 'passed' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' :
                resolution.status === 'failed' ? 'border-red-500 text-red-500 bg-red-500/10' :
                resolution.status === 'draft' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                'border-blue-500 text-blue-500 bg-blue-500/10'}
            `}>
              {resolution.status}
            </Badge>
            <span className="text-muted-foreground font-mono">{resolution.committeeName || `CMT-${resolution.committeeId}`}</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tight">{resolution.title}</h1>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 flex gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground font-mono mb-1">YEA</span>
            <span className="text-emerald-500 font-mono text-2xl font-bold">{resolution.votesFor || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground font-mono mb-1">NAY</span>
            <span className="text-red-500 font-mono text-2xl font-bold">{resolution.votesAgainst || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground font-mono mb-1">ABS</span>
            <span className="text-yellow-500 font-mono text-2xl font-bold">{resolution.abstentions || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                PREAMBULAR CLAUSES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {resolution.preambularClauses && resolution.preambularClauses.length > 0 ? (
                <ul className="space-y-4">
                  {resolution.preambularClauses.map((clause, idx) => (
                    <li key={idx} className="font-serif italic text-muted-foreground leading-relaxed">
                      {clause}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">No preambular clauses drafted.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Scale className="w-4 h-4" />
                OPERATIVE CLAUSES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {resolution.operativeClauses && resolution.operativeClauses.length > 0 ? (
                <ol className="space-y-4 list-decimal pl-5">
                  {resolution.operativeClauses.map((clause, idx) => (
                    <li key={idx} className="font-serif leading-relaxed pl-2">
                      <span className="underline decoration-primary/30 underline-offset-4">{clause.split(' ')[0]}</span>{' '}
                      {clause.substring(clause.indexOf(' ') + 1)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">No operative clauses drafted.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Users className="w-4 h-4" />
                SPONSORS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {resolution.sponsors && resolution.sponsors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resolution.sponsors.map(sponsor => (
                    <Badge key={sponsor} variant="secondary" className="font-mono">
                      {sponsor}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">No sponsors.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <AlertCircle className="w-4 h-4" />
                SIGNATORIES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {resolution.signatories && resolution.signatories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resolution.signatories.map(sig => (
                    <Badge key={sig} variant="outline" className="font-mono bg-background">
                      {sig}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">No signatories.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}