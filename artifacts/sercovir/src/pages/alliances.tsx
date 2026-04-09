import { Link } from "wouter";
import { useListAlliances } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Network, Shield, Landmark, HeartHandshake, Briefcase, Globe } from "lucide-react";

export default function Alliances() {
  const { data: alliances, isLoading } = useListAlliances();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'military': return Shield;
      case 'political': return Landmark;
      case 'humanitarian': return HeartHandshake;
      case 'economic': return Briefcase;
      case 'diplomatic': return Globe;
      default: return Network;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">ALLIANCES & BLOCS</h1>
          <p className="text-muted-foreground font-mono mt-1">Geopolitical coalitions, pacts, and voting blocs.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alliances?.map((alliance) => {
            const Icon = getTypeIcon(alliance.type);
            return (
              <Link key={alliance.id} href={`/alliances/${alliance.id}`}>
              <Card className="bg-card/50 backdrop-blur-sm border-border flex flex-col group cursor-pointer hover:border-primary/40 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={`font-mono text-xs uppercase flex items-center gap-1
                      ${alliance.type === 'military' ? 'border-red-500 text-red-500' :
                        alliance.type === 'economic' ? 'border-blue-500 text-blue-500' :
                        alliance.type === 'political' ? 'border-purple-500 text-purple-500' :
                        alliance.type === 'humanitarian' ? 'border-emerald-500 text-emerald-500' :
                        'border-yellow-500 text-yellow-500'}
                    `}>
                      <Icon className="w-3 h-3" />
                      {alliance.type}
                    </Badge>
                    <span className={`text-[10px] font-mono uppercase font-bold
                      ${alliance.strength === 'dominant' ? 'text-primary' :
                        alliance.strength === 'strong' ? 'text-primary/80' :
                        alliance.strength === 'moderate' ? 'text-muted-foreground' :
                        'text-muted-foreground/50'}
                    `}>
                      {alliance.strength} STRENGTH
                    </span>
                  </div>
                  <CardTitle className="font-mono text-xl flex items-center gap-2">
                    {alliance.name}
                    {alliance.abbreviation && (
                      <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {alliance.abbreviation}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs line-clamp-2 mt-2">
                    {alliance.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-muted-foreground">
                      FOUNDED: {alliance.founded || 'UNKNOWN'}
                      {alliance.headquarters && ` • HQ: ${alliance.headquarters}`}
                    </div>
                    
                    <div className="space-y-2 border-t border-border/50 pt-4">
                      <span className="text-xs font-mono text-muted-foreground">MEMBERS ({alliance.memberCountries?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {alliance.memberCountries?.slice(0, 8).map(member => (
                          <span key={member} className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded">
                            {member}
                          </span>
                        ))}
                        {(alliance.memberCountries?.length || 0) > 8 && (
                          <span className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                            +{(alliance.memberCountries?.length || 0) - 8}
                          </span>
                        )}
                        {(!alliance.memberCountries || alliance.memberCountries.length === 0) && (
                          <span className="text-xs font-mono text-muted-foreground italic">No members documented</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            );
          })}
          {(!alliances || alliances.length === 0) && (
            <div className="col-span-full p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground font-mono">No alliances recorded in the database.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}