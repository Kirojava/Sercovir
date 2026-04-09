import { useRoute, Link } from "wouter";
import { useGetInterpolNotice, getGetInterpolNoticeQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Crosshair, MapPin, Calendar, AlertTriangle, Shield, FileText } from "lucide-react";
import { format } from "date-fns";

const NOTICE_STYLES: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  red: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50", bar: "bg-red-500" },
  blue: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/50", bar: "bg-blue-500" },
  green: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50", bar: "bg-green-500" },
  yellow: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/50", bar: "bg-yellow-500" },
  orange: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/50", bar: "bg-orange-500" },
  purple: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/50", bar: "bg-purple-500" },
};

const DANGER_COLORS: Record<string, string> = {
  extreme: "text-red-500",
  high: "text-orange-500",
  moderate: "text-yellow-500",
  low: "text-muted-foreground",
};

export default function InterpolNoticeDetail() {
  const [, params] = useRoute("/interpol/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: notice, isLoading } = useGetInterpolNotice(id, {
    query: { enabled: !!id, queryKey: getGetInterpolNoticeQueryKey(id) }
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

  if (!notice) return (
    <div className="py-20 text-center font-mono text-muted-foreground">Notice not found.</div>
  );

  const styles = NOTICE_STYLES[notice.noticeType] || { color: "text-primary", bg: "bg-primary/10", border: "border-primary/50", bar: "bg-primary" };
  const dangerColor = DANGER_COLORS[notice.dangerLevel || ""] || "text-muted-foreground";

  return (
    <div className="space-y-6">
      <Link href="/interpol">
        <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> BACK TO INTERPOL NOTICES
        </span>
      </Link>

      <div className={`relative overflow-hidden rounded-lg border ${styles.border} ${styles.bg} p-6`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 ${styles.bar}`} />
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className={`w-4 h-4 ${styles.color}`} />
              <Badge variant="outline" className={`font-mono uppercase text-xs ${styles.color} ${styles.border} ${styles.bg}`}>
                {notice.noticeType.toUpperCase()} NOTICE
              </Badge>
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">{notice.subjectName}</h1>
            {notice.nationality && (
              <div className="flex items-center gap-2 mt-2 text-sm font-mono text-muted-foreground">
                <Globe className="w-3 h-3" /> {notice.nationality}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="text-[10px] font-mono text-muted-foreground">STATUS</div>
            <span className={`font-mono text-sm font-bold uppercase ${notice.status === 'active' ? 'text-red-500' : 'text-muted-foreground'}`}>
              {notice.status}
            </span>
            {notice.dangerLevel && (
              <>
                <div className="text-[10px] font-mono text-muted-foreground mt-2">DANGER LEVEL</div>
                <span className={`font-mono text-sm font-bold uppercase flex items-center gap-1 ${dangerColor}`}>
                  <AlertTriangle className="w-3 h-3" /> {notice.dangerLevel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {notice.charges && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <Shield className="w-4 h-4" /> CHARGES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {notice.charges.split(",").map((charge: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 font-mono text-sm">
                      <span className="text-primary mt-0.5">›</span>
                      <span>{charge.trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {notice.description && (
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                  <FileText className="w-4 h-4" /> INTELLIGENCE DOSSIER
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">{notice.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Crosshair className="w-4 h-4" /> NOTICE DETAILS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {notice.chargedBy && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> CHARGED BY
                  </div>
                  <div className="font-mono text-sm">{notice.chargedBy}</div>
                </div>
              )}
              {notice.lastKnownLocation && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> LAST KNOWN LOCATION
                  </div>
                  <div className="font-mono text-sm">{notice.lastKnownLocation}</div>
                </div>
              )}
              {notice.issuedDate && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> ISSUED DATE
                  </div>
                  <div className="font-mono text-sm">{format(new Date(notice.issuedDate), "MMMM d, yyyy")}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground">NATIONALITY</div>
                <div className="font-mono text-sm">{notice.nationality || "UNKNOWN"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
