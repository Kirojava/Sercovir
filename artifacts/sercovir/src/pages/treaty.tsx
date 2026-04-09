import { useRoute, Link } from "wouter";
import { useGetTreaty, getGetTreatyQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileSignature, Users, Calendar, Star, Globe, Shield } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  "in force": "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  "in-force": "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  signed: "text-yellow-500 border-yellow-500/50 bg-yellow-500/10",
  draft: "text-muted-foreground border-border",
  expired: "text-red-500/60 border-red-500/20 bg-red-500/5",
  negotiating: "text-blue-500 border-blue-500/50 bg-blue-500/10",
};

const SIGNIFICANCE_COLORS: Record<string, string> = {
  landmark: "text-primary",
  significant: "text-orange-500",
  routine: "text-muted-foreground",
};

export default function TreatyDetail() {
  const [, params] = useRoute("/treaties/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: treaty, isLoading } = useGetTreaty(id, {
    query: { enabled: !!id, queryKey: getGetTreatyQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!treaty) return (
    <div className="py-20 text-center font-mono text-muted-foreground">Treaty not found.</div>
  );

  const statusColor = STATUS_COLORS[treaty.status] || "text-primary border-primary/50 bg-primary/10";

  return (
    <div className="space-y-6">
      <Link href="/treaties">
        <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> BACK TO TREATIES
        </span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileSignature className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">
              {treaty.type}
            </span>
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-tight leading-tight">{treaty.title}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={`font-mono text-xs uppercase ${statusColor}`}>
            {treaty.status}
          </Badge>
          {treaty.significance && (
            <span className={`text-xs font-mono font-bold uppercase flex items-center gap-1 ${SIGNIFICANCE_COLORS[treaty.significance] || "text-muted-foreground"}`}>
              <Star className="w-3 h-3" /> {treaty.significance}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <FileSignature className="w-4 h-4" /> TREATY ANALYSIS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{treaty.description}</p>
            </CardContent>
          </Card>

          {treaty.signatories && treaty.signatories.length > 0 && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4" /> SIGNATORIES ({treaty.signatories.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {treaty.signatories.map((signatory: string) => (
                    <span key={signatory} className="font-mono text-xs bg-background border border-border px-2 py-1 rounded hover:border-primary/50 transition-colors">
                      <Globe className="w-3 h-3 inline-block mr-1 text-primary" />
                      {signatory}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {treaty.relatedConflicts && treaty.relatedConflicts.length > 0 && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Shield className="w-4 h-4" /> RELATED CONFLICTS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {treaty.relatedConflicts.map((conflict: string) => (
                    <span key={conflict} className="font-mono text-xs text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded">
                      {conflict}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" /> KEY DATES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {treaty.signedDate && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground">DATE SIGNED</div>
                  <div className="font-mono text-sm font-bold">{format(new Date(treaty.signedDate), "MMMM d, yyyy")}</div>
                </div>
              )}
              {treaty.effectiveDate && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground">EFFECTIVE DATE</div>
                  <div className="font-mono text-sm font-bold text-primary">{format(new Date(treaty.effectiveDate), "MMMM d, yyyy")}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">TYPE</div>
                <div className="font-mono text-xs uppercase bg-muted border border-border px-2 py-1 rounded">{treaty.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">PARTIES</div>
                <div className="font-mono text-2xl font-bold text-primary">{treaty.signatories?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
