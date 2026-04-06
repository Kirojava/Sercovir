import { Link } from "wouter";
import { useListCommittees } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock } from "lucide-react";

export default function Committees() {
  const { data: committees, isLoading } = useListCommittees();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">COMMITTEES</h1>
          <p className="text-muted-foreground font-mono mt-1">Active legislative bodies and diplomatic forums.</p>
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
          {committees?.map((committee) => (
            <Link key={committee.id} href={`/committees/${committee.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm h-full flex flex-col group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={`font-mono text-xs
                      ${committee.status === 'active' ? 'border-primary text-primary bg-primary/5' : 
                        committee.status === 'upcoming' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 
                        'border-muted-foreground text-muted-foreground'}
                    `}>
                      {committee.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {committee.abbreviation}
                    </span>
                  </div>
                  <CardTitle className="font-mono text-xl group-hover:text-primary transition-colors">
                    {committee.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3" /> TOPIC
                      </span>
                      <p className="text-sm font-mono line-clamp-2">{committee.topic}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground flex justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {committee.delegateCount || 0} DELEGATES
                  </span>
                  {committee.session && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {committee.session}
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
          {(!committees || committees.length === 0) && (
            <div className="col-span-full p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground font-mono">No committees initialized.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}