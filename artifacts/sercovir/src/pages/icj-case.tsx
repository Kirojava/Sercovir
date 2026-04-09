import { useRoute, Link } from "wouter";
import { useGetIcjCase, getGetIcjCaseQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, Globe, ArrowRight, Calendar, AlertTriangle, FileText, Star } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  hearings: "text-primary border-primary/50 bg-primary/10",
  judged: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  pending: "text-yellow-500 border-yellow-500/50 bg-yellow-500/10",
  preliminary: "text-orange-500 border-orange-500/50 bg-orange-500/10",
  dismissed: "text-muted-foreground border-border",
};

const SIGNIFICANCE_COLORS: Record<string, string> = {
  landmark: "text-primary",
  significant: "text-orange-500",
  routine: "text-muted-foreground",
};

export default function IcjCaseDetail() {
  const [, params] = useRoute("/icj/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: icjCase, isLoading } = useGetIcjCase(id, {
    query: { enabled: !!id, queryKey: getGetIcjCaseQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!icjCase) return (
    <div className="py-20 text-center font-mono text-muted-foreground">Case not found.</div>
  );

  const statusColor = STATUS_COLORS[icjCase.status] || "text-primary border-primary/50 bg-primary/10";

  return (
    <div className="space-y-6">
      <Link href="/icj">
        <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> BACK TO ICJ CASES
        </span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{icjCase.caseType}</span>
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-tight leading-tight">{icjCase.title}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={`font-mono text-xs uppercase ${statusColor}`}>
            {icjCase.status}
          </Badge>
          {icjCase.significance && (
            <span className={`text-xs font-mono font-bold uppercase flex items-center gap-1 ${SIGNIFICANCE_COLORS[icjCase.significance] || "text-muted-foreground"}`}>
              <Star className="w-3 h-3" /> {icjCase.significance}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 bg-card/50 border border-border rounded-lg flex items-center justify-between">
        <div className="flex flex-col items-center flex-1 text-center">
          <span className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Applicant</span>
          <span className="font-mono font-bold flex items-center gap-1 text-lg">
            <Globe className="w-4 h-4 text-primary" /> {icjCase.applicantCountry}
          </span>
        </div>
        <div className="px-6 text-muted-foreground/30">
          <ArrowRight className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center flex-1 text-center">
          <span className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Respondent</span>
          <span className="font-mono font-bold flex items-center gap-1 text-lg">
            <Globe className="w-4 h-4 text-red-500" /> {icjCase.respondentCountry}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" /> CASE SUMMARY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{icjCase.description}</p>
            </CardContent>
          </Card>

          {icjCase.currentPhase && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <AlertTriangle className="w-4 h-4" /> CURRENT PHASE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="font-mono text-sm text-foreground leading-relaxed">{icjCase.currentPhase}</p>
              </CardContent>
            </Card>
          )}

          {icjCase.lastUpdate && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Globe className="w-4 h-4" /> LATEST DEVELOPMENTS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{icjCase.lastUpdate}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" /> TIMELINE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {icjCase.filedDate && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground">DATE FILED</div>
                  <div className="font-mono text-sm font-bold">{format(new Date(icjCase.filedDate), "MMMM d, yyyy")}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">CASE TYPE</div>
                <div className="font-mono text-sm uppercase">{icjCase.caseType}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">STATUS</div>
                <Badge variant="outline" className={`font-mono text-[10px] uppercase ${statusColor}`}>
                  {icjCase.status}
                </Badge>
              </div>
              {icjCase.significance && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground">SIGNIFICANCE</div>
                  <div className={`font-mono text-sm uppercase font-bold ${SIGNIFICANCE_COLORS[icjCase.significance] || "text-muted-foreground"}`}>
                    {icjCase.significance}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
