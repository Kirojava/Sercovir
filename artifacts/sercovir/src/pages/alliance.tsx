import { useRoute, Link } from "wouter";
import { useGetAlliance, getGetAllianceQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Network, Shield, Landmark, HeartHandshake, Briefcase, Globe, MapPin, Calendar, Zap, Users } from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  military: Shield,
  political: Landmark,
  humanitarian: HeartHandshake,
  economic: Briefcase,
  diplomatic: Globe,
};

const TYPE_COLORS: Record<string, string> = {
  military: "border-red-500/50 text-red-500 bg-red-500/10",
  economic: "border-blue-500/50 text-blue-500 bg-blue-500/10",
  political: "border-purple-500/50 text-purple-500 bg-purple-500/10",
  humanitarian: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
  diplomatic: "border-yellow-500/50 text-yellow-500 bg-yellow-500/10",
};

const STRENGTH_COLORS: Record<string, string> = {
  dominant: "text-primary",
  strong: "text-primary/80",
  moderate: "text-yellow-500",
  growing: "text-emerald-500",
  declining: "text-muted-foreground",
};

export default function AllianceDetail() {
  const [, params] = useRoute("/alliances/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: alliance, isLoading } = useGetAlliance(id, {
    query: { enabled: !!id, queryKey: getGetAllianceQueryKey(id) }
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

  if (!alliance) return (
    <div className="py-20 text-center font-mono text-muted-foreground">Alliance not found.</div>
  );

  const Icon = TYPE_ICONS[alliance.type] || Network;
  const typeColor = TYPE_COLORS[alliance.type] || "border-primary/50 text-primary bg-primary/10";

  return (
    <div className="space-y-6">
      <Link href="/alliances">
        <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> BACK TO ALLIANCES
        </span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={`font-mono text-xs uppercase flex items-center gap-1 ${typeColor}`}>
              <Icon className="w-3 h-3" /> {alliance.type}
            </Badge>
            {alliance.abbreviation && (
              <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                {alliance.abbreviation}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">{alliance.name}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">STRENGTH ASSESSMENT</span>
          <span className={`text-xl font-mono font-bold uppercase ${STRENGTH_COLORS[alliance.strength || ""] || "text-muted-foreground"}`}>
            {alliance.strength || "UNKNOWN"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Globe className="w-4 h-4" /> ALLIANCE OVERVIEW
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">{alliance.description}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Users className="w-4 h-4" /> MEMBER STATES ({alliance.memberCountries?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {alliance.memberCountries && alliance.memberCountries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {alliance.memberCountries.map((country: string) => (
                    <span key={country} className="font-mono text-xs bg-background border border-border px-2 py-1 rounded hover:border-primary/50 transition-colors">
                      {country}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-sm text-muted-foreground italic">No members documented.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" /> KEY FACTS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {alliance.founded && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> FOUNDED
                  </div>
                  <div className="font-mono text-sm font-bold">{alliance.founded}</div>
                </div>
              )}
              {alliance.headquarters && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> HEADQUARTERS
                  </div>
                  <div className="font-mono text-sm">{alliance.headquarters}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Network className="w-3 h-3" /> TYPE
                </div>
                <div className="font-mono text-sm uppercase">{alliance.type}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> MEMBER COUNT
                </div>
                <div className="font-mono text-2xl font-bold text-primary">{alliance.memberCountries?.length || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
