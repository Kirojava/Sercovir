import { useState } from "react";
import { Link } from "wouter";
import { useListLeaders } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCheck, MapPin, Building2, UserX } from "lucide-react";

export default function Leaders() {
  const [search, setSearch] = useState("");
  const { data: leaders, isLoading } = useListLeaders({ search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">WORLD LEADERS</h1>
          <p className="text-muted-foreground font-mono mt-1">Directory of prominent global figures and key decision makers.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 font-mono bg-background/50 border-border/50" 
            placeholder="Search leader name, country, or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaders?.map((leader) => (
            <Link key={leader.id} href={`/leaders/${leader.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm h-full flex flex-col group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-mono text-lg group-hover:text-primary transition-colors">
                        {leader.name}
                      </CardTitle>
                      <p className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {leader.position}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50">
                        {leader.countryCode || leader.country}
                      </span>
                      {leader.isCurrentlyInPower ? (
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <UserX className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>LOC: {leader.currentLocation || "UNKNOWN"}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">APPROVAL RATING</span>
                        <span className={
                          (leader.approvalRating || 0) < 40 ? 'text-red-500' :
                          (leader.approvalRating || 0) < 60 ? 'text-yellow-500' :
                          'text-emerald-500'
                        }>{leader.approvalRating}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (leader.approvalRating || 0) < 40 ? 'bg-red-500' :
                            (leader.approvalRating || 0) < 60 ? 'bg-yellow-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${leader.approvalRating || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
